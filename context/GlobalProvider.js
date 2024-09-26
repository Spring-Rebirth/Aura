import { createContext, useContext, useState, useEffect } from 'react';
// cSpell:word appwrite
import { getCurrentUser } from '../lib/appwrite';

const GlobalContext = createContext();

const useGlobalContext = () => {
    return useContext(GlobalContext);
}

function GlobalProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentUser()
            .then((res) => {
                if (res) {
                    setIsLoggedIn(true);
                    setUser(res);
                    console.log('User is logged in');
                } else {
                    setIsLoading(false);
                    setUser(null);
                    console.log('User is not logged in');
                }
            })
            .catch((error) => {
                console.log("Error in fetching user:", error);
                setIsLoggedIn(false);
                setUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            })
    }, []);

    return (
        <GlobalContext.Provider value={{
            user,
            setUser,
            isLoggedIn,
            setIsLoggedIn,
            isLoading,
        }}>
            {children}
        </GlobalContext.Provider>
    );
}

export { useGlobalContext, GlobalProvider };
