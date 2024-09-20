'use client'
import Header from "@/components/header/Header";
import InitiateTransaction from "@/components/initiate-request/InitiateRequest";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };
  return (
    <>
      <Header />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <button className="initiateBtn button-50" onClick={openModal}>
          Initiate Request
        </button>

        {isModalOpen && <InitiateTransaction onClose={closeModal} />}
      </div>
    </>
  );
}
