"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useUserDetails } from "./user-appState";

export type ProjectChainsDeploymentData = {
  chain: string;
  contractAddress: string;
  contractAbi: string;
  contractByteCode: string;
};

export type ProjectDataObject = {
  projectName: string;
  email: string;
  ownerUrl: string;
  description: string;
  type: string;
  chains: string[];
  projectData: string;
  status?: boolean;
  deploymentData?: ProjectChainsDeploymentData[];
  dateCreated?: Date;
  lastUpdated?: Date;
};

interface ProjectContextProps {
  projectData: ProjectDataObject;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectDataObject>>;
  refreshProjectData: () => void;
}

const ProjectDataContext = createContext<ProjectContextProps | undefined>(
  undefined,
);

export const ProjectDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projectData, setProjectData] = useState<ProjectDataObject>();
  const { userDetails } = useUserDetails();

  useEffect(() => {
    if (userDetails.projectName) {
      // Call getProjectData only if userDetails.projectName data is available
      getProjectData();
    }
  }, [userDetails.projectName]);

  function getProjectData() {
    axios
      .get(
        `${
          import.meta.env.VITE_APP_FAAS_TESTNET_URL
        }/v1/dev/dash/projects/project`,
        {
          params: {
            email: userDetails.email,
            projectName: userDetails.projectName,
          },
        },
      )
      .then((response) => {
        if (response.status === 200) {
          setProjectData(response.data);
        }
      })
      .catch((error: any) => {
        console.error("Error fetching projects:", error);
      });
  }

  const refreshProjectData = () => {
    getProjectData();
  };

  const contextValue: ProjectContextProps = {
    projectData: projectData as ProjectDataObject,
    setProjectData: setProjectData as React.Dispatch<
      React.SetStateAction<ProjectDataObject>
    >,
    refreshProjectData,
  };

  return (
    <ProjectDataContext.Provider value={contextValue}>
      {children}
    </ProjectDataContext.Provider>
  );
};

export const useProjectData = () => {
  const context = useContext(ProjectDataContext);
  if (!context) {
    throw new Error("useProjectData must be used within a ProjectDataProvider");
  }
  return context;
};
