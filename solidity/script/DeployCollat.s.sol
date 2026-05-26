// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {CollatVault} from "../src/CollatVault.sol";
import {PriceFeed} from "../src/PriceFeed.sol";

contract DeployCollat is Script {
    address constant MUSD_MATSNET = 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503;
    address constant MUSD_MAINNET = 0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186;

    uint256 constant INITIAL_BTC_PRICE = 60_000_000_000; // $60,000 (6dp)
    uint256 constant MIN_COLLATERAL = 1_000_000_000_000; // 0.000001 BTC (1e12 wei)
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

        PriceFeed priceFeed = new PriceFeed(INITIAL_BTC_PRICE);
        console2.log("PriceFeed deployed at:", address(priceFeed));

        CollatVault vault = new CollatVault(
            musdAddr,
            address(priceFeed),
            MIN_COLLATERAL,
            FEE_RATE_BPS,
            INTEREST_RATE_BPS
        );
        console2.log("CollatVault deployed at:", address(vault));

        vm.stopBroadcast();

        console2.log("\n=== Deployment Summary ===");
        console2.log("PriceFeed:", address(priceFeed));
        console2.log("Vault:", address(vault));
        console2.log("MUSD:", musdAddr);
        console2.log("Min Collateral:", MIN_COLLATERAL, "wei (0.000001 BTC)");
        console2.log("Initial BTC Price: $60,000");
        console2.log("Max LTV: 60%");
        console2.log("Liquidation LTV: 75%");
        console2.log("Liquidation Penalty: 5%");
        console2.log("Interest Rate: 5% APR");
        console2.log("Fee Rate: 0.5%");

        string memory addrs = _serializeAddrs(
            address(priceFeed),
            address(vault),
            musdAddr
        );
        vm.writeFile("./broadcast/deployed-addresses.json", addrs);
        console2.log("Addresses saved to broadcast/deployed-addresses.json");
    }

    function _serializeAddrs(
        address priceFeed,
        address vault,
        address musd
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{\n',
            '  "priceFeed": "', vm.toString(priceFeed), '",\n',
            '  "vault": "', vm.toString(vault), '",\n',
            '  "musd": "', vm.toString(musd), '"\n',
            '}\n'
        ));
    }
}
