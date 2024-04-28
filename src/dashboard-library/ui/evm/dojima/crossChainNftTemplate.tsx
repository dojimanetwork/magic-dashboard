import React, { useState, useEffect } from "react";
import { AvailableChains } from "../../../../../excalidraw-app/dojima-templates/types";
import Button from "../../common/Button";
import DojimaOmnichainNftTemplateView from "./templates/nft/OmnichainNft";
import DojimaXNftTemplateView from "./templates/nft/XNft";

interface TabViewProps {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
  tabs: { title: string; content: React.ReactNode }[];
  currentTabIndex: number;
  setCurrentTabIndex: React.Dispatch<React.SetStateAction<number>>;
}

const TabView: React.FC<TabViewProps> = ({
  displayCode,
  selectedChain,
  tabs,
  currentTabIndex,
  setCurrentTabIndex,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Call saveDetails function here
    // ...
    setIsSaving(false);
  };

  const handleNext = () => {
    setCurrentTabIndex((currentTabIndex + 1) % tabs.length);
    handleSave(); // Call saveDetails before moving to next tab
  };

  const handleBack = () => {
    setCurrentTabIndex((currentTabIndex - 1 + tabs.length) % tabs.length);
  };

  const handleClose = () => {
    // Implement close functionality here
    // ...
  };

  return (
    <div>
      {/* ... Tab headers implementation here ... */}

      <div className="tab-content">
        {tabs[currentTabIndex].content}
      </div>

      <div className="flex justify-center mt-6">
        {currentTabIndex === 0 ? (
          <Button onClick={handleClose} className="w-3/4" color="secondary">
            Close
          </Button>
        ) : (
          <Button onClick={handleBack} className="w-1/4">Back</Button>
        )}
        {currentTabIndex === tabs.length - 1 ? (
          <Button
            onClick={handleSave}
            className={`w-3/4 ${isSaving && "cursor-not-allowed"}`}
            color="primary"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-3/4" color="primary">
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

// ... existing DojimaErc20TemplateView component

export default function DojimaNftTemplateComponent({
  displayCode,
  selectedChain,
}: {
  displayCode: (code: string) => void;
  selectedChain: AvailableChains;
}) {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const tabs = [
    {
      title: "XNft",
      content: (
        <DojimaXNftTemplateView
          displayCode={displayCode}
          selectedChain={selectedChain}
        />
      ),
    },
    {
      title: "OmniChainNft",
      content: (
        <DojimaOmnichainNftTemplateView
          displayCode={displayCode}
          selectedChain={selectedChain}
        />
      ),
    },
    // ... more tabs
  ];

  return <TabView displayCode={displayCode} selectedChain={selectedChain} tabs={tabs} currentTabIndex={currentTabIndex} setCurrentTabIndex={setCurrentTabIndex} />;
}
