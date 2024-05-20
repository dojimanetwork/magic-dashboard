import * as path from "path";
import * as _ from "lodash";
import { PATHS } from "./fs";
import { processCreate, processInstallNodeModules } from "./create";

const SOLIDITY_VERSION = "0.8.20";

export const processCreateHardhat = async (contractName: string) => {
  // Get the name of the project
  // const name = await getProjectName();
  const name = contractName;

  const pvtKey = `${process.env.VITE_APP_TEST_ACCOUNT_PVTKEY}`;

  // Create default anchor files, mirrored from anchor-cli
  const init = await processCreate({
    name,
    files: [
      // Folders
      [PATHS.DIRS.CONTRACTS, ""],
      [PATHS.DIRS.SCRIPTS, ""],

      // Solidity contracts
      [
        path.join(PATHS.DIRS.CONTRACTS, `${contractName}.sol`),
        `
        // SPDX-License-Identifier: UNLICENSED
        pragma solidity ^0.8.19;

        import '@dojimanetwork/dojima-contracts/contracts/interfaces/IOutboundStateSender.sol';

        contract ${contractName} {

            address public owner;

            address public stateSyncer;
            IOutboundStateSender public outboundStateSender;

            event DataTransferredToChain(bytes32 indexed destinationChain, bytes payload);

          
            modifier onlyStateSyncer() {
                require(isCallerStateSyncer(), 'State syncer: caller is not the state syncer contract');
                _;
            }

            constructor(address _outboundStateSender) {
                // default state syncer contract
                stateSyncer = ${process.env.VITE_APP_STATE_SYNCER_VERIFIER_CONTRACT_ADDRESS};
                outboundStateSender = IOutboundStateSender(_outboundStateSender);

                owner = msg.sender;
            }

            function isCallerStateSyncer() public view returns (bool) {
                return msg.sender == stateSyncer;
            }

            // Payload should coontain all necessary information required to process 'TokenTransfer'
            // on destination chain
            function xChainDataTransfer( 
                bytes32 destinationChain,
                bytes memory destinationContractAddress,
                bytes memory payload
            ) external payable
            {
                //Check - destination chain should only be SOLANA(in this example)

                //Call 'transferPayload' function of OutboundStateSender
              outboundStateSender.transferPayload{value: msg.value}(
                    destinationChain,
                    destinationContractAddress,
                    msg.sender,
                    payload 
                );
                emit DataTransferredToChain(destinationChain, payload);
            }

            function onStateReceive(uint256 /* id */, bytes calldata data) external onlyStateSyncer {
                //Decode the data corresponding to the encoding mechanism on the target chain(SOL)
                //Process the decoded data accordingly
            }
            
        }
        `,
      ],

      [
        path.join(PATHS.DIRS.SCRIPTS, `${contractName}.js`),
        `
        const { ethers } = require('hardhat');

        const omniChainDeployerAccPrvKey = '${pvtKey}';

        // network config
        const dojimaURL = '${process.env.VITE_APP_DOJIMA_URL}';

        const dojimaProvider = new ethers.JsonRpcProvider(dojimaURL);
        const omniChainDeployerWallet = new ethers.Wallet(omniChainDeployerAccPrvKey, dojimaProvider);

        // State Contracts
          const outboundStateSenderContract = '${process.env.VITE_APP_OUTBOUND_STATE_SENDER_CONTRACT_ADDRESS}';

        async function main() {

            const xchainDataTransfer = await ethers.getContractFactory("${contractName}");
            await xchainDataTransfer.connect(omniChainDeployerWallet);
            const contract = await xchainDataTransfer.deploy(outboundStateSenderContract);
            await contract.waitForDeployment();
            console.log("Contract Address: ", await contract.getAddress());
            
        }

        main()
          .then(() => process.exit(0))
          .catch(error => {
            console.error(error);
            process.exit(1);
          });
        `
      ],

      [
        PATHS.FILES.HARDHAT_CONFIG,
        `/** @type import('hardhat/config').HardhatUserConfig */
        require('@nomicfoundation/hardhat-toolbox');
        require('@nomicfoundation/hardhat-ethers');
        require('@openzeppelin/hardhat-upgrades');
        // require("@nomiclabs/hardhat-truffle5");
        require("@nomicfoundation/hardhat-chai-matchers")
        // require('hardhat-ethernal');
        // require("hardhat-tracer");
        
        module.exports = {
          solidity: {
            version: "${SOLIDITY_VERSION}",
            settings: {
              optimizer: {
                enabled: true,
                runs: 200
              }
            }
          },
          networks: {
            dojima: {
              url: '${process.env.VITE_APP_DOJIMA_URL}',
              chainId: 1001,
              // gas: 5000000, //units of gas you are willing to pay, aka gas limit
              gasPrice: 2000000000, // gas is typically in units of gwei, but you must enter it as wei here
              accounts: [
                // process.env.VITE_APP_TEST_ACCOUNT_PVTKEY,
                "ae1d058b9c5713848e7ac4c1901fac9a737729a34c10c997991c861dd7705ac0",
              ],
            },
            holesky_ethereum: {
              url: '${process.env.VITE_APP_ETH_URL}',
              chainId: 17000,
              // gas: 5000000, //units of gas you are willing to pay, aka gas limit
              gasPrice: 2000000000, // gas is typically in units of gwei, but you must enter it as wei here
              accounts: [
                "ae1d058b9c5713848e7ac4c1901fac9a737729a34c10c997991c861dd7705ac0",
              ],
            },
            ethereum: {
              url: "${process.env.VITE_APP_ETH_GOERLI_ALCHEMY_URL}",
              chainId: 1337,
              // gas: 5000000, //units of gas you are willing to pay, aka gas limit
              gasPrice: 2000000000, // gas is typically in units of gwei, but you must enter it as wei here
              accounts: [
                // process.env.VITE_APP_TEST_ACCOUNT_PVTKEY,
                "ae1d058b9c5713848e7ac4c1901fac9a737729a34c10c997991c861dd7705ac0",
              ],
            },
            avalanche: {
              url: "${process.env.VITE_APP_AVAX_URL}",
              chainId: 43112,
              gas: 5000000, // units of gas you are willing to pay, aka gas limit
              gasPrice: 225000000000, // gas is typically in units of gwei, but you must enter it as wei here
            },
            bsc: {
              url: "${process.env.VITE_APP_BSC_URL}",
              chainId: 97,
              gasPrice: 20000000000,
              accounts: [
                "ae1d058b9c5713848e7ac4c1901fac9a737729a34c10c997991c861dd7705ac0",
              ],
            },
          },
          etherscan: {
            apiKey: {
              ethereum: "6IU4JG5P2PNVRSB54YIAMIAQFQ879PXJ7C",
              dojima: 'dojima',
              bsc: "7X1FZ7XNHKPHMXA6VXFX56I533BP7KW3MW",
            },
            customChains: [
              {
                network: 'dojima',
                chainId: 1001,
                urls: {
                  apiURL: "${process.env.VITE_APP_DOJIMA_BLOCKSCOUT_URL}",
                  browserURL: "${process.env.VITE_APP_DOJIMA_BLOCKSCOUT_API_URL}"
                },
                // urls: {
                //   apiURL: 'https://doj-bex-test.dojima.network/api',
                //   browserURL: 'https://doj-bex-test.dojima.network/',
                // },
              },
            ],
          },
        };
        `
      ],

      // .gitignore
      [
        PATHS.FILES.GITIGNORE,
        `node_modules
        .env
        
        # Hardhat files
        /cache
        /artifacts
        
        # TypeChain files
        /typechain
        /typechain-types
        
        # solidity-coverage files
        /coverage
        /coverage.json
        
        # Hardhat Ignition default folder for deployments against a local node
        ignition/deployments/chain-31337
`,
      ],

      // package.json
      [
        PATHS.FILES.PACKAGE_JSON,
        `{
          "name": "${contractName}",
          "version": "1.0.0",
          "main": "index.js",
          "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1"
          },
          "author": "",
          "license": "ISC",
          "description": "",
          "devDependencies": {
            "@nomicfoundation/hardhat-toolbox": "^5.0.0",
            "@nomicfoundation/hardhat-chai-matchers": "^2.0.0",
            "@nomicfoundation/hardhat-ethers": "^3.0.0",
            "@nomicfoundation/hardhat-network-helpers": "^1.0.0",
            "@nomicfoundation/hardhat-verify": "^1.0.0",
            "@nomiclabs/hardhat-ethers": "2.2.3",
            "@typechain/ethers-v6": "^0.4.0",
            "@typechain/hardhat": "^8.0.0",
          },
          "dependencies": {
            "@dojimanetwork/dojima-contracts": "^0.1.2",
            "child_process": "^1.0.2",
            "dotenv": "16.4.1",
            "ethers": "^6.8.0",
            "hardhat": "^2.19.4",
            "hardhat-gas-reporter": "^1.0.8",
            "lodash": "4.17.21",
            "solidity-coverage": "^0.8.0",
            "typechain": "8.3.2",
            "web3": "^4.8.0"
          }
        }
        `,
      ],

      // tsconfig.json
      [
        PATHS.FILES.TSCONFIG_JSON,
        `{
          "compilerOptions": {
            "target": "es2020",
            "module": "commonjs",
            "esModuleInterop": true,
            "forceConsistentCasingInFileNames": true,
            "strict": true,
            "skipLibCheck": true,
            "resolveJsonModule": true
          }
        }
      `,
      ],
    ],
  });

  await processInstallNodeModules(name);

  return init;
};
