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
import { extractConstructorArguments } from "../../../utils/readConstructorArgs";

export type DOJERC20ContractParams = {
  name: string;
  symbol: string;
  premint: number;
  mintable: boolean;
  burnable: boolean;
};

export function GetDOJERC20Contract(params: DOJERC20ContractParams) {
  const contract = `// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.19;
  
  import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
  import "@openzeppelin/contracts/access/AccessControl.sol";
  
  
  contract ${params.name} is ERC20Burnable, AccessControl {
      string public token_name;
      string public token_symbol;
      uint8 private token_decimals;
      address public omniChainTokenContract;
      bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  
      event OmniChainTokenContractUpdated(address omniChainContract);
  
      constructor() ERC20(token_name, token_symbol) {
        // Assign the token details
        token_name = "${params.name}";
        token_symbol = "${params.symbol}";
        token_decimals = 18;
          _mint(msg.sender, ${
            params.premint
          } * (10 ** uint256(token_decimals)));
          _setupRole(ADMIN_ROLE, msg.sender);
      }
  
      function decimals() public view virtual override returns (uint8) {
          return token_decimals;
      }
  
      function setOmniChainContract(address _omniChainTokenContract) external onlyRole(ADMIN_ROLE) {
          omniChainTokenContract = _omniChainTokenContract;
          emit OmniChainTokenContractUpdated(_omniChainTokenContract);
      }
  
      modifier onlyOmniChainContract() {
          require(msg.sender == omniChainTokenContract, "XTokenContract: Unauthorized");
          _;
      }

      ${
        params.mintable
          ? `function mint(address account, uint256 amount) external onlyOmniChainContract{
            _mint(account, amount);
        }`
          : ``
      }

      ${
        params.burnable
          ? `function burn(address account, uint256 amount) external onlyOmniChainContract {
            _burn(account, amount);
        }`
          : ``
      }
  }`;

  return contract;
}

export default function DojimaErc20TemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const { contractsData, updateContractDetails } = useContractDetails();
  const [disable, setDisable] = useState(false);
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
  const [mintable, setMintable] = useState(false); // TODO : add option to user
  const [burnable, setBurnable] = useState(false); // TODO : add option to user
  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const erc20Options: DOJERC20ContractParams = {
      name,
      symbol,
      premint: premint ? Number(premint) : 0,
      mintable,
      burnable,
    };
    const finalContract = GetDOJERC20Contract(erc20Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, []);

  useEffect(() => {
    setIsEditing(true);
    const erc20Options: DOJERC20ContractParams = {
      name,
      symbol,
      premint: premint ? Number(premint) : 0,
      mintable,
      burnable,
    };
    const finalContract = GetDOJERC20Contract(erc20Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, [displayCode, name, premint, symbol, burnable, mintable]);

  function saveDetails() {
    setIsSaving(true);
    // Find the contract with the selected chain
    const selectedContract = contractsData.contracts.find(
      (contract) => contract.chain === selectedChain,
    );

    const constructorArgs = extractConstructorArguments(contract);

    if (selectedContract) {
      // Create an updated contract with only the changed fields
      const updatedContract: ContractDetailsData = {
        ...selectedContract,
        name,
        symbol: symbol !== "" ? symbol : selectedContract.symbol,
        code: contract,
        arguments:
          constructorArgs && constructorArgs.length > 0
            ? Array(constructorArgs.length).fill("")
            : selectedContract.arguments,
      };

      // Update the contract details using the context
      updateContractDetails(updatedContract);
    } else {
      // Create an updated contract with only the changed fields
      const updatedContract: ContractDetailsData = {
        name,
        symbol: symbol !== "" ? symbol : "",
        code: contract,
        arguments:
          constructorArgs && constructorArgs.length > 0
            ? Array(constructorArgs.length).fill("")
            : [],
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
    setIsSaving(false);
    setIsEditing(false);
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
      </div>
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

// import { useEffect, useState } from "react";
// import Button from "../../common/Button";
// import TextInput, { TextInputTypes } from "../../common/TextInput";
// import {
//   ContractDetailsData,
//   useContractDetails,
// } from "../../../../context/contract-appState";
// import { AvailableChains } from "../../../../../excalidraw-app/dojima-templates/types";
// import { useUserDetails } from "../../../../context/user-appState";
// import {
//   Erc20TemplateSaveContractDetailsData,
//   useTemplateContractDetails,
// } from "../../../../context/template-contract-appState";
// import { XTokenContractTemplate } from "../../../template-contracts/contracts/dojima/token/XTokenContract";

// export default function DojimaErc20TemplateView({
//   displayCode,
//   selectedChain,
// }: {
//   displayCode: (code: string) => void;
//   selectedChain: AvailableChains;
// }) {
//   const { contractsData, updateContractDetails } = useContractDetails();
//   const { erc20TemplateContractDetails, updateErc20TemplateContractDetail } =
//     useTemplateContractDetails();
//   const { userDetails } = useUserDetails();

//   const selectedContractDetails = erc20TemplateContractDetails.contracts.find(
//     (data) => data.chain === selectedChain,
//   );

//   const [name, setName] = useState(
//     selectedContractDetails?.name === ""
//       ? "Token"
//       : (selectedContractDetails?.name as string),
//   );
//   const [symbol, setSymbol] = useState(
//     selectedContractDetails?.symbol === ""
//       ? "Tkn"
//       : (selectedContractDetails?.symbol as string),
//   );
//   const [premint, setPremint] = useState(
//     selectedContractDetails?.premint === ""
//       ? ""
//       : (selectedContractDetails?.premint as string),
//   );
//   const [contract, setContract] = useState("");

//   const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
//   // const [deployedAddress, setDeployedAddress] = useState<string>("");

//   useEffect(() => {
//     const finalContract = XTokenContractTemplate;
//     setContract(finalContract);
//     displayCode(finalContract);
//   }, []);

//   useEffect(() => {
//     const finalContract = XTokenContractTemplate;
//     setContract(finalContract);
//     displayCode(finalContract);
//   }, [displayCode, name, premint, symbol]);

//   function saveDetails() {
//     // Find the contract with the selected chain
//     const selectedContract = contractsData.contracts.find(
//       (contract) => contract.chain === selectedChain,
//     );

//     if (selectedContract) {
//       // Create an updated contract with only the changed fields
//       const updatedContract: ContractDetailsData = {
//         ...selectedContract,
//         name,
//         symbol: symbol !== "" ? symbol : selectedContract.symbol,
//         code: contract,
//         arguments:
//           deployedArgs.length > 0 ? deployedArgs : selectedContract.arguments,
//       };

//       // Update the contract details using the context
//       updateContractDetails(updatedContract);
//     } else {
//       // Create an updated contract with only the changed fields
//       const updatedContract: ContractDetailsData = {
//         name,
//         symbol: symbol !== "" ? symbol : "",
//         code: contract,
//         arguments: deployedArgs.length > 0 ? deployedArgs : [],
//         chain: selectedChain,
//         gasPrice: "~0.0002",
//         type: userDetails.type,
//       };

//       // Update the contract details using the context
//       updateContractDetails(updatedContract);
//     }

//     // Find the templateContract with the selected chain
//     const selectedTemplateContract =
//       erc20TemplateContractDetails.contracts.find(
//         (contract) => contract.chain === selectedChain,
//       );

//     if (selectedTemplateContract) {
//       // Create an updated contract with only the changed fields
//       const updatedTemplateContract: Erc20TemplateSaveContractDetailsData = {
//         ...selectedTemplateContract,
//         name,
//         symbol,
//         premint,
//       };

//       // Update the contract details using the context
//       updateErc20TemplateContractDetail(selectedChain, updatedTemplateContract);
//     }
//   }

//   return (
//     <div className="contract-form-container">
//       {/* <div className="">Contract Form</div> */}
//       <div className="border-b">
//         <div className="flex flex-col gap-y-5">
//           <TextInput
//             id="name"
//             label="Contract Name*"
//             labelClassName="text-subtext"
//             type={TextInputTypes.TEXT}
//             value={name}
//             setValue={setName}
//           />
//           <TextInput
//             id="symbol"
//             label="Contract Symbol*"
//             labelClassName="text-subtext"
//             type={TextInputTypes.TEXT}
//             value={symbol}
//             setValue={setSymbol}
//           />
//           <TextInput
//             id="premint"
//             label="Premint"
//             labelClassName="text-subtext"
//             type={TextInputTypes.NUMBER}
//             value={premint}
//             setValue={setPremint}
//             minNum={0}
//           />
//         </div>
//       </div>
//       <div className="flex justify-between mt-[140px] ">
//         <Button onClick={saveDetails} className="w-full" color={"secondary"}>
//           Save
//         </Button>
//       </div>
//     </div>
//   );
// }
