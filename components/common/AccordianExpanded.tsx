"use client";

import React from "react";
import { formatUnits } from "viem";
import AddressWithCopy from "@/components/common/AddressWithCopy";
import Blockies from "react-blockies";
import { useAccount } from "wagmi";
import { Transaction } from "./TransactionAccordian";



interface AccordianExpandedProps {
    transaction: Transaction;
    cancelTransaction: (transaction: Transaction, index: number) => Promise<void>;
    isLoading: boolean;
    index: number;
    selectedIndex: number;
    isRejectedBtn: number;
    handleActionButtonClick: (transaction: Transaction, index: number) => Promise<void>;
}

const AccordianExpanded: React.FC<AccordianExpandedProps> = ({
    transaction,
    cancelTransaction,
    isLoading,
    index,
    selectedIndex,
    isRejectedBtn,
    handleActionButtonClick,
}) => {
    const { address } = useAccount();

    return (
        <>
            <div className="flex flex-col md:flex-row justify-evenly expanded-single-tx-parent">
                <div className="flex-1 border-r border-gray-300">
                    <div className="w-full flex flex-col">
                        <div className="border-b border-gray-300 w-full">
                            <div className="text-left mt-2 mb-2">
                                Send
                                <span className="font-bold ml-1">
                                    {formatUnits(transaction.amount, transaction.decimals)}
                                    <span className="mx-1">{transaction.tokenName}</span>
                                </span>
                                to:
                            </div>
                            <div className="mt-2 mb-5">
                                <div className="table-user flex items-center">
                                    <Blockies
                                        className="table-user-gradient"
                                        seed={transaction.receiverAddress ? transaction.receiverAddress : "dualsign"}
                                        size={10}
                                        scale={3}
                                    />
                                    <div className="table-user-details">
                                        <AddressWithCopy address={transaction.receiverAddress} short={true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-4/5">
                            <div className="flex flex-col justify-start items-start gap-2 mt-8">
                                <div className="label">Nonce:</div>
                                <div className="label">Transaction Hash:</div>
                                <div className="label">Initiated Date:</div>
                                <div className="label">Status:</div>
                                <div className="label">Sender:</div>
                            </div>
                            <div className="flex flex-col justify-start items-start gap-2 mt-8 ml-6">
                                <div className="value font-semibold capitalize">{transaction.nonce}</div>
                                <div className="value font-semibold capitalize">txHash</div>
                                <div className="value font-semibold capitalize">{transaction.initiateDate}</div>
                                <div className="value font-semibold capitalize">{transaction.status}</div>
                                <div className="value flex items-center">
                                    <Blockies
                                        className="table-user-gradient"
                                        seed={transaction.senderAddress ? transaction.senderAddress : "dualsign"}
                                        size={10}
                                        scale={3}
                                    />
                                    <AddressWithCopy address={transaction.senderAddress} short={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="min-w-[30%]">
                    <div className="process p-8 font-dmsans">
                        <ul className="list-none p-0 m-0 flex flex-col">
                            <li className={`step ${["inititated", "approved", "completed", "rejected"].includes(transaction.status) ? "completed" : ""}`}>
                                <div className="name flex items-center text-gray-600 font-bold text-base">
                                    Request Initiated
                                </div>
                            </li>
                            <li className={`step ${transaction.status === "inititated" ? "current" : ""} ${["approved", "completed"].includes(transaction.status) ? "completed" : ""}`}>
                                <div className="name flex items-center text-gray-600 font-bold text-base">
                                    {["approved", "completed"].includes(transaction.status) ? "Approved" : "Waiting for Receiver's Approval"}
                                </div>
                            </li>
                            <li className={`step ${transaction.status === "approved" ? "current" : ""} ${transaction.status === "completed" ? "completed" : ""}`}>
                                <div className="name flex items-center text-gray-600 font-bold text-base">
                                    {["approved", "inititated", "rejected"].includes(transaction.status) ? "Waiting for Sender to Execute" : transaction.status === "completed" ? "Executed" : null}
                                </div>
                            </li>
                            <li className={`step ${["rejected", "completed"].includes(transaction.status) ? "completed" : ""}`}>
                                <div className="name flex items-center text-gray-600 font-bold text-base">
                                    {transaction.status === "rejected" ? "Rejected" : "Completed"}
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="action-btns-expanded w-full flex items-center justify-between gap-4 p-4">
                        {transaction.status === "rejected" ? (
                            <button className="rejected-action-btn action-btn">
                                Rejected
                            </button>
                        ) : transaction.status === "completed" ? (
                            <button className="completed-action-btn action-btn">
                                Completed
                            </button>
                        ) : (
                            <>
                                <button
                                    className={`action-btn flex-1 ${address && transaction.senderAddress === address && transaction.status === "inititated" ? "waiting-action-btn" : transaction.senderAddress === address && transaction.status === "approved" ? "execute-action-btn" : transaction.receiverAddress === address && transaction.status === "inititated" ? "execute-action-btn" : "waiting-action-btn"}`}
                                    onClick={() => handleActionButtonClick(transaction, index)}
                                >
                                    {isLoading && isRejectedBtn !== index && selectedIndex === index
                                        ? "Loading..."
                                        : address && transaction.senderAddress === address && transaction.status === "inititated"
                                            ? "Waiting"
                                            : transaction.senderAddress === address && transaction.status === "approved"
                                                ? "Execute"
                                                : transaction.receiverAddress === address && transaction.status === "inititated"
                                                    ? "Approve"
                                                    : transaction.status === "rejected"
                                                        ? "Rejected"
                                                        : "Waiting"}
                                </button>
                                <button
                                    className="rejected-action-btn action-btn flex-1"
                                    onClick={() => cancelTransaction(transaction, index)}
                                >
                                    {isLoading && isRejectedBtn === index ? "Loading..." : "Reject"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccordianExpanded;