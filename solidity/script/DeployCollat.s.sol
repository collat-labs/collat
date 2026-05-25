// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {CollatVault} from "../src/CollatVault.sol";
import {PriceFeed} from "../src/PriceFeed.sol";
import {MockBTCToken} from "../src/MockBTCToken.sol";

contract DeployCollat is Script {
    // Deployed MUSD on Mezo matsnet
    address constant MUSD_MATSNET = 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503;
    // Deployed MUSD on Mezo mainnet
    address constant MUSD_MAINNET = 0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186;

    uint256 constant INITIAL_BTC_PRICE = 60_000_000_000; // $60,000 (6dp)
    uint256 constant MIN_COLLATERAL = 100_000; // 0.001 BTC (8dp)
    uint256 constant FEE_RATE_BPS = 50; // 0.5%
    uint256 constant INTEREST_RATE_BPS = 500; // 5% APR

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        bool isTestnet = block.chainid == 31611;

        address musdAddr = isTestnet ? MUSD_MATSNET : MUSD_MAINNET;

        console2.log("Deployer:", deployer);
        console2.log("Chain ID:", block.chainid);
        console2.log("Network:", isTestnet ? "matsnet (testnet)" : "mainnet");
        console2.log("MUSD Address:", musdAddr);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy PriceFeed
        PriceFeed priceFeed = new PriceFeed(INITIAL_BTC_PRICE);
        console2.log("PriceFeed deployed at:", address(priceFeed));

        // 2. Deploy MockBTC Token (testnet) or use bridged BTC (mainnet)
        MockBTCToken btcToken = new MockBTCToken();
        console2.log("BTC Token deployed at:", address(btcToken));

        // 3. Deploy CollatVault
        CollatVault vault = new CollatVault(
            address(btcToken),
            musdAddr,
            address(priceFeed),
            MIN_COLLATERAL,
            FEE_RATE_BPS,
            INTEREST_RATE_BPS
        );
        console2.log("CollatVault deployed at:", address(vault));

        // 4. Mint some test BTC to deployer
        uint256 testBTC = 1_000_000_000; // 10 BTC (8dp)
        btcToken.mint(deployer, testBTC);
        console2.log("Minted", testBTC, "BTC tokens to deployer");

        // 5. Approve vault to spend deployer's BTC
        btcToken.approve(address(vault), type(uint256).max);

        vm.stopBroadcast();

        console2.log("\n=== Deployment Summary ===");
        console2.log("PriceFeed:", address(priceFeed));
        console2.log("BTC Token:", address(btcToken));
        console2.log("Vault:", address(vault));
        console2.log("MUSD:", musdAddr);
        console2.log("Min Collateral:", MIN_COLLATERAL);
        console2.log("Initial BTC Price: $60,000");
        console2.log("Max LTV: 60%");
        console2.log("Liquidation LTV: 75%");
        console2.log("Liquidation Penalty: 5%");
        console2.log("Interest Rate: 5% APR");
        console2.log("Fee Rate: 0.5%");

        // Write addresses for frontend
        string memory addrs = _serializeAddrs(
            address(priceFeed),
            address(btcToken),
            address(vault),
            musdAddr
        );
        vm.writeFile("./broadcast/deployed-addresses.json", addrs);
        console2.log("\nAddresses saved to broadcast/deployed-addresses.json");
    }

    function _serializeAddrs(
        address priceFeed,
        address btcToken,
        address vault,
        address musd
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{\n',
            '  "priceFeed": "', vm.toString(priceFeed), '",\n',
            '  "btcToken": "', vm.toString(btcToken), '",\n',
            '  "vault": "', vm.toString(vault), '",\n',
            '  "musd": "', vm.toString(musd), '"\n',
            '}\n'
        ));
    }
}
