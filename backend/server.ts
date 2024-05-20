// server/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import winston from "winston";
import timeout from "connect-timeout";
// import { compile } from "./scripts/utils";
// import { deployDOJContractHandler } from "./scripts/dojima/deployContract";
import { deployETHContractHandler } from "./scripts/ethereum/deployContract";
import { DeployableChainsData, DeployContract } from "./scripts/deploy";
import {
  DeployBSCChainScript,
  DeployChainScript,
  DeployDOJChainScript,
  DeployETHChainScript,
  DeployOmniChainScript,
} from "./scripts";
import { OmniChainDeployableData } from "./scripts/types";
import { SolDojTokenTemplate } from "./setup/sol-evm-token/deployTemplate";
import { SolDojTokenTemplateParams } from "./setup/sol-evm-token/types";
import { DojSolDataTransferTemplate } from "./setup/evm-sol-data-transfer/deployTemplate";
import { DojSolDataTransferTemplateParams } from "./setup/evm-sol-data-transfer/types";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.VITE_APP_BACKEND_PORT;

// var allowedOrigin = ['http://localhost:3012'];
// // // Example: Allow requests only from 'http://localhost:3001'
// // const corsOptions = {
// //   origin: function (origin: any, callback: any) {
// //     if (allowedOrigin.indexOf(origin) !== -1 || !origin) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error("CORS error"));
// //     }
// //   },
// // };

// const corsOptions = {
//   origin: allowedOrigin,
//   optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// Define allowed origins
// const allowedOrigin = ['http://localhost:3012', 'https://magic-dashboard.test.dojima.network'];

// // CORS middleware
// const corsOptions = {
//   origin: function (origin: any, callback: any) {
//     if (allowedOrigin.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   optionsSuccessStatus: 204, // Some legacy browsers choke on 204
// };

// // Then pass these options to cors:

// app.use(cors(corsOptions));

// Enable CORS for all routes
app.use(cors());

app.use(express.json()); // Parse JSON in the request body

// app.options("*", cors()); // Enable preflight for all routes

// // Custom middleware for handling OPTIONS requests
// app.options('*', (req, res) => {
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.sendStatus(204);
// });

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', `${process.env.VITE_APP_MAGIC_DASHBOARD_URL}`);
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

// app.use((req, res, next) => {
//   res.set({
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "*",
//       "Access-Control-Allow-Headers": "'Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token'",
//   });

//   next();
// });

// app.options("*", cors()); // Enable preflight for all routes

// app.get('/', async (req, res) => {
//   // const {contract, contractName} = req.query;
//   // const result = await compile(contract as string, contractName as string);
//   console.log("Url : ", process.env.VITE_APP_DOJIMA_API_URL);
//   console.log("Phrase : ", process.env.VITE_APP_TEST_ACCOUNT_PHRASE);
//   res.send(process.env.VITE_APP_DOJIMA_API_URL);
//   // res.send(result);
// });

// // app.get('/compile', (req, res) => {
// //   const { contractName, code } = req.query;
// //   const result = compile(code as string, contractName as string);
// //   res.send(result);
// // });

// app.post('/compile', async (req, res) => {
//   const { data } = req.body;
//   console.log("Data : ", data)
//   const params = {
//     contractCode: data.contractCode,
//     contractName: data.contractName,
//     args: data.args
//   }
//   const result = await deployETHContractHandler(params);
//   res.send(result);
// });

// // New POST endpoint to deploy an EVM contract
// app.post('/deployEVMContract', async (req, res) => {
//   const { contractCode, contractName, args } = req.body;
//   console.log("Code : ", contractCode);
//   console.log("Name : ", contractName);
//   console.log("Args : ", args);
//   // Your logic to deploy the EVM contract goes here...
//   // // For now, just echoing back the received parameters.
//   // res.json({ contractCode, contractName, args });
//   const result = await deployETHContractHandler({
//     contractCode,
//     contractName,
//     args
//   });
//   res.send(result);
//   // const result = await deployDOJContractHandler({
//   //   contractCode,
//   //   contractName,
//   //   args
//   // });
//   // res.send(result);
// });

// Set a timeout of 30 seconds for all routes
app.use(timeout("1500s"));

// This middleware will run for every request
app.use((req, res, next) => {
  // Check if the request has timed out
  if (req.timedout) {
    return res.status(408).send("Request Timeout");
  }
  next();
});

app.get("/", (req, res) => {
  logger.info("GET request received");
  res.send(process.env.VITE_APP_MESSAGE);
});

// app.post("/deploy", async (req, res) => {
//   // res.set('Access-Control-Allow-Origin', 'https://magic-dashboard.test.dojima.network');
//   // res.set('Access-Control-Allow-Origin', 'http://localhost:3012');
//   const { data } = req.body;
//   const result = await DeployChainScript(data as Array<DeployableChainsData>);
//   res.send(result);
// });

app.post("/deploy", async (req, res) => {
  try {
    const { data } = req.body;

    // Log the received data
    logger.info("POST request to /deploy with data:", data);

    const result = await DeployChainScript(data as Array<DeployableChainsData>);

    // Log the result before sending it
    logger.info("Deployment result:", result);

    res.send(result);
  } catch (error) {
    // Log any errors that occurred during the process
    logger.error("Error during deployment:", error);

    // Handle the error and send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});

app.post("/deploy/dojima", async (req, res) => {
  try {
    const { data } = req.body;

    // Log the received data
    logger.info("POST request to /deploy/dojima with data:", data);

    const result = await DeployDOJChainScript(data as DeployableChainsData);

    // Log the result before sending it
    logger.info("Dojima Deployment result:", result);

    res.send(result);
  } catch (error) {
    // Log any errors that occurred during the process
    logger.error("Error during deployment:", error);

    // Handle the error and send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});

app.post("/deploy/ethereum", async (req, res) => {
  try {
    const { data } = req.body;

    // Log the received data
    logger.info("POST request to /deploy/ethereum with data:", data);

    const result = await DeployETHChainScript(data as DeployableChainsData);

    // Log the result before sending it
    logger.info("ethereum Deployment result:", result);

    res.send(result);
  } catch (error) {
    // Log any errors that occurred during the process
    logger.error("Error during deployment:", error);

    // Handle the error and send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});

app.post("/deploy/bsc", async (req, res) => {
  try {
    const { data } = req.body;

    // Log the received data
    logger.info("POST request to /deploy/bsc with data:", data);

    const result = await DeployBSCChainScript(data as DeployableChainsData);

    // Log the result before sending it
    logger.info("bsc Deployment result:", result);

    res.send(result);
  } catch (error) {
    // Log any errors that occurred during the process
    logger.error("Error during deployment:", error);

    // Handle the error and send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});

app.post("/omnichain/deploy", async (req, res) => {
  try {
    const { data } = req.body;

    // Log the received data
    logger.info("POST request to /omnichain/deploy with data:", data);

    const result = await DeployOmniChainScript(data as Array<OmniChainDeployableData>);

    // Log the result before sending it
    logger.info("Deployment result:", result);

    res.send(result);
  } catch (error) {
    // Log any errors that occurred during the process
    logger.error("Error during deployment:", error);

    // Handle the error and send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});

app.post("/sol-doj-token/deploy", async (req, res) => {
  try {
    const { data } = req.body;

    // Log the received data
    logger.info("POST request to /sol-doj-token/deploy with data:", data);

    const result = await SolDojTokenTemplate(data as SolDojTokenTemplateParams);

    // Log the result before sending it
    logger.info("Deployment result:", result);

    res.send(result);
  } catch (error) {
    // Log any errors that occurred during the process
    logger.error("Error during deployment:", error);

    // Handle the error and send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});

app.post("/doj-sol-data-transfer/deploy", async (req, res) => {
  try {
    const { data } = req.body;

    // Log the received data
    logger.info("POST request to /doj-sol-data-transfer/deploy with data:", data);

    const result = await DojSolDataTransferTemplate(data as DojSolDataTransferTemplateParams);

    // Log the result before sending it
    logger.info("Deployment result:", result);

    res.send(result);
  } catch (error) {
    // Log any errors that occurred during the process
    logger.error("Error during deployment:", error);

    // Handle the error and send an appropriate response
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
