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
import { useUserDetails } from "../context/user-appState";
import SolEvmTokenContractView from "./ui/ContractViews/SolEvmToken";
import EvmSolDataTransferContractView from "./ui/ContractViews/EvmSolDataTransfer";

export default function ContractDialog({
  element,
  setAppState,
}: {
  element: NonDeletedExcalidrawElement;
  setAppState: React.Component<any, AppState>["setState"];
}) {
  const [, setIslandNode] = useCallbackRefState<HTMLDivElement>();
  const [chainSelected, setChainSelected] = useState<AvailableChains>(null!);
  const { userDetails } = useUserDetails();

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
      {userDetails.type === "solEvmTokenTemplate" ? (
        <SolEvmTokenContractView
          element={element}
          setAppState={setAppState}
          selectedElementChain={chainSelected}
        />
      ) : userDetails.type === "evmSolDataTransferTemplate" ? (
        <EvmSolDataTransferContractView
          element={element}
          setAppState={setAppState}
          selectedElementChain={chainSelected}
        />
      ) : (
        <ContractView
          element={element}
          setAppState={setAppState}
          selectedElementChain={chainSelected}
        />
      )}
    </Island>
  );
}
