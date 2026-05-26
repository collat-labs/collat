// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {CollatVault} from "../src/CollatVault.sol";
import {PriceFeed} from "../src/PriceFeed.sol";

contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= amount, "insufficient allowance");
            allowance[from][msg.sender] = allowed - amount;
        }
        require(balanceOf[from] >= amount, "insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract CollatVaultTest is Test {
    CollatVault public vault;
    PriceFeed public priceFeed;
    MockERC20 public musd;

    address public admin = makeAddr("admin");
    address public user = makeAddr("user");
    address public user2 = makeAddr("user2");
    address public liquidator = makeAddr("liquidator");
    address public oracle = makeAddr("oracle");

    uint256 constant BTC_PRICE = 60_000_000_000; // $60,000 with 6 decimals
    uint256 constant ONE_BTC = 1 ether; // 1 BTC = 1e18 wei
    uint256 constant TEN_BTC = 10 ether;
    uint256 constant ONE_MUSD = 1_000_000; // 1 MUSD with 6 decimals
    uint256 constant THOUSAND_MUSD = 1_000_000_000;

    function setUp() public {
        vm.startPrank(admin);

        musd = new MockERC20("Mezo USD", "MUSD", 6);

        priceFeed = new PriceFeed(BTC_PRICE);
        priceFeed.addOracle(oracle);

        vault = new CollatVault(
            address(musd),
            address(priceFeed),
            100_000_000_000_000, // min: 0.0001 BTC (1e14 wei)
            50,                  // feeRateBps: 0.5%
            500                  // interestRateBps: 5% APR
        );

        vm.stopPrank();
    }

    function deposit(address who, uint256 amount) internal {
        vm.deal(who, amount);
        vm.prank(who);
        vault.depositCollateral{value: amount}();
    }

    // ─── DEPOSIT ───
    function test_deposit() public {
        deposit(user, ONE_BTC);
        (uint256 deposited, uint256 debt,,) = vault.positions(user);
        assertEq(deposited, ONE_BTC);
        assertEq(vault.totalBtcDeposited(), ONE_BTC);
    }

    function test_deposit_multiple() public {
        deposit(user, ONE_BTC);
        deposit(user, ONE_BTC * 2);
        (uint256 deposited, uint256 debt,,) = vault.positions(user);
        assertEq(deposited, ONE_BTC * 3);
        assertEq(vault.totalBtcDeposited(), ONE_BTC * 3);
    }

    function test_deposit_zero_revert() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert(CollatVault.ZeroAmount.selector);
        vault.depositCollateral{value: 0}();
    }

    // ─── BORROW ───
    function test_borrow() public {
        deposit(user, ONE_BTC);
        mintMusd(address(vault), ONE_MUSD * 100_000);
        vm.prank(user);
        vault.borrow(ONE_MUSD * 1_000);
        (uint256 deposited, uint256 debt,,) = vault.positions(user);
        assertEq(deposited, ONE_BTC);
        assertEq(debt, ONE_MUSD * 1_000);
    }

    function test_borrow_exceeds_ltv_revert() public {
        deposit(user, ONE_BTC);
        mintMusd(address(vault), THOUSAND_MUSD * 100);
        vm.prank(user);
        vm.expectRevert(CollatVault.ExceedsMaxLTV.selector);
        vault.borrow(ONE_MUSD * 100_000); // exceeds 60% LTV
    }

    function test_borrow_no_position_revert() public {
        vm.prank(user);
        vm.expectRevert(CollatVault.PositionNotFound.selector);
        vault.borrow(ONE_MUSD);
    }

    // ─── REPAY ───
    function test_repay() public {
        deposit(user, ONE_BTC);
        mintMusd(address(vault), ONE_MUSD * 100_000);
        vm.prank(user);
        vault.borrow(ONE_MUSD * 1_000);
        mintMusd(user, ONE_MUSD * 500);
        vm.prank(user);
        musd.approve(address(vault), ONE_MUSD * 500);
        vm.prank(user);
        vault.repay(ONE_MUSD * 500);
        (, uint256 debt,,) = vault.positions(user);
        assertEq(debt, ONE_MUSD * 500);
    }

    function test_repay_full() public {
        deposit(user, ONE_BTC);
        mintMusd(address(vault), ONE_MUSD * 100_000);
        vm.prank(user);
        vault.borrow(ONE_MUSD * 1_000);
        mintMusd(user, ONE_MUSD * 1_000);
        vm.prank(user);
        musd.approve(address(vault), ONE_MUSD * 1_000);
        vm.prank(user);
        vault.repay(ONE_MUSD * 1_000);
        (, uint256 debt,,) = vault.positions(user);
        assertEq(debt, 0);
    }

    function test_repay_over_revert() public {
        deposit(user, ONE_BTC);
        mintMusd(address(vault), ONE_MUSD * 100_000);
        vm.prank(user);
        vault.borrow(ONE_MUSD * 1_000);
        mintMusd(user, ONE_MUSD * 2_000);
        vm.prank(user);
        musd.approve(address(vault), ONE_MUSD * 2_000);
        vm.prank(user);
        vm.expectRevert(CollatVault.OverRepay.selector);
        vault.repay(ONE_MUSD * 2_000);
    }

    // ─── WITHDRAW ───
    function test_withdraw() public {
        deposit(user, ONE_BTC);
        vm.prank(user);
        vault.withdrawCollateral(ONE_BTC / 2);
        (uint256 deposited, uint256 debt,,) = vault.positions(user);
        assertEq(deposited, ONE_BTC / 2);
    }

    function test_withdraw_with_loan_revert() public {
        deposit(user, ONE_BTC);
        mintMusd(address(vault), ONE_MUSD * 100_000);
        vm.prank(user);
        vault.borrow(ONE_MUSD * 1_000);
        vm.prank(user);
        vm.expectRevert(CollatVault.OutstandingLoan.selector);
        vault.withdrawCollateral(ONE_BTC / 2);
    }

    function test_withdraw_more_than_deposited_revert() public {
        deposit(user, ONE_BTC);
        vm.prank(user);
        vm.expectRevert(CollatVault.InsufficientCollateral.selector);
        vault.withdrawCollateral(ONE_BTC * 2);
    }

    // ─── HEALTH / LTV ───
    function test_health_factor() public {
        deposit(user, ONE_BTC);
        uint256 health = vault.getHealthFactor(user);
        assertEq(health, type(uint256).max); // no debt = infinite health
    }

    function test_collateral_value() public {
        deposit(user, ONE_BTC);
        uint256 value = vault.getCollateralValue(user);
        assertEq(value, BTC_PRICE); // 1 BTC * $60k
    }

    function test_max_borrow() public {
        deposit(user, ONE_BTC);
        uint256 maxB = vault.getMaxBorrow(user);
        assertEq(maxB, BTC_PRICE * 6000 / 10000);
    }

    // ─── LIQUIDATION ───
    function test_liquidate() public {
        deposit(user, ONE_BTC);
        mintMusd(address(vault), ONE_MUSD * 100_000);
        vm.prank(user);
        vault.borrow(ONE_MUSD * 30_000); // 50% LTV

        // Drop price to trigger liquidation
        vm.prank(oracle);
        priceFeed.updatePrice(BTC_PRICE / 2); // $30k, now ~100% LTV

        mintMusd(liquidator, ONE_MUSD * 40_000);
        vm.prank(liquidator);
        musd.approve(address(vault), ONE_MUSD * 40_000);

        vm.prank(liquidator);
        vault.liquidate(user, ONE_MUSD * 30_000);

        (, uint256 debt,,) = vault.positions(user);
        assertEq(debt, 0);
    }

    function test_liquidate_not_underwater_revert() public {
        deposit(user, ONE_BTC);
        mintMusd(address(vault), ONE_MUSD * 100_000);
        vm.prank(user);
        vault.borrow(ONE_MUSD * 10_000); // well below 75%

        mintMusd(liquidator, ONE_MUSD * 20_000);
        vm.prank(liquidator);
        musd.approve(address(vault), ONE_MUSD * 20_000);

        vm.prank(liquidator);
        vm.expectRevert(CollatVault.NotLiquidatable.selector);
        vault.liquidate(user, ONE_MUSD * 10_000);
    }

    // ─── INTEREST ───
    function test_interest_accrual() public {
        deposit(user, ONE_BTC);
        mintMusd(address(vault), ONE_MUSD * 100_000);
        vm.prank(user);
        vault.borrow(ONE_MUSD * 10_000);
        (, uint256 debtBefore,,) = vault.positions(user);

        vm.warp(block.timestamp + 365 days);
        vault.accrueInterest(user);

        (, uint256 debtAfter,,) = vault.positions(user);
        assertApproxEqRel(debtAfter, debtBefore + debtBefore * 500 / 10000, 0.01e18);
    }

    // ─── MULTI-USER ───
    function test_multi_user_isolation() public {
        deposit(user, ONE_BTC);
        deposit(user2, ONE_BTC * 2);

        mintMusd(address(vault), THOUSAND_MUSD * 100);
        vm.prank(user);
        vault.borrow(ONE_MUSD * 20_000);

        (uint256 d1, uint256 debt1,,) = vault.positions(user);
        (uint256 d2, uint256 debt2,,) = vault.positions(user2);

        assertEq(d1, ONE_BTC);
        assertEq(debt1, ONE_MUSD * 20_000);
        assertEq(d2, ONE_BTC * 2);
        assertEq(debt2, 0);
    }

    // ─── HELPERS ───
    function mintMusd(address to, uint256 amount) internal {
        vm.prank(admin);
        musd.mint(to, amount);
    }

    receive() external payable {}
}
