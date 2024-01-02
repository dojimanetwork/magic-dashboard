import React from "react";
import {
  AvailableChains,
  templateType,
} from "../../excalidraw-app/dojima-templates/types";

export interface UserDetails {
  chains: Array<AvailableChains>;
  type: templateType;
}

export interface UserDetailsContextProps {
  userDetails: UserDetails;
  updateUserDetails: (updatedFields: Partial<UserDetails>) => void;
}

export const UserDetailsContext = React.createContext<UserDetailsContextProps>(
  null!,
);

// Custom hook to access the global state
export const useUserDetails = () => React.useContext(UserDetailsContext);

export const UserDetailsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userDetails, setUserDetails] = React.useState<UserDetails>({
    chains: ["dojima"],
    type: "erc20",
  });

  const updateUserDetails = (updatedFields: Partial<UserDetails>) => {
    setUserDetails((prevUserDetails) => ({
      ...prevUserDetails,
      ...updatedFields,
    }));
  };

  const contextValue: UserDetailsContextProps = {
    userDetails,
    updateUserDetails,
  };

  return (
    <UserDetailsContext.Provider value={contextValue}>
      {children}
    </UserDetailsContext.Provider>
  );
};
