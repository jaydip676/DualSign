'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useAccount } from 'wagmi';

const Header: React.FC = () => {
    const { isConnected } = useAccount()
    return (
        <header className="bg-white shadow-md py-4">
            <div className="container mx-auto flex justify-between items-center px-4">
                {/* Logo */}
                <div className="text-2xl font-bold">
                    <Link href="/" className="shrink-0">
                        <div className="flex items-center">
                            <span className="ml-2 text-black text-lg font-bold md:text-1rem ld:text-[1.2rem]">
                                Dual Sign
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-4">
                    {isConnected ?
                        <div className='flex items-center gap-4'>
                            <Link className="text-gray-700 hover:text-black hover:font-semibold" href="/send-request" >Send Token</Link>
                            <Link className="text-gray-700 hover:text-black hover:font-semibold" href="/dashboard" >Dashboard</Link>
                        </div> : null}
                    <ConnectButton />
                </div>
            </div>
        </header >
    );
};

export default Header;
