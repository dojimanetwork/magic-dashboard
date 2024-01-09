import { t } from "../i18n";
import { ExportIcon } from "./icons";

type DeployButtonProps = {
  name?: string;
  id?: string;
  enable?: boolean;
  onClick?(): void;
};

export const DeployButton = (props: DeployButtonProps) => (
  <button
    className="deploy-icon"
    onClick={props.onClick}
    type="button"
    title={`${t("deployDialog.title")} — ?`}
    aria-label={t("deployDialog.title")}
    style={{
      background: props.enable
        ? "linear-gradient(270deg, #8B1EFD 1.11%, #48C2FD 27.94%)"
        : "#CCCCCC",
      color: "white",
      cursor: props.enable ? "pointer" : "not-allowed",
    }}
    disabled={!props.enable}
  >
    {ExportIcon}
    {t("deployDialog.title")}
  </button>
);
