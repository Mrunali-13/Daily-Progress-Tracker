import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

const TaskForm = ({ visible, onHide, onSave, task }) => {
    const [taskDetails, setTaskDetails] = useState({
        title: '',
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: null
    });

    const [submitted, setSubmitted] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const toast = useRef(null);
    const fileUploadRef = useRef(null);

    useEffect(() => {
        if (task) {
            setTaskDetails({
                ...task,
                dueDate: task.dueDate ? new Date(task.dueDate) : null
            });
        } else {
            setTaskDetails({
                title: '',
                description: '',
                status: 'PENDING',
                priority: 'MEDIUM',
                dueDate: null
            });
        }
        setSelectedFiles([]);
    }, [task, visible]);

    const handleChange = (e, name) => {
        const value = e.target && e.target.value !== undefined ? e.target.value : e.value;
        setTaskDetails(prev => ({ ...prev, [name]: value }));
    };

    const onFileSelect = (e) => {
        setSelectedFiles(e.files);
    };

    const onFileUpload = async (e) => {
        // This handler is called when the "Upload" button is clicked
        const files = e.files;

        try {
            if (!task && files.length > 0) {
                // For new tasks, we don't upload yet, but we want to simulate a successful checks
                // Validation happens on server usually, but we can't send it yet.
                // We just confirm they are queued for save.
                toast.current?.show({
                    severity: 'success',
                    summary: 'Files Ready',
                    detail: `${files.length} file(s) will be uploaded when you save the task`
                });
                // We DON'T clear the file upload here so the user sees the files selected
            } else if (task?.id && files.length > 0) {
                // For existing tasks, upload immediately
                const success = await uploadFilesImmediately(task.id, files);

                // Only clear if upload was successful
                if (success) {
                    // Clear the UI list and local state to prevent re-upload on Save
                    if (fileUploadRef.current) {
                        fileUploadRef.current.clear();
                    }
                    setSelectedFiles([]);
                }
            }
        } catch (error) {
            console.error("Handler error:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Application Error',
                detail: 'An unexpected error occurred during file handling.'
            });
        }
    };

    const uploadFilesImmediately = async (taskId, files) => {
        try {
            const uploadPromises = files.map(file => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('entityType', 'TASK');
                formData.append('entityId', taskId);

                return api.post(API_ENDPOINTS.FILES.UPLOAD, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            });

            await Promise.all(uploadPromises);

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'All files uploaded successfully'
            });
            return true;
        } catch (error) {
            console.error('Error uploading files:', error);
            let errorMessage = 'Failed to upload some files';

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (typeof error.response.data === 'object') {
                    // Handle Spring Boot default error structure or custom JSON
                    errorMessage = error.response.data.message || JSON.stringify(error.response.data);
                }
            }

            toast.current?.show({
                severity: 'error',
                summary: 'Upload Error',
                detail: errorMessage
            });
            return false;
        }
    };

    const saveTask = async () => {
        setSubmitted(true);

        if (taskDetails.title.trim()) {
            try {
                // First, save the task
                const savedTask = await onSave(taskDetails);

                // If there are files and we have a task ID, upload them
                if (selectedFiles.length > 0 && savedTask?.id) {
                    await uploadFiles(savedTask.id);
                }

                // Clear form and close
                setSelectedFiles([]);
                if (fileUploadRef.current) {
                    fileUploadRef.current.clear();
                }
                onHide();
            } catch (error) {
                console.error('Error saving task:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to save task'
                });
            }
        }
    };

    const uploadFiles = async (taskId) => {
        try {
            const uploadPromises = selectedFiles.map(file => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('entityType', 'TASK');
                formData.append('entityId', taskId);

                return api.post(API_ENDPOINTS.FILES.UPLOAD, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            });

            await Promise.all(uploadPromises);

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Files uploaded successfully'
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            const errorMessage = error.response?.data || 'Failed to upload files';
            toast.current?.show({
                severity: 'error',
                summary: 'Upload Error',
                detail: errorMessage
            });
        }
    };

    const priorities = [
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' }
    ];

    const statuses = [
        { label: 'Pending', value: 'PENDING' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Completed', value: 'COMPLETED' }
    ];

    const taskDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={onHide} />
            <Button label="Save" icon="pi pi-check" onClick={saveTask} />
        </React.Fragment>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                visible={visible}
                style={{ width: '35rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header={task ? "Edit Task" : "New Task"}
                modal
                className="p-fluid"
                footer={taskDialogFooter}
                onHide={onHide}
            >
                <div className="flex flex-column gap-3 mt-2">
                    <div className="field">
                        <label htmlFor="title" className="font-bold block mb-2">Title *</label>
                        <InputText
                            id="title"
                            value={taskDetails.title}
                            onChange={(e) => handleChange(e, 'title')}
                            required
                            autoFocus
                            placeholder="Enter task title"
                            className={classNames({ 'p-invalid': submitted && !taskDetails.title })}
                        />
                        {submitted && !taskDetails.title && <small className="p-error">Title is required.</small>}
                    </div>

                    <div className="field">
                        <label htmlFor="description" className="font-bold block mb-2">Description</label>
                        <InputTextarea
                            id="description"
                            value={taskDetails.description}
                            onChange={(e) => handleChange(e, 'description')}
                            rows={3}
                            placeholder="Add details about the task"
                        />
                    </div>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="priority" className="font-bold block mb-2">Priority</label>
                            <Dropdown
                                id="priority"
                                value={taskDetails.priority}
                                options={priorities}
                                onChange={(e) => handleChange(e, 'priority')}
                                placeholder="Select Priority"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="status" className="font-bold block mb-2">Status</label>
                            <Dropdown
                                id="status"
                                value={taskDetails.status}
                                options={statuses}
                                onChange={(e) => handleChange(e, 'status')}
                                placeholder="Select Status"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="dueDate" className="font-bold block mb-2">Due Date</label>
                        <Calendar
                            id="dueDate"
                            value={taskDetails.dueDate}
                            onChange={(e) => handleChange(e, 'dueDate')}
                            showIcon
                            showTime
                            hourFormat="24"
                            placeholder="Select date and time"
                        />
                    </div>

                    {!task && (
                        <div className="field">
                            <label className="font-bold block mb-2">Attach Files (Optional)</label>
                            <FileUpload
                                ref={fileUploadRef}
                                name="files"
                                multiple
                                maxFileSize={5000000}
                                onSelect={onFileSelect}
                                customUpload
                                uploadHandler={onFileUpload}
                                chooseLabel="Choose Files"
                                uploadLabel="Upload"
                                cancelLabel="Clear"
                                emptyTemplate={<p className="text-sm text-500 m-0">Click to select files or drag and drop here.</p>}
                            />
                            <small className="text-500 block mt-1">Max file size: 5MB. Supported: PNG, JPEG, PDF, Excel</small>
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default TaskForm;
