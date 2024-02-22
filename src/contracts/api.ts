import axios, { AxiosResponse, AxiosError } from "axios";
import {
  ChainContractsObject,
  ContractsChain,
  EVMContractDeployedObject,
} from "./types";

const apiInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_FAAS_TESTNET_URL}/v1/dev/dash/contracts`,
});

async function handleRequest<T>(
  request: () => Promise<AxiosResponse<T>>,
): Promise<T> {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    handleRequestError(error as AxiosError);
  }
}

function handleRequestError(error: AxiosError): never {
  if (error.response) {
    throw new Error(`Request failed with status ${error.response.status}`);
  } else if (error.request) {
    throw new Error("Request made, but no response received");
  } else {
    throw new Error(`Error setting up request: ${error.message}`);
  }
}

export async function postEVMContractData(
  email: string,
  chain: ContractsChain,
  deployedDetails: EVMContractDeployedObject,
): Promise<boolean> {
  const contractsAddDetails: ChainContractsObject[] = [
    {
      chain,
      contracts: [
        {
          contractAddress: deployedDetails.contractAddress,
          contractAbi: deployedDetails.contractABI,
          contractByteCode: deployedDetails.contractByteCode,
          verified: false,
        },
      ],
    },
  ];

  return handleRequest<boolean>(() =>
    apiInstance.post("/add", {
      email,
      chainContractsData: contractsAddDetails,
    }),
  );
}

export async function postEVMContractVerifiedStatus(
  email: string,
  chain: ContractsChain,
  contractAddress: string,
  verified: boolean,
): Promise<boolean> {
  return handleRequest<boolean>(() =>
    apiInstance.post("/update/verify", {
      email,
      chain,
      contractAddress,
      verified,
    }),
  );
}
