import * as path from "path";
import * as _ from "lodash";
import { PATHS } from "./fs";
import { processCreate, processInstallNodeModules } from "./create";
import { Keypair } from "@solana/web3.js";

const ANCHOR_VERSION = "0.29.0";

const DEFAULT_KEYPAIR_PATH = path.join(
  process.cwd(),
  "setup",
  "sol-evm-token",
  "solana",
  "id.json"
);

export const processCreateAnchor = async (programName: string) => {
  // Get the name of the project
  // const name = await getProjectName();
  const name = programName;
  const programKeypair = Keypair.generate();

  const pvtKey = JSON.stringify(Array.from(programKeypair.secretKey));

  const pvtKeyFileName = `${_.snakeCase(name)}-keypair.json`;

  // Create default anchor files, mirrored from anchor-cli
  const init = await processCreate({
    name,
    files: [
      // App folder
      [PATHS.DIRS.APP, ""],
      [PATHS.DIRS.MIGRATIONS, ""],
      [PATHS.DIRS.PROGRAMS, ""],
      [PATHS.DIRS.TESTS, ""],
      [PATHS.DIRS.TARGET, ""],
      [path.join(PATHS.DIRS.TARGET, PATHS.DIRS.DEPLOY), ""],
      [path.join(PATHS.DIRS.PROGRAMS, name), ""],
      [path.join(PATHS.DIRS.PROGRAMS, name, PATHS.DIRS.SRC), ""],

      // Target
      [path.join(PATHS.DIRS.TARGET, PATHS.DIRS.DEPLOY, pvtKeyFileName), pvtKey],

      // Migrations
      [
        path.join(PATHS.DIRS.MIGRATIONS, PATHS.FILES.DEPLOY_TS),
        `// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

const anchor = require("@coral-xyz/anchor");

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  // Add your deploy script here.
};
`,
      ],

      // Program Cargo.toml
      [
        path.join(PATHS.DIRS.PROGRAMS, name, PATHS.FILES.CARGO_TOML),
        `[package]
name = "${name}"
version = "0.1.0"
description = "Created with Anchor"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "${_.snakeCase(name)}"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "${ANCHOR_VERSION}"
anchor-spl = "0.29.0"
ethabi = "18.0.0"
hex = { version = "0.4" }
solana-program = "1.16.8"
`,
      ],

      // Program Xargo.toml
      [
        path.join(PATHS.DIRS.PROGRAMS, name, PATHS.FILES.XARGO_TOML),
        `[target.bpfel-unknown-unknown.dependencies.std]
features = []
`,
      ],

      // Program lib.rs
      [
        path.join(
          PATHS.DIRS.PROGRAMS,
          name,
          PATHS.DIRS.SRC,
          PATHS.FILES.LIB_RS
        ),
        `use anchor_lang::prelude::*;
        use anchor_spl::token;
        use ethabi::encode;
        use ethabi::{Address, Uint};
        use ethabi::Token;
        use hex::*;
        use solana_program::{system_instruction, instruction::Instruction, program::invoke_signed};
        
        declare_id!("${programKeypair.publicKey.toBase58()}");
        
        #[program]
        pub mod ${_.snakeCase(name)} {
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
        }
`,
      ],

      // Mocha test
      [
        path.join(PATHS.DIRS.TESTS, `${name}.ts`),
        `import * as anchor from "@coral-xyz/anchor";

describe("${name}", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  it("Is initialized!", async () => {
    // Add your test here.
    const program = anchor.workspace.${_.camelCase(name)};
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
`,
      ],

      // .gitignore
      [
        PATHS.FILES.GITIGNORE,
        `.anchor
.DS_Store
target
**/*.rs.bk
node_modules
test-ledger
`,
      ],

      // .prettierignore
      [
        PATHS.FILES.PRETTIERIGNORE,
        `.anchor
.DS_Store
target
node_modules
dist
build
test-ledger
`,
      ],

      // Anchor.toml
      [
        PATHS.FILES.ANCHOR_TOML,
        `[toolchain]

        [features]
seeds = false
skip-lint = false
[programs.localnet]
${_.camelCase(name)} = "${programKeypair.publicKey.toBase58()}"

[registry]
url = "${process.env.VITE_APP_SOL_API_URL}"

[provider]
cluster = "${process.env.VITE_APP_SOL_CLUSTER}"
wallet = "${DEFAULT_KEYPAIR_PATH}"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
`,
      ],

      // Workspace Cargo.toml
      [
        PATHS.FILES.CARGO_TOML,
        `[workspace]
members = [
    "programs/*"
]

[profile.release]
overflow-checks = true
lto = "fat"
codegen-units = 1
[profile.release.build-override]
opt-level = 3
incremental = false
codegen-units = 1
`,
      ],

      // package.json
      [
        PATHS.FILES.PACKAGE_JSON,
        `{
    "scripts": {
        "lint:fix": "prettier */*.js \\"*/**/*{.js,.ts}\\" -w",
        "lint": "prettier */*.js \\"*/**/*{.js,.ts}\\" --check"
    },
    "dependencies": {
        "@coral-xyz/anchor": "^${ANCHOR_VERSION}",
        "@project-serum/anchor": "^0.26.0",
        "@solana/spl-token": "^0.4.6",
        "@solana/wallet-adapter-react": "^0.15.35",
        "@supercharge/fs": "^3.4.2"
    },
    "devDependencies": {
        "chai": "^4.3.4",
        "mocha": "^9.0.3",
        "ts-mocha": "^10.0.0",
        "@types/bn.js": "^5.1.0",
        "@types/chai": "^4.3.0",
        "@types/mocha": "^9.0.0",
        "typescript": "^4.3.5",
        "prettier": "^2.6.2"
    }
}
`,
      ],

      // tsconfig.json
      [
        PATHS.FILES.TSCONFIG_JSON,
        `{
  "compilerOptions": {
    "types": ["mocha", "chai"],
    "typeRoots": ["./node_modules/@types"],
    "lib": ["es2015"],
    "module": "commonjs",
    "target": "es6",
    "esModuleInterop": true
  }
}
      `,
      ],
    ],
  });

  await processInstallNodeModules(name);

  return init;
};
