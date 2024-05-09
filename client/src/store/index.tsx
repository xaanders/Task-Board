import React, { useContext, useState } from "react";
import { Props } from "../types/types";

interface IAppContext {
    showLoading: (state: boolean) => void;
    isLoading: boolean
}

export const UserContext = React.createContext<IAppContext>({} as IAppContext);

export function AppWrapper({ children }: Props) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const showLoading = (state: boolean) => {
        setIsLoading(state);
    }

    const ctx: IAppContext = {
        showLoading,
        isLoading
    }

    return (
        <UserContext.Provider value={ctx}>
            {children}
        </UserContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useAppContext must be used within a AppWrapper");
    }
    return context;
}