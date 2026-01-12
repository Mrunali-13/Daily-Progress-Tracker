import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import TaskForm from './TaskForm';
import ProgressLog from '../progress/ProgressLog';
import FileUploader from '../file/FileUpload';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [taskDialog, setTaskDialog] = useState(false);
    const [task, setTask] = useState(null);

    // New Dialog states
    const [progressDialog, setProgressDialog] = useState(false);
    const [fileDialog, setFileDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [expandedRows, setExpandedRows] = useState(null);

    const [loading, setLoading] = useState(true);
    const toast = useRef(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.TASKS.BASE); // Adjust this endpoint if needed, usually just GET /tasks
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks", error);
            // toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch tasks', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setTask(null);
        setTaskDialog(true);
    };

    const hideDialog = () => {
        setTaskDialog(false);
    };

    const saveTask = async (taskDetails) => {
        try {
            let response;
            if (taskDetails.id) {
                // Update
                response = await api.put(API_ENDPOINTS.TASKS.BY_ID(taskDetails.id), taskDetails);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Task Updated', life: 3000 });
            } else {
                // Create
                response = await api.post(API_ENDPOINTS.TASKS.BASE, taskDetails);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Task Created', life: 3000 });
            }
            fetchTasks();
            setTaskDialog(false);
            return response?.data;
        } catch (error) {
            console.error("Error saving task", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save task', life: 3000 });
            throw error;
        }
    };

    const editTask = (task) => {
        setTask({ ...task });
        setTaskDialog(true);
    };

    const deleteTask = async (taskId) => {
        try {
            await api.delete(API_ENDPOINTS.TASKS.BY_ID(taskId));
            setTasks(tasks.filter(t => t.id !== taskId));
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Task Deleted', life: 3000 });
        } catch (error) {
            console.error("Error deleting task", error);
            // toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete task', life: 3000 });
        }
    };

    const openProgress = (task) => {
        setSelectedTask(task);
        setProgressDialog(true);
    };

    const openFiles = (task) => {
        setSelectedTask(task);
        setFileDialog(true);
    };

    const getStatusSeverity = (task) => {
        switch (task.status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'info';
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'help';
            default: return null;
        }
    };

    const getPrioritySeverity = (task) => {
        switch (task.priority) {
            case 'HIGH': return 'danger';
            case 'MEDIUM': return 'warning';
            case 'LOW': return 'info';
            default: return null;
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editTask(rowData)} tooltip="Edit" />
                <Button icon="pi pi-compass" rounded outlined severity="help" className="mr-2" onClick={() => openProgress(rowData)} tooltip="Progress" />
                <Button icon="pi pi-paperclip" rounded outlined severity="info" className="mr-2" onClick={() => openFiles(rowData)} tooltip="Files" />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => deleteTask(rowData.id)} tooltip="Delete" />
            </React.Fragment>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.status} severity={getStatusSeverity(rowData)}></Tag>;
    };

    const priorityBodyTemplate = (rowData) => {
        return <Tag value={rowData.priority} severity={getPrioritySeverity(rowData)}></Tag>;
    };

    const dateBodyTemplate = (rowData) => {
        return rowData.dueDate ? new Date(rowData.dueDate).toLocaleString() : '-';
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New Task" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="card">
                <h2 className="text-xl font-bold mb-4">My Tasks</h2>
                <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                <DataTable value={tasks} loading={loading} dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tasks"
                    responsiveLayout="stack" breakpoint="960px"
                    expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
                    rowExpansionTemplate={(data) => (
                        <div className="p-3">
                            <h5 className="font-bold mb-2">Description</h5>
                            <p className="mb-4 text-700">{data.description || <span className="italic">No description provided</span>}</p>

                            {data.attachments && data.attachments.length > 0 && (
                                <>
                                    <h5 className="font-bold mb-2">Attachments</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {data.attachments.map((file, index) => (
                                            <div key={index} className="p-2 surface-100 border-round flex align-items-center gap-2">
                                                <i className={`pi ${file.fileType.includes('image') ? 'pi-image' : 'pi-file'} text-primary`}></i>
                                                <span className="text-sm font-medium">{file.fileName}</span>
                                                <Button
                                                    icon="pi pi-download"
                                                    rounded
                                                    text
                                                    size="small"
                                                    onClick={() => window.open(file.filePath, '_blank')}
                                                    tooltip="Download"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}>
                    <Column expander style={{ width: '3rem' }} />
                    <Column field="title" header="Title" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="priority" header="Priority" body={priorityBodyTemplate} sortable style={{ minWidth: '8rem' }}></Column>
                    <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: '8rem' }}></Column>
                    <Column field="dueDate" header="Due Date" body={dateBodyTemplate} sortable style={{ minWidth: '12rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <TaskForm visible={taskDialog} onHide={hideDialog} onSave={saveTask} task={task} />

            {/* Progress Dialog */}
            <ProgressLog
                visible={progressDialog}
                onHide={() => setProgressDialog(false)}
                taskId={selectedTask?.id}
            />

            {/* File Upload Dialog */}
            <Dialog header={`Attachments for ${selectedTask?.title}`} visible={fileDialog} style={{ width: '50vw' }} onHide={() => setFileDialog(false)}>
                {selectedTask && (
                    <FileUploader
                        entityType="TASK"
                        entityId={selectedTask.id}
                        onUpload={() => {
                            toast.current.show({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully' });
                            fetchTasks();
                            setFileDialog(false);
                        }}
                    />
                )}
            </Dialog>
        </>
    );
};

export default TaskList;
