import React, { useState } from "react";
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

  const renderDetailsForChain = (chain: AvailableChains) => {
    const contract = contractsData.contracts.find((c) => c.chain === chain);
    if (!contract) {
      return null;
    }

    return (
      <>
        {Object.entries(contract).map(([key, value]) => (
          <div key={key} className="HelpDialog__details-row">
            <span className="HelpDialog__details-key">{key}:</span>
            <span className="HelpDialog__details-value">{value}</span>
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
        className={"HelpDialog"}
      >
        <div className="HelpDialog__header">
          {userDetails.chains.map((item, i) => {
            const index = i + 1;
            return (
              <button
                className="HelpDialog__btn"
                onClick={() => {
                  setTab(index);
                  setIsDetailsComplete(!isDetailsComplete);
                }}
                key={i}
              >
                {/*{t("helpDialog.documentation")}*/}
                {item}
                <div className="HelpDialog__link-icon">{usersIcon}</div>
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
        <div className="global-button-container">
          <button
            className="global-button"
            onClick={() => {
              // Handle the click event for the global button
              if (isDetailsComplete) {
                // Perform the desired action when details are complete\
              } else {
                // Display a message or handle the case when details are not complete\
              }
            }}
            disabled={!isDetailsComplete} // Disable the button if details are not complete
          >
            Global Button
          </button>
        </div>
      </Dialog>
    </>
  );
};
