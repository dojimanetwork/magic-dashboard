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
  ContractDetailsData,
  useContractDetails,
} from "../../../context/contract-appState";
import { AvailableChains } from "../../../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../../../context/user-appState";
import { ERC20Options } from "@openzeppelin/wizard/dist/erc20";
import {
  Erc20TemplateSaveContractDetailsData,
  useTemplateContractDetails,
} from "../../../context/template-contract-appState";

export default function Dex({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const { contractsData, updateContractDetails } = useContractDetails();
  const { erc20TemplateContractDetails, updateErc20TemplateContractDetail } =
    useTemplateContractDetails();
  const { userDetails } = useUserDetails();
  const [isSaving, setIsSaving] = useState(false);

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
  const [burnable, setBurnable] = useState(
    selectedContractDetails?.burnable === false
      ? false
      : (selectedContractDetails?.burnable as boolean),
  );
  const [pausable, setPausable] = useState(
    selectedContractDetails?.pausable === false
      ? false
      : (selectedContractDetails?.pausable as boolean),
  );
  const [premint, setPremint] = useState(
    selectedContractDetails?.premint === ""
      ? ""
      : (selectedContractDetails?.premint as string),
  );
  const [mintable, setMintable] = useState(
    selectedContractDetails?.mintable === false
      ? false
      : (selectedContractDetails?.mintable as boolean),
  );
  const [permit, setPermit] = useState(
    selectedContractDetails?.permit === false
      ? false
      : (selectedContractDetails?.permit as boolean),
  );
  const [votes, setVotes] = useState(
    selectedContractDetails?.votes === false
      ? false
      : (selectedContractDetails?.votes as boolean),
  );
  const [flashmint, setFlashmint] = useState(
    selectedContractDetails?.flashmint === false
      ? false
      : (selectedContractDetails?.flashmint as boolean),
  );
  const [access, setAccess] = useState(
    selectedContractDetails?.access === ""
      ? ""
      : (selectedContractDetails?.access as string),
  );
  const [upgradeable, setUpgradeable] = useState(
    selectedContractDetails?.upgradeable === ""
      ? "false"
      : (selectedContractDetails?.upgradeable as string),
  );
  const [securityContract, setSecurityContract] = useState(
    selectedContractDetails?.info?.securityContract === ""
      ? ""
      : (selectedContractDetails?.info?.securityContract as string),
  );
  const [license, setLicense] = useState(getLicences()[2].value);
  const [contract, setContract] = useState("");

  // const [deployModal, setDeployModal] = useState(false);
  // const [verifyModal, setVerifyModal] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [verified, setVerified] = useState(false);
  const [deployedArgs, setDeployedArgs] = useState<Array<any>>([]);
  // const [deployedAddress, setDeployedAddress] = useState<string>("");

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
        securityContract,
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
        securityContract,
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
  //       securityContract: securityContract,
  //       license,
  //     },
  //   };

  //   const finalContract = erc20.print(erc20Options);
  //   setContract(finalContract);
  // }

  function saveDetails() {
    setIsSaving(true);
    // Find the contract with the selected chain
    const selectedContract = contractsData.contracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if (selectedContract) {
      // Create an updated contract with only the changed fields
      const updatedContract: ContractDetailsData = {
        ...selectedContract,
        name,
        symbol: symbol !== "" ? symbol : selectedContract.symbol,
        code: contract,
        arguments:
          deployedArgs.length > 0 ? deployedArgs : selectedContract.arguments,
      };

      // Update the contract details using the context
      updateContractDetails(updatedContract);
    } else {
      // Create an updated contract with only the changed fields
      const updatedContract: ContractDetailsData = {
        name,
        symbol: symbol !== "" ? symbol : "",
        code: contract,
        arguments: deployedArgs.length > 0 ? deployedArgs : [],
        chain: selectedChain,
        gasPrice: "",
        type: userDetails.type,
      };

      // Update the contract details using the context
      updateContractDetails(updatedContract);
    }

    // Find the templateContract with the selected chain
    const selectedTemplateContract = erc20TemplateContractDetails.contracts.find(
      (contract) => contract.chain === selectedChain,
    );

    if (selectedTemplateContract) {
      // Create an updated contract with only the changed fields
      const updatedTemplateContract: Erc20TemplateSaveContractDetailsData = {
        ...selectedTemplateContract,
        name,
        symbol,
        premint,
        mintable,
        burnable,
        pausable,
        permit,
        votes,
        flashmint,
        access,
        upgradeable,
        info: {
          securityContract,
          license,
        },
      };

      // Update the contract details using the context
      updateErc20TemplateContractDetail(selectedChain, updatedTemplateContract);
    }
    setIsSaving(false);
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
          className={`w-3/4 ${isSaving && "cursor-not-allowed"}`}
          color={deployed && !verified ? "secondary" : "primary"}
        >
          {isSaving ? "Saving..." : "Save"}
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
