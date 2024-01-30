const { ethers, upgrades } = require('hardhat');
const { deployEthCrossChainToken } = require('./deploy_eth_cross_chain_token.js');
const globalValues = require("../../global-values.json");

async function deployOmnichainTokenContracts(tokenName, tokenSymbol, omniChainDeployerAccPrvKey) {
	// Check if required parameters are provided
	if (!tokenName || !tokenSymbol || !omniChainDeployerAccPrvKey) {
		console.error('Missing required parameters: tokenName, tokenSymbol, omniChainDeployerAccPrvKey');
		process.exitCode = 1;
		return;
	}

	const dojimaProvider = new ethers.JsonRpcProvider(globalValues.urls.dojima.api);
	const omniChainDeployerWallet = new ethers.Wallet(omniChainDeployerAccPrvKey, dojimaProvider);

	// deploy cross-chain token 'contract
	const xTokenContract = await ethers.deployContract("XTokenContract", [tokenName, tokenSymbol, globalValues.token_decimal.dojima], omniChainDeployerWallet);
	await xTokenContract.waitForDeployment();
	console.log(`XTokenContract deployed to: ${xTokenContract.target}`);

	const OmniChainTokenContract = await ethers.getContractFactory("OmniChainTokenContract", omniChainDeployerWallet);
	const omniChainContract = await upgrades.deployProxy(OmniChainTokenContract, [xTokenContract.target, globalValues.state_contracts.OUTBOUND_STATE_SENDER_CONTRACT_ADDRESS, globalValues.state_contracts.STATE_SYNCER_VERIFIER_CONTRACT_ADDRESS], { initializer: 'initialize' });
	await omniChainContract.waitForDeployment();
	console.log(`OmniChainContract deployed to: ${await omniChainContract.target}`);

	const ethCrossChainTokenContract = await deployEthCrossChainToken(
		new ethers.Wallet(omniChainDeployerAccPrvKey, new ethers.JsonRpcProvider(globalValues.urls.ethereum.goerli_alchemy)),
		tokenName,
		tokenSymbol,
		globalValues.state_contracts.INBOUND_STATE_SENDER_CONTRACT_ADDRESS,
		omniChainContract.target
	);
	console.log(`EthCrossChainTokenContract address: ${ethCrossChainTokenContract.target}`);

	return {
		OmniChainTokenContract: omniChainContract,
		XTokenContract: xTokenContract,
		EthCrossChainTokenContract: ethCrossChainTokenContract
	};
}

module.exports = deployOmnichainTokenContracts;
