import React, { createContext, useContext, useState, useCallback } from 'react';
import { IUser, IUserLogin, IUserTokenResponse } from '../types/interfaces';
import { getRefreshToken, signUserIn, signUserOut } from '../helpers/DataAccess';

interface AuthContextType {
    user: IUser | null;
    accessToken: string | null;
    signIn: (userData: IUserLogin, callback: VoidFunction) => void;
    signOut: (callback?: VoidFunction) => void;
    refreshToken: (callback?: VoidFunction) => void;
    isTokenFetched: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isTokenFetched, setIsTokenFetched] = useState<boolean>(false);
    const signIn = async (userData: IUserLogin, callback: VoidFunction) => {
        const res = await signUserIn(userData);

        if(!res)
            return;
        
        const {user, accessToken}: IUserTokenResponse = res;

        if(!accessToken || !user)
            return;

        setAccessToken(accessToken);
        setUser(user);
        callback();
    };

    const signOut = useCallback(async (callback?: VoidFunction) => {
        await signUserOut()
        setAccessToken(null)
        setUser(null);
        callback?.();

    }, []);

    const refreshToken = useCallback(async (callback?: VoidFunction) => {
        
        const res: IUserTokenResponse = await getRefreshToken();
        if(!res)
            return;

        const {user, accessToken, noUser, isSignOut} = res;
        
        setIsTokenFetched(true);

        if(noUser)
            return;

        if (isSignOut){
            signOut();
            return;
        }

        if(user && accessToken) {
            setAccessToken(accessToken)
            setUser(user);
            callback?.();
        }
        
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