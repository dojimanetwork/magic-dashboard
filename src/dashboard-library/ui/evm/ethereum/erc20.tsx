import { useEffect, useState } from "react";
import Button from "../../common/Button";
import TextInput, { TextInputTypes } from "../../common/TextInput";
import {
  ContractDetailsData,
  useContractDetails,
} from "../../../../context/contract-appState";
import { AvailableChains } from "../../../../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../../../../context/user-appState";
import { TemplateSaveContractDetailsData, useTemplateContractDetails } from "../../../../context/template-contract-appState";
import { EthereumCrossChainTokenTemplate } from "../../../template-contracts/contracts/ethereum/token/EthereumCrossChainToken";

export default function EthereumErc20TemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const { contractsData, updateContractDetails } = useContractDetails();
  const { templateContractDetails, updateTemplateContractDetail } = useTemplateContractDetails();
  const { userDetails } = useUserDetails();

  const selectedContractDetails = templateContractDetails.contracts.find((data) => data.chain === selectedChain);
  
  const [name, setName] = useState(selectedContractDetails?.name === "" ? "Token" : selectedContractDetails?.name as string);
  const [symbol, setSymbol] = useState(selectedContractDetails?.symbol === "" ? "Tkn" : selectedContractDetails?.symbol as string);
  const [premint, setPremint] = useState(selectedContractDetails?.premint === "" ? "" : selectedContractDetails?.premint as string);
  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");

  useEffect(() => {
    const finalContract = EthereumCrossChainTokenTemplate;
    setContract(finalContract);
    displayCode(finalContract);
  }, []);

  useEffect(() => {
    const finalContract = EthereumCrossChainTokenTemplate;
    setContract(finalContract);
    displayCode(finalContract);
  }, [
    displayCode,
    name,
    premint,
    symbol,
  ]);

  function saveDetails() {
    // Find the contract with the selected chain
    const selectedContract = contractsData.contracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if (selectedContract) {
      // Create an updated contract with only the changed fields
      const updatedContract: ContractDetailsData = {
        ...selectedContract,
        name,
        symbol: symbol !== "" ? symbol : selectedContract.symbol,
        code: contract,
        arguments:
          deployedArgs.length > 0 ? deployedArgs : selectedContract.arguments,
      };

      // Update the contract details using the context
      updateContractDetails(updatedContract);
    } else {
      // Create an updated contract with only the changed fields
      const updatedContract: ContractDetailsData = {
        name,
        symbol: symbol !== "" ? symbol : "",
        code: contract,
        arguments: deployedArgs.length > 0 ? deployedArgs : [],
        chain: selectedChain,
        gasPrice: "",
        type: userDetails.type,
      };

      // Update the contract details using the context
      updateContractDetails(updatedContract);
    }

    // Find the templateContract with the selected chain
    const selectedTemplateContract = templateContractDetails.contracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if(selectedTemplateContract) {
      // Create an updated contract with only the changed fields
      const updatedTemplateContract: TemplateSaveContractDetailsData = {
        ...selectedTemplateContract,
        name,
        symbol,
        premint,
      };

      // Update the contract details using the context
      updateTemplateContractDetail(selectedChain, updatedTemplateContract);
    }
  }

  return (
    <div className="contract-form-container">
      {/* <div className="">Contract Form</div> */}
      <div className="border-b">
        <div className="flex flex-col gap-y-5">
          <TextInput
            id="name"
            label="Contract Name*"
            labelClassName="text-subtext"
            type={TextInputTypes.TEXT}
            value={name}
            setValue={setName}
          />
          <TextInput
            id="symbol"
            label="Contract Symbol*"
            labelClassName="text-subtext"
            type={TextInputTypes.TEXT}
            value={symbol}
            setValue={setSymbol}
          />
          <TextInput
            id="premint"
            label="Premint"
            labelClassName="text-subtext"
            type={TextInputTypes.NUMBER}
            value={premint}
            setValue={setPremint}
            minNum={0}
          />
        </div>
      </div>
      <div className="flex justify-between mt-[140px] ">
        <Button
          onClick={saveDetails}
          className="w-full"
          color={"secondary"}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
