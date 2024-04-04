const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:18888')
const web3 = new Web3(provider)
const BN = web3.utils.BN
const dec18 = new BN('1000000000000000000')
const ThetaPrivatenet = 'theta_privatenet';
const ThetaTestnet = 'theta_testnet';
const ThetaMainnet = 'theta_mainnet';
const Ganache = 'ganache';

const PogToken = artifacts.require("PogToken")

let name = "POG Coin";
let symbol = "POGS";
let decimal = 18;
let maxSupply = dec18.mul(new BN(2000000000));
let minter;
let stakerRewardPerBlock = dec18.mul(new BN(15)); // 300,000,000 token rewards over 4 years
let initDistrWallet;
let initMintAmount;
let admin;

module.exports = async function (deployer, network, accounts) {

    minter = getMinterAddress(network);
    if (network == ThetaMainnet) { // the Mainnet
        initDistrWallet = "0xfc69346b33735ea04d678ed0282983db851873b8";
        initMintAmount = dec18.mul(new BN(1700000000));
        admin = "0xfc69346b33735ea04d678ed0282983db851873b8";
    } else { // all the other testing networks
        initDistrWallet = "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
        initMintAmount = dec18.mul(new BN(1700000000));
        admin = "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
    }

    await deployer.deploy(PogToken, 
        name, symbol, decimal, 
        maxSupply,
        minter,
        stakerRewardPerBlock,
        initDistrWallet,
        initMintAmount,
        admin, { gas: 20000000 });
};

function getMinterAddress(network) {
    if (network == ThetaPrivatenet) {
        return "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
    } else if (network == ThetaTestnet) {
        return "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
    } else if (network == ThetaMainnet) {
        return "0xf0716e6221618137fB05D72450e0FC8d9c2919d4";
    } else if (network == Ganache) {
        return "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
    } else {
        throw "Invalid network!"
    }
}
