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
  Erc20TemplateSaveContractDetailsData,
  useTemplateContractDetails,
} from "../../../../context/template-contract-appState";
import { Text } from "../../common/Typography";
import CheckboxInput from "../../common/CheckboxInput";
// import { BscCrossChainTokenTemplate } from "../../../template-contracts/contracts/bsc/token/BscCrossChainToken";

export type Bep20ContractParams = {
  name: string;
  symbol: string;
  premint: number;
  mintable: boolean;
  burnable: boolean;
};

export function GetBEP20Contract(params: Bep20ContractParams) {
  const contract = `// SPDX-License-Identifier: MIT
      pragma solidity ^0.8.19;
      contract ${params.name} {
          // Token details
      string public name;
      string public symbol;
      uint256 public totalSupply;
      uint8 public decimals;
  
      // Mapping to keep track of token balances
      mapping (address => uint256) public balanceOf;
  
      // Events for token transfers and approvals
      event Transfer(address indexed from, address indexed to, uint256 value);
  
      // Variable to keep track of contract owner
      address public getOwner;
  
      // Constructor function to initialize the contract
      constructor() {
          // Assign the token details
          name = "${params.name}";
          symbol = "${params.symbol}";
          totalSupply = ${params.premint};
          decimals = 18;
  
          // Assign the total supply to the contract creator
          balanceOf[msg.sender] = totalSupply;
  
          // Assign the contract owner to the creator
          getOwner = msg.sender;
      }
  
      // Function to transfer tokens
      function transfer(address to, uint256 value) public returns (bool) {
          require(balanceOf[msg.sender] >= value, "Insufficient balance");
  
          // Transfer tokens
          balanceOf[msg.sender] -= value;
          balanceOf[to] += value;
  
          // Emit transfer event
          emit Transfer(msg.sender, to, value);
  
          return true;
      }
  
          ${
            params.mintable
              ? `function mint(uint256 _amount) public returns (bool success) {
              require(msg.sender == address(0), "Operation unauthorised");
      
              totalSupply += _amount;
              balanceOf[msg.sender] += _amount;
      
              emit Transfer(address(0), msg.sender, _amount);
              return true;
          }`
              : ``
          }
  
          ${
            params.burnable
              ? `function burn(uint256 _amount) public returns (bool success) {
                  require(msg.sender != address(0), "Invalid burn recipient");
            
                  uint256 accountBalance = balanceOf[msg.sender];
                  require(accountBalance > _amount, "Burn amount exceeds balance");
            
                  balanceOf[msg.sender] -= _amount;
                  totalSupply -= _amount;
            
                  emit Transfer(msg.sender, address(0), _amount);
                  return true;
                }`
              : ``
          }
      }
      `;

  return contract;
}

export default function BscBep20View({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const { contractsData, updateContractDetails } = useContractDetails();
  const { erc20TemplateContractDetails, updateErc20TemplateContractDetail } =
    useTemplateContractDetails();
  const { userDetails } = useUserDetails();

  const selectedContractDetails = erc20TemplateContractDetails.contracts.find(
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
  const [premint, setPremint] = useState(
    selectedContractDetails?.premint === ""
      ? "0"
      : (selectedContractDetails?.premint as string),
  );
  const [mintable, setMintable] = useState(true); // TODO : add option to user
  const [burnable, setBurnable] = useState(true); // TODO : add option to user
  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");

  useEffect(() => {
    const bep20Options: Bep20ContractParams = {
      name,
      symbol,
      premint: premint ? Number(premint) : 0,
      mintable,
      burnable,
    };
    const finalContract = GetBEP20Contract(bep20Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, []);

  useEffect(() => {
    const bep20Options: Bep20ContractParams = {
      name,
      symbol,
      premint: premint ? Number(premint) : 0,
      mintable,
      burnable,
    };
    const finalContract = GetBEP20Contract(bep20Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, [displayCode, name, premint, symbol, burnable, mintable]);

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
        gasPrice: "~0.0002",
        type: userDetails.type,
      };

      // Update the contract details using the context
      updateContractDetails(updatedContract);
    }

    // Find the templateContract with the selected chain
    const selectedTemplateContract =
      erc20TemplateContractDetails.contracts.find(
        (contract) => contract.chain === selectedChain,
      );

    if (selectedTemplateContract) {
      // Create an updated contract with only the changed fields
      const updatedTemplateContract: Erc20TemplateSaveContractDetailsData = {
        ...selectedTemplateContract,
        name,
        symbol,
        premint,
      };

      // Update the contract details using the context
      updateErc20TemplateContractDetail(selectedChain, updatedTemplateContract);
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
      <div className="flex flex-col gap-y-5 py-6 border-b">
        <Text Type="16-Md"> Features</Text>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          <CheckboxInput
            id="mintable"
            label="Mintable"
            value={mintable}
            setValue={setMintable}
            labelClassName="text-subtext"
            className="accent-[#6B45CD]"
          />
          <CheckboxInput
            id="burnable"
            label="Burnable"
            value={burnable}
            setValue={setBurnable}
            labelClassName="text-subtext"
            className="accent-[#6B45CD]"
          />
        </div>
      </div>
      <div className="flex justify-between mt-[140px] ">
        <Button onClick={saveDetails} className="w-full" color={"primary"}>
          Save
        </Button>
      </div>
    </div>
  );
}
