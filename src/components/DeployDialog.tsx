import React, { useEffect, useState } from "react";
// import { t } from "../i18n";
import { Dialog } from "./Dialog";
import "./HelpDialog.scss";
import { usersIcon } from "./icons";
import { useContractDetails } from "../context/contract-appState";
import { AvailableChains } from "../../excalidraw-app/dojima-templates/types";
import { useUserDetails } from "../context/user-appState";

const Section = (props: { title: string; children: React.ReactNode }) => (
  <>
    <h3>{props.title}</h3>
    <div className="HelpDialog__islands-container">{props.children}</div>
  </>
);

export const DeployDialog = ({ onClose }: { onClose?: () => void }) => {
  const [tab, setTab] = useState(1);
  const handleClose = React.useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const { contractsData } = useContractDetails();
  const { userDetails } = useUserDetails();
  const [isDetailsComplete, setIsDetailsComplete] = useState(false);

  useEffect(() => {
    if (contractsData.contracts.length === 1) {
      setIsDetailsComplete(true);
    }
  }, []);

  const renderDetailsForChain = (chain: AvailableChains) => {
    const contract = contractsData.contracts.find((c) => c.chain === chain);
    if (!contract) {
      return null;
    }

    return (
      <>
        {Object.entries(contract).map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col gap-2 text-black cursor-not-allowed"
          >
            <div className="text-sm font-semibold capitalize">{key}:</div>
            <div className="text-base font-medium border rounded-lg p-3 border-[#dddddd] h-12">
              {value}
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <>
      <Dialog
        onCloseRequest={handleClose}
        title="Deploy"
        className={"HelpDialog max-w-[760px] mx-auto"}
      >
        <div className="HelpDialog__header">
          {userDetails.chains.map((item, i) => {
            const index = i + 1;
            return (
              <button
                className="p-3 flex items-center gap-x-3 border border-[#6B45CD] bg-[rgba(107,_69,_205,_0.14)] rounded-lg text-black capitalize"
                onClick={() => {
                  setTab(index);
                  setIsDetailsComplete(!isDetailsComplete);
                }}
                key={i}
              >
                {/*{t("helpDialog.documentation")}*/}
                <div className="w-6 h-6 grid place-items-center bg-[#CEC2FF] rounded-full p-1">
                  {usersIcon}
                </div>
                {item}
              </button>
            );
          })}
        </div>
        <Section title={"Details"}>
          {/*{*/}
          {/*  tab === 1 &&*/}
          {/*    <button*/}
          {/*        className="HelpDialog__btn"*/}
          {/*    >*/}
          {/*      /!*{t("helpDialog.blog")}*!/*/}
          {/*        {chains[tab - 1]}*/}
          {/*      <div className="HelpDialog__link-icon">{usersIcon}</div>*/}
          {/*    </button>*/}
          {/*}*/}
          {/*{*/}
          {/*    tab === 2 &&*/}
          {/*    <button*/}
          {/*        className="HelpDialog__btn"*/}
          {/*    >*/}
          {/*      /!*{t("helpDialog.blog")}*!/*/}
          {/*      {chains[tab - 1]}*/}
          {/*      <div className="HelpDialog__link-icon">{DiamondIcon}</div>*/}
          {/*    </button>*/}
          {/*}*/}
          {tab === 1 && renderDetailsForChain(userDetails.chains[tab - 1])}
          {tab === 2 && renderDetailsForChain(userDetails.chains[tab - 1])}
        </Section>
        <div className="flex mt-10 justify-between items-center">
          <button className="py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl">
            Cancel
          </button>
          <button className="py-4 text-lg/[22px] font-semibold px-4 min-w-[160px] border rounded-xl bg-[linear-gradient(270deg,_#A71CFF_-35.09%,_#8000FF_65.62%)] shadow-[0px_5px_20px_0px_rgba(0,_0,_0,_0.15)] text-white">
            Next
          </button>
          <button
            className="global-button hidden"
            onClick={() => {
              // Handle the click event for the global button
              if (isDetailsComplete) {
                // Perform the desired action when details are complete\
              } else {
                // Display a message or handle the case when details are not complete\
              }
            }}
            // disabled={!isDetailsComplete} // Disable the button if details are not complete
          >
            Deploy
          </button>
        </div>
      </Dialog>
    </>
  );
};
