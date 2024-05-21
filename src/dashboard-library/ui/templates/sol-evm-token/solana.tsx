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

export type SOLSolEvmTokenTemplateContractParams = {
  name: string;
};

export function GetSOLSolEvmTokenProgram(params: SOLSolEvmTokenTemplateContractParams) {
  const program = `use anchor_lang::prelude::*;
  use anchor_spl::token;
  use ethabi::encode;
  use ethabi::{Address, Uint};
  use ethabi::Token;
  use hex::*;
  use solana_program::{system_instruction, instruction::Instruction, program::invoke_signed};
  
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
  
      pub fn transfer_to_doj_chain(ctx: Context<TransferToDojchain>, destination_doj_address: String, token_amount: u64, destination_doj_token_address: String) -> Result<()> {
  
          let sender_tokens = &ctx.accounts.from_token_account;
          let recipient_tokens = &ctx.accounts.to_token_account;
          let authority = &ctx.accounts.authority;
          let doj_bridge_address = &ctx.accounts.destination_prog;
          let token_program = &ctx.accounts.token_program;
  
          // Bridge related accounts
          let counter= ctx.accounts.counter.to_account_info();
          let contract_mapping = ctx.accounts.contract_mapping.to_account_info();
          let signing_pda= ctx.accounts.signing_pda.to_account_info();
  
          //PDA that signs the CPI to dojima_bridge_program        
          let seeds_to_sign: &[&[u8]] = &[
              b"signing_authority",
              &[254]
         ]; 
         let signer_seeds:&[&[&[u8]]] = &[&seeds_to_sign[..]];
  
         //Transfer tokens to one of our vault address(Locking)
          token::transfer(
              CpiContext::new(
                  token_program.to_account_info(),
                  token::Transfer {
                      from: sender_tokens.to_account_info(),
                      to: recipient_tokens.to_account_info(),
                      authority: authority.to_account_info(),
                  },
              ),
              token_amount,
          )?;
  
          //Instruction identifier of global:transfer_payload
          let inst_identifier:Vec<u8> = vec![84, 168, 180, 187, 29, 10, 105, 179];
  
          //Prepare data for CPI
          //Payload should be abi-encoded
          let mut dest_address = hex::decode(destination_doj_address[2..].to_owned()).expect("Decoding failed");
          let mut dest_address_bytes = [0u8;20];
          for i in 0..dest_address.len() {
              dest_address_bytes[i] = dest_address[i]
          } 
          let token_amount: Uint = Uint{0:[token_amount,0,0,0]};
          let vec_payload_for_evm =encode(&vec![
              //destination user address
        Token::Bytes(dest_address_bytes.into()),
        Token::Uint(token_amount),
              Token::Uint(12.into()),
      ]);
          let mut bytes_payload_for_evm = hex::encode(&vec_payload_for_evm);
          bytes_payload_for_evm = bytes_payload_for_evm.to_owned();
          
          //data_for_CPI = instruction_identifier + arguments_in_bytes
          let mut data = inst_identifier.to_vec();
  
          //append destination_doj_token_address
          let mut len_to_extend= destination_doj_token_address.len() as u32;
          let dest_contract_len_bytes = len_to_extend.to_le_bytes();
          data.extend(dest_contract_len_bytes);
          data.extend(destination_doj_token_address.as_bytes());
  
          //append bytes_payload_for_evm
          len_to_extend = bytes_payload_for_evm.len() as u32;
          let evm_data_len_bytes = len_to_extend.to_le_bytes();
          data.extend(evm_data_len_bytes);
          data.extend(bytes_payload_for_evm.as_bytes());
  
          //construct account_metas vector for CPI usage
          let account_metas = vec![
              AccountMeta::new(signing_pda.key(),true),
              AccountMeta::new(counter.key(), false),
              AccountMeta::new_readonly(contract_mapping.key(),false),
          ];
  
          //construct account_infos vector
          let account_infos = vec![
              signing_pda,
              counter,
              contract_mapping,
          ];
  
          //Construct instruction
          let inst = Instruction{ 
              program_id: doj_bridge_address.key(),
              accounts: account_metas,
              data: data,
          };
  
          //Invoke CPI
          invoke_signed(&inst, &account_infos, signer_seeds)?;
  
          Ok(())
      }
  
      pub fn execute_state(ctx: Context<ExecuteProgState>, data: Vec<u8>) -> Result<()> {
          //Check if it is being signed by state sender contract
          if ctx.accounts.bridge_owner_pda.owner != ctx.accounts.from.key() {
              msg!("This is not from bridge contract")
          }
  
          //create a PDA from programaddress from which tokens will be transferred
          let seeds: &[&[u8]] = &[
              b"spl_token_holding_authority",
              &[255]
          ];  
          let signer_seeds:&[&[&[u8]]] = &[&seeds[..]];
  
          //De-serialize the data to get number of tokens to send
          let slice = data.as_slice();
          let amt_as_bytes: [u8; 8] = match slice.try_into() {
              Ok(ba) => ba,
              Err(_) => panic!("Expected a Vec of length {} but it was {}", 32, data.len()),
          };
          let tokens_to_send = u64::from_be_bytes(amt_as_bytes);
  
          //retrive the accounts and send the tokens by signing with PDA that is derived by program_address
          let authority = ctx.accounts.authority.to_account_info();
          let sender_tokens = &ctx.accounts.from_token_account.to_account_info();
          let recipient_tokens = &ctx.accounts.to_token_account;
          let token_program = &ctx.accounts.token_program;
         
          token::transfer(
              CpiContext::new_with_signer(
                  token_program.to_account_info(),
                  token::Transfer {
                      from: sender_tokens.to_account_info(),
                      to: recipient_tokens.to_account_info(),
                      authority: authority,
                  },
                  signer_seeds
              ),
              tokens_to_send,
          )?;
                
          msg!("Tokens transffered sucessfully");
          msg!("{:?}",tokens_to_send);
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
  pub struct TransferToDojchain<'info> {
      #[account(mut)]
      pub from: Signer<'info>,
      #[account(mut)]
      pub from_token_account: Account<'info,token::TokenAccount>,
      #[account(mut)]
      pub to_token_account: Account<'info,token::TokenAccount>,
      pub token_program: Program<'info, token::Token>,
      ///CHECK: authority account who holds tokens.
      pub authority: AccountInfo<'info>,
      ///CHECK: destination_prog is dojima bridge program address on solana.
      #[account(mut)]
      pub destination_prog: AccountInfo<'info>,
      ///CHECK: counter account need to be passed which will be used by bridge.
      #[account(mut)]
      pub counter: AccountInfo<'info>,
      ///CHECK: contract mapping, where the assosiated authority and dojimatoken are stored.
      pub contract_mapping: AccountInfo<'info>,
      ///CHECK: contract mapping, where the assosiated authority and dojimatoken are stored.
      #[account(mut)]
      pub signing_pda: AccountInfo<'info>,
  }
  
  #[derive(Accounts)]
  pub struct ExecuteProgState<'info> {
      #[account(mut)]
      pub from: Signer<'info>,
      #[account(mut)]
      pub from_token_account: Account<'info, token::TokenAccount>,
      #[account(mut)]
      pub to_token_account: Account<'info, token::TokenAccount>,
      pub token_program: Program<'info, token::Token>,
      ///CHECK: authority account who holds tokens
      pub authority: AccountInfo<'info>,
      pub bridge_owner_pda: Account<'info,BridgeOwner>,
  }`;

  return program;
}

export default function SolanaSolEvmTokenTemplateView({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const mounted = useRef(false);
  const { solEvmTokenContractsData, updateSolEvmTokenContractDetails } = useContractDetails();
  const { solDojTokenData, updateSolDojTokenSolana } = useSolanaTemplatesDetails();
  const [disable, setDisable] = useState(false);
  // const { erc20TemplateContractDetails, updateErc20TemplateContractDetail } =
  //   useTemplateContractDetails();
  const { userDetails } = useUserDetails();

  const selectedProgramDetails = solEvmTokenContractsData.solEvmTokenContracts.find(
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
    
    const tokenOptions: SOLSolEvmTokenTemplateContractParams = {
      name
    };
    const finalProgram = GetSOLSolEvmTokenProgram(tokenOptions);
    setContract(finalProgram);
    displayCode(finalProgram);

    // const constructorArgs = extractConstructorArguments(finalProgram);

    // Update unified program details
    const updatedSolDojTokenData = {
      dojima: solDojTokenData.dojima, // Preserve existing Dojima data
      solana: {
        programName: name
      }
    };

    updateSolDojTokenSolana(updatedSolDojTokenData.solana);

    // Find the contract with the selected chain
    const selectedContract = solEvmTokenContractsData.solEvmTokenContracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if (selectedContract) {
      const updatedContract: SolEvmTokenContractDetailsData = {
        ...selectedContract,
        name,
      };

      // Update the contract details using the context
      updateSolEvmTokenContractDetails(updatedContract);

    } else {
      // If no contract with selectedChain exists, add new contract details
      const addContractDetails: SolEvmTokenContractDetailsData = {
        name,
        chain: selectedChain,
        gasPrice: "~0.0002",
        type: userDetails.type,
      };

      // Update the contract details using the context
      updateSolEvmTokenContractDetails(addContractDetails);
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
