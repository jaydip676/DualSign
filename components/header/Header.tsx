'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Header: React.FC = () => {
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
                <div>
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
};

export default Header;
