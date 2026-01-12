import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

import { Tag } from 'primereact/tag';

const TeamView = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberTasks, setMemberTasks] = useState([]);
    const [expandedRows, setExpandedRows] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.TEAM.USERS);
            setTeamMembers(response.data);
        } catch (error) {
            console.error("Error fetching team", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch team members' });
        } finally {
            setLoading(false);
        }
    };

    const fetchMemberTasks = async (userId) => {
        try {
            const response = await api.get(API_ENDPOINTS.TEAM.USER_TASKS(userId));
            setMemberTasks(response.data);
        } catch (error) {
            console.error("Error fetching member tasks", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch tasks' });
        }
    };

    const approveTask = async (taskId) => {
        try {
            await api.post(API_ENDPOINTS.TEAM.APPROVE_TASK(taskId));
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Task Approved', life: 3000 });
            if (selectedMember) fetchMemberTasks(selectedMember.id);
        } catch (error) {
            console.error("Error approving task", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to approve task' });
        }
    };

    const getStatusSeverity = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'info';
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'help';
            default: return null;
        }
    };

    const onMemberSelect = (e) => {
        setSelectedMember(e.value);
        if (e.value) {
            fetchMemberTasks(e.value.id);
        }
    };

    const rowExpansionTemplate = (data) => {
        const hasAttachments = data.attachments && Array.isArray(data.attachments) && data.attachments.length > 0;

        return (
            <div className="p-4 surface-50 border-round shadow-1 mx-3 mb-3">
                <div className="flex justify-content-between align-items-start mb-4">
                    <div className="flex-1">
                        <h5 className="font-bold mb-2 flex align-items-center">
                            <i className="pi pi-align-left mr-2 text-primary"></i>Description
                        </h5>
                        <p className="m-0 text-700 line-height-3" style={{ whiteSpace: 'pre-wrap' }}>
                            {data.description || <span className="italic text-400 text-sm">No description provided</span>}
                        </p>
                    </div>
                    {data.status === 'COMPLETED' && (
                        <Button
                            label="Approve Task"
                            icon="pi pi-check-circle"
                            severity="success"
                            onClick={() => approveTask(data.id)}
                            className="ml-4"
                        />
                    )}
                </div>

                {hasAttachments ? (
                    <div className="mt-4 pt-3 border-top-1 border-200">
                        <h5 className="font-bold mb-3 flex align-items-center">
                            <i className="pi pi-paperclip mr-2 text-primary"></i>Attachments ({data.attachments.length})
                        </h5>
                        <div className="flex flex-wrap gap-3">
                            {data.attachments.map((file, index) => (
                                <div key={index} className="flex align-items-center p-2 border-1 border-200 border-round hover:surface-100 transition-duration-150" style={{ minWidth: '220px' }}>
                                    <i className={`pi ${file.fileType?.includes('image') ? 'pi-image' : 'pi-file'} text-xl text-primary mr-3`}></i>
                                    <div className="flex-1 overflow-hidden mr-3">
                                        <div className="text-sm font-bold truncate" title={file.fileName}>{file.fileName}</div>
                                        <div className="text-xs text-secondary">{(file.fileSize / 1024).toFixed(1)} KB</div>
                                    </div>
                                    <Button
                                        icon="pi pi-external-link"
                                        rounded
                                        text
                                        onClick={() => window.open(file.filePath, '_blank')}
                                        tooltip="View/Download"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 pt-3 border-top-1 border-200 text-500 text-sm italic">
                        <i className="pi pi-info-circle mr-2"></i>No attachments for this task.
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid gap-4 md:gap-0">
            <Toast ref={toast} />

            <div className="col-12 md:col-4">
                <Card title={<><i className="pi pi-users mr-2 text-primary"></i>Team Members</>} className="h-full shadow-2 overflow-hidden">
                    <DataTable
                        value={teamMembers}
                        loading={loading}
                        selectionMode="single"
                        selection={selectedMember}
                        onSelectionChange={onMemberSelect}
                        dataKey="id"
                        className="p-datatable-sm"
                    >
                        <Column field="username" header="Name" sortable></Column>
                        <Column field="role" header="Role" body={(rowData) => (
                            <span className="text-xs text-secondary italic">{rowData.role}</span>
                        )}></Column>
                    </DataTable>
                </Card>
            </div>

            <div className="col-12 md:col-8">
                <Card
                    title={
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-list mr-2 text-primary"></i>
                            <span>{selectedMember ? `${selectedMember.username}'s Tasks` : 'Member Tasks'}</span>
                        </div>
                    }
                    className="h-full shadow-2 overflow-hidden"
                >
                    {selectedMember ? (
                        <DataTable
                            value={memberTasks}
                            dataKey="id"
                            className="p-datatable-sm"
                            paginator
                            rows={10}
                            expandedRows={expandedRows}
                            onRowToggle={(e) => setExpandedRows(e.data)}
                            rowExpansionTemplate={rowExpansionTemplate}
                        >
                            <Column expander style={{ width: '3rem' }} />
                            <Column field="title" header="Task" style={{ minWidth: '12rem' }} sortable></Column>
                            <Column field="status" header="Status" body={(rowData) => (
                                <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />
                            )} sortable></Column>
                            <Column field="priority" header="Priority" sortable></Column>
                            <Column field="dueDate" header="Due Date" body={(rowData) => rowData.dueDate ? new Date(rowData.dueDate).toLocaleDateString() : '-'} sortable></Column>
                        </DataTable>
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center py-6 text-500">
                            <i className="pi pi-users mb-3" style={{ fontSize: '3rem', opacity: 0.2 }}></i>
                            <p>Select a team member to view their tasks</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default TeamView;
