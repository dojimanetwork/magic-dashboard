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
	console.log("Token name : ", tokenName);
	console.log("Token symbol : ", tokenSymbol);
	console.log("Acc key : ", omniChainDeployerAccPrvKey);
	console.log("Globals : ", globalValues);
	const dojimaProvider = new ethers.JsonRpcProvider("http://localhost:8545");
	console.log("provider : ", dojimaProvider);
	// const FEE_DATA = {
	// 	maxFeePerGas:         ethers.parseUnits('100', 'gwei'),
	// 	maxPriorityFeePerGas: ethers.parseUnits('5',   'gwei'),
	// };
	
	// // Wrap the provider so we can override fee data.
	// const provider = new ethers.providers.FallbackProvider([ethers.provider], 1);
	// dojimaProvider.getFeeData = async () => FEE_DATA;
	const omniChainDeployerWallet = new ethers.Wallet(omniChainDeployerAccPrvKey, dojimaProvider);
	console.log("omniChainDeployerWallet : ", omniChainDeployerWallet);
	// deploy cross-chain token 'contract
	// const xTokenContract = await ethers.deployContract("XTokenContract", [tokenName, tokenSymbol, globalValues.token_decimal.dojima], omniChainDeployerWallet);
	// await xTokenContract.waitForDeployment();

	const OmniChainTokenContract = await ethers.getContractFactory("OmniChainTokenContract", omniChainDeployerWallet);
	const OmniChainAttachContract = await OmniChainTokenContract.attach("0x1715cBDCe62A95e9360e0655b0CaA0805947AD65");
	console.log("OmniChainAttachContract : ", OmniChainAttachContract);
	const omniChainContract = await upgrades.deployProxy(OmniChainAttachContract, [
		"0x37886387ba73300E80697A121E4794426a545545", "0x0000000000000000000000000000000000001100", "0x0000000000000000000000000000000000001001"
	], { initializer: 'initialize', txOverrides: { maxFeePerGas: 10e9 },
	})
	// const omniChainContract = await upgrades.deployProxy(OmniChainTokenContract, [xTokenContract.target, globalValues.state_contracts.OUTBOUND_STATE_SENDER_CONTRACT_ADDRESS, globalValues.state_contracts.STATE_SYNCER_VERIFIER_CONTRACT_ADDRESS], { initializer: 'initialize', 
	// 	gasPrice: (await dojimaProvider.getGasPrice()).mul(120).div(100),
	//    });
	console.log("omniChainContract : ", omniChainContract);
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
