'use client';

import Link from 'next/link';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { RxCaretLeft, RxCaretRight } from 'react-icons/rx';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { HiHome } from 'react-icons/hi';
import { BiSearch } from 'react-icons/bi';
import { FaUserAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from '@/hooks/useUser';

import Button from './Button';

interface HeaderProps {
    children: React.ReactNode;
    className?: string;
}

const Header = ({ children, className }: HeaderProps) => {
    const router = useRouter();
    const authModal = useAuthModal();

    const supabaseClient = useSupabaseClient();
    const { user } = useUser();

    const handleLogout = async () => {
        const { error } = await supabaseClient.auth.signOut();
        //TODO: Reset any playing songs
        router.refresh();

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Logged Out');
        }
    };

    return (
        <div
            className={twMerge(
                `bg-gradient-to-b from-purple-700 p-6 rounded-lg h-fit`,
                className,
            )}
        >
            <div className='w-full mb-4 flex items-center justify-between'>
                {/* Buttons */}
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

                {/* Home and Search Button */}
                <div className='flex md:hidden gap-x-2 items-center'>
                    <Link href={'/'}>
                        <button
                            className='rounded-full p-2 bg-white flex items-center justify-center hover:opacity-75 transition'
                        >
                            <HiHome className='text-black' size={20} />
                        </button>
                    </Link>
                    <Link href={'/search'}>
                        <button
                            className='rounded-full p-2 bg-white flex items-center justify-center hover:opacity-75 transition'
                        >
                            <BiSearch className='text-black' size={20} />
                        </button>
                    </Link>
                </div>

                <div className='flex justify-between items-center gap-x-4'>
                    {user ? (
                        <div className='flex gap-x-4 items-center'>
                            <Button className='bg-white px-6py-2' onClick={handleLogout}>
                                Logout
                            </Button>

                            <Image
                                src="/images/auraTuneIcon.png"
                                width={40}
                                height={40}
                                alt="AuraTune Icon"
                            />

                            <Button
                                onClick={() => router.push('/account')}
                                className='bg-white'
                            >
                                <FaUserAlt />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <Button
                                    onClick={authModal.onOpen}
                                    className='bg-transparent text-neutral-300 font-medium'>
                                    Sign Up
                                </Button>
                            </div>

                            <div>
                                <Button
                                    onClick={authModal.onOpen}
                                    className='bg-white px-6 py-2'>
                                    Log In
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

export default Header;