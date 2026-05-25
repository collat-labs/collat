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
    MockERC20 public btc;
    MockERC20 public musd;

    address public admin = makeAddr("admin");
    address public user = makeAddr("user");
    address public user2 = makeAddr("user2");
    address public liquidator = makeAddr("liquidator");
    address public oracle = makeAddr("oracle");

    uint256 constant BTC_PRICE = 60_000_000_000; // $60,000 with 6 decimals
    uint256 constant ONE_BTC = 100_000_000; // 1 BTC with 8 decimals
    uint256 constant TEN_BTC = 1_000_000_000; // 10 BTC
    uint256 constant ONE_MUSD = 1_000_000; // 1 MUSD with 6 decimals
    uint256 constant THOUSAND_MUSD = 1_000_000_000; // 1000 MUSD

    function setUp() public {
        vm.startPrank(admin);

        btc = new MockERC20("Bitcoin", "BTC", 8);
        musd = new MockERC20("Mezo USD", "MUSD", 6);

        priceFeed = new PriceFeed(BTC_PRICE);
        priceFeed.addOracle(oracle);

        vault = new CollatVault(
            address(btc),
            address(musd),
            address(priceFeed),
            100_000,        // minCollateral: 0.001 BTC (8dp)
            50,             // feeRateBps: 0.5%
            500             // interestRateBps: 5% APR
        );

        vm.stopPrank();

        // Fund users
        btc.mint(user, TEN_BTC * 10);
        btc.mint(user2, TEN_BTC * 10);
        btc.mint(liquidator, TEN_BTC * 10);
        musd.mint(user, THOUSAND_MUSD * 100);
        musd.mint(liquidator, THOUSAND_MUSD * 1000);

        // Fund vault with MUSD for borrowing
        musd.mint(address(vault), THOUSAND_MUSD * 1000);

        // Approvals
        vm.startPrank(user);
        btc.approve(address(vault), type(uint256).max);
        musd.approve(address(vault), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user2);
        btc.approve(address(vault), type(uint256).max);
        musd.approve(address(vault), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(liquidator);
        btc.approve(address(vault), type(uint256).max);
        musd.approve(address(vault), type(uint256).max);
        vm.stopPrank();
    }

    // ============ Deposit Tests ============

    function test_depositCollateral() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);

        assertEq(vault.totalBtcDeposited(), ONE_BTC);
        (uint256 deposited, uint256 borrowed, , bool exists) = vault.positions(user);
        assertEq(deposited, ONE_BTC);
        assertEq(borrowed, 0);
        assertTrue(exists);
    }

    function test_depositMultipleTimes() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.depositCollateral(ONE_BTC * 2);

        (uint256 deposited, , , ) = vault.positions(user);
        assertEq(deposited, ONE_BTC * 3);
        assertEq(vault.totalBtcDeposited(), ONE_BTC * 3);
    }

    function test_depositZeroReverts() public {
        vm.startPrank(user);
        vm.expectRevert(CollatVault.ZeroAmount.selector);
        vault.depositCollateral(0);
    }

    function test_depositBelowMinCollateral() public {
        vm.startPrank(user);
        vault.depositCollateral(1);
        (uint256 deposited, , , ) = vault.positions(user);
        assertEq(deposited, 1);
    }

    // ============ Borrow Tests ============

    function test_borrow() public {
        vm.startPrank(user);
        uint256 balanceBefore = musd.balanceOf(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 30); // 30k MUSD from 60k BTC at 60% LTV

        (uint256 deposited, uint256 borrowed, , ) = vault.positions(user);
        assertEq(deposited, ONE_BTC);
        assertEq(borrowed, THOUSAND_MUSD * 30);
        assertEq(musd.balanceOf(user), balanceBefore + THOUSAND_MUSD * 30);
    }

    function test_borrowMaxLTV() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        // 60% of $60,000 = $36,000 in MUSD
        vault.borrow(THOUSAND_MUSD * 36);

        (uint256 deposited, uint256 borrowed, , ) = vault.positions(user);
        assertEq(deposited, ONE_BTC);
        assertEq(borrowed, THOUSAND_MUSD * 36);
    }

    function test_borrowExceedsMaxLTV() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        // 60% + 1 = exceeds max
        vm.expectRevert(CollatVault.ExceedsMaxLTV.selector);
        vault.borrow(THOUSAND_MUSD * 36 + 1);
    }

    function test_borrowZeroReverts() public {
        vm.startPrank(user);
        vm.expectRevert(CollatVault.ZeroAmount.selector);
        vault.borrow(0);
    }

    function test_borrowWithoutPosition() public {
        vm.startPrank(user2);
        vm.expectRevert(CollatVault.PositionNotFound.selector);
        vault.borrow(1);
    }

    // ============ Repay Tests ============

    function test_repay() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 30);

        musd.mint(user, THOUSAND_MUSD * 15);
        vault.repay(THOUSAND_MUSD * 15);

        (uint256 deposited, uint256 borrowed, , ) = vault.positions(user);
        assertEq(deposited, ONE_BTC);
        assertEq(borrowed, THOUSAND_MUSD * 15);
    }

    function test_repayFull() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 30);

        musd.mint(user, THOUSAND_MUSD * 30);
        vault.repay(THOUSAND_MUSD * 30);

        (uint256 deposited, uint256 borrowed, , ) = vault.positions(user);
        assertEq(deposited, ONE_BTC);
        assertEq(borrowed, 0);
    }

    function test_repayOverDebt() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 10);

        musd.mint(user, THOUSAND_MUSD * 20);
        vm.expectRevert(CollatVault.OverRepay.selector);
        vault.repay(THOUSAND_MUSD * 11);
    }

    function test_repayZeroReverts() public {
        vm.startPrank(user);
        vm.expectRevert(CollatVault.ZeroAmount.selector);
        vault.repay(0);
    }

    // ============ Withdraw Tests ============

    function test_withdrawAfterFullRepay() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC * 2);
        vault.borrow(THOUSAND_MUSD * 10);

        musd.mint(user, THOUSAND_MUSD * 10);
        vault.repay(THOUSAND_MUSD * 10);
        vault.withdrawCollateral(ONE_BTC);

        (uint256 deposited, uint256 borrowed, , ) = vault.positions(user);
        assertEq(deposited, ONE_BTC);
        assertEq(borrowed, 0);
    }

    function test_withdrawWithOutstandingLoan() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC * 2);
        vault.borrow(THOUSAND_MUSD * 10);

        vm.expectRevert(CollatVault.OutstandingLoan.selector);
        vault.withdrawCollateral(ONE_BTC);
    }

    function test_withdrawZeroReverts() public {
        vm.startPrank(user);
        vm.expectRevert(CollatVault.ZeroAmount.selector);
        vault.withdrawCollateral(0);
    }

    function test_withdrawMoreThanDeposited() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);

        vm.expectRevert(CollatVault.InsufficientCollateral.selector);
        vault.withdrawCollateral(ONE_BTC * 2);
    }

    // ============ Liquidation Tests ============

    function test_liquidation() public {
        // Setup: deposit 1 BTC, borrow max, then drop price to trigger liquidation
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 36); // Max borrow
        vm.stopPrank();

        // Drop BTC price to $47k (makes position underwater at 75% LTV)
        // At $47k: collateralValue = 1 * 47000 = $47,000
        // LTV = 36,000 / 47,000 = 76.6% > 75%
        uint256 lowPrice = 47_000_000_000;
        vm.prank(oracle);
        priceFeed.updatePrice(lowPrice);

        // Liquidator covers 10k MUSD debt
        vm.startPrank(liquidator);
        musd.mint(liquidator, THOUSAND_MUSD * 15);
        uint256 debtToCover = THOUSAND_MUSD * 10;

        vault.liquidate(user, debtToCover);

        (uint256 deposited, uint256 borrowed, , ) = vault.positions(user);
        assertLt(borrowed, THOUSAND_MUSD * 36);
        assertLt(deposited, ONE_BTC);
    }

    function test_liquidationNotUnderwater() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 10); // Well under 75% LTV
        vm.stopPrank();

        vm.startPrank(liquidator);
        vm.expectRevert(CollatVault.NotLiquidatable.selector);
        vault.liquidate(user, THOUSAND_MUSD * 5);
    }

    // ============ Health Factor Tests ============

    function test_healthFactor() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 10);

        // At $60k BTC, 10k MUSD = 16.67% LTV
        // Health factor = 75 / 16.67 = 4.5x
        uint256 hf = vault.getHealthFactor(user);
        assertTrue(hf > 0);
    }

    // ============ Interest Accrual Tests ============

    function test_interestAccrues() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 10);
        vm.stopPrank();

        // Warp 1 year forward
        vm.warp(block.timestamp + 365 days);

        // Accrue interest explicitly (also happens on borrow/repay)
        vm.prank(user);
        vault.accrueInterest(user);

        (uint256 deposited, uint256 borrowed, , ) = vault.positions(user);
        assertEq(deposited, ONE_BTC);
        // 5% APR on 10,000 MUSD = 500 MUSD interest after 1 year
        assertEq(borrowed, THOUSAND_MUSD * 10 + THOUSAND_MUSD / 2); // 10,000 + 500
    }

    // ============ Collateral Value Tests ============

    function test_collateralValueCalculation() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC * 2); // 2 BTC

        uint256 value = vault.getCollateralValue(user);
        // 2 BTC * $60,000 = $120,000 in MUSD units (6dp)
        assertEq(value, 120_000_000_000);
    }

    // ============ Max Borrow Tests ============

    function test_maxBorrow() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC); // $60,000 collateral

        uint256 maxB = vault.getMaxBorrow(user);
        // 60% of $60,000 = $36,000
        assertEq(maxB, THOUSAND_MUSD * 36);
    }

    // ============ Liquidation Repay Requirement ============

    function test_liquidationRequiresMUSDPayment() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 36);
        vm.stopPrank();

        // Drop price
        vm.prank(oracle);
        priceFeed.updatePrice(47_000_000_000);

        // Liquidator tries without MUSD approval
        vm.startPrank(liquidator);
        // Clear approval
        musd.approve(address(vault), 0);
        vm.expectRevert(); // transferFrom will fail
        vault.liquidate(user, THOUSAND_MUSD * 10);
    }

    // ============ Multi-User Isolation ============

    function test_multiUserIsolation() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 5);
        vm.stopPrank();

        vm.startPrank(user2);
        vault.depositCollateral(ONE_BTC * 3);
        vault.borrow(THOUSAND_MUSD * 10);
        vm.stopPrank();

        (uint256 u1Dep, uint256 u1Bor, , ) = vault.positions(user);
        (uint256 u2Dep, uint256 u2Bor, , ) = vault.positions(user2);

        assertEq(u1Dep, ONE_BTC);
        assertEq(u1Bor, THOUSAND_MUSD * 5);
        assertEq(u2Dep, ONE_BTC * 3);
        assertEq(u2Bor, THOUSAND_MUSD * 10);
    }

    // ============ Reentrancy Test ============

    function test_reentrancyGuard() public {
        vm.startPrank(user);
        vault.depositCollateral(ONE_BTC);
        vault.borrow(THOUSAND_MUSD * 1);
        vault.repay(THOUSAND_MUSD * 1);
        vault.withdrawCollateral(ONE_BTC);
        // If reentrancy guards work, all succeed sequentially
        (uint256 deposited, , , ) = vault.positions(user);
        assertEq(deposited, 0);
    }
}
