import { useEffect, useRef, useState } from "react";
import Button from "../../common/Button";
import TextInput, { TextInputTypes } from "../../common/TextInput";
import {
  EvmSolDataTransferContractDetailsData,
  useContractDetails,
} from "../../../../context/contract-appState";
import { AvailableChains } from "../../../../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../../../../context/user-appState";
// import {
//   useTemplateContractDetails,
// } from "../../../../context/template-contract-appState";
import { extractConstructorArguments } from "../../../utils/readConstructorArgs";
import * as _ from "lodash";
import { useSolanaTemplatesDetails } from "../../../../context/solana-templates-appState";

export type DOJEvmSolDataTransferTemplateContractParams = {
  name: string;
};

export function GetDOJEvmSolDataTransferContract(params: DOJEvmSolDataTransferTemplateContractParams) {
  const contract = `// SPDX-License-Identifier: UNLICENSED
  pragma solidity ^0.8.19;

  import '@dojimanetwork/dojima-contracts/contracts/interfaces/IOutboundStateSender.sol';

  contract ${params.name} {

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
          stateSyncer = 0x0000000000000000000000000000000000001001;
          outboundStateSender = IOutboundStateSender(_outboundStateSender);

          owner = msg.sender;
      }

      function isCallerStateSyncer() public view returns (bool) {
          return msg.sender == stateSyncer;
      }

      // Payload should coontain all necessary information required to process 'DataTransfer'
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
      
  }`;

  return contract;
}

export default function DojimaEvmSolDataTransferTemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const mounted = useRef(false);
  const { evmSolDataTransferContractsData, updateEvmSolDataTransferContractDetails } = useContractDetails();
  const { dojSolDataTransferData, updateDojSolDataTransferDojima } = useSolanaTemplatesDetails();
  const [disable, setDisable] = useState(false);
  // const { erc20TemplateContractDetails, updateErc20TemplateContractDetail } =
  //   useTemplateContractDetails();
  const { userDetails } = useUserDetails();

  const selectedContractDetails = evmSolDataTransferContractsData.evmSolDataTransferContracts.find(
    (data) => data.chain === selectedChain,
  ); // Updated logic

  const [name, setName] = useState(
    selectedContractDetails?.name || "Token"
  );

  // const selectedContractDetails = erc20TemplateContractDetails.contracts.find(
  //   (data) => data.chain === selectedChain,
  // );

  // const [name, setName] = useState(
  //   selectedContractDetails?.name === ""
  //     ? "Token"
  //     : (selectedContractDetails?.name as string),
  // );
  // const [symbol, setSymbol] = useState(
  //   selectedContractDetails?.symbol === ""
  //     ? "Tkn"
  //     : (selectedContractDetails?.symbol as string),
  // );

  // const [total_supply, setTotalSupply] = useState(
  //   selectedContractDetails?. === 0
  //     ? "0"
  //     : (selectedContractDetails?.),
  // );

  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [missingAllInputs, setMissingAllInputs] = useState(false);

  useEffect(() => {
    if (!mounted.current) {
      // This block will execute only once when the component mounts
      mounted.current = true;
      return; // Exit early, don't execute the rest of the useEffect
    }

    setMissingAllInputs(false);
    setIsEditing(true);
    
    const tokenOptions: DOJEvmSolDataTransferTemplateContractParams = {
      name,
    };
    const finalContract = GetDOJEvmSolDataTransferContract(tokenOptions);
    setContract(finalContract);
    displayCode(finalContract);

    // const constructorArgs = extractConstructorArguments(finalContract);

    // Update unified contract details
    const updatedDojSolDataTransferData = {
      dojima: {
        contractName: name,
      },
      solana: dojSolDataTransferData.solana // Preserve existing Solana data
    };

    updateDojSolDataTransferDojima(updatedDojSolDataTransferData.dojima);

    // Find the contract with the selected chain
    const selectedContract = evmSolDataTransferContractsData.evmSolDataTransferContracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if (selectedContract) {
      const updatedContract: EvmSolDataTransferContractDetailsData = {
        ...selectedContract,
        name,
      };

      // Update the contract details using the context
      updateEvmSolDataTransferContractDetails(updatedContract);

    } else {
      // If no contract with selectedChain exists, add new contract details
      const addContractDetails: EvmSolDataTransferContractDetailsData = {
        name,
        chain: selectedChain,
        gasPrice: "~0.0002",
        type: userDetails.type,
      };

      // Update the contract details using the context
      updateEvmSolDataTransferContractDetails(addContractDetails);
    }

    // // Find the templateContract with the selected chain
    // const selectedTemplateContractIndex =
    //   erc20TemplateContractDetails.contracts.findIndex(
    //     (contract) => contract.chain === selectedChain,
    //   );

    // if (selectedTemplateContractIndex !== -1) {
    //   // If template contract with selectedChain exists, update existing details
    //   const updatedTemplateContracts = [
    //     ...erc20TemplateContractDetails.contracts,
    //   ];
    //   updatedTemplateContracts[selectedTemplateContractIndex] = {
    //     ...updatedTemplateContracts[selectedTemplateContractIndex],
    //     name,
    //     symbol
    //   };

    //   // Update the template contract details using the context
    //   updateErc20TemplateContractDetail(
    //     selectedChain,
    //     updatedTemplateContracts[selectedTemplateContractIndex],
    //   );
    // }

    setIsEditing(false);
  }, [name, selectedChain]);

  function saveDetails() {
    setIsSaving(true);

    if (!name) {
      setMissingAllInputs(true);
      setIsSaving(false);
      return;
    }

    // // Find the contract with the selected chain
    // const selectedContract = contractsData.contracts.find(
    //   (contract) => contract.chain === selectedChain,
    // );

    // const constructorArgs = extractConstructorArguments(contract);

    // if (selectedContract) {
    //   // Create an updated contract with only the changed fields
    //   const updatedContract: ContractDetailsData = {
    //     ...selectedContract,
    //     name,
    //     symbol: symbol !== "" ? symbol : selectedContract.symbol,
    //     code: contract,
    //     arguments:
    //       constructorArgs && constructorArgs.length > 0
    //         ? Array(constructorArgs.length).fill("")
    //         : selectedContract.arguments,
    //   };

    //   // Update the contract details using the context
    //   updateContractDetails(updatedContract);
    // } else {
    //   // Create an updated contract with only the changed fields
    //   const updatedContract: ContractDetailsData = {
    //     name,
    //     symbol: symbol !== "" ? symbol : "",
    //     code: contract,
    //     arguments:
    //       constructorArgs && constructorArgs.length > 0
    //         ? Array(constructorArgs.length).fill("")
    //         : [],
    //     chain: selectedChain,
    //     gasPrice: "~0.0002",
    //     type: userDetails.type,
    //   };

    //   // Update the contract details using the context
    //   updateContractDetails(updatedContract);
    // }

    // // Find the templateContract with the selected chain
    // const selectedTemplateContract =
    //   erc20TemplateContractDetails.contracts.find(
    //     (contract) => contract.chain === selectedChain,
    //   );

    // if (selectedTemplateContract) {
    //   // Create an updated contract with only the changed fields
    //   const updatedTemplateContract: Erc20TemplateSaveContractDetailsData = {
    //     ...selectedTemplateContract,
    //     name,
    //     symbol,
    //   };

    //   // Update the contract details using the context
    //   updateErc20TemplateContractDetail(selectedChain, updatedTemplateContract);
    // }
    setIsSaving(false);
    // setIsEditing(false);
  }

  return (
    <div>
      <div className="contract-form-container h-[458px] overflow-auto">
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
          </div>
        </div>
      </div>
      {missingAllInputs ? (
        <p className="text-red-600 text-sm">Please enter all required fields</p>
      ) : null}
      <div className="flex justify-center mt-6">
        <Button
          onClick={saveDetails}
          className={`w-3/4 ${isSaving && "cursor-not-allowed"}`}
          color={disable === true ? "secondary" : "primary"}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
