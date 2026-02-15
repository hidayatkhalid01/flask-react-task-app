import React from 'react'
import { useAuth } from '../context/useAuth';
import { Navigate } from 'react-router-dom';

/**
 * A wrapper component that checks if the user is logged in or not.
 * If the user is not logged in, it will redirect the user to the login page.
 * If the user is logged in, it will render the children component.
 * If the user is loading, it will render a loading message.
 * @param {React.ReactNode} children The component to render if the user is logged in.
 * @returns {React.ReactElement} The component to render.
 */
function ProtectedRoute({
    children
}: {
    children: React.ReactNode
}) {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return <div><p>Loading...</p></div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute
