import React, { useEffect, useState } from "react";
// import { t } from "../i18n";
import { Dialog } from "./Dialog";
import "./HelpDialog.scss";
import { usersIcon } from "./icons";
import { useContractDetails } from "../context/contract-appState";
import { AvailableChains } from "../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../context/user-appState";
import axios from "axios";
// import { DeployEVMContractParams } from "../contracts/types";
import AddIconImg from "../static/add_icon.svg";
import { XTokenContractTemplate } from "../dashboard-library/template-contracts/contracts/dojima/token/XTokenContract";
import { OmniChainTokenContractTemplate } from "../dashboard-library/template-contracts/contracts/dojima/token/OmniChainTokenContract";
import { EthereumCrossChainTokenTemplate } from "../dashboard-library/template-contracts/contracts/ethereum/token/EthereumCrossChainToken";
import SuccessIcon from "./Success.icon";
import ErrorIcon from "./ErrorIcon";

export type ContractsData = {
  fileName: string;
  contractCode: string;
  contractName: string;
  contractSymbol?: string;
  args?: any;
};

export type DeployableChainsData = {
  chainName: AvailableChains;
  contracts: Array<ContractsData>;
};

export type EVMContractDeployedObject = {
  contractAddress: string;
  contractABI: string;
  contractByteCode: string;
};

export type DeployedDetails = {
  chain: AvailableChains;
  details: EVMContractDeployedObject;
};

const Section = (props: { title: string; children: React.ReactNode }) => (
  <>
    <h3>{props.title}</h3>
    <div className="HelpDialog__islands-container">{props.children}</div>
  </>
);

export const DeployDialog = ({ onClose }: { onClose?: () => void }) => {
  const [tab, setTab] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<
    "success" | "failed" | ""
  >("");
  const handleClose = React.useCallback(() => {
    setDeploymentStatus("");
    setIsDeployed(false);
    setDeployedDetails([]);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const { contractsData } = useContractDetails();
  const { userDetails } = useUserDetails();
  const [deployedDetails, setDeployedDetails] = useState<
    Array<DeployedDetails>
  >([]);

  function handleDeploy() {
    setIsDeploying(true);
    const data: Array<DeployableChainsData> = [];

    contractsData.contracts.map((contract) => {
      const addContract: DeployableChainsData = {
        chainName: contract.chain,
        contracts: [
          {
            fileName: contract.name,
            contractCode: contract.code,
            contractName: contract.name,
            contractSymbol: contract.symbol ? contract.symbol : "",
            args: contract.arguments ? contract.arguments : [],
          },
        ],
      };
      data.push(addContract);
    });

    // Make Axios POST request with DeployEVMContractParams in the request body
    axios.post("http://localhost:3002/deploy", { data }).then((response) => {
      if (response.status === 200) {
        const result: Array<DeployedDetails> = response.data;
        setIsDeploying(false);
        setDeployedDetails(result);
        setDeploymentStatus("success");
        setIsDeployed(true);
      } else {
        setDeploymentStatus("failed");
        setIsDeployed(true);
      }
    }).catch((error) => {
      setIsDeploying(false);
      setDeploymentStatus("failed");
      setIsDeployed(true);
      console.error(error);
    });

    // const data: Array<DeployableChainsData> = [
    //   {
    //     chainName: "dojima",
    //     contracts: [
    //       {
    //         fileName: "XTokenContract",
    //         contractCode: XTokenContractTemplate,
    //         contractName: "XTokenContract",
    //         contractSymbol: "XTK",
    //       },
    //       {
    //         fileName: "OmniChainTokenContract",
    //         contractCode: OmniChainTokenContractTemplate,
    //         contractName: "XTokenContract",
    //         contractSymbol: "XTK",
    //       },
    //     ],
    //   },
    //   {
    //     chainName: "ethereum",
    //     contracts: [
    //       {
    //         fileName: "EthereumCrossChainToken",
    //         contractCode: EthereumCrossChainTokenTemplate,
    //         contractName: "XTokenContract",
    //         contractSymbol: "XTK",
    //       },
    //     ],
    //   },
    // ];
    // // Make Axios POST request with DeployEVMContractParams in the request body
    // axios.post("http://localhost:3002/deploy", { data }).then((response) => {
    //   console.log(response);
    // });
  }

  const renderDetailsForChain = (chain: AvailableChains) => {
    const contract = contractsData.contracts.find((c) => c.chain === chain);
    if (!contract) {
      return null;
    }

    const { code, ...remainingContract } = contract;

    return (
      <>
        {Object.entries(remainingContract).map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col gap-2 text-black cursor-not-allowed"
          >
            <div className="text-sm font-semibold capitalize">{key}:</div>
            <div className="text-base font-medium border rounded-lg p-3 border-[#dddddd] h-12">
              {value}
            </div>
          </div>
        ))}
      </>
    );
  };

  // const renderArgumentsForChain = (chain: AvailableChains) => {
  //   return (
  //     <>
  //       <div className="flex flex-row gap-x-6 text-black cursor-not-allowed">
  //         <div className="text-base w-1/2 font-medium border rounded-lg p-3 border-[#dddddd] h-12"></div>
  //         <div className="text-base  w-1/2 font-medium border rounded-lg p-3 border-[#dddddd] h-12"></div>
  //       </div>
  //     </>
  //   );
  // };

  const renderCodeForChain = (chain: AvailableChains) => {
    const contract = contractsData.contracts.find((c) => c.chain === chain);
    if (!contract) {
      return null;
    }

    return (
      <>
        <div className=" text-black cursor-not-allowed">
          <div className="text-base w-full h-36 max-h-36  font-medium border rounded-lg p-3 border-[#dddddd] overflow-auto">
            {contract.code}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {isDeployed ? (
        <Dialog
          onCloseRequest={handleClose}
          title="Deploy Status"
          className={"HelpDialog max-w-[760px] mx-auto"}
        >
          <div className="w-ful text-center">
            <div>
              {deploymentStatus === "success" ? (
                <div className=" flex justify-center items-center ">
                  <SuccessIcon />
                  <strong className="text-2xl ">Success</strong>
                </div>
              ) : (
                <div className="flex justify-center items-center ">
                  <ErrorIcon />
                  <strong className="text-2xl ">Error</strong>
                </div>
              )}
            </div>
            {deployedDetails.map((detail) => {
              return (
                <>
                  <div className=" mt-4 mb-4  p-4">
                    <div className="flex items-center">
                      <p className="text-start text-sm w-20 ">Chain </p>
                      <p className="w-10">:</p>
                      <strong className="font-semibold">{detail.chain}</strong>
                    </div>
                    <div className="flex items-center">
                      <p className="text-start text-sm w-20">Contract </p>
                      <p className="w-10">:</p>
                      <strong className="font-semibold">
                        {detail.details.contractAddress}
                      </strong>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-[#CEC2FF]" />
                </>
              );
            })}
            {/* <div className=" mt-4 mb-4  p-4">
              <div className="flex items-center">
                <p className="text-start text-sm w-20 ">Chain </p>
                <p className="w-10">:</p>
                <strong className="font-semibold">Dojima</strong>
              </div>
              <div className="flex items-center">
                <p className="text-start text-sm w-20">Address </p>
                <p className="w-10">:</p>
                <strong className="font-semibold">
                  klajjhghjagjkhgdkfjadhgkjafhgjkdgf
                </strong>
              </div>
            </div>
            <div className="w-full h-[1px] bg-[#CEC2FF]"> </div>
            <div className=" p-4">
              <div className="flex items-center">
                <p className="text-start text-sm w-20 ">Chain </p>
                <p className="w-10">:</p>
                <strong className="font-semibold">Dojima</strong>
              </div>
              <div className="flex items-center">
                <p className="text-start text-sm w-20">Address </p>
                <p className="w-10">:</p>
                <strong className="font-semibold">
                  klajjhghjagjkhgdkfjadhgkjafhgjkdgf
                </strong>
              </div>
            </div> */}
          </div>
        </Dialog>
      ) : (
        <Dialog
          onCloseRequest={handleClose}
          title="Deploy"
          className={"HelpDialog max-w-[760px] mx-auto"}
        >
          <div className="HelpDialog__header">
            {contractsData.contracts.map((item, i) => {
              const index = i + 1;

              return (
                <button
                  className={`p-3 flex items-center gap-x-3 border ${
                    i + 1 === tab
                      ? "border-[#6B45CD] bg-[rgba(107,_69,_205,_0.14)]"
                      : ""
                  }   rounded-lg text-black capitalize`}
                  onClick={() => {
                    setTab(index);
                    // setIsDetailsComplete(!isDetailsComplete);
                  }}
                  key={i}
                >
                  <div className="w-6 h-6 grid place-items-center bg-[#CEC2FF] rounded-full p-1">
                    {usersIcon}
                  </div>
                  {item.chain}
                </button>
              );
            })}
          </div>
          <div className="border-[1px] border-dashed mt-6"></div>
          <div className="h-[500px] pb-4 pr-2 overflow-auto ">
            <Section title={"Details"}>
              {userDetails.chains.map((chain, index) => (
                <React.Fragment key={index}>
                  {tab === index + 1 && renderDetailsForChain(chain)}
                </React.Fragment>
              ))}
            </Section>
            <div className="border-[1px] border-dashed mt-6"></div>
            <div>
              <div className="flex w-full items-center">
                <h3 className="w-1/2">Arguments</h3>
                <div className="justify-end w-1/2 flex">
                  <img src={AddIconImg} alt="" />
                </div>
              </div>
            </div>
            <div className="border-[1px] border-dashed mt-6"></div>
            <div className="mt-6">
              <p className="text-base text-[#757575] font-semibold ">Code</p>
              {userDetails.chains.map((chain, index) => (
                <React.Fragment key={index}>
                  {tab === index + 1 && renderCodeForChain(chain)}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex mt-10 justify-between items-center">
            <button
              className="py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl"
              onClick={
                tab === 1
                  ? handleClose
                  : () => {
                      setTab(tab - 1);
                    }
              }
            >
              {tab === 1 ? "Close" : "Back"}
            </button>
            <button
              className={`py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl bg-[linear-gradient(270deg,_#A71CFF_-35.09%,_#8000FF_65.62%)] shadow-[0px_5px_20px_0px_rgba(0,_0,_0,_0.15)] text-white ${
                isDeploying && "cursor-not-allowed"
              }`}
              onClick={
                tab === contractsData.contracts.length
                  ? handleDeploy
                  : () => {
                      setTab(tab + 1);
                    }
              }
            >
              {tab === contractsData.contracts.length
                ? isDeploying
                  ? "Deploying..."
                  : "Deploy"
                : "Next"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
};
