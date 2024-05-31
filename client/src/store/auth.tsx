import React from "react";
import { sleep } from "../helpers/helpers";
import { apiCall } from "../helpers/DataAccess";
import { IUserLogin } from "../types/interfaces";
import { toast } from "react-toastify";

interface AuthContextType {
    user: any;
    signIn: (userData: IUserLogin, callback: VoidFunction) => void;
    signOut: (callback: VoidFunction) => void;
    checkToken: (callback: VoidFunction) => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    let [user, setUser] = React.useState<any>(null);


    console.log('user',user);

    let signIn = (userData: IUserLogin, callback: VoidFunction) => {
        return fakeAuthProvider.signIn(userData, async (data) => {
            setUser(data);
            callback();
        });
    };

    let checkToken = (callback: VoidFunction) => {
        return fakeAuthProvider.checkToken(async () => {
            setUser('s');
        });
    };

    let signOut = (callback: VoidFunction) => {
        return fakeAuthProvider.signOut(() => {
            setUser(null);
            callback();
        });
    };

    let value = { user, signIn, signOut, checkToken };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return React.useContext(AuthContext);
}

const fakeAuthProvider = {
    isAuthenticated: false,
    signIn: async function (userData: IUserLogin, callback: (data: any) => void) {
        // setTimeout(callback, 100); // fake async
        //TODO check the access token => 
        this.isAuthenticated = true;
        try {
            const res = await apiCall({method: 'POST', parameters: {...userData, apiGate: 'signin'}})
            if(res.message)
                throw new Error(res.message)       
            
            if(res)
                callback(res)
        } catch (error: any) {
            toast.error(error.message);
            callback(null)

        }

    },
    signOut: function (callback: VoidFunction) {
        this.isAuthenticated = false;
        //remove cookies
        callback()
        return null
    },

    checkToken: async function (callback: VoidFunction) {
        const user = await sleep(100);
        this.isAuthenticated = !!user;
        callback()
        return user
    },
};