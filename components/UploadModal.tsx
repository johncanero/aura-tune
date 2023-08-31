'use client';

import Modal from './Modal';
import useUploadModal from '@/hooks/useUploadModal';

const UploadModal = () => {
    const { isOpen, onClose } = useUploadModal();

    const onChange = (open: boolean) => {
        if (!open) {
            // Reset the form
            onClose();
        }
    };

    return ( 
        <div>
            <Modal
                title='Add a Song'
                description='Upload a song file'
                isOpen={isOpen}  
                onChange={onChange}
            >
                Upload Content
            </Modal>
        </div>
     );
}
 
export default UploadModal;