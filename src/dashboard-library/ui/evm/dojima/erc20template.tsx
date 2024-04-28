"use client";

import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokai } from "react-syntax-highlighter/dist/esm/styles/hljs";

const DOJIMATabData = ["XToken", "OmniChainToken"];

const DOJTabData = [
  {
    id: 1,
    name: "XToken",
  },
  {
    id: 2,
    name: "OmniChainToken",
  },
];

const BSCTabData = ["BEP20"];

type chains = "doj" | "eth" | "bsc";

function formatSolidityCode(code: string): string {
  code = code.replace("pragma solidity", "\npragma solidity");
  // Replace semicolons with semicolons + newline
  code = code.replace(/;/g, ";\n");
  code = code.replace(/{/g, "{\n");
  code = code.replace(/}/g, "}\n");
  // Split the code into lines
  const lines = code.split("\n");
  // Indent each line with 4 spaces
  const indentedCode = lines.map((line) => ` ${line}`).join("\n");
  // Add a Solidity file preamble
  return `\n${indentedCode}\n`;
}

function Page() {
  const [tab, setTab] = useState(1);
  const [contractCode, setContractCode] = useState("");
  const [value, setValue] = useState("doj");
  const [chainSelected, setChainSelected] = useState("dojima");
  const displayContractCode = (code: string) => {
    setContractCode(code);
  };

  return (
    <>
      {/* NEW */}
      <div className="overflow-hidden">
        <div className="flex justify-between items-center border-b pb-[26px] sticky top-0 bg-white/10 backdrop-blur-sm">
          <div className="flex gap-x-8">
            {/* {DOJTabData.map((item) => {
              const index = item.id + 1;
              return (
                <Button
                  onClick={() => setTab(index)}
                  key={item.id}
                  color="secondary"
                  className={`min-w-10 p-0 border-none relative gap-x-0 ${
                    tab === index ? "text-purple" : "text-black"
                  }`}
                  size="sm"
                >
                  {item}
                  {tab === index && (
                    <span className="w-full h-2 bg-purple absolute -bottom-[38px] left-0 rounded-full" />
                  )}
                </Button>
              );
            })} */}
          </div>
        </div>
        <div className="grid grid-cols-[305px_1fr] overflow-auto h-[calc(100%-70px)]">
          {/* first */}
          <div className="overflow-auto">
            <div className="flex flex-col px-2 ">
              <div className="py-6 ">
                {/* {tab === 1 && (
                  <Erc20
                    displayCode={displayContractCode}
                    chain={chainSelected}
                    token={value}
                  />
                )}
                {tab === 2 && (
                  <Erc721
                    displayCode={displayContractCode}
                    chain={chainSelected}
                    token={value}
                  />
                )} */}
              </div>
            </div>
          </div>
          {/* second */}
          <div className="overflow-auto">
            <div className="p-6 pb-0 grid h-full">
              <div className="bg-black p-6 text-white rounded-20">
                {/* For Refrence only we can split and join the string to make it line by line */}
                {/* {`${JSON.stringify(validatorRes)
                  .split(":{")
                  .join(":{ \t")
                  .split('"}, ')
                  .join('"}, \n')
                  .split("{")
                  .join("{ \n\t\t")
                  .split(",")
                  .join(", \n\t\t")}`} */}
                <SyntaxHighlighter
                  language="solidity"
                  style={monokai}
                  wrapLongLines={true}
                  customStyle={{
                    backgroundColor: "transparent",
                    color: "white",
                  }}
                >
                  {formatSolidityCode(contractCode)}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
