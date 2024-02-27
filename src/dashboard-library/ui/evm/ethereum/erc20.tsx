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

export type ETHERC20ContractParams = {
  name: string;
  symbol: string;
};

export function GetETHERC20Contract(params: ETHERC20ContractParams) {
  const contract = `// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.19;
  
  import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
  import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
  import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
  import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
  import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
  import '@dojimanetwork/dojima-contracts/contracts/interfaces/IInboundStateSender.sol';
  import {IStateExecutor} from '@dojimanetwork/dojima-contracts/contracts/interfaces/IStateReceiver.sol';
  
  contract ${params.name} is IStateExecutor, Initializable, ERC20Upgradeable, UUPSUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable {
      bytes32 public constant EXECUTE_STATE_ROLE = keccak256("EXECUTE_STATE_ROLE");
  
      IInboundStateSender public inboundStateSender;
      address public omniChainContractAddress;
      string public token_name;
      string public token_symbol;
  
      event TokenDeposited(
          address indexed user,
          address token,
          uint256 amount,
          uint256 indexed depositId
      );

      constructor() {
        // Assign the token details
        token_name = "${params.name}";
        token_symbol = "${params.symbol}";
      }
  
      // Initialize replaces the constructor for upgradeable contracts
      function initialize(
          // string memory token_name,
          // string memory token_symbol,
          address _inboundStateSender,
          address _omniChainContractAddress
      ) public initializer {
          require(_inboundStateSender != address(0), "EthereumCrossChainToken: InboundStateSender address cannot be zero");
          require(_omniChainContractAddress != address(0), "EthereumCrossChainToken: OmniChain contract address cannot be zero");
  
          __ERC20_init(token_name, token_symbol);
          __AccessControl_init();
          __UUPSUpgradeable_init();
  
          // Grant the deployer the default admin role: they can grant/revoke any roles
          _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  
          inboundStateSender = IInboundStateSender(_inboundStateSender);
          omniChainContractAddress = _omniChainContractAddress;
          _setupRole(EXECUTE_STATE_ROLE, _inboundStateSender);
      }
  
      function assignExecuteStateRole(address _account) external onlyRole(DEFAULT_ADMIN_ROLE) {
          _setupRole(EXECUTE_STATE_ROLE, _account);
      }
  
      function transferToOmniChain(bytes memory user, uint256 amount) external nonReentrant {
          _burn(msg.sender, amount);
          inboundStateSender.transferPayload(omniChainContractAddress, abi.encode(user, amount, 0));
      }
  
      function executeState(uint256 /*depositID*/, bytes calldata stateData) external nonReentrant onlyRole(EXECUTE_STATE_ROLE) {
          (bytes memory userBytes, uint256 amount, uint256 depositId) = abi.decode(stateData, (bytes, uint256, uint256));
          // Ensure the bytes array for the address is of the correct length
          require(userBytes.length == 20, "EthereumCrossChainToken: Invalid address length");
  
          address userAddress;
          assembly {
              userAddress := mload(add(userBytes, 20))
          }
  
          // Additional validation for the address can go here if needed
          require(userAddress != address(0), "EthereumCrossChainToken: Invalid address");
  
          _mint(userAddress, amount);
          emit TokenDeposited(userAddress, address(this), amount, depositId);
      }
  
      // Ensure only admin can upgrade the contract
      function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {
          // Upgrade authorization logic
      }
  }`;

  return contract;
}

export default function EthereumErc20TemplateView({
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

  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const erc20Options: ETHERC20ContractParams = {
      name,
      symbol,
    };
    const finalContract = GetETHERC20Contract(erc20Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, []);

  useEffect(() => {
    setIsEditing(true);
    const erc20Options: ETHERC20ContractParams = {
      name,
      symbol,
    };
    const finalContract = GetETHERC20Contract(erc20Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, [displayCode, name, symbol]);

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
            {/* <TextInput
              id="premint"
              label="Premint"
              labelClassName="text-subtext"
              type={TextInputTypes.NUMBER}
              value={premint}
              setValue={setPremint}
              minNum={0}
            /> */}
          </div>
        </div>
        {/* <div className="flex flex-col gap-y-5 py-6 border-b">
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
        </div> */}
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
// import { EthereumCrossChainTokenTemplate } from "../../../template-contracts/contracts/ethereum/token/EthereumCrossChainToken";

// export default function EthereumErc20TemplateView({
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
//     const finalContract = EthereumCrossChainTokenTemplate;
//     setContract(finalContract);
//     displayCode(finalContract);
//   }, []);

//   useEffect(() => {
//     const finalContract = EthereumCrossChainTokenTemplate;
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
