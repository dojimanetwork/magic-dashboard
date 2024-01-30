/** @type import('hardhat/config').HardhatUserConfig */
require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ethers');
// require("@nomiclabs/hardhat-truffle5");
require("@nomicfoundation/hardhat-chai-matchers")
// require('hardhat-ethernal');
// require("hardhat-tracer");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    dojimachain: {
      // url: "http://localhost:8545",
      // url: 'https://api-test.d11k.dojima.network',
      url: process.env.VITE_APP_DOJIMA_API_URL,
      chainId: 1001,
      // gas: 5000000, //units of gas you are willing to pay, aka gas limit
      gasPrice: 2000000000, // gas is typically in units of gwei, but you must enter it as wei here
      accounts: [
        process.env.VITE_APP_TEST_ACCOUNT_PVTKEY,
        // "ae1d058b9c5713848e7ac4c1901fac9a737729a34c10c997991c861dd7705ac0",
      ],
    },
    goerli: {
      // url: "http://localhost:9545",
      // url: `https://eth-goerli.g.alchemy.com/v2/TIMeEU-fdUdyD-YijUoB_AbdtlVfEcl2`,
      url: process.env.VITE_APP_ETH_GOERLI_ALCHEMY_URL,
      // chainId: 1337,
      // gas: 5000000, //units of gas you are willing to pay, aka gas limit
      gasPrice: 2000000000, // gas is typically in units of gwei, but you must enter it as wei here
      accounts: [
        process.env.VITE_APP_TEST_ACCOUNT_PVTKEY,
        // "ae1d058b9c5713848e7ac4c1901fac9a737729a34c10c997991c861dd7705ac0",
      ],
    },
    avalanche: {
      url: "http://127.0.0.1:9650/ext/bc/C/rpc",
      chainId: 43112,
      gas: 5000000, // units of gas you are willing to pay, aka gas limit
      gasPrice: 225000000000, // gas is typically in units of gwei, but you must enter it as wei here
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.VITE_APP_ETH_ETHERSCAN_APIKEY,
      // goerli: "6IU4JG5P2PNVRSB54YIAMIAQFQ879PXJ7C",
      dojimachain: 'dojima',
    },
    customChains: [
      {
        network: 'dojimachain',
        chainId: 1001,
        urls: {
          apiURL: process.env.VITE_APP_DOJIMA_BLOCKSCOUT_URL,
          browserURL: process.env.VITE_APP_DOJIMA_BLOCKSCOUT_API_URL
        },
        // urls: {
        //   apiURL: 'https://doj-bex-test.dojima.network/api',
        //   browserURL: 'https://doj-bex-test.dojima.network/',
        // },
      },
    ],
  },
};
