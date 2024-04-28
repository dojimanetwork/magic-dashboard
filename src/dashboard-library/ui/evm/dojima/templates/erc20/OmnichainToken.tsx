import { useEffect, useRef, useState } from "react";
import Button from "../../../../common/Button";
import TextInput, { TextInputTypes } from "../../../../common/TextInput";
import {
  ContractDetailsData,
  useContractDetails,
} from "../../../../../../context/contract-appState";
import { AvailableChains } from "../../../../../../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../../../../../../context/user-appState";
import {
  Erc20TemplateSaveContractDetailsData,
  useTemplateContractDetails,
} from "../../../../../../context/template-contract-appState";
import { Text } from "../../../../common/Typography";
import CheckboxInput from "../../../../common/CheckboxInput";
import { extractConstructorArguments } from "../../../../../utils/readConstructorArgs";

export type DOJERC20ContractParams = {
  id: string;
  name: string;
  symbol: string;
  premint: number;
  mintable?: boolean;
  burnable?: boolean;
};

export function GetDOJOmnichainTokenERC20Contract(params: DOJERC20ContractParams) {
  const contract = `// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.19;
  
  import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
  import '@openzeppelin/contracts/access/AccessControl.sol';
  import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
  import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
  import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
  import '@dojimanetwork/dojima-contracts/contracts/interfaces/IOutboundStateSender.sol';
  import '@dojimanetwork/dojima-contracts/contracts/interfaces/IStateReceiver.sol';
  import '@dojimanetwork/dojima-contracts/contracts/dojimachain/StateSyncerVerifier.sol';
  import './${params.name}XTokenContract.sol';
  
  contract ${params.name}${params.id} is  Initializable, UUPSUpgradeable, ReentrancyGuardUpgradeable, AccessControl, IStateReceiver {
      ${params.name}XTokenContract public xToken;
      StateSyncerVerifier private _stateVerifier;
  
      IOutboundStateSender public outboundStateSender;
      bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
      bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  
      // Mapping of chain names to their contract addresses in bytes format
      mapping(bytes32 => bytes) public chainContractMappings;
  
      event ChainContractMappingUpdated(bytes32 chainName, bytes contractAddress);
      event TokensTransferredToChain(bytes32 destinationChain, bytes user, uint256 amount);
  
      modifier onlyStateSyncer() {
          require(msg.sender == address(_stateVerifier.stateSyncer()), "${params.name}${params.id}: Caller is not the state syncer");
          _;
      }
  
      // Initializer replaces the constructor
      function initialize(address _xTokenAddress, address _outboundStateSender, address _stateSyncerVerifier) public initializer {
          require(_xTokenAddress != address(0), "OmniChainERC20: XToken address cannot be zero");
          require(_outboundStateSender != address(0), "OmniChainERC20: OutboundStateSender address cannot be zero");
          require(_stateSyncerVerifier != address(0), "OmniChainERC20: Invalid state syncer verifier address");
          __UUPSUpgradeable_init();
          __ReentrancyGuard_init();
  
          _setupRole(ADMIN_ROLE, msg.sender);
  
          xToken = ${params.name}XTokenContract(_xTokenAddress);
          outboundStateSender = IOutboundStateSender(_outboundStateSender);
          _stateVerifier = StateSyncerVerifier(_stateSyncerVerifier);
      }
  
      // Function to authorize upgrades
      function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {
          // Upgrade authorization logic
      }
  
      function updateChainContractMapping(bytes32 chainName, bytes memory contractAddress) external onlyRole(ADMIN_ROLE) {
          chainContractMappings[chainName] = contractAddress;
          emit ChainContractMappingUpdated(chainName, contractAddress);
      }
  
      function transferToChain(
          bytes32 destinationChain,
          bytes memory user,
          uint256 amount,
          bytes memory destinationContractAddress
      ) external nonReentrant payable {
          require(
              keccak256(destinationContractAddress) == keccak256(chainContractMappings[destinationChain]),
              "OmniChainERC20: Destination contract address does not match"
          );
  
          xToken.burn(msg.sender, amount);
          // msg.value will be used as gas amount for the outbound transfer
          outboundStateSender.transferPayload{value: msg.value}(
              destinationChain,
              destinationContractAddress,
              msg.sender,
              abi.encode(user, amount, 0) // TODO: add depositId
          );
          emit TokensTransferredToChain(destinationChain, user, amount);
      }
  
      function onStateReceive(uint256 /* id */, bytes calldata data) external onlyStateSyncer {
          (bytes memory userBytes, uint256 amount, uint256 depositId ) = abi.decode(data, (bytes, uint256, uint256));
  
          // Ensure the bytes array for the address is of the correct length
          require(userBytes.length == 20, "OmniChainERC20: Invalid address length");

          // Ensure depositId is non-zero
          require(depositId != 0, "OmniChainERC20: Invalid depositId");
  
          address userAddress;
          assembly {
              userAddress := mload(add(userBytes, 20))
          }
  
          // Additional validation for the address can go here if needed
          require(userAddress != address(0), "OmniChainERC20: Invalid address");
  
          xToken.mint(userAddress, amount);
      }
  }`;

  return contract;
}

export default function DojimaOmnichainTokenTemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const mounted = useRef(false); // Ref to track whether the component is mounted
  const { contractsData, updateContractDetails } = useContractDetails();
  const [disable, setDisable] = useState(false);
  const { erc20TemplateContractDetails, updateErc20TemplateContractDetail } =
    useTemplateContractDetails();
  const { userDetails } = useUserDetails();
  const Contract_Id = "OmniChainERC20";

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
  const [missingAllInputs, setMissingAllInputs] = useState(false);

  useEffect(() => {
    if (!mounted.current) {
      // This block will execute only once when the component mounts
      mounted.current = true;
      return; // Exit early, don't execute the rest of the useEffect
    }

    setMissingAllInputs(false);
    setIsEditing(true);

    const erc20Options: DOJERC20ContractParams = {
      id: Contract_Id,
      name,
      symbol,
      premint: premint ? Number(premint) : 0,
    };
    const finalContract = GetDOJOmnichainTokenERC20Contract(erc20Options);
    setContract(finalContract);
    displayCode(finalContract);
  
    const constructorArgs = extractConstructorArguments(finalContract);
  
    // Find the contract with the selected chain
    const selectedContract = contractsData.contracts.find(
      (contract) => contract.chain === selectedChain,
    );
  
    if (selectedContract) {
      const existingCodeDetailIndex = selectedContract.codeDetails.findIndex(
        (detail) => detail.id === Contract_Id,
      );
  
      if (existingCodeDetailIndex !== -1) {
        // If code details with Contract_Id exist, update existing details
        const updatedContract: ContractDetailsData = {
          ...selectedContract,
          name,
          symbol,
          codeDetails: [
            ...selectedContract.codeDetails.slice(0, existingCodeDetailIndex),
            {
              ...selectedContract.codeDetails[existingCodeDetailIndex],
              fileName: `${name}${Contract_Id}`,
              code: finalContract,
            },
            ...selectedContract.codeDetails.slice(existingCodeDetailIndex + 1),
          ],
          argumentsDetails:
            selectedContract.argumentsDetails &&
            selectedContract.argumentsDetails.length > 0
              ? selectedContract.argumentsDetails.map((argDetail) => ({
                ...argDetail,
                fileName: `${name}${Contract_Id}`,
              }))
              : [
                  {
                    id: Contract_Id,
                    fileName: `${name}${Contract_Id}`,
                    arguments:
                      constructorArgs && constructorArgs.length > 0
                        ? Array(constructorArgs.length).fill("")
                        : [],
                  },
                ],
        };
  
        // Update the contract details using the context
        updateContractDetails(updatedContract);
      } else {
        // No existing code details found, add new details
        const newCodeDetail = {
          id: Contract_Id,
          fileName: `${name}${Contract_Id}`,
          code: finalContract,
        };
      
        const newArgumentsDetail = {
          id: Contract_Id,
          fileName: `${name}${Contract_Id}`,
          arguments:
            constructorArgs && constructorArgs.length > 0
              ? Array(constructorArgs.length).fill("")
              : [],
        };
      
        const updatedContract: ContractDetailsData = {
          ...selectedContract,
          name,
          symbol,
          codeDetails: [
            ...selectedContract.codeDetails,
            newCodeDetail,
          ],
          argumentsDetails: [
            ...(selectedContract.argumentsDetails || []),
            newArgumentsDetail,
          ],
        };
      
        // Update the contract details using the context
        updateContractDetails(updatedContract);
      }
    } else {
      // If no contract with selectedChain exists, add new contract details
      const addContractDetails: ContractDetailsData = {
        name,
        symbol: symbol !== "" ? symbol : "",
        codeDetails: [
          {
            id: Contract_Id,
            fileName: `${name}${Contract_Id}`,
            code: finalContract,
          },
        ],
        argumentsDetails: [
          {
            id: Contract_Id,
            fileName: `${name}${Contract_Id}`,
            arguments:
              constructorArgs && constructorArgs.length > 0
                ? Array(constructorArgs.length).fill("")
                : [],
          },
        ],
        chain: selectedChain,
        gasPrice: "~0.0002",
        type: userDetails.type,
      };
  
      // Update the contract details using the context
      updateContractDetails(addContractDetails);
    }
  
    // Find the templateContract with the selected chain
    const selectedTemplateContractIndex = erc20TemplateContractDetails.contracts.findIndex(
      (contract) => contract.chain === selectedChain,
    );
  
    if (selectedTemplateContractIndex !== -1) {
      // If template contract with selectedChain exists, update existing details
      const updatedTemplateContracts = [...erc20TemplateContractDetails.contracts];
      updatedTemplateContracts[selectedTemplateContractIndex] = {
        ...updatedTemplateContracts[selectedTemplateContractIndex],
        name,
        symbol,
        premint,
      };
  
      // Update the template contract details using the context
      updateErc20TemplateContractDetail(selectedChain, updatedTemplateContracts[selectedTemplateContractIndex]);
    } 

    setIsEditing(false);
  }, [name, symbol, premint, selectedChain]);

  // useEffect(() => {
  //   const erc20Options: DOJERC20ContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     premint: premint ? Number(premint) : 0,
  //   };
  //   const finalContract = GetDOJOmnichainTokenERC20Contract(erc20Options);
  //   setContract(finalContract);
  //   displayCode(finalContract);

  //   const constructorArgs = extractConstructorArguments(contract);

  //   // Find the contract with the selected chain
  //   const selectedContract = contractsData.contracts.find(
  //     (contract) => contract.chain === selectedChain,
  //   );

  //   if (selectedContract) {
  //     const codeDetailsByContractId = selectedContract.codeDetails.find(
  //       (detail) => detail.id === Contract_Id,
  //     );

  //     if (!codeDetailsByContractId) {
  //       const updatedContract: ContractDetailsData = {
  //         ...selectedContract,
  //         codeDetails: [
  //           ...selectedContract.codeDetails,
  //           {
  //             id: Contract_Id,
  //             fileName: `${name}${Contract_Id}`,
  //             code: contract,
  //           },
  //         ],
  //         argumentsDetails:
  //           selectedContract.argumentsDetails &&
  //           selectedContract.argumentsDetails.length > 0
  //             ? [
  //                 ...selectedContract.argumentsDetails,
  //                 {
  //                   id: Contract_Id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : [],
  //                 },
  //               ]
  //             : [
  //                 {
  //                   id: Contract_Id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : [],
  //                 },
  //               ],
  //       };

  //       // Update the contract details using the context
  //       updateContractDetails(updatedContract);
  //     }
  //   } else {
  //     const addContractDetails: ContractDetailsData = {
  //       name,
  //       symbol: symbol !== "" ? symbol : "",
  //       codeDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           code: contract,
  //         },
  //       ],
  //       argumentsDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           arguments:
  //             constructorArgs && constructorArgs.length > 0
  //               ? Array(constructorArgs.length).fill("")
  //               : [],
  //         },
  //       ],
  //       chain: selectedChain,
  //       gasPrice: "~0.0002",
  //       type: userDetails.type,
  //     };

  //     // Update the contract details using the context
  //     updateContractDetails(addContractDetails);
  //   }
  // }, []);

  // useEffect(() => {
  //   setIsEditing(true);
  //   const erc20Options: DOJERC20ContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     premint: premint ? Number(premint) : 0,
  //   };
  //   const finalContract = GetDOJOmnichainTokenERC20Contract(erc20Options);
  //   setContract(finalContract);
  //   displayCode(finalContract);

  //   // Find the templateContract with the selected chain
  //   const selectedTemplateContract =
  //     erc20TemplateContractDetails.contracts.find(
  //       (contract) => contract.chain === selectedChain,
  //     );

  //   if (selectedTemplateContract) {
  //     // Create an updated contract with only the changed fields
  //     const updatedTemplateContract: Erc20TemplateSaveContractDetailsData = {
  //       ...selectedTemplateContract,
  //       name,
  //       symbol,
  //       premint,
  //     };

  //     // Update the contract details using the context
  //     updateErc20TemplateContractDetail(selectedChain, updatedTemplateContract);
  //   }
  // }, [name, symbol, premint]);

  // useEffect(() => {
  //   const constructorArgs = extractConstructorArguments(contract);

  //   // Find the contract with the selected chain
  //   const selectedContract = contractsData.contracts.find(
  //     (contract) => contract.chain === selectedChain,
  //   );

  //   if (selectedContract) {
  //     const codeDetailsByContractId = selectedContract.codeDetails.find(
  //       (detail) => detail.id === Contract_Id,
  //     );

  //     if (codeDetailsByContractId) {
  //       const updatedContract: ContractDetailsData = {
  //         ...selectedContract,
  //         name,
  //         symbol,
  //         codeDetails: [
  //           ...selectedContract.codeDetails,
  //           {
  //             id: Contract_Id,
  //             fileName: `${name}${Contract_Id}`,
  //             code: contract,
  //           },
  //         ],
  //         argumentsDetails:
  //           selectedContract.argumentsDetails &&
  //           selectedContract.argumentsDetails.length > 0
  //             ? [
  //                 ...selectedContract.argumentsDetails,
  //                 {
  //                   id: Contract_Id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : [],
  //                 },
  //               ]
  //             : [
  //                 {
  //                   id: Contract_Id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : [],
  //                 },
  //               ],
  //       };

  //       // Update the contract details using the context
  //       updateContractDetails(updatedContract);
  //     }
  //   }
  // }, [displayCode]);

  // useEffect(() => {
  //   const erc20Options: DOJERC20ContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     premint: premint ? Number(premint) : 0
  //   };
  //   const finalContract = GetDOJOmnichainTokenERC20Contract(erc20Options);
  //   setContract(finalContract);
  //   displayCode(finalContract);
  // }, []);

  // useEffect(() => {
  //   setIsEditing(true);
  //   const erc20Options: DOJERC20ContractParams = {
  //     id: Contract_Id,
  //     name,
  //     symbol,
  //     premint: premint ? Number(premint) : 0,
  //   };
  //   const finalContract = GetDOJOmnichainTokenERC20Contract(erc20Options);
  //   setContract(finalContract);
  //   displayCode(finalContract);

  //   // Find the contract with the selected chain
  //   const selectedContract = contractsData.contracts.find(
  //     (contract) => contract.chain === selectedChain,
  //   );

  //   const constructorArgs = extractConstructorArguments(contract);

  //   if (selectedContract) {
  //     // Create an updated contract with only the changed fields
  //     const updatedContract: ContractDetailsData = {
  //       ...selectedContract,
  //       name,
  //       symbol: symbol !== "" ? symbol : selectedContract.symbol,
  //       codeDetails: (() => {
  //         const existingCodeDetail = selectedContract.codeDetails.find(
  //           (codeDetail) => codeDetail.id === Contract_Id,
  //         );
  //         if (existingCodeDetail) {
  //           // Update existing code detail
  //           return selectedContract.codeDetails.map((codeDetail) => {
  //             if (codeDetail.id === Contract_Id) {
  //               return {
  //                 ...codeDetail,
  //                 fileName: `${name}${Contract_Id}`,
  //                 code: contract,
  //               };
  //             } else {
  //               return codeDetail;
  //             }
  //           });
  //         } else {
  //           // Add new code detail
  //           return [
  //             ...selectedContract.codeDetails,
  //             {
  //               id: Contract_Id,
  //               fileName: `${name}${Contract_Id}`,
  //               code: contract,
  //             },
  //           ];
  //         }
  //       })(),

  //       argumentsDetails: (() => {
  //         if (
  //           selectedContract.argumentsDetails &&
  //           selectedContract.argumentsDetails.length > 0
  //         ) {
  //           const existingArgDetail = selectedContract.argumentsDetails.find(
  //             (argDetail) => argDetail.id === Contract_Id,
  //           );
  //           if (existingArgDetail) {
  //             // Update existing arguments detail
  //             selectedContract.argumentsDetails.map((argDetail) => {
  //               if (argDetail.id === Contract_Id) {
  //                 return {
  //                   id: argDetail.id,
  //                   fileName: `${name}${Contract_Id}`,
  //                   arguments:
  //                     constructorArgs && constructorArgs.length > 0
  //                       ? Array(constructorArgs.length).fill("")
  //                       : existingArgDetail,
  //                 };
  //               } else {
  //                 return argDetail;
  //               }
  //             });
  //           } else {
  //             // Add new arguments detail
  //             return [
  //               ...selectedContract.argumentsDetails,
  //               {
  //                 id: Contract_Id,
  //                 fileName: `${name}${Contract_Id}`,
  //                 arguments:
  //                   constructorArgs && constructorArgs.length > 0
  //                     ? Array(constructorArgs.length).fill("")
  //                     : [],
  //               },
  //             ];
  //           }
  //         } else {
  //           // Add new arguments detail
  //           return [
  //             {
  //               id: Contract_Id,
  //               fileName: `${name}${Contract_Id}`,
  //               arguments:
  //                 constructorArgs && constructorArgs.length > 0
  //                   ? Array(constructorArgs.length).fill("")
  //                   : [],
  //             },
  //           ];
  //         }
  //       })(),
  //     };

  //     // Update the contract details using the context
  //     updateContractDetails(updatedContract);
  //   } else {
  //     // Create an updated contract with only the changed fields
  //     const updatedContract: ContractDetailsData = {
  //       name,
  //       symbol: symbol !== "" ? symbol : "",
  //       codeDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           code: contract,
  //         },
  //       ],
  //       argumentsDetails: [
  //         {
  //           id: Contract_Id,
  //           fileName: `${name}${Contract_Id}`,
  //           arguments:
  //             constructorArgs && constructorArgs.length > 0
  //               ? Array(constructorArgs.length).fill("")
  //               : [],
  //         },
  //       ],
  //       chain: selectedChain,
  //       gasPrice: "~0.0002",
  //       type: userDetails.type,
  //     };

  //     // Update the contract details using the context
  //     updateContractDetails(updatedContract);
  //   }

  //   // Find the templateContract with the selected chain
  //   const selectedTemplateContract =
  //     erc20TemplateContractDetails.contracts.find(
  //       (contract) => contract.chain === selectedChain,
  //     );

  //   if (selectedTemplateContract) {
  //     // Create an updated contract with only the changed fields
  //     const updatedTemplateContract: Erc20TemplateSaveContractDetailsData = {
  //       ...selectedTemplateContract,
  //       name,
  //       symbol,
  //       premint,
  //     };

  //     // Update the contract details using the context
  //     updateErc20TemplateContractDetail(selectedChain, updatedTemplateContract);
  //   }
  // }, [displayCode, name, premint, symbol, burnable, mintable]);

  //   function saveDetails() {
  //     setIsSaving(true);

  //     if (!name || !symbol) {
  //       setMissingAllInputs(true);
  //       setIsSaving(false);
  //       return;
  //     }

  //     setIsSaving(false);
  //     setIsEditing(false);
  //   }

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
      {/* {missingAllInputs ? (
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
      </div> */}
    </div>
  );
}
