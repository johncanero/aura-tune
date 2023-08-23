'use client';

import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

import { RxCaretLeft, RxCaretRight } from 'react-icons/rx';

interface HeaderProps {
    children: React.ReactNode;
    className?: string;
}

const Header = ({ children, className }: HeaderProps) => {
    const router = useRouter();

    const handleLogout = async () => {
        // Handle Logout in the Feature
    };
    return (
        <div
            className={twMerge(
                `bg-gradient-to-b from-purple-700 p-6 rounded-lg h-fit`,
                className,
            )}
        >
            <div className='w-full mb-4 flex items-center justify-between'>
                <div className='hidden md:flex gap-x-2 items-center'>
                    {/* RxCaretLeft */}
                    <button
                        className='rounded-full bg-black flex items-center justify-center cursor-pointer hover:opacity-75 transition'
                        onClick={() => router.back()}
                    >
                        <RxCaretLeft size={35} className='text-white' />
                    </button>

                    {/* RxCaretRight */}
                    <button
                        className='rounded-full bg-black flex items-center justify-center cursor-pointer hover:opacity-75 transition'
                        onClick={() => router.forward()}
                    >
                        <RxCaretRight size={35} className='text-white' />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Header;