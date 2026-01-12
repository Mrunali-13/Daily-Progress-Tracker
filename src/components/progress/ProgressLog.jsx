import React, { useState, useEffect, useRef } from 'react';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

const ProgressLog = ({ taskId, visible, onHide }) => {
    const [logs, setLogs] = useState([]);
    const [logDialog, setLogDialog] = useState(false);
    const [description, setDescription] = useState('');
    const toast = useRef(null);

    useEffect(() => {
        if (visible && taskId) {
            fetchProgress();
        }
    }, [visible, taskId]);

    const fetchProgress = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.TASKS.PROGRESS(taskId));
            setLogs(response.data);
        } catch (error) {
            console.error("Fetch progress failed", error);
        }
    };

    const saveProgress = async () => {
        if (!description.trim()) return;
        try {
            await api.post(API_ENDPOINTS.TASKS.PROGRESS(taskId), { description });
            toast.current.show({ severity: 'success', summary: 'Logged', detail: 'Progress added' });
            setDescription('');
            setLogDialog(false);
            fetchProgress();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to add progress' });
        }
    };

    const customizedMarker = (item) => {
        return (
            <span className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1" style={{ backgroundColor: '#9C27B0' }}>
                <i className="pi pi-compass"></i>
            </span>
        );
    };

    const customizedContent = (item) => {
        return (
            <Card title={new Date(item.createdAt).toLocaleString()} subTitle={item.createdBy?.username}>
                <p className="m-0">{item.description}</p>
            </Card>
        );
    };

    return (
        <Dialog header="Task Progress" visible={visible} style={{ width: '50vw' }} onHide={onHide}>
            <Toast ref={toast} />
            <Button label="Add Progress" icon="pi pi-plus" onClick={() => setLogDialog(true)} className="mb-3" />

            <Timeline value={logs} align="alternate" className="customized-timeline" marker={customizedMarker} content={customizedContent} />

            <Dialog header="Add Progress Log" visible={logDialog} style={{ width: '30vw' }} onHide={() => setLogDialog(false)}>
                <div className="flex flex-column gap-2">
                    <label htmlFor="prog-desc">Description</label>
                    <InputTextarea id="prog-desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
                    <Button label="Save" icon="pi pi-check" onClick={saveProgress} />
                </div>
            </Dialog>
        </Dialog>
    );
};

export default ProgressLog;
