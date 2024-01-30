const { ethers, upgrades } = require('hardhat');
const { deployEthCrossChainNFT } = require('./deploy_eth_cross_chain_token.js');
const globalValues = require("../../global-values.json");

async function deployNFTContracts(tokenName, tokenSymbol, omniChainDeployerAccPrvKey) {
    // Check if required parameters are provided
    if (!tokenName || !tokenSymbol || !omniChainDeployerAccPrvKey) {
        console.error('Missing required parameters: tokenName, tokenSymbol, omniChainDeployerAccPrvKey');
        process.exitCode = 1;
        return;
    }

    const dojimaProvider = new ethers.JsonRpcProvider(globalValues.urls.dojima.api);
    const omniChainDeployerWallet = new ethers.Wallet(omniChainDeployerAccPrvKey, dojimaProvider);

    // deploy cross-chain NFT 'contract
    const xNFTContract = await ethers.deployContract("XNFTContract", [tokenName, tokenSymbol], omniChainDeployerWallet);
    await xNFTContract.waitForDeployment();
    console.log(`xNFTContract deployed to: ${xNFTContract.target}`);

    const OmniChainNFTContract = await ethers.getContractFactory("OmniChainNFTContract", omniChainDeployerWallet);
    const omniChainContract = await upgrades.deployProxy(OmniChainNFTContract, [xNFTContract.target, globalValues.state_contracts.OUTBOUND_STATE_SENDER_CONTRACT_ADDRESS, globalValues.state_contracts.STATE_SYNCER_VERIFIER_CONTRACT_ADDRESS], { initializer: 'initialize' });
    await omniChainContract.waitForDeployment();
    console.log(`OmniChainNFTContract deployed to: ${await omniChainContract.target}`);

    const ethCrossChainNFTContract = await deployEthCrossChainNFT(
        new ethers.Wallet(omniChainDeployerAccPrvKey, new ethers.JsonRpcProvider(globalValues.urls.ethereum.goerli_alchemy)),
        tokenName,
        tokenSymbol,
        globalValues.state_contracts.INBOUND_STATE_SENDER_CONTRACT_ADDRESS,
        omniChainContract.target
    );
    console.log(`EthereumCrossChainNFT address: ${ethCrossChainNFTContract.target}`);

    return {
        OmniChainNFTContract: omniChainContract,
        xNFTContract: xNFTContract,
        EthereumCrossChainNFT: ethCrossChainNFTContract
    };
}

module.exports = deployNFTContracts;
