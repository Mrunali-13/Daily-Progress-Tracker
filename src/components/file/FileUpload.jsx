import React, { useRef } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

const FileUploader = ({ entityType, entityId, onUpload }) => {
    const toast = useRef(null);

    const onUploadHandler = async (event) => {
        const file = event.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType); // 'TASK' or 'PROGRESS'
        formData.append('entityId', entityId);

        try {
            await api.post(API_ENDPOINTS.FILES.UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'File Uploaded' });
            if (onUpload) onUpload();
            event.options.clear();
        } catch (error) {
            console.error("Upload failed", error);
            let errorMessage = 'Upload Failed';

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (typeof error.response.data === 'object') {
                    errorMessage = error.response.data.message || JSON.stringify(error.response.data);
                }
            }

            toast.current.show({ severity: 'error', summary: 'Upload Error', detail: errorMessage });
        }
    };

    return (
        <div>
            <Toast ref={toast} />
            <FileUpload
                name="file"
                customUpload
                uploadHandler={onUploadHandler}
                maxFileSize={5000000}
                emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>}
            />
        </div>
    );
};

export default FileUploader;
