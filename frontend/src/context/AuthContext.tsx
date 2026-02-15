
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
    id: number,
    email: string,
    role: "admin" | "user"
}
interface AuthContextProps {
    token: string | null;
    isLoading: boolean;
    user: User | null;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
    register: (email: string, password: string) => Promise<any>;
    fetchUser: () => Promise<any>;
}

export const AuthContext = createContext<AuthContextProps>({
    signIn: async () => { },
    signOut: async () => { },
    register: async () => { },
    fetchUser: async () => { },
    token: null,
    isLoading: false,
    user: null
});

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User|null>(null);
    const [token, setToken] = useState<string | null>(() => {return sessionStorage.getItem("token") || null;});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    let navigate = useNavigate();

    useEffect(() => {
        if(!user){
            fetchUser();
        }
    }, [])
    

    /**
     * Logs in a user with the given email and password.
     * If either email or password is empty, returns an object with success set to false and a message indicating that both email and password are required.
     * If the login request is not successful, returns an object with success set to false and a message indicating that the login failed.
     * If the login request is successful, sets the token in state and in local storage, fetches the user data, and navigates to the dashboard page. Returns an object with success set to true, a message indicating that the login was successful, and the user data.
     * @param {string} email - The email of the user to log in.
     * @param {string} password - The password of the user to log in.
     * @returns {Promise<{success: boolean, message: string, data?: any}>} - A promise that resolves with an object indicating the success of the login request and the user data if successful.
     */    
    const signIn = async (email: string, password: string) => {
        if(!email || !password) return { success: false, message: 'Please enter email and password' }

        try{
            const response = await fetch(import.meta.env.VITE_API_URL + '/auth/login', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if(!response.ok){
                return { success: false, message: 'Failed to login' }
            }

            const data = await response.json();
            setToken(data.access_token);
            sessionStorage.setItem('token', data.access_token);
            
            const fetchedUser = await fetchUser();
            console.log("fetchUser", fetchedUser);
            navigate('/dashboard');
            return { success: true, message: 'Logged in successfully', data };
        }catch(err){
            return { success: false, message: 'Failed to login: ' + err }
        }
    }

    
    /**
     * Logs out the current user and navigates to the login page.
     * It also removes the token from local storage.
     * @returns {Promise<void>} - A promise that resolves when the logout is complete.
     */
    const signOut = async () => {
        navigate('/login');
        setUser(null);
        sessionStorage.removeItem('token');
    }

    
    /**
     * Registers a new user with the given email and password.
     * If the API call fails, it returns an object with success set to false and a message with the error.
     * If the API call is successful, it returns an object with success set to true and a message with a success message.
     * @param {string} email The email of the user to register.
     * @param {string} password The password of the user to register.
     * @returns {Promise<{success: boolean, message: string, data: any}>} A promise that resolves with an object containing a success message and the data from the API call.
     */
    const register = async (email: string, password: string) => {
        if(!email || !password) return { success: false, email: 'Please enter email', password: 'Please enter password' }

        if(!email.includes('@') || !email.includes('.')){
            return { success: false, email: 'Please enter a valid email' }
        }

        if(password.length < 8){
            return { success: false, password: 'Password must be at least 8 characters' }
        }
        const response = await fetch(import.meta.env.VITE_API_URL + '/auth/register',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        if(!response.ok) {
            return { success: false, message: 'Failed to register' }
        }

        const data = await response.json();
        
        if(!data.success){
            return { success: false, email: data.message }
        }
        
        return { success: true, message: 'Registered successfully' };
        
    }

    /**
     * Fetches the current user from the API.
     * If the API call fails, it returns nothing.
     * If the API call is successful, it sets the user state with the fetched data and returns an object with success set to true, a message with a success message, and the fetched data.
     * @returns {Promise<{success: boolean, message: string, data: any}>} A promise that resolves with an object containing a success message and the data from the API call.
     */
    const fetchUser = async () => {
        if(!token) return;
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/users/current-user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok) return;
        const data = await response.json();
        setUser(data);

        return { success: true, message: 'Fetched user successfully', data };
    }

    return (
        <AuthContext.Provider value={{
            signIn,
            signOut,
            register,
            fetchUser,
            user,
            token,
            isLoading,
        }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider