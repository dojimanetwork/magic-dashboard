import clsx from "clsx";
// import { actionShortcuts } from "../../actions";
import { ActionManager } from "../../actions/manager";
import {
  ExitZenModeAction,
  FinalizeAction,
  UndoRedoActions,
  ZoomActions,
} from "../Actions";
import { useDevice } from "../App";
// import { useTunnels } from "../../context/tunnels";
// import { HelpButton } from "../HelpButton";
import { Section } from "../Section";
import Stack from "../Stack";
import { UIAppState } from "../../types";
import { DeployButton } from "../DeployButton";
import { actionDeploy } from "../../actions";
import { useContractDetails } from "../../context/contract-appState";
import { useUserDetails } from "../../context/user-appState";
/** Footer component with zoom in, out, deploy and help buttons */
const Footer = ({
  appState,
  actionManager,
  showExitZenModeBtn,
  renderWelcomeScreen,
}: {
  appState: UIAppState;
  actionManager: ActionManager;
  showExitZenModeBtn: boolean;
  renderWelcomeScreen: boolean;
}) => {
  // const { FooterCenterTunnel, WelcomeScreenHelpHintTunnel } = useTunnels();

  const device = useDevice();
  const showFinalize =
    !appState.viewModeEnabled && appState.multiElement && device.isTouchScreen;
  const { contractsData, solEvmTokenContractsData } = useContractDetails();
  const { userDetails } = useUserDetails();

  return (
    <footer
      role="contentinfo"
      className="layer-ui__wrapper__footer App-menu App-menu_bottom"
    >
      <div
        className={clsx("layer-ui__wrapper__footer-left zen-mode-transition", {
          "layer-ui__wrapper__footer-left--transition-left":
            appState.zenModeEnabled,
        })}
      >
        <Stack.Col gap={2}>
          <Section heading="canvasActions">
            <ZoomActions
              renderAction={actionManager.renderAction}
              zoom={appState.zoom}
            />

            {!appState.viewModeEnabled && (
              <UndoRedoActions
                renderAction={actionManager.renderAction}
                className={clsx("zen-mode-transition", {
                  "layer-ui__wrapper__footer-left--transition-bottom":
                    appState.zenModeEnabled,
                })}
              />
            )}
            {showFinalize && (
              <FinalizeAction
                renderAction={actionManager.renderAction}
                className={clsx("zen-mode-transition", {
                  "layer-ui__wrapper__footer-left--transition-left":
                    appState.zenModeEnabled,
                })}
              />
            )}
          </Section>
        </Stack.Col>
      </div>
      {/*<FooterCenterTunnel.Out />*/}
      <div
        className={clsx("layer-ui__wrapper__footer-right zen-mode-transition", {
          "transition-right": appState.zenModeEnabled,
        })}
      >
        <div style={{ position: "relative" }}>
          {userDetails.type === "solEvmTokenTemplate" ? (
            <DeployButton
              enable={solEvmTokenContractsData.solEvmTokenContracts.length > 0}
              onClick={() => actionManager.executeAction(actionDeploy)}
            />
          ) : (
            <DeployButton
              enable={contractsData.contracts.length > 0}
              onClick={() => actionManager.executeAction(actionDeploy)}
            />
          )}
        </div>
        {/*<div style={{ position: "relative" }}>*/}
        {/*  {renderWelcomeScreen && <WelcomeScreenHelpHintTunnel.Out />}*/}
        {/*  <HelpButton*/}
        {/*    onClick={() => actionManager.executeAction(actionShortcuts)}*/}
        {/*  />*/}
        {/*</div>*/}
      </div>
      <ExitZenModeAction
        actionManager={actionManager}
        showExitZenModeBtn={showExitZenModeBtn}
      />
    </footer>
  );
};

export default Footer;
Footer.displayName = "Footer";
