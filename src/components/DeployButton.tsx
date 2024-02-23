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
        ? "linear-gradient(270deg,_#A71CFF_-35.09%,_#8000FF_65.62%)"
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
