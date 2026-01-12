import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [userDialog, setUserDialog] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [user, setUser] = useState({ username: '', email: '', password: '', role: 'USER', managerId: null });
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);

    const roles = [
        { label: 'User', value: 'USER' },
        { label: 'Reporting Manager', value: 'REPORTING_MANAGER' },
        { label: 'Admin', value: 'ADMIN' }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.ADMIN.USERS);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users' });
        } finally {
            setLoading(false);
        }
    };

    const fetchManagersByRole = (role) => {
        let managerRole = '';
        if (role === 'USER') managerRole = 'REPORTING_MANAGER';
        else if (role === 'REPORTING_MANAGER') managerRole = 'ADMIN';

        if (!managerRole) {
            setManagers([]);
            return;
        }

        const filtered = users.filter(u => u.role === managerRole);
        setManagers(filtered.map(m => ({ label: m.username, value: m.id })));
    };

    const openNew = () => {
        setUser({ username: '', email: '', password: '', role: 'USER', managerId: null });
        fetchManagersByRole('USER');
        setSubmitted(false);
        setUserDialog(true);
    };

    const editUser = (userData) => {
        setUser({ ...userData, password: '' });
        fetchManagersByRole(userData.role);
        setUserDialog(true);
    };

    const confirmDeleteUser = (userData) => {
        setUser(userData);
        setDeleteUserDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const saveUser = async () => {
        setSubmitted(true);

        const username = user.username?.trim();
        const email = user.email?.trim();

        if (!username || !email) {
            toast.current.show({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Username and Email are required',
                life: 3000
            });
            return;
        }

        try {
            // Create a clean request object
            const userRequest = {
                username,
                email,
                role: user.role,
                managerId: user.managerId,
                password: user.password?.trim() || null
            };

            if (user.id) {
                await api.put(API_ENDPOINTS.ADMIN.USER_BY_ID(user.id), userRequest);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'User Updated', life: 3000 });
            } else {
                if (!userRequest.password) {
                    toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Password is required for new users', life: 3000 });
                    return;
                }
                await api.post(API_ENDPOINTS.ADMIN.USERS, userRequest);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'User Created', life: 3000 });
            }
            fetchUsers();
            setUserDialog(false);
        } catch (error) {
            console.error("Error saving user", error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Failed to save user',
                life: 5000
            });
        }
    };

    const deleteUser = async () => {
        try {
            await api.delete(API_ENDPOINTS.ADMIN.USER_BY_ID(user.id));
            setUsers(users.filter(val => val.id !== user.id));
            setDeleteUserDialog(false);
            setUser({ username: '', email: '', password: '', role: 'USER', managerId: null });
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'User Deleted', life: 3000 });
        } catch (error) {
            console.error("Error deleting user", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' });
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editUser(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUser(rowData)} />
            </React.Fragment>
        );
    };

    const userDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveUser} />
        </>
    );

    const deleteUserDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteUserDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteUser} />
        </>
    );

    return (
        <>
            <Toast ref={toast} />
            <div className="card">
                <div className="flex justify-content-between align-items-center mb-4">
                    <h2 className="m-0"><i className="pi pi-users text-primary mr-2"></i>User Management</h2>
                    <Button label="New User" icon="pi pi-plus" severity="success" onClick={openNew} />
                </div>

                <DataTable value={users} loading={loading} dataKey="id" paginator rows={10}
                    className="p-datatable-sm" responsiveLayout="stack" breakpoint="960px">
                    <Column field="id" header="ID" sortable style={{ minWidth: '4rem' }}></Column>
                    <Column field="username" header="Username" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="email" header="Email" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="role" header="Role" sortable body={(rowData) => (
                        <span className={`px-2 py-1 border-round text-xs font-bold uppercase ${rowData.role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                            rowData.role === 'REPORTING_MANAGER' ? 'bg-orange-100 text-orange-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                            {rowData.role}
                        </span>
                    )} style={{ minWidth: '10rem' }}></Column>
                    <Column field="managerName" header="Manager" style={{ minWidth: '10rem' }} body={(rowData) => rowData.managerName || <span className="text-secondary text-sm italic">No Manager</span>}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>

                <Dialog visible={userDialog} style={{ width: '32rem' }} header={user.id ? "Edit User" : "New User Details"} modal footer={userDialogFooter} onHide={hideDialog}>
                    <div className="flex flex-column gap-3 mt-2">
                        <div className="field m-0">
                            <label htmlFor="username" className="font-bold">Username</label>
                            <InputText id="username" value={user.username || ''} onChange={(e) => setUser({ ...user, username: e.target.value })} required autoFocus placeholder="Enter username" className="w-full" />
                        </div>
                        <div className="field m-0">
                            <label htmlFor="email" className="font-bold">Email</label>
                            <InputText id="email" value={user.email || ''} onChange={(e) => setUser({ ...user, email: e.target.value })} required placeholder="Enter email" className="w-full" />
                        </div>
                        <div className="field m-0">
                            <label htmlFor="password" title="Password" className="font-bold">Password {user.id && "(leave blank to keep current)"}</label>
                            <InputText id="password" type="password" value={user.password || ''} onChange={(e) => setUser({ ...user, password: e.target.value })} placeholder="Enter password" className="w-full" />
                        </div>
                        <div className="field m-0">
                            <label htmlFor="role" className="font-bold">Role</label>
                            <Dropdown id="role" value={user.role} options={roles} onChange={(e) => {
                                setUser({ ...user, role: e.value, managerId: null });
                                fetchManagersByRole(e.value);
                            }} placeholder="Select Role" className="w-full" />
                        </div>
                        {user.role !== 'ADMIN' && (
                            <div className="field m-0">
                                <label htmlFor="manager" className="font-bold">Reporting Manager</label>
                                <Dropdown id="manager" value={user.managerId} options={managers} onChange={(e) => setUser({ ...user, managerId: e.value })} placeholder="Select Manager" className="w-full" />
                            </div>
                        )}
                    </div>
                </Dialog>

                <Dialog visible={deleteUserDialog} style={{ width: '25rem' }} header="Confirm" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                    <div className="confirmation-content flex align-items-center">
                        <i className="pi pi-exclamation-triangle mr-3 text-red-500" style={{ fontSize: '2rem' }} />
                        {user && (
                            <span>Are you sure you want to delete <b>{user.username}</b>?</span>
                        )}
                    </div>
                </Dialog>
            </div>
        </>
    );
};

export default UserManagement;
