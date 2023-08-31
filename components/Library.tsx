"use client"

import { MdLibraryMusic } from 'react-icons/md';
import { AiOutlinePlus } from 'react-icons/ai';

import useAuthModal from '@/hooks/useAuthModal';
import useUploadModal from '@/hooks/useUploadModal';
import { useUser } from '@/hooks/useUser';

const Library = () => {
    const authModal = useAuthModal();
    const uploadModal = useUploadModal();
    const { user, subscription } = useUser();

    const onClick = () => {
        if (!user) {
            return authModal.onOpen();
        }

        // TODO: Check for subscription
        
        return uploadModal.onOpen();
    };

    return (
        <div className='flex flex-col'>
            <div className='flex items-center justify-between px-5 pt-4'>
                <div className='inline-flex items-center gap-x-2'>
                    <MdLibraryMusic size={26} className='text-neutral-400' />
                    <p className='font-medium text-md text-neutral-400'>Your Library</p>
                </div>

                <AiOutlinePlus
                    className='cursor-pointer text-neutral-400 hover:text-white transition'
                    onClick={onClick}
                    size={20}
                />
            </div>

            <div className='flex flex-col gap-y-2 mt-4 px-3'>
                List of Songs
            </div>
        </div>
    );
}

export default Library;