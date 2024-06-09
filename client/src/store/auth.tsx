import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUserLogin, IUserTokenResponse } from '../types/interfaces';
import { apiCall, getRefreshToken, signUserIn } from '../helpers/DataAccess';

interface AuthContextType {
    user: any;
    accessToken: string | null;
    signIn: (userData: IUserLogin, callback: VoidFunction) => void;
    signOut: (callback?: VoidFunction) => void;
    refreshToken: (callback?: VoidFunction) => void;
    isTokenFetched: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isTokenFetched, setIsTokenFetched] = useState<boolean>(false);

    const signIn = async (userData: IUserLogin, callback: VoidFunction) => {
        const {name, email, accessToken}: IUserTokenResponse = await signUserIn(userData);

        setAccessToken(accessToken)
        setUser({name, email});
        callback();
    };

    const signOut = useCallback(async (callback?: VoidFunction) => {
        await apiCall({ method: 'POST', accessToken, parameters: { apiGate: 'signOut' } });
        setAccessToken(null)
        setUser(null);
        callback?.();

    }, [accessToken]);

    const refreshToken = useCallback(async (callback?: VoidFunction) => {
        
        const {name, email, accessToken, message, noUser}: IUserTokenResponse = await getRefreshToken();
        
        setIsTokenFetched(true);
        if(message && noUser)
            return;

        if (message && !noUser){
            signOut();
            return;
        }
        
        setAccessToken(accessToken)
        setUser({name, email});

        callback?.();
        
    }, [signOut])

    
    
    const value = { user, accessToken, signIn, signOut, refreshToken, isTokenFetched };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};