import React, { useState } from "react";
// import { t } from "../i18n";
import { Dialog } from "./Dialog";
import "./HelpDialog.scss";
import { copyIcon, usersIcon } from "./icons";
import { useContractDetails } from "../context/contract-appState";
import { AvailableChains } from "../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../context/user-appState";
import axios from "axios";
// import { DeployEVMContractParams } from "../contracts/types";
import AddIconImg from "../static/add_icon.svg";
// import { XTokenContractTemplate } from "../dashboard-library/template-contracts/contracts/dojima/token/XTokenContract";
// import { OmniChainTokenContractTemplate } from "../dashboard-library/template-contracts/contracts/dojima/token/OmniChainTokenContract";
// import { EthereumCrossChainTokenTemplate } from "../dashboard-library/template-contracts/contracts/ethereum/token/EthereumCrossChainToken";
import SuccessIcon from "./Success.icon";
import ErrorIcon from "./ErrorIcon";
import DojimaImg from "../static/dojima.png";
import BinanceImg from "../static/binance.svg";
import EthereumImg from "../static/ethereum.svg";
import FailIcon from "./FailIcon";
import CircleCancleIcon from "./circlecancleIcon";
import CopyIcon from "./copyIcon";
import { Card } from "./Card";

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
    {props.children}
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

  function handleChains(chain: string) {
    switch (chain) {
      case "dojima":
      case "DOJ":
        return DojimaImg;
      case "ethereum":
      case "ETH":
        return EthereumImg;
      case "bsc":
      case "binance":
      case "BSC":
        return BinanceImg;
    }
  }

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
    axios
      .post(`${import.meta.env.VITE_APP_MAGIC_DASHBOARD_BACKEND_URL}/deploy`, { data })
      .then((response) => {
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
      })
      .catch((error) => {
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

  function ContractDetails() {
    return (
      <div>
            <div className=" flex text-base items-center mb-2">
              <div className=" mr-2 w-[150px] font-semibold text-sm text-[#000]">
                Contract Address
              </div>
              <div className="w-full flex justify-between pr-4 items-center mr-2 p-2 text-[15px] font-medium text-black border rounded-lg h-[40px]">
                <div>
                  0x000095E79eAC4d76aab57cB2c1f091d553b36ca0hgy678hjuuyi
                </div>
                <div>
                  <CopyIcon width="15" />
                </div>
              </div>
            </div>
            <div className="h-[1px] bg-[#dddddd] mt-4"></div>
            <div className="mt-6">
              <p className="text-base text-black mb-2 font-semibold ">
                Contract ABI
              </p>
              {userDetails.chains.map((chain, index) => (
                <React.Fragment key={index}>
                  {tab === index + 1 && renderCodeForChain(chain)}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-base text-black mb-2 font-semibold ">
                Contract Bytecode
              </p>
              {userDetails.chains.map((chain, index) => (
                <React.Fragment key={index}>
                  {tab === index + 1 && renderCodeForChain(chain)}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-4 items-center">
              <button
                className={`py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl bg-[linear-gradient(270deg,_#A71CFF_-35.09%,_#8000FF_65.62%)] shadow-[0px_5px_20px_0px_rgba(0,_0,_0,_0.15)] text-white`}
                onClick={
                  tab === 1
                    ? handleClose
                    : () => {
                        setTab(tab - 1);
                      }
                }
              >
                {tab === 1 ? "Verify" : "Close"}
              </button>
              <button
                className="py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl"
                onClick={
                  tab === contractsData.contracts.length
                    ? handleDeploy
                    : () => {
                        setTab(tab + 1);
                      }
                }
              >
                Close
                {/* {tab === contractsData.contracts.length
                ? isDeploying
                  ? "Deploying..."
                  : "Deploy"
                : "Next"} */}
              </button>
            </div>
          </div>
    )
  }

  function DeployStatus() {
    return (
      <div className="w-full border bg-white rounded-lg shadow border-[#fff]">
        <div className="flex p-7 w-full items-center justify-between ">
          <div className="flex items-center">
            <p className="text-lg tracking-wide font-bold mr-2 font-sans ">
              Deploy Details
            </p>
            <SuccessIcon width="25" height="25" />
          </div>
          <div className="cursor-pointer">
            <CircleCancleIcon width="25" height="25" />
          </div>
        </div>
        <div className="h-[1px] bg-[#F2F3F5]"></div>
        <div className="px-7 py-3">
          <div className="grid grid-cols-[0.6fr_2fr_0.5fr] body16 font-sans tracking-wide text-sm">
            <div>Chain</div>
            <div>Address</div>
          </div>
          <hr className="border-dotted mt-3 border-t-2 " />
          <div className="grid-cols-[0.6fr_2fr_0.5fr] body16 items-center grid border-b border-outline mt-1 pb-2 last:border-none">
            {successData.map((item) => (
              <>
                <div className="flex mt-4 items-center">
                  <img
                    className="mr-1"
                    width={23}
                    alt="img"
                    src={handleChains(item.chains)}
                  />
                  <p className="text-sm text-black">{item.chains}</p>
                </div>
                <p className="text-sm mt-4 text-black">{item.address}</p>
                <div
                  className="cursor-pointer mt-4"
                  onClick={() => copyToClipboard(item.address)}
                >
                  <CopyIcon width="15" />
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    );
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
          <div key={key} className="flex w-full">
            <div className="w-1/2 border rounded h-[240px] max-h-[240px] overflow-scroll">
              {key}:
            </div>
            <div>{value}</div>
          </div>
        ))}
      </>
    );
  };

  const successData = [
    {
      chains: "ETH",
      address: "0x066F799B9bED2B7C34Ac9b7FcA8843c1731a9575",
    },
    {
      chains: "BSC",
      address: "0x066F799B9bED2B7C34Ac9b7FcA8843c1731a9576",
    },
    {
      chains: "DOJ",
      address: "0x066F799B9bED2B7C34Ac9b7FcA8843c1731a9575",
    },
  ];

  async function copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {}
  }

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
          </div>
        </Dialog>
      ) : (
        <Dialog
          onCloseRequest={handleClose}
          title="Deploy"
          className={"HelpDialog max-w-[760px] rounded-lg mx-auto"}
        >
          <ContractDetails />
          {/* <DeployStatus /> */}
          {/* <div className="HelpDialog__header">
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
                    <img alt="" src={handleChains("dojima")} />
                  </div>
                  {item.chain}
                </button>
              );
            })}
          </div>
          <div className="h-[450px] pb-4 mt-8 pr-2 overflow-auto ">
            <div className="flex gap-x-[20px] w-full">
              <div className="w-1/2  border rounded-lg p-4 h-[240px] max-h-[240px] overflow-scroll">
                <div className="flex mb-2">
                  <div className="w-1/2 text-base text-[#6D6D6D]">Contract</div>
                  <div className="w-1/2  text-black">Udays tokens</div>
                </div>
                <div className=" flex text-base mb-2">
                  <div className="w-1/2 text-[#6D6D6D]">Contract</div>
                  <div className="w-1/2  text-black">Udays tokens</div>
                </div>
              </div>
              <div className="w-1/2 border p-4 rounded-lg h-[240px] max-h-[240px]">
                <div className="flex w-full items-center">
                  <div className="w-1/2 text-base font-[600] ">Arguments</div>
                  <div className="justify-end w-1/2 flex">
                    <button
                      className={` text-xs font-normal w-[57px] h-[24px] border rounded-lg bg-[linear-gradient(270deg,_#A71CFF_-35.09%,_#8000FF_65.62%)] shadow-[0px_5px_20px_0px_rgba(0,_0,_0,_0.15)] text-white`}
                    >
                      Add +
                    </button>
                  </div>
                </div>
                <div className="flex mt-4 items-center overflow-scroll w-full">
                  <div className="w-[2200px] mr-2 max-w-[220px] max-h-[40px] p-2 text-sm border rounded-lg h-[40px]">
                    Jonathan Joe
                  </div>

                  <div>da</div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-base text-black mb-2 font-semibold ">Code</p>
              {userDetails.chains.map((chain, index) => (
                <React.Fragment key={index}>
                  {tab === index + 1 && renderCodeForChain(chain)}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-2 items-center">
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
          </div>  */}
        </Dialog>
      )}
    </>
  );
};
