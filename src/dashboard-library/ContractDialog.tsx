import { Island } from "../components/Island";
// import { t } from "../i18n";
// import { CloseIcon } from "../components/icons";
import React, { useEffect, useState } from "react";
import { useCallbackRefState } from "../hooks/useCallbackRefState";
import { NonDeletedExcalidrawElement } from "../element/types";
import { AppState } from "../types";
import { extractMainElementFromId } from "./utils/getElementData";
import { AvailableChains } from "../../excalidraw-app/dojima-templates/types";
import ContractView from "./ui/ContractView";

export default function ContractDialog({
  element,
  setAppState,
}: {
  element: NonDeletedExcalidrawElement;
  setAppState: React.Component<any, AppState>["setState"];
}) {
  const [, setIslandNode] = useCallbackRefState<HTMLDivElement>();
  const [chainSelected, setChainSelected] = useState<AvailableChains>(null!);

  useEffect(() => {
    const elementSelected = extractMainElementFromId(element.id);
    const selectedElementChain = (
      elementSelected.includes("-")
        ? elementSelected.substring(0, elementSelected.indexOf("-"))
        : elementSelected
    ) as AvailableChains;
    setChainSelected(selectedElementChain);
  }, []);

  return (
    <Island ref={setIslandNode}>
      <ContractView
        element={element}
        setAppState={setAppState}
        selectedElementChain={chainSelected}
      />
    </Island>
  );
}
