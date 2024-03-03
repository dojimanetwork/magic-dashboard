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
import { Text } from "../../common/Typography";
import CheckboxInput from "../../common/CheckboxInput";
import { extractConstructorArguments } from "../../../utils/readConstructorArgs";

export type BSCNFTContractParams = {
  name: string;
  symbol: string;
  baseUri: string;
};

export function GetBSCNFTContract(params: BSCNFTContractParams) {
  const contract = `// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.19;
  
  import "@openzeppelin/contracts/access/AccessControl.sol";
  import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
  import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
  import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
  import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
  import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
  import '@dojimanetwork/dojima-contracts/contracts/interfaces/IInboundStateSender.sol';
  import {IStateExecutor} from '@dojimanetwork/dojima-contracts/contracts/interfaces/IStateReceiver.sol';
  
  contract ${params.name} is IStateExecutor, Initializable, ERC721Upgradeable, UUPSUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable {
      bytes32 public constant EXECUTE_STATE_ROLE = keccak256("EXECUTE_STATE_ROLE");
      string public nft_name;
      string public nft_symbol;
      IInboundStateSender public inboundStateSender;
      address public omniChainNFTContractAddress;
  
      event NFTDeposited(
          address indexed user,
          address nft,
          uint256 tokenId,
          uint256 indexed depositId
      );

      constructor() {
        // Assign the token details
        nft_name = "${params.name}";
        nft_symbol = "${params.symbol}";
      }
  
      function initialize(
          // string memory nft_name,
          // string memory nft_symbol,
          address _inboundStateSender,
          address _omniChainNFTContractAddress
      ) public initializer {
          require(_inboundStateSender != address(0), "BscCrossChainToken: InboundStateSender address cannot be zero");
          require(_omniChainNFTContractAddress != address(0), "BscCrossChainToken: OmniChain contract address cannot be zero");
  
          __ERC721_init(nft_name, nft_symbol);
          __AccessControl_init();
          __UUPSUpgradeable_init();
  
          _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
          inboundStateSender = IInboundStateSender(_inboundStateSender);
          omniChainNFTContractAddress = _omniChainNFTContractAddress;
          _setupRole(EXECUTE_STATE_ROLE, _inboundStateSender);
      }

      function _baseURI() internal view virtual override returns (string memory) {
        return "${params.baseUri}";
      }
  
      function transferToOmniChain(address user, uint256 tokenId) external nonReentrant {
          _burn(tokenId);
          inboundStateSender.transferPayload(omniChainNFTContractAddress, abi.encode(user, tokenId, 0));
      }
  
      function executeState(uint256 /*depositID*/, bytes calldata stateData) external nonReentrant onlyRole(EXECUTE_STATE_ROLE) {
          (address userAddress, uint256 tokenId, uint256 depositId) = abi.decode(stateData, (address, uint256, uint256));
  
          _mint(userAddress, tokenId);
          emit NFTDeposited(userAddress, address(this), tokenId, depositId);
      }
  
      function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {
          // Upgrade authorization logic
      }
  
  
      function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
          return super.supportsInterface(interfaceId);
      }
  }`;

  return contract;
}

export default function BscNftTemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const { contractsData, updateContractDetails } = useContractDetails();
  const [disable, setDisable] = useState(false);
  const [missingAllInputs, setMissingAllInputs] = useState(false);
  const [baseUriError, setBaseUriError] = useState(false);
  const { erc721TemplateContractDetails, updateErc721TemplateContractDetail } =
    useTemplateContractDetails();
  const { userDetails } = useUserDetails();

  const selectedContractDetails = erc721TemplateContractDetails.contracts.find(
    (data) => data.chain === selectedChain,
  );

  const [name, setName] = useState(
    selectedContractDetails?.name === ""
      ? "Nft"
      : (selectedContractDetails?.name as string),
  );
  const [symbol, setSymbol] = useState(
    selectedContractDetails?.symbol === ""
      ? "Nft"
      : (selectedContractDetails?.symbol as string),
  );

  const [baseUri, setBaseUri] = useState(
    selectedContractDetails?.baseUri === ""
      ? ""
      : (selectedContractDetails?.baseUri as string),
  );

  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const nftOptions: BSCNFTContractParams = {
      name,
      symbol,
      baseUri
    };
    const finalContract = GetBSCNFTContract(nftOptions);
    setContract(finalContract);
    displayCode(finalContract);
  }, []);

  useEffect(() => {
    setIsEditing(true);
    const nftOptions: BSCNFTContractParams = {
      name,
      symbol,
      baseUri
    };
    const finalContract = GetBSCNFTContract(nftOptions);
    setContract(finalContract);
    displayCode(finalContract);
  }, [displayCode, name, symbol, baseUri]);

  function saveDetails() {
    setIsSaving(true);

    if (!name || !symbol || !baseUri) {
      setMissingAllInputs(true);
      setIsSaving(false);
      return;
    }

    if (!baseUri.startsWith("https://")) {
      setBaseUriError(true);
      setIsSaving(false);
      return;
    }

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
      erc721TemplateContractDetails.contracts.find(
        (contract) => contract.chain === selectedChain,
      );

    if (selectedTemplateContract) {
      // Create an updated contract with only the changed fields
      const updatedTemplateContract: Erc721TemplateSaveContractDetailsData = {
        ...selectedTemplateContract,
        name,
        symbol,
        baseUri,
      };

      // Update the contract details using the context
      updateErc721TemplateContractDetail(
        selectedChain,
        updatedTemplateContract,
      );
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
              id="baseUri"
              label="Base URI*"
              labelClassName="text-subtext"
              type={TextInputTypes.TEXT}
              value={baseUri}
              setValue={setBaseUri}
              placeholder="https://..."
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
      {missingAllInputs ? (
        <p className="text-red-600 text-sm">Please enter all required fields</p>
      ) : null}
      {baseUriError ? (
        <p className="text-red-600 text-sm">{`Base URI should start with https://`}</p>
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
//   Erc721TemplateSaveContractDetailsData,
//   useTemplateContractDetails,
// } from "../../../../context/template-contract-appState";
// import { BscCrossChainNftTemplate } from "../../../template-contracts/contracts/bsc/nft/BscCrossChainNft";

// export default function BscNftTemplateView({
//   displayCode,
//   selectedChain,
// }: {
//   displayCode: (code: string) => void;
//   selectedChain: AvailableChains;
// }) {
//   const { contractsData, updateContractDetails } = useContractDetails();
//   const { erc721TemplateContractDetails, updateErc721TemplateContractDetail } =
//     useTemplateContractDetails();
//   const { userDetails } = useUserDetails();

//   const selectedContractDetails = erc721TemplateContractDetails.contracts.find(
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
//   const [contract, setContract] = useState("");

//   const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
//   // const [deployedAddress, setDeployedAddress] = useState<string>("");

//   useEffect(() => {
//     const finalContract = BscCrossChainNftTemplate;
//     setContract(finalContract);
//     displayCode(finalContract);
//   }, []);

//   useEffect(() => {
//     const finalContract = BscCrossChainNftTemplate;
//     setContract(finalContract);
//     displayCode(finalContract);
//   }, [displayCode, name, symbol]);

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
//       erc721TemplateContractDetails.contracts.find(
//         (contract) => contract.chain === selectedChain,
//       );

//     if (selectedTemplateContract) {
//       // Create an updated contract with only the changed fields
//       const updatedTemplateContract: Erc721TemplateSaveContractDetailsData = {
//         ...selectedTemplateContract,
//         name,
//         symbol,
//       };

//       // Update the contract details using the context
//       updateErc721TemplateContractDetail(
//         selectedChain,
//         updatedTemplateContract,
//       );
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
