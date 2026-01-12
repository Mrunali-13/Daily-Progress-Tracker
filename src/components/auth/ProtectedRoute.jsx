import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from 'primereact/button';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have the required role
        return (
            <div className="flex flex-column align-items-center justify-content-center min-h-screen p-4 surface-ground">
                <div className="surface-card p-6 shadow-4 border-round-3xl w-full md:w-30rem text-center transform hover-scale-transition">
                    <div className="text-red-500 mb-5">
                        <i className="pi pi-shield" style={{ fontSize: '5rem' }}></i>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 text-900">Access Denied</h1>
                    <p className="text-600 mb-6 line-height-3 text-lg">
                        Oops! It seems you don't have the necessary permissions to access this administrative area.
                    </p>
                    <div className="flex flex-column gap-3">
                        <Button
                            label="Go Back"
                            icon="pi pi-arrow-left"
                            onClick={() => window.history.back()}
                            className="p-button-outlined p-button-secondary py-3 font-bold border-round-xl"
                        />
                        <Button
                            label="Return to Dashboard"
                            icon="pi pi-home"
                            onClick={() => window.location.href = '/dashboard'}
                            className="p-button-primary py-3 font-bold border-round-xl"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;

