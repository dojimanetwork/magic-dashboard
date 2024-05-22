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

export type SOLEvmSolDataTransferTemplateContractParams = {
  name: string;
};

export function GetSOLEvmSolDataTransferProgram(params: SOLEvmSolDataTransferTemplateContractParams) {
  const program = `use anchor_lang::prelude::*;

  // Below ProgramId is only for viewing. Will generate new and updated during deployment
  declare_id!("11111111111111111111111111111111111111111111");

  #[program]
  pub mod ${_.snakeCase(params.name)} {
      use super::*;

      pub fn initialize(ctx: Context<Initialize>, BridgeOwnerPDA: Pubkey) -> Result<()> {
          ctx.accounts.bridge_owner_pda.owner = BridgeOwnerPDA;
          msg!("BridgeOwnerPDA intialized");
          Ok(())
      }


      // The name of the function should be 'execute_data_transfer', Solana-dojima-bridge will be calling 
      // destination program(ie; this program) with the same method identifier.
      pub fn execute_data_transfer(ctx: Context<ExecuteDataTransfer>, data: Vec<u8>) -> Result<()> {
          //Check if it is being signed by state sender contract(solana-dojima-bridge)
          if ctx.accounts.bridge_owner_pda.owner != ctx.accounts.user.key() {
              msg!("This message is not from bridge contract")
          }
          msg!("{:?}",data);
          Ok(())
      }
  }


  //BridgeOwner will be the PDA, that signs in solana_dojima_bridge.
  #[account]
  pub struct BridgeOwner {
      pub owner: Pubkey,
  }


  #[derive(Accounts)]
  pub struct Initialize<'info> {
      #[account(mut)]
      pub user: Signer<'info>,
      pub system_program: Program<'info, System>,
      #[account(
          init,
          seeds=[b"PDA_storing_bridge_authority"],
          bump,
          payer = user,
          space = 8 + 32,
      )]
      //Bridge owner will be stored in this PDA
      pub bridge_owner_pda: Account<'info,BridgeOwner>,
  }

  #[derive(Accounts)]
  pub struct ExecuteDataTransfer<'info> {
      #[account(mut)]
      pub user: Signer<'info>,
      pub bridge_owner_pda: Account<'info,BridgeOwner>,
  }`

  return program;
}

export default function SolanaEvmSolDataTransferTemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const mounted = useRef(false);
  const { evmSolDataTransferContractsData, updateEvmSolDataTransferContractDetails } = useContractDetails();
  const { dojSolDataTransferData, updateDojSolDataTransferSolana } = useSolanaTemplatesDetails();
  const [disable, setDisable] = useState(false);
  // const { erc20TemplateContractDetails, updateErc20TemplateContractDetail } =
  //   useTemplateContractDetails();
  const { userDetails } = useUserDetails();

  const selectedProgramDetails = evmSolDataTransferContractsData.evmSolDataTransferContracts.find(
    (data) => data.chain === selectedChain,
  );

  const [name, setName] = useState(
    selectedProgramDetails?.name || "Token"
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
    
    const tokenOptions: SOLEvmSolDataTransferTemplateContractParams = {
      name
    };
    const finalProgram = GetSOLEvmSolDataTransferProgram(tokenOptions);
    setContract(finalProgram);
    displayCode(finalProgram);

    // const constructorArgs = extractConstructorArguments(finalProgram);

    // Update unified program details
    const updatedDojSolDataTransferData = {
      dojima: dojSolDataTransferData.dojima, // Preserve existing Dojima data
      solana: {
        programName: name
      }
    };

    updateDojSolDataTransferSolana(updatedDojSolDataTransferData.solana);

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
