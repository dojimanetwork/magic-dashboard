import { useEffect, useState } from "react";
import Button from "../../common/Button";
import TextInput, { TextInputTypes } from "../../common/TextInput";
import {
  ContractDetailsData,
  useContractDetails,
} from "../../../../context/contract-appState";
import { AvailableChains } from "../../../../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../../../../context/user-appState";
import {
  Erc721TemplateSaveContractDetailsData,
  useTemplateContractDetails,
} from "../../../../context/template-contract-appState";
import { EthereumCrossChainNftTemplate } from "../../../template-contracts/contracts/ethereum/nft/EthereumCrossChainNft";

export default function EthereumNftTemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const { contractsData, updateContractDetails } = useContractDetails();
  const { erc721TemplateContractDetails, updateErc721TemplateContractDetail } =
    useTemplateContractDetails();
  const { userDetails } = useUserDetails();

  const selectedContractDetails = erc721TemplateContractDetails.contracts.find(
    (data) => data.chain === selectedChain,
  );

  const [name, setName] = useState(
    selectedContractDetails?.name === ""
      ? "Token"
      : (selectedContractDetails?.name as string),
  );
  const [symbol, setSymbol] = useState(
    selectedContractDetails?.symbol === ""
      ? "Tkn"
      : (selectedContractDetails?.symbol as string),
  );
  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");

  useEffect(() => {
    const finalContract = EthereumCrossChainNftTemplate;
    setContract(finalContract);
    displayCode(finalContract);
  }, []);

  useEffect(() => {
    const finalContract = EthereumCrossChainNftTemplate;
    setContract(finalContract);
    displayCode(finalContract);
  }, [displayCode, name, symbol]);

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
    const selectedTemplateContract = erc721TemplateContractDetails.contracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if (selectedTemplateContract) {
      // Create an updated contract with only the changed fields
      const updatedTemplateContract: Erc721TemplateSaveContractDetailsData = {
        ...selectedTemplateContract,
        name,
        symbol,
      };

      // Update the contract details using the context
      updateErc721TemplateContractDetail(selectedChain, updatedTemplateContract);
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
        </div>
      </div>
      <div className="flex justify-between mt-[140px] ">
        <Button onClick={saveDetails} className="w-full" color={"secondary"}>
          Save
        </Button>
      </div>
    </div>
  );
}
