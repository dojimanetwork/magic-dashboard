import * as path from "path";
import * as _ from "lodash";
import { PATHS } from "./fs";
import { processCreate, processInstallNodeModules } from "./create";
import { Keypair } from "@solana/web3.js";

const ANCHOR_VERSION = "0.29.0";

const DEFAULT_KEYPAIR_PATH = path.join(
  process.cwd(),
  "setup",
  "evm-sol-data-transfer",
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
        `
        use anchor_lang::prelude::*;

        declare_id!("${programKeypair.publicKey.toBase58()}");

        #[program]
        pub mod ${_.snakeCase(name)} {
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
        }
      `
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
.yarn
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
