import React, { useEffect, useState } from "react";
import "./../ui.css";
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokai } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { NonDeletedExcalidrawElement } from "../../../element/types";
import { AppState } from "../../../types";
import { AvailableChains } from "../../../../excalidraw-app/dojima-templates/types";
import { DisplayContract } from "../DisplayContract";
import { useUserDetails } from "../../../context/user-appState";
import { useProjectData } from "../../../context/project-appState";
import CopyIcon from "../../../components/copyIcon";
import { copyTextToSystemClipboard } from "../../../clipboard";

export type ProjectEVMChainsDeploymentData = {
  chain: string;
  contractAddress: string;
  contractAbi: string;
  contractByteCode: string;
};

export type ProjectSOLChainsDeploymentData = {
  chain: string;
  programId: string;
  idl: any;
};

export type ProjectDataObject = {
  projectName: string;
  email: string;
  ownerUrl: string;
  description: string;
  type: string;
  chains: string[];
  projectData: string;
  status?: boolean;
  deploymentData?: Array<ProjectEVMChainsDeploymentData | ProjectSOLChainsDeploymentData>;
  dateCreated?: Date;
  lastUpdated?: Date;
};

export function formatSolidityCode(code: string): string {
  code = code.replace("pragma solidity", "\npragma solidity");
  code = code.replace(/;/g, ";\n");
  code = code.replace(/{/g, "{\n");
  code = code.replace(/}/g, "}\n");
  const lines = code.split("\n");
  const indentedCode = lines.map((line) => ` ${line}`).join("\n");
  return `\n${indentedCode}\n`;
}

export function formatRustCode(code: string): string {
  // Add newline after 'use' statements
  code = code.replace(/(use\s+[^;]+;)/g, "$1\n");
  // Add newline after semicolons
  code = code.replace(/;/g, ";\n");
  // Add newline after opening curly braces and indent the content
  code = code.replace(/{/g, "{\n");
  // Add newline before closing curly braces
  code = code.replace(/}/g, "\n}");
  // Split the code into lines
  const lines = code.split("\n");
  // Indent each line with 4 spaces
  const indentedCode = lines.map((line) => `    ${line.trim()}`).join("\n");
  // Add a Rust file preamble
  return `\n${indentedCode}\n`;
}

function SolEvmTokenContractView({
  element,
  setAppState,
  selectedElementChain,
}: {
  element: NonDeletedExcalidrawElement;
  setAppState: React.Component<any, AppState>["setState"];
  selectedElementChain: AvailableChains;
}) {
  const [contractCode, setContractCode] = useState("");
  const [isDeployed, setIsDeployed] = useState(false);
  const [contractDeployedData, setContractDeployedData] =
    useState<ProjectEVMChainsDeploymentData | ProjectSOLChainsDeploymentData>();
  const { userDetails } = useUserDetails();
  const { projectData } = useProjectData();

  const displayContractCode = (code: string) => {
    setContractCode(code);
  };

  useEffect(() => {
    if (userDetails.email && userDetails.projectName) {
      if (projectData.deploymentData && projectData.deploymentData.length > 0) {
        const contractDataByChain = projectData.deploymentData?.find(
          (data) => data.chain === selectedElementChain,
        );

        setContractDeployedData(contractDataByChain);
        setIsDeployed(!!contractDataByChain);
      } else {
        setIsDeployed(false);
      }
    }
  }, [projectData, selectedElementChain]);

  return (
    <>
      {isDeployed && contractDeployedData ? (
        <div>
          {selectedElementChain === "solana" ? (
            <>
              <div className=" flex text-base items-center m-2">
                <div className=" w-[150px] font-semibold text-base text-[#000]">
                  Program ID
                </div>
                <div className="w-full flex justify-between pr-4 items-center mr-2 p-2 text-[15px] font-medium text-black border rounded-lg h-[40px]">
                  {(contractDeployedData as ProjectSOLChainsDeploymentData).programId}
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      copyTextToSystemClipboard(
                        (contractDeployedData as ProjectSOLChainsDeploymentData).programId
                      )
                    }
                  >
                    <CopyIcon width="15" />
                  </div>
                </div>
              </div>
              <div className="h-[1px] bg-[#dddddd] m-4"></div>
              <div className="m-2">
                <div className="flex justify-between">
                  <p className="text-base text-black mb-2 font-semibold ">
                    IDL
                  </p>
                  <div
                    className="cursor-pointer mr-5"
                    onClick={() =>
                      copyTextToSystemClipboard(
                        JSON.stringify((contractDeployedData as ProjectSOLChainsDeploymentData).idl, null, 2)
                      )
                    }
                  >
                    <CopyIcon width="15" />
                  </div>
                </div>
                <div className=" text-black cursor-not-allowed">
                  <div className="text-[15px] w-full h-36 max-h-36 font-medium border rounded-lg p-3 border-[#dddddd] overflow-auto">
                    <pre>
                      {JSON.stringify((contractDeployedData as ProjectSOLChainsDeploymentData).idl, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className=" flex text-base items-center m-2">
                <div className=" w-[150px] font-semibold text-base text-[#000]">
                  Contract Address
                </div>
                <div className="w-full flex justify-between pr-4 items-center mr-2 p-2 text-[15px] font-medium text-black border rounded-lg h-[40px]">
                  {(contractDeployedData as ProjectEVMChainsDeploymentData).contractAddress}
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      copyTextToSystemClipboard(
                        (contractDeployedData as ProjectEVMChainsDeploymentData).contractAddress
                      )
                    }
                  >
                    <CopyIcon width="15" />
                  </div>
                </div>
              </div>
              <div className="h-[1px] bg-[#dddddd] m-4"></div>
              <div className="m-2">
                <div className="flex justify-between">
                  <p className="text-base text-black mb-2 font-semibold ">
                    Contract ABI
                  </p>
                  <div
                    className="cursor-pointer mr-5"
                    onClick={() =>
                      copyTextToSystemClipboard(
                        JSON.stringify((contractDeployedData as ProjectEVMChainsDeploymentData).contractAbi, null, 2)
                      )
                    }
                  >
                    <CopyIcon width="15" />
                  </div>
                </div>
                <div className=" text-black cursor-not-allowed">
                  <div className="text-[15px] w-full h-36 max-h-36 font-medium border rounded-lg p-3 border-[#dddddd] overflow-auto">
                    <pre>
                      {JSON.stringify((contractDeployedData as ProjectEVMChainsDeploymentData).contractAbi, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="h-[1px] bg-[#dddddd] m-4"></div>
              <div className="m-2">
                <div className="flex justify-between">
                  <p className="text-base text-black mb-2 font-semibold ">
                    Contract Bytecode
                  </p>
                  <div
                    className="cursor-pointer mr-5"
                    onClick={() =>
                      copyTextToSystemClipboard(
                        (contractDeployedData as ProjectEVMChainsDeploymentData).contractByteCode
                      )
                    }
                  >
                    <CopyIcon width="15" />
                  </div>
                </div>
                <div className=" text-black cursor-not-allowed">
                  <div className="text-[15px] w-full break-all h-36 max-h-36  font-medium border rounded-lg p-3 border-[#dddddd] overflow-auto">
                    <div className="m-2">
                      {(contractDeployedData as ProjectEVMChainsDeploymentData).contractByteCode}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <section className="">
          <div className="flex items-center text-center border-b text-[] text-xl/6 font-semibold uppercase">
            <div className="cursor-pointer text-center w-full py-6 text-[#6B45CD] border-r last:border-r-0">
              {selectedElementChain}
            </div>
          </div>
          <div className="flex h-[600px] overflow-auto w-[810px]">
            <div className="h-full overflow-auto w-1/3 shrink-0">
              <div>
                <DisplayContract
                  displayCode={displayContractCode}
                  selectedChain={selectedElementChain as AvailableChains}
                />
              </div>
            </div>

            <div className="contract-view-content h-full w-full">
              <SyntaxHighlighter
                language={`${selectedElementChain === "solana" ? "rust" : "solidity"}`}
                style={monokai}
                wrapLongLines={true}
                customStyle={{
                  backgroundColor: "transparent",
                  color: "white",
                }}
              >
                {selectedElementChain === "solana"
                    ? formatRustCode(contractCode)
                    : formatSolidityCode(contractCode)}
              </SyntaxHighlighter>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default SolEvmTokenContractView;
