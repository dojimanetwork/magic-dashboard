import { useEffect, useRef, useState } from "react";
import Button from "../../common/Button";
import TextInput, { TextInputTypes } from "../../common/TextInput";
import {
  SolEvmTokenContractDetailsData,
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

export type DOJSolEvmTokenTemplateContractParams = {
  name: string;
  symbol: string;
  total_supply: string;
};

export function GetDOJSolEvmTokenContract(params: DOJSolEvmTokenTemplateContractParams) {
  const contract = `// SPDX-License-Identifier: UNLICENSED
  pragma solidity ^0.8.19;
  
  import '@dojimanetwork/dojima-contracts/contracts/interfaces/IOutboundStateSender.sol';
  
  contract ${_.snakeCase(params.name)} {
     
      address public owner;
  
      // Some string type variables to identify the token.
      string public name = "${params.name}";
      string public symbol = "${params.symbol}";
      
      // The fixed amount of tokens, stored in an unsigned integer type variable.
      uint256 public totalSupply = ${params.total_supply};
  
       // A mapping is a key/value map. Here we store each account's balance.
      mapping(address => uint256) balances;
  
      // The Transfer event helps off-chain applications understand
      // what happens within your contract.
      event Transfer(address indexed _from, address indexed _to, uint256 _value);
      event TokensTransferredToChain(bytes32 indexed destinationChain, uint256 amount);
  
      address public stateSyncer;
      IOutboundStateSender public outboundStateSender;
  
      modifier onlyStateSyncer() {
          require(isCallerStateSyncer(), 'State syncer: caller is not the state syncer contract');
          _;
      }
  
      constructor(address _outboundStateSender) {
           // default state syncer contract
          stateSyncer = 0x0000000000000000000000000000000000001001;
          outboundStateSender = IOutboundStateSender(_outboundStateSender);
  
          balances[msg.sender] = totalSupply;
          owner = msg.sender;
      }
  
      function isCallerStateSyncer() public view returns (bool) {
          return msg.sender == stateSyncer;
      }
  
      // Payload should coontain all necessary information required to process 'TokenTransfer'
      // on destination chain
      function xChainTransfer( 
          bytes32 destinationChain,
          bytes memory destinationContractAddress,
          uint256 amount,
          bytes memory payload
      ) external payable
      {
          //Check - destination chain should only be SOLANA(in this example)
          //Lock 'amount' tokens in owner address
          balances[msg.sender] -= amount;
          balances[owner] += amount;
  
          // Call 'transferPayload' function of OutboundStateSender
         outboundStateSender.transferPayload{value: msg.value}(
              destinationChain,
              destinationContractAddress,
              msg.sender,
              payload // TODO: add depositId
          );
          emit TokensTransferredToChain(destinationChain, amount);
      }
  
      function onStateReceive(uint256 /* id */, bytes calldata data) external onlyStateSyncer {
          (bytes memory userBytes, uint256 amount, uint256 depositId ) = abi.decode(data, (bytes, uint256, uint256));
  
          // Ensure the bytes array for the address is of the correct length
          require(userBytes.length == 20, "DOJToken: Invalid address length");
  
          address userAddress;
          assembly {
              userAddress := mload(add(userBytes, 20))
          }
  
          // Additional validation for the address can go here if needed
          require(userAddress != address(0), "DOJToken: Invalid address");
  
          totalSupply += amount;
  
          // transfer amount to user
          balances[userAddress]+= amount;
  
      }
  
      function balanceOf(address account) public view returns (uint256) {
          return balances[account];
      }
  }`;

  return contract;
}

export default function DojimaSolEvmTokenTemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const mounted = useRef(false);
  const { solEvmTokenContractsData, updateSolEvmTokenContractDetails } = useContractDetails();
  const { solDojTokenData, updateSolDojTokenDojima } = useSolanaTemplatesDetails();
  const [disable, setDisable] = useState(false);
  // const { erc20TemplateContractDetails, updateErc20TemplateContractDetail } =
  //   useTemplateContractDetails();
  const { userDetails } = useUserDetails();

  const selectedContractDetails = solEvmTokenContractsData.solEvmTokenContracts.find(
    (data) => data.chain === selectedChain,
  ); // Updated logic

  const [name, setName] = useState(
    selectedContractDetails?.name || "Token"
  );
  const [symbol, setSymbol] = useState(
    selectedContractDetails?.symbol || "Tkn"
  );
  const [total_supply, setTotalSupply] = useState(
    selectedContractDetails?.supply?.toString() || "0"
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
    
    const tokenOptions: DOJSolEvmTokenTemplateContractParams = {
      name,
      symbol,
      total_supply
    };
    const finalContract = GetDOJSolEvmTokenContract(tokenOptions);
    setContract(finalContract);
    displayCode(finalContract);

    // const constructorArgs = extractConstructorArguments(finalContract);

    // Update unified contract details
    const updatedSolDojTokenData = {
      dojima: {
        contractName: name,
        contractSymbol: symbol,
        totalSupply: parseInt(total_supply, 10)
      },
      solana: solDojTokenData.solana // Preserve existing Solana data
    };

    updateSolDojTokenDojima(updatedSolDojTokenData.dojima);

    // Find the contract with the selected chain
    const selectedContract = solEvmTokenContractsData.solEvmTokenContracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if (selectedContract) {
      const updatedContract: SolEvmTokenContractDetailsData = {
        ...selectedContract,
        name,
        symbol,
        supply: parseInt(total_supply, 10)
      };

      // Update the contract details using the context
      updateSolEvmTokenContractDetails(updatedContract);

    } else {
      // If no contract with selectedChain exists, add new contract details
      const addContractDetails: SolEvmTokenContractDetailsData = {
        name,
        symbol: symbol !== "" ? symbol : "",
        supply: parseInt(total_supply, 10),
        chain: selectedChain,
        gasPrice: "~0.0002",
        type: userDetails.type,
      };

      // Update the contract details using the context
      updateSolEvmTokenContractDetails(addContractDetails);
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
  }, [name, symbol, total_supply, selectedChain]);

  function saveDetails() {
    setIsSaving(true);

    if (!name || !symbol) {
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
            <TextInput
              id="symbol"
              label="Contract Symbol*"
              labelClassName="text-subtext"
              type={TextInputTypes.TEXT}
              value={symbol}
              setValue={setSymbol}
            />
            <TextInput
              id="total_supply"
              label="Total supply"
              labelClassName="text-subtext"
              type={TextInputTypes.NUMBER}
              value={total_supply}
              setValue={setTotalSupply}
              minNum={0}
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
