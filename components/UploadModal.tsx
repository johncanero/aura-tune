'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

import Modal from './Modal';
import Input from './Input';
import useUploadModal from '@/hooks/useUploadModal';

const UploadModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { isOpen, onClose } = useUploadModal();

    const { register, handleSubmit, reset } = useForm<FieldValues>({
        defaultValues: {
            artist: '',
            title: '',
            song: null,
            image: null,
        },
    });

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            onClose();
        }
    };

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        // TODO: Upload to Supabase
    }


    return ( 
        <div>
            <Modal
                title='Add a Song'
                description='Upload a song file'
                isOpen={isOpen}  
                onChange={onChange}
            >
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-y-4'>
                    <Input
                        id='title'
                        disabled={isLoading}
                        {...register('title', { required: true })}
                        placeholder='Song Title'
                    />

                    <Input
                        id='artist'
                        disabled={isLoading}
                        {...register('artist', { required: true })}
                        placeholder='Artist'
                    />
                </form>
            </Modal>
        </div>
     );
}
 
export default UploadModal;