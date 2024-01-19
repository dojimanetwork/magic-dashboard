import { useEffect, useState } from "react";
import { erc721 } from "@openzeppelin/wizard";
import getLicences from "../utils/getLicenses";
import { ERC721ContractParams, access, upgradeable } from "../utils/types";
import TextInput, { TextInputTypes } from "../common/TextInput";
import CheckboxInput from "../common/CheckboxInput";
import RadioInput from "../common/RadioInput";
import Button from "../common/Button";
import {
  ContractData,
  useContractDetails,
} from "../../../context/contract-appState";
import { Text } from "../common/Typography";
import { AvailableChains } from "../../../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../../../context/user-appState";
// import DeployModal from "../deploy/page";
// import VerifyContract from "../verifycontract/page";

export default function Erc721({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const [name, setName] = useState("Token");
  const [symbol, setSymbol] = useState("TKN");
  const [burnable, setBurnable] = useState(false);
  const [incremental, setIncremental] = useState(false);
  const [pausable, setPausable] = useState(false);
  const [baseUri, setBaseUri] = useState("");
  const [mintable, setMintable] = useState(false);
  const [votes, setVotes] = useState(false);
  const [enumerable, setEnumerable] = useState(false);
  const [uriStorage, setUriStorage] = useState(false);
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
  // const isVerified = (verify: boolean) => {
  //   setVerified(verify);
  // };
  // const getContractAddress = (contractAddress: string) => {
  //   setDeployedAddress(contractAddress);
  // };

  useEffect(() => {
    const erc721Options: ERC721ContractParams = {
      name,
      symbol,
      baseUri,
      mintable,
      burnable,
      pausable,
      incremental,
      votes,
      uriStorage,
      access: access as access,
      upgradeable: (upgradeable === "false"
        ? false
        : upgradeable) as upgradeable,
      info: {
        securityContact: securityContract,
        license,
      },
    };
    const finalContract = erc721.print(erc721Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, []);

  useEffect(() => {
    const erc721Options: ERC721ContractParams = {
      name,
      symbol,
      baseUri,
      mintable,
      burnable,
      pausable,
      incremental,
      votes,
      uriStorage,
      access: access as access,
      upgradeable: (upgradeable === "false"
        ? false
        : upgradeable) as upgradeable,
      info: {
        securityContact: securityContract,
        license,
      },
    };
    const finalContract = erc721.print(erc721Options);
    setContract(finalContract);
    displayCode(finalContract);
  }, [
    access,
    incremental,
    baseUri,
    burnable,
    displayCode,
    license,
    mintable,
    name,
    pausable,
    securityContract,
    symbol,
    upgradeable,
    uriStorage,
    votes,
  ]);

  // function checkContractParams() {
  //   if (!name || !symbol || !license) {
  //     console.error("Contract Name / Symbol / License cannot be empty");
  //     return;
  //   }

  //   const erc721Options: ERC721ContractParams = {
  //     name,
  //     symbol,
  //     baseUri,
  //     mintable,
  //     burnable,
  //     pausable,
  //     incremental,
  //     votes,
  //     uriStorage,
  //     access: access as access,
  //     upgradeable: (upgradeable === "false"
  //       ? false
  //       : upgradeable) as upgradeable,
  //     info: {
  //       securityContact: securityContract,
  //       license,
  //     },
  //   };
  //   const finalContract = erc721.print(erc721Options);
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
    <div className="contract-form-container">
      <div className="contract-heading">Contract Form</div>
      <div className="py-6 border-b">
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
            label="Base URI"
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
          />
          <CheckboxInput
            id="incremental"
            label="Auto Increment IDs"
            value={incremental}
            setValue={setIncremental}
            labelClassName="text-subtext"
          />
          <CheckboxInput
            id="burnable"
            label="Burnable"
            value={burnable}
            setValue={setBurnable}
            labelClassName="text-subtext"
          />
          <CheckboxInput
            id="pausable"
            label="Pausable"
            value={pausable}
            setValue={setPausable}
            labelClassName="text-subtext"
          />
          <CheckboxInput
            id="votes"
            label="Votes"
            value={votes}
            setValue={setVotes}
            labelClassName="text-subtext"
          />
          <CheckboxInput
            id="enumerable"
            label="Enumerable"
            value={enumerable}
            setValue={setEnumerable}
            labelClassName="text-subtext"
          />
          <CheckboxInput
            id="uriStorage"
            label="URI Storage"
            value={uriStorage}
            setValue={setUriStorage}
            labelClassName="text-subtext"
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
      <div className="flex justify-between mt-[140px] ">
        <Button
          onClick={saveDetails}
          className="min-w-[113px]"
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
      {/*      contractType="ERC721"*/}
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
      {/*      contractType="ERC721"*/}
      {/*      contractAddress={deployedAddress}*/}
      {/*      chain="DOJ"*/}
      {/*      argValues={deployedArgs}*/}
      {/*    />*/}
      {/*  </Overlay>*/}
      {/*)}*/}
    </div>
  );
}
