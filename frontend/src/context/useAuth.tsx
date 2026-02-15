import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Returns the current user, token, isLoading, signIn, signOut and register from the AuthContext.
 * Throws an error if useAuth is used outside of an AuthProvider.
 * @returns {Object} An object containing the current user, token, isLoading, signIn, signOut and register.
 * @throws {Error} If useAuth is used outside of an AuthProvider.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;

}