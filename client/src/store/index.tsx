import { createContext, useContext, useState } from "react";

interface IAppContext {
    showLoading: (state: boolean) => void;
    isLoading: boolean;
}

export const UserContext = createContext<IAppContext>({} as IAppContext);

export function AppWrapper({ children }: { children: React.ReactNode }) {
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
        throw new Error(
            "UserContext has to be used within <CurrentUserContext.Provider>"
        );
    }

    return context;
}