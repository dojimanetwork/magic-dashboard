'use strict';

const { ethers, upgrades } = require("hardhat");

async function deployEthCrossChainToken(deployerAccount, name, symbol, inboundStateSender, omniChainTokenContract) {
	const EthCrossChainTokenContract = await ethers.getContractFactory('EthereumCrossChainToken', deployerAccount);
	const ethCrossChainTokenContract = await upgrades.deployProxy(EthCrossChainTokenContract, [name, symbol, inboundStateSender, omniChainTokenContract], { initializer: 'initialize' });
	await ethCrossChainTokenContract.waitForDeployment();
	return ethCrossChainTokenContract;
}

async function deployEthCrossChainNFT(deployerAccount, name, symbol, inboundStateSender, omniChainNFTContract) {
	const EthCrossChainNFTContract = await ethers.getContractFactory('EthereumCrossChainNFT', deployerAccount);
	const ethCrossChainNFTContract = await upgrades.deployProxy(EthCrossChainNFTContract, [name, symbol, inboundStateSender, omniChainNFTContract], { initializer: 'initialize' });
	await ethCrossChainNFTContract.waitForDeployment();
	return ethCrossChainNFTContract;
}

module.exports = {
	deployEthCrossChainToken,
	deployEthCrossChainNFT,
}