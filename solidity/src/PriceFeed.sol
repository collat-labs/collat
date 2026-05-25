// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PriceFeed is Ownable {
    uint256 public price;
    uint256 public updatedAt;
    uint256 public constant STALENESS_THRESHOLD = 1 hours;
    address[] public authorizedOracles;
    mapping(address => bool) public isOracle;

    event PriceUpdated(uint256 price, uint256 timestamp);
    event OracleAdded(address oracle);
    event OracleRemoved(address oracle);

    error UnauthorizedOracle();
    error StalePrice();
    error AlreadyOracle();
    error NotOracle();
    error ZeroAddress();

    constructor(uint256 _initialPrice) Ownable(msg.sender) {
        require(_initialPrice > 0, "Price must be > 0");
        price = _initialPrice;
        updatedAt = block.timestamp;
        authorizedOracles.push(msg.sender);
        isOracle[msg.sender] = true;
    }

    modifier onlyOracle() {
        _onlyOracle();
        _;
    }

    function _onlyOracle() internal view {
        if (!isOracle[msg.sender]) revert UnauthorizedOracle();
    }

    function addOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert ZeroAddress();
        if (isOracle[_oracle]) revert AlreadyOracle();
        isOracle[_oracle] = true;
        authorizedOracles.push(_oracle);
        emit OracleAdded(_oracle);
    }

    function removeOracle(address _oracle) external onlyOwner {
        if (!isOracle[_oracle]) revert NotOracle();
        isOracle[_oracle] = false;
        for (uint256 i = 0; i < authorizedOracles.length; i++) {
            if (authorizedOracles[i] == _oracle) {
                authorizedOracles[i] = authorizedOracles[authorizedOracles.length - 1];
                authorizedOracles.pop();
                break;
            }
        }
        emit OracleRemoved(_oracle);
    }

    function updatePrice(uint256 _price) external onlyOracle {
        require(_price > 0, "Price must be > 0");
        price = _price;
        updatedAt = block.timestamp;
        emit PriceUpdated(_price, block.timestamp);
    }

    function getPrice() external view returns (uint256) {
        if (block.timestamp > updatedAt + STALENESS_THRESHOLD) revert StalePrice();
        return price;
    }

    function getPriceUnsafe() external view returns (uint256) {
        return price;
    }

    function oracleCount() external view returns (uint256) {
        return authorizedOracles.length;
    }
}
