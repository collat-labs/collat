// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {PriceFeed} from "./PriceFeed.sol";

contract CollatVault is Ownable, ReentrancyGuard {
    IERC20 public musdToken;
    PriceFeed public priceFeed;

    uint256 public constant MAX_LTV_BPS = 6000;
    uint256 public constant LIQUIDATION_LTV_BPS = 7500;
    uint256 public constant LIQUIDATION_PENALTY_BPS = 500;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant RAY = 1e27;

    uint256 public minCollateral;
    uint256 public feeRateBps;
    uint256 public interestRateBps;
    uint256 public totalBtcDeposited;
    uint256 public totalMusdBorrowed;

    struct Position {
        uint256 btcDeposited;
        uint256 musdBorrowed;
        uint256 lastAccruedAt;
        bool exists;
    }

    mapping(address => Position) public positions;

    event CollateralDeposited(address indexed owner, uint256 amount, uint256 totalBtc);
    event CollateralWithdrawn(address indexed owner, uint256 amount, uint256 totalBtc);
    event Borrowed(address indexed owner, uint256 amount, uint256 totalDebt);
    event Repaid(address indexed owner, uint256 amount, uint256 remainingDebt);
    event Liquidated(
        address indexed owner,
        address indexed liquidator,
        uint256 debtCovered,
        uint256 collateralSeized
    );
    event InterestAccrued(address indexed owner, uint256 interestAmount);
    event VaultInitialized(address musdToken, address priceFeed);
    event VaultConfigUpdated(uint256 minCollateral, uint256 feeRateBps, uint256 interestRateBps);
    event CardCreated(address indexed owner, bytes32 cardId, uint256 limit);

    error ZeroAmount();
    error InsufficientCollateral();
    error OutstandingLoan();
    error ExceedsMaxLTV();
    error OverRepay();
    error NotLiquidatable();
    error PositionNotFound();
    error TransferFailed();
    error StalePrice();

    constructor(
        address _musdToken,
        address _priceFeed,
        uint256 _minCollateral,
        uint256 _feeRateBps,
        uint256 _interestRateBps
    ) Ownable(msg.sender) {
        require(_musdToken != address(0), "Zero MUSD token");
        require(_priceFeed != address(0), "Zero price feed");
        require(_feeRateBps <= 500, "Fee rate max 5%");
        require(_interestRateBps <= 2000, "Interest rate max 20%");

        musdToken = IERC20(_musdToken);
        priceFeed = PriceFeed(_priceFeed);
        minCollateral = _minCollateral;
        feeRateBps = _feeRateBps;
        interestRateBps = _interestRateBps;

        emit VaultInitialized(_musdToken, _priceFeed);
    }

    function updateConfig(
        uint256 _minCollateral,
        uint256 _feeRateBps,
        uint256 _interestRateBps
    ) external onlyOwner {
        require(_feeRateBps <= 500, "Fee rate max 5%");
        require(_interestRateBps <= 2000, "Interest rate max 20%");
        minCollateral = _minCollateral;
        feeRateBps = _feeRateBps;
        interestRateBps = _interestRateBps;
        emit VaultConfigUpdated(_minCollateral, _feeRateBps, _interestRateBps);
    }

    function accrueInterest(address owner) public {
        Position storage pos = positions[owner];
        if (!pos.exists || pos.musdBorrowed == 0 || interestRateBps == 0) return;

        uint256 elapsed = block.timestamp - pos.lastAccruedAt;
        if (elapsed == 0) return;

        uint256 interest = pos.musdBorrowed
            * interestRateBps
            * elapsed
            / (SECONDS_PER_YEAR * BASIS_POINTS);

        if (interest > 0) {
            pos.musdBorrowed += interest;
            pos.lastAccruedAt = block.timestamp;
            totalMusdBorrowed += interest;
            emit InterestAccrued(owner, interest);
        }
    }

    function depositCollateral() external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();

        Position storage pos = positions[msg.sender];
        if (!pos.exists) {
            pos.exists = true;
            pos.lastAccruedAt = block.timestamp;
        }
        pos.btcDeposited += msg.value;
        totalBtcDeposited += msg.value;

        emit CollateralDeposited(msg.sender, msg.value, pos.btcDeposited);
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        Position storage pos = positions[msg.sender];
        if (!pos.exists) revert PositionNotFound();
        if (pos.btcDeposited < amount) revert InsufficientCollateral();

        accrueInterest(msg.sender);
        if (pos.musdBorrowed > 0) revert OutstandingLoan();

        pos.btcDeposited -= amount;
        totalBtcDeposited -= amount;

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit CollateralWithdrawn(msg.sender, amount, pos.btcDeposited);
    }

    function getCollateralValue(address owner) public view returns (uint256) {
        Position storage pos = positions[owner];
        if (!pos.exists || pos.btcDeposited == 0) return 0;

        uint256 btcPrice = priceFeed.price();
        return pos.btcDeposited * btcPrice / 1e18;
    }

    function getMaxBorrow(address owner) public view returns (uint256) {
        Position storage pos = positions[owner];
        if (!pos.exists || pos.btcDeposited == 0) return 0;

        uint256 collateralValue = getCollateralValue(owner);
        uint256 maxBorrowVal = collateralValue * MAX_LTV_BPS / BASIS_POINTS;

        if (maxBorrowVal <= pos.musdBorrowed) return 0;
        return maxBorrowVal - pos.musdBorrowed;
    }

    function getCurrentLtv(address owner) public view returns (uint256) {
        Position storage pos = positions[owner];
        if (!pos.exists || pos.musdBorrowed == 0) return 0;

        uint256 collateralValue = getCollateralValue(owner);
        if (collateralValue == 0) return type(uint256).max;

        return pos.musdBorrowed * BASIS_POINTS / collateralValue;
    }

    function borrow(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        Position storage pos = positions[msg.sender];
        if (!pos.exists) revert PositionNotFound();

        accrueInterest(msg.sender);

        uint256 maxBorrow = getMaxBorrow(msg.sender);
        if (amount > maxBorrow) revert ExceedsMaxLTV();

        pos.musdBorrowed += amount;
        totalMusdBorrowed += amount;

        bool ok = musdToken.transfer(msg.sender, amount);
        if (!ok) revert TransferFailed();

        emit Borrowed(msg.sender, amount, pos.musdBorrowed);
    }

    function repay(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        Position storage pos = positions[msg.sender];
        if (!pos.exists) revert PositionNotFound();

        accrueInterest(msg.sender);
        if (amount > pos.musdBorrowed) revert OverRepay();

        pos.musdBorrowed -= amount;
        totalMusdBorrowed -= amount;

        bool ok = musdToken.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();

        emit Repaid(msg.sender, amount, pos.musdBorrowed);
    }

    function liquidate(address owner, uint256 debtToCover) external nonReentrant {
        if (debtToCover == 0) revert ZeroAmount();
        if (owner == msg.sender) revert();

        Position storage pos = positions[owner];
        if (!pos.exists) revert PositionNotFound();

        accrueInterest(owner);

        uint256 currentLtv = getCurrentLtv(owner);
        if (currentLtv <= LIQUIDATION_LTV_BPS) revert NotLiquidatable();

        if (debtToCover > pos.musdBorrowed) {
            debtToCover = pos.musdBorrowed;
        }

        uint256 penalty = debtToCover * LIQUIDATION_PENALTY_BPS / BASIS_POINTS;
        uint256 collateralToSeize = debtToCover + penalty;

        if (collateralToSeize > pos.btcDeposited) {
            collateralToSeize = pos.btcDeposited;
        }

        bool musdOk = musdToken.transferFrom(msg.sender, address(this), debtToCover);
        if (!musdOk) revert TransferFailed();

        pos.btcDeposited -= collateralToSeize;
        pos.musdBorrowed -= debtToCover;
        totalBtcDeposited -= collateralToSeize;
        totalMusdBorrowed -= debtToCover;

        (bool btcOk,) = payable(msg.sender).call{value: collateralToSeize}("");
        if (!btcOk) revert TransferFailed();

        emit Liquidated(owner, msg.sender, debtToCover, collateralToSeize);
    }

    function getHealthFactor(address owner) external view returns (uint256) {
        uint256 ltv = getCurrentLtv(owner);
        if (ltv == 0) return type(uint256).max;
        return LIQUIDATION_LTV_BPS * RAY / ltv;
    }

    receive() external payable {
        if (msg.value == 0) return;

        Position storage pos = positions[msg.sender];
        if (!pos.exists) {
            pos.exists = true;
            pos.lastAccruedAt = block.timestamp;
        }
        pos.btcDeposited += msg.value;
        totalBtcDeposited += msg.value;

        emit CollateralDeposited(msg.sender, msg.value, pos.btcDeposited);
    }
}
