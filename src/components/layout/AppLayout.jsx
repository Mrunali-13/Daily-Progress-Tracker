import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';

const AppLayout = () => {
    const { user, logout, isManager, isAdmin } = useAuth();
    const navigate = useNavigate();

    const items = [];

    // Role-based navigation
    if (isAdmin()) {
        items.push({
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => navigate('/dashboard')
        });
        items.push({
            label: 'User Management',
            icon: 'pi pi-users',
            command: () => navigate('/admin')
        });
    } else if (isManager()) {
        items.push({
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => navigate('/dashboard')
        });
        items.push({
            label: 'My Team',
            icon: 'pi pi-users',
            command: () => navigate('/team')
        });
    } else {
        items.push({
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => navigate('/dashboard')
        });
        items.push({
            label: 'My Tasks',
            icon: 'pi pi-check-square',
            command: () => navigate('/tasks')
        });
    }


    const start = <div className="text-xl font-bold text-primary mr-4">Todo Tracker</div>;
    const end = (
        <div className="flex align-items-center gap-4">
            <div className="flex flex-column align-items-end">
                <span className="text-sm font-bold text-900">{user?.username}</span>
                <span className="text-xs text-secondary">{user?.role}</span>
            </div>
            <Button
                icon="pi pi-power-off"
                rounded
                text
                severity="danger"
                tooltip="Logout"
                tooltipOptions={{ position: 'bottom' }}
                onClick={() => {
                    logout();
                    navigate('/login');
                }}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-column">
            <Menubar model={items} start={start} end={end} className="border-none shadow-1 border-noround sticky top-0 z-5" />
            <main className="flex-1 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
