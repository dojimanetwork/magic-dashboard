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

export type DOJNFTContractParams = {
  name: string;
  symbol: string;
  baseUri: string;
  mintable: boolean;
  burnable: boolean;
};

export function GetDOJNFTContract(params: DOJNFTContractParams) {
  const contract = `// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.19;
  
  import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
  import "@openzeppelin/contracts/access/AccessControl.sol";
  
  contract ${params.name} is ERC721Burnable, AccessControl {
      string public nft_name;
      string public nft_symbol;
      address public omniChainNFTContract;
      bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  
      event OmniChainNFTContractUpdated(address omniChainContract);
  
      constructor() ERC721(nft_name, nft_symbol) {
        nft_name = "${params.name}";
        nft_symbol = "${params.symbol}";
          _setupRole(ADMIN_ROLE, msg.sender);
      }
  
      function _baseURI() internal view virtual override returns (string memory) {
        return "${params.baseUri}";
      }

      function setOmniChainContract(address _omniChainNFTContract) external onlyRole(ADMIN_ROLE) {
          omniChainNFTContract = _omniChainNFTContract;
          emit OmniChainNFTContractUpdated(_omniChainNFTContract);
      }
  
      modifier onlyOmniChainNFTContract() {
          require(msg.sender == omniChainNFTContract, "XNFTContract: Unauthorized");
          _;
      }

      ${
        params.mintable
          ? `function mint(address to, uint256 tokenId) public onlyOmniChainNFTContract {
            _safeMint(to, tokenId);
        }`
          : ``
      }

      ${
        params.burnable
          ? `function burn(uint256 tokenId) public override onlyOmniChainNFTContract {
            _burn(tokenId);
        }`
          : ``
      }
  
      function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
          return super.supportsInterface(interfaceId);
      }
  }`;

  return contract;
}

export default function DojimaNftTemplateView({
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
  // const [premint, setPremint] = useState(
  //   selectedContractDetails?.premint === ""
  //     ? "0"
  //     : (selectedContractDetails?.premint as string),
  // );
  const [mintable, setMintable] = useState(false); // TODO : add option to user
  const [burnable, setBurnable] = useState(false); // TODO : add option to user
  const [contract, setContract] = useState("");

  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const nftOptions: DOJNFTContractParams = {
      name,
      symbol,
      baseUri,
      mintable,
      burnable,
    };
    const finalContract = GetDOJNFTContract(nftOptions);
    setContract(finalContract);
    displayCode(finalContract);
  }, []);

  useEffect(() => {
    setMissingAllInputs(false);
    setBaseUriError(false);
    setIsEditing(true);
    const nftOptions: DOJNFTContractParams = {
      name,
      symbol,
      baseUri,
      mintable,
      burnable,
    };
    const finalContract = GetDOJNFTContract(nftOptions);
    setContract(finalContract);
    displayCode(finalContract);
  }, [displayCode, name, baseUri, symbol, burnable, mintable]);

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
// import { XNftContractTemplate } from "../../../template-contracts/contracts/dojima/nft/XNftContract";

// export default function DojimaNftTemplateView({
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
//     const finalContract = XNftContractTemplate;
//     setContract(finalContract);
//     displayCode(finalContract);
//   }, []);

//   useEffect(() => {
//     const finalContract = XNftContractTemplate;
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
