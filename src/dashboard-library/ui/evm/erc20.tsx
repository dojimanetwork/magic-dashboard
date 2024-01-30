import { useEffect, useState } from "react";
import Button from "../common/Button";
// import Input from "@/app/ui/Input";
import { Text } from "../common/Typography";
import { erc20 } from "@openzeppelin/wizard";
// import Overlay from "../Overlay";
// import DeployModal from "../deploy/page";
// import VerifyContract from "../verifycontract/page";
import getLicences from "../utils/getLicenses";
import TextInput, { TextInputTypes } from "../common/TextInput";
import CheckboxInput from "../common/CheckboxInput";
import RadioInput from "../common/RadioInput";
import { access, ERC20ContractParams, upgradeable } from "../utils/types";
import {
  ContractData,
  useContractDetails,
} from "../../../context/contract-appState";
import { AvailableChains } from "../../../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../../../context/user-appState";
import { ERC20Options } from "@openzeppelin/wizard/dist/erc20";

export default function Erc20({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const [name, setName] = useState("Token");
  const [symbol, setSymbol] = useState("TKN");
  const [burnable, setBurnable] = useState(false);
  const [pausable, setPausable] = useState(false);
  const [premint, setPremint] = useState("");
  const [mintable, setMintable] = useState(false);
  const [permit, setPermit] = useState(false);
  const [votes, setVotes] = useState(false);
  const [flashmint, setFlashmint] = useState(false);
  const [access, setAccess] = useState("");
  const [upgradeable, setUpgradeable] = useState("false");
  const [securityContract, setSecurityContract] = useState("");
  const [license, setLicense] = useState(getLicences()[2].value);
  const [contract, setContract] = useState("");

  // const [deployModal, setDeployModal] = useState(false);
  // const [verifyModal, setVerifyModal] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [verified, setVerified] = useState(false);
  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");

  const { contractsData, updateContractDetails } = useContractDetails();
  const { userDetails } = useUserDetails();

  // const isDeployed = (deploy: boolean) => {
  //   setDeployed(deploy);
  //   setDeployModal(false);
  // };
  // const getDeployedArgs = (args: Array<any>) => {
  //   setDeployedArgs(args);
  // };
  // const getContractAddress = (contractAddress: string) => {
  //   setDeployedAddress(contractAddress);
  // };
  // const isVerified = (verify: boolean) => {
  //   setVerified(verify);
  // };

  useEffect(() => {
    const erc20Options: ERC20ContractParams = {
      name,
      symbol,
      premint,
      mintable,
      burnable,
      pausable,
      permit,
      votes,
      flashmint,
      access: access as access,
      upgradeable: (upgradeable === "false"
        ? false
        : upgradeable) as upgradeable,
      info: {
        securityContact: securityContract,
        license,
      },
    };
    const finalContract = erc20.print(erc20Options as ERC20Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, []);

  useEffect(() => {
    const erc20Options: ERC20ContractParams = {
      name,
      symbol,
      premint,
      mintable,
      burnable,
      pausable,
      permit,
      votes,
      flashmint,
      access: access as access,
      upgradeable: (upgradeable === "false"
        ? false
        : upgradeable) as upgradeable,
      info: {
        securityContact: securityContract,
        license,
      },
    };
    const finalContract = erc20.print(erc20Options as ERC20Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, [
    access,
    burnable,
    displayCode,
    flashmint,
    license,
    mintable,
    name,
    pausable,
    permit,
    premint,
    securityContract,
    symbol,
    upgradeable,
    votes,
  ]);

  // function checkContractParams() {
  //   if (!name || !symbol || !license) {
  //     console.error("Contract Name / Symbol / License cannot be empty");
  //     return;
  //   }

  //   if (Number.parseInt(premint) < 0) {
  //     console.error("Premint cannot be less than 0");
  //     return;
  //   }

  //   const erc20Options: ERC20ContractParams = {
  //     name,
  //     symbol,
  //     premint,
  //     mintable,
  //     burnable,
  //     pausable,
  //     permit,
  //     votes,
  //     flashmint,
  //     access: access as access,
  //     upgradeable: upgradeable as upgradeable,
  //     info: {
  //       securityContact: securityContract,
  //       license,
  //     },
  //   };

  //   const finalContract = erc20.print(erc20Options);
  //   setContract(finalContract);
  // }

  function saveDetails() {
    // Find the contract with the selected chain
    const selectedContract = contractsData.contracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if (selectedContract) {
      // Create an updated contract with only the changed fields
      const updatedContract: ContractData = {
        ...selectedContract,
        name,
        symbol: symbol !== "" ? symbol : selectedContract.symbol,
        // code: contract,
        arguments:
          deployedArgs.length > 0 ? deployedArgs : selectedContract.arguments,
      };

      // Update the contract details using the context
      updateContractDetails(updatedContract);
    } else {
      // Create an updated contract with only the changed fields
      const updatedContract: ContractData = {
        name,
        symbol: symbol !== "" ? symbol : "",
        // code: contract,
        arguments: deployedArgs.length > 0 ? deployedArgs : [],
        chain: selectedChain,
        gasPrice: "",
        type: userDetails.type,
      };

      // Update the contract details using the context
      updateContractDetails(updatedContract);
    }
  }

  // function handleDeployModalClose() {
  //   setDeployModal(false);
  // }

  // function handleVerifyModalClose() {
  //   setVerifyModal(false);
  // }

  return (
    <div>
      <div className=" h-[515px] overflow-auto contract-form-container">
        {/* <div className="">Contract Form</div> */}
        <div className="border-b ">
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
            <CheckboxInput
              id="pausable"
              label="Pausable"
              value={pausable}
              setValue={setPausable}
              labelClassName="text-subtext"
              className="accent-[#6B45CD]"
            />
            <CheckboxInput
              id="permit"
              label="Permit"
              value={permit}
              setValue={setPermit}
              labelClassName="text-subtext"
              className="accent-[#6B45CD]"
            />
            <CheckboxInput
              id="votes"
              label="Votes"
              value={votes}
              setValue={setVotes}
              labelClassName="text-subtext"
              className="accent-[#6B45CD]"
            />
            <CheckboxInput
              id="flashmint"
              label="Flash Minting"
              value={flashmint}
              setValue={setFlashmint}
              labelClassName="text-subtext"
              className="accent-[#6B45CD]"
            />
          </div>
        </div>
        <div className="py-6 border-b">
          <div className="flex flex-col gap-y-5">
            {/* <Text Type="16-Md"> Access control</Text> */}

            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              <RadioInput
                id="accesss"
                label="Access Control"
                value={access}
                setValue={setAccess}
                className="accent-[#6B45CD]"
                valueOptions={[
                  {
                    value: "ownable",
                    label: "Ownable",
                  },
                  {
                    value: "roles",
                    label: "Roles",
                  },
                  {
                    value: "managed",
                    label: "Managed",
                  },
                ]}
                labelClassName="text-subtext"
              />
            </div>
          </div>
        </div>
        <div className="py-6 border-b">
          <div className="flex flex-col gap-y-5">
            {/* <Text Type="16-Md">Upgradeability</Text> */}

            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              <RadioInput
                id="upgradeable"
                label="Upgradeability"
                value={upgradeable}
                setValue={setUpgradeable}
                valueOptions={[
                  {
                    value: "transparent",
                    label: "Transparent",
                  },
                  {
                    value: "uups",
                    label: "UUPS",
                  },
                ]}
                labelClassName="text-subtext"
              />
            </div>
          </div>
        </div>
        <div className="py-6 border-b">
          <div className="flex flex-col gap-y-5">
            {/* <Text Type="16-Md"> INFO</Text> */}
            {/* <TextInput
            id="securityContract"
            label="Security Contract"
            labelClassName="text-subtext"
            type={TextInputTypes.TEXT}
            value={securityContract}
            setValue={setSecurityContract}
            placeholder="security@example.com"
          /> */}
            <TextInput
              id="license"
              label="License"
              labelClassName="text-subtext"
              type={TextInputTypes.TEXT}
              value={license}
              setValue={setLicense}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6 ">
        <Button
          onClick={saveDetails}
          className="w-3/4"
          color={deployed && !verified ? "secondary" : "primary"}
        >
          Save
        </Button>
        {/*<Button*/}
        {/*  onClick={() => setDeployModal(true)}*/}
        {/*  className="min-w-[113px]"*/}
        {/*  color={deployed && !verified ? "secondary" : "primary"}*/}
        {/*>*/}
        {/*  Deploy*/}
        {/*</Button>*/}
        {/*<Button*/}
        {/*  onClick={() => setVerifyModal(true)}*/}
        {/*  className="min-w-[113px]"*/}
        {/*  color={deployed && !verified ? "primary" : "secondary"}*/}
        {/*>*/}
        {/*  Verify*/}
        {/*</Button>*/}
      </div>
      {/*{deployModal && (*/}
      {/*  <Overlay>*/}
      {/*    <DeployModal*/}
      {/*      deployed={isDeployed}*/}
      {/*      verified={isVerified}*/}
      {/*      getDeployedArgs={getDeployedArgs}*/}
      {/*      getContractAddress={getContractAddress}*/}
      {/*      onClose={handleDeployModalClose}*/}
      {/*      code={contract}*/}
      {/*      name={name}*/}
      {/*      // symbol={symbol}*/}
      {/*      contractType="ERC20"*/}
      {/*      chain="DOJ"*/}
      {/*      gasPrice="0.002 DOJ"*/}
      {/*    />*/}
      {/*  </Overlay>*/}
      {/*)}*/}
      {/*{verifyModal && deployed && (*/}
      {/*  <Overlay>*/}
      {/*    <VerifyContract*/}
      {/*      verified={isVerified}*/}
      {/*      deployed={isDeployed}*/}
      {/*      onClose={handleVerifyModalClose}*/}
      {/*      name={name}*/}
      {/*      contractType="ERC20"*/}
      {/*      contractAddress={deployedAddress}*/}
      {/*      chain="DOJ"*/}
      {/*      argValues={deployedArgs}*/}
      {/*    />*/}
      {/*  </Overlay>*/}
      {/*)}*/}
    </div>
  );
}
