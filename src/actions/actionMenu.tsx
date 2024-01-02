import { HamburgerMenuIcon, palette } from "../components/icons";
import { ToolButton } from "../components/ToolButton";
import { t } from "../i18n";
import { showSelectedShapeActions, getNonDeletedElements } from "../element";
import { register } from "./register";
import { KEYS } from "../keys";

export const actionToggleCanvasMenu = register({
  name: "toggleCanvasMenu",
  trackEvent: { category: "menu" },
  perform: (_, appState) => ({
    appState: {
      ...appState,
      openMenu: appState.openMenu === "canvas" ? null : "canvas",
    },
    commitToHistory: false,
  }),
  PanelComponent: ({ appState, updateData }) => (
    <ToolButton
      type="button"
      icon={HamburgerMenuIcon}
      aria-label={t("buttons.menu")}
      onClick={updateData}
      selected={appState.openMenu === "canvas"}
    />
  ),
});

export const actionToggleEditMenu = register({
  name: "toggleEditMenu",
  trackEvent: { category: "menu" },
  perform: (_elements, appState) => ({
    appState: {
      ...appState,
      openMenu: appState.openMenu === "shape" ? null : "shape",
    },
    commitToHistory: false,
  }),
  PanelComponent: ({ elements, appState, updateData }) => (
    <ToolButton
      visible={showSelectedShapeActions(
        appState,
        getNonDeletedElements(elements),
      )}
      type="button"
      icon={palette}
      aria-label={t("buttons.edit")}
      onClick={updateData}
      selected={appState.openMenu === "shape"}
    />
  ),
});

/** action to Display HelpDialog when clicked on help-button */

export const actionShortcuts = register({
  name: "toggleShortcuts",
  viewMode: true,
  trackEvent: { category: "menu", action: "toggleHelpDialog" },
  perform: (_elements, appState, _, { focusContainer }) => {
    if (appState.openDialog === "help") {
      focusContainer();
    }
    return {
      appState: {
        ...appState,
        openDialog: appState.openDialog === "help" ? null : "help",
      },
      commitToHistory: false,
    };
  },
  keyTest: (event) => event.key === KEYS.QUESTION_MARK,
});

/** action to Display DeployDialog when clicked on deploy-button */
export const actionDeploy = register({
  name: "toggleDeploy",
  viewMode: true,
  trackEvent: { category: "menu", action: "toggleDeployDialog" },
  perform: (_elements, appState, _, { focusContainer }) => {
    if (appState.openDialog === "deploy") {
      focusContainer();
    }
    return {
      appState: {
        ...appState,
        openDialog: appState.openDialog === "deploy" ? null : "deploy",
      },
      commitToHistory: false,
    };
  },
  keyTest: (event) => event.key === KEYS.QUESTION_MARK,
});
