"use client";

import React, { useEffect, useState } from "react";
import { getTokenDetails, TokenDetails } from "@/utils/getTokenDetails";
import { useAccount } from "wagmi";
import { formatUnits, Address } from "viem";
import { createWalletClient, custom } from "viem";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parseUnits, parseEther } from "viem";
import { formSchemaLoadToken, formSchemaTransaction } from "@/utils/initiateTxFormSchema";
import LoadingSpinner from "../common/LoadingSpinner";
import { arbitrumSepolia } from "viem/chains";
import CustomSelect from "../common/CustomSelect";



interface Transaction {
    sender: string;
    receiver: string;
    token: string;
    amount: string;
}

interface InitiateTransactionProps {
    onClose: () => void;
}

interface FormErrors {
    receiver?: string[];
    amount?: string[];
    token?: string[];
}

const InitiateTransaction: React.FC<InitiateTransactionProps> = ({ onClose }) => {
    const { address, isConnected } = useAccount();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingToken, setIsLoadingToken] = useState<boolean>(false);
    const [errorDisplay, setErrorDisplay] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors | undefined>();
    const [selectedNetwork, setSelectedNetwork] = useState<string>("");
    const [secretPin, setSecretPin] = useState<number>(0);
    const [errorLoadToken, setErrorLoadToken] = useState<string | undefined>();
    const [transaction, setTransaction] = useState<Transaction>({
        sender: "",
        receiver: "",
        token: "",
        amount: "",
    });
    const [isERC20, setIsERC20] = useState<boolean>(false);
    const defaultTokenDetails: TokenDetails = {
        name: "",
        symbol: "",
        decimals: "",
        balance: BigInt(0)
    };

    const [tokenDetails, setTokenDetails] = useState<TokenDetails>(defaultTokenDetails);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTransaction({ ...transaction, [name]: value });
    };

    const loadTokenDetails = async () => {
        setErrorLoadToken("")
        setErrorDisplay(false);
        const formData = {
            token: transaction.token,
        };

        try {
            formSchemaLoadToken.parse(formData);
            setIsLoadingToken(true);
            console.log(transaction.token, address);
            const getToken: any = await getTokenDetails(transaction.token, address as string);
            console.log(getToken);
            if (getToken !== null) {
                setTokenDetails(getToken);
            }
        } catch (err: any) {
            console.log(err);
            setErrorLoadToken(err.formErrors?.fieldErrors?.token);
            setErrorDisplay(true);
        } finally {
            setIsLoadingToken(false);
        }
    };

    useEffect(() => {
        if (!isERC20) {
            setTokenDetails(defaultTokenDetails);
            setTransaction({ ...transaction, token: "" });
        }
    }, [isERC20]);

    const handleCheckboxChange = () => {
        setIsERC20(!isERC20);
    };

    const signTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorDisplay(false);

        const formData = {
            receiver: transaction.receiver,
            amount: transaction.amount,
            token: isERC20 ? transaction.token : undefined,
        };

        const { ethereum } = window as any;
        if (!ethereum) {
            throw new Error("Metamask is not installed, please install!");
        }

        try {
            formSchemaTransaction.parse(formData);
            setIsLoading(true);
            const client = createWalletClient({
                chain: arbitrumSepolia,
                transport: custom(window ? window.ethereum : ""),
            });

            // const url = `/api/latest-nonce?address=${address}`;

            // const response = await fetch(url);
            // const data = await response.json();
            // console.log(data);
            // let nonce = parseInt(data.nonce) + 1;
            var amount: any = transaction.amount;
            if (isERC20) {
                amount = parseUnits(transaction.amount, parseInt(tokenDetails.decimals ? tokenDetails.decimals : ""));
            } else {
                amount = parseEther(transaction.amount);
            }

            const signature = await client.signTypedData({
                account: address as Address,
                domain: {
                    name: "DualSign",
                    version: "1",
                    chainId: BigInt(1029),
                    verifyingContract: "0xabcd", //contract address
                },
                types: {
                    EIP712Domain: [
                        { name: "name", type: "string" },
                        { name: "version", type: "string" },
                        { name: "chainId", type: "uint256" },
                        { name: "verifyingContract", type: "address" },
                    ],
                    initiateTransaction: [
                        { name: "sender", type: "address" },
                        { name: "receiver", type: "address" },
                        { name: "amount", type: "uint256" },
                        { name: "tokenName", type: "string" },
                        { name: "chainId", type: "uint256" },
                        { name: "secretPin", type: "uint256" }
                    ],
                },
                primaryType: "initiateTransaction",
                message: {
                    // nonce: BigInt(nonce),
                    sender: address as Address,
                    receiver: transaction.receiver as Address,
                    amount: amount,
                    tokenName: tokenDetails.symbol ? tokenDetails.symbol : "ETH",
                    chainId: BigInt(selectedNetwork),
                    secretPin: BigInt(secretPin)
                },
            });
            const currentDate = new Date();
            console.log("Signature:", signature);
            if (signature) {
                const userData = {
                    senderAddress: address,
                    receiverAddress: transaction.receiver,
                    amount: amount.toString(),
                    tokenAddress: transaction.token,
                    senderSignature: signature,
                    receiverSignature: "",
                    status: "inititated",
                    tokenName: tokenDetails.symbol !== "" ? tokenDetails.symbol : "ETH",
                    initiateDate: currentDate,
                    decimals: tokenDetails.symbol !== "" ? tokenDetails.decimals : 18,
                };
                console.log(userData);
                try {
                    console.log("entered into try block");
                    let result = await fetch(`api/store-transaction`, {
                        method: "POST",
                        body: JSON.stringify(userData),
                    });
                    const response = await result.json();
                    toast.success("Signed Successfully");
                    setIsLoading(false);
                    onClose();
                } catch (error) {
                    toast.error("Error while signing");
                    setIsLoading(false);
                    console.error("Error signing transaction:", error);
                }
            }
        } catch (err: any) {
            console.log(err.formErrors ? err.formErrors : err);
            setErrors(err.formErrors?.fieldErrors);
            setErrorDisplay(true);
            console.error("Error signing transaction:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (transaction.receiver || transaction.token || transaction.amount) {
            setErrors({});
            setErrorDisplay(false);
        }

        return () => {
            setErrors({});
            setErrorDisplay(false);
        };
    }, [transaction.receiver, transaction.token, transaction.amount]);

    return (

        <div className="absolute top-0 left-0 w-full min-h-screen bg-black bg-opacity-60 backdrop-blur-lg flex justify-center items-center z-[99999999]">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden w-[40em] my-8 opacity-100 transition-all duration-300 ease-in-out">
                <div className="relative bg-white">
                    <div className="absolute top-5 right-5 cursor-pointer">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 0 24 24"
                            width="24px"
                            fill="#000000"
                            onClick={onClose}
                        >
                            <path d="M0 0h24v24H0V0z" fill="none" />
                            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl text-black m-5">Send Transaction</h1>

                    <form
                        className="mt-6 flex flex-col justify-start w-full px-4"
                        onSubmit={signTransaction}
                    >
                        <div className="w-full mb-4 ">
                            <label className="self-left text-gray-700 text-xs mb-1">Receiver Address</label>
                            <input
                                type="text"
                                name="receiver"
                                placeholder="Enter Receiver's Address"
                                className={`w-full p-2 border rounded-lg text-black ${errorDisplay && errors?.receiver ? 'border-red-500' : 'border-[#2d2d2d]'}`}
                                value={transaction.receiver || ""}
                                onChange={handleInputChange}
                            />
                            {errorDisplay && errors?.receiver && (
                                <span className="text-red-600 text-left mt-2 text-sm">
                                    *{errors.receiver}
                                </span>
                            )}
                        </div>


                        {/* <select
                                className="w-full p-2 border rounded-lg text-black"
                                value={selectedNetwork} // Assume you have this state variable
                                onChange={(e) => setSelectedNetwork(e.target.value)} // Update this function as needed
                            >
                                <option value="">Select Network</option>
                                <option value="arbitrum-sepolia">Arbitrum Sepolia</option>
                                <option value="base-sepolia">Base Sepolia</option>
                            </select> */}
                        <CustomSelect selectedOption={selectedNetwork} setSelectedOption={setSelectedNetwork} />

                        <div className="w-full mb-4 ">
                            <label className="text-left text-gray-700 text-xs mb-1">Do you want to send ERC-20 token?</label>
                            <div
                                className={`flex items-center cursor-pointer w-full p-2 border rounded-lg text-black ${errorDisplay && errorLoadToken ? 'border-red-500' : 'border-[#2d2d2d]'}`}
                                onClick={handleCheckboxChange}
                            >
                                <input
                                    type="checkbox"
                                    checked={isERC20}
                                    className="form-checkbox h-5 w-5 text-indigo-600"
                                />
                                <span className="ml-2 text-black">Yes</span>
                            </div>
                        </div>

                        {isERC20 && (
                            <>
                                <div className="w-full mb-4 ">
                                    <label className="text-left text-gray-700 text-xs mb-1">Token:</label>
                                    <div className="flex flex-row gap-2">
                                        <input
                                            type="text"
                                            name="token"
                                            placeholder="Enter Token Address"
                                            className={`w-full p-2 border rounded-lg text-black ${errorDisplay && errorLoadToken ? 'border-red-500' : 'border-[#2d2d2d]'}`}
                                            value={transaction.token || ""}
                                            onChange={handleInputChange}
                                        />
                                        {isLoadingToken ? (
                                            <button className="flex items-center justify-center w-full bg-black text-white rounded-lg p-2 mt-2">
                                                <LoadingSpinner />
                                                Loading...
                                            </button>
                                        ) : (
                                            <button
                                                onClick={loadTokenDetails}
                                                className="secondaryButton max-w-max bg-black text-white rounded-lg p-2 mt-2"
                                                type="button"
                                            >
                                                Load Token
                                            </button>
                                        )}
                                    </div>
                                    {errorDisplay && errorLoadToken && (
                                        <span className="text-red-600 text-left mt-2 text-sm">
                                            *{errorLoadToken}
                                        </span>
                                    )}
                                </div>

                            </>
                        )}

                        {transaction.token && tokenDetails.name && (
                            <div className="token-details text-left flex flex-col px-4 border border-[#2d2d2d] my-4 rounded-lg">
                                <span className="text-slate-600 text-base my-4">
                                    Name:{" "}
                                    <span className="text-black text-xl font-bold">
                                        {tokenDetails.name}
                                    </span>
                                </span>
                                <span className="text-slate-600 text-base my-4">
                                    Symbol:{" "}
                                    <span className="text-black text-xl font-bold">
                                        {tokenDetails.symbol}
                                    </span>
                                </span>
                                <span className="text-slate-600 text-base my-4">
                                    Total Balance:{" "}
                                    <span className="text-black text-xl font-bold">
                                        {tokenDetails.balance
                                            ? `${formatUnits(
                                                tokenDetails.balance,
                                                tokenDetails.decimals ? parseInt(tokenDetails.decimals) : 18,
                                            )} ${tokenDetails.symbol}`
                                            : null}
                                    </span>
                                </span>
                            </div>
                        )}

                        <div className="w-full mb-4 ">
                            <label className="text-left text-gray-700 text-xs mb-1">Amount:</label>
                            <input
                                type="text"
                                name="amount"
                                placeholder="Enter Amount"
                                className={`w-full p-2 border rounded-lg text-black ${errorDisplay && errors?.amount ? 'border-red-500' : 'border-[#2d2d2d]'}`}
                                value={transaction.amount || ""}
                                onChange={handleInputChange}
                            />
                            {errorDisplay && errors?.amount && (
                                <span className="text-red-600 text-left mt-2 text-sm">
                                    *{errors.amount}
                                </span>
                            )}
                        </div>
                        <div className="w-full mb-4 ">
                            <label className="self-left text-gray-700 text-xs mb-1">Secret Pin</label>
                            <input
                                type="number"
                                name="receiver"
                                placeholder="Enter Secret Pin"
                                className={`w-full p-2 border rounded-lg text-black ${errorDisplay && errors?.receiver ? 'border-red-500' : 'border-[#2d2d2d]'}`}
                                value={secretPin || ""}
                                onChange={(e) => setSecretPin(e.target.valueAsNumber)}
                            />
                            {errorDisplay && errors?.receiver && (
                                <span className="text-red-600 text-left mt-2 text-sm">
                                    *{errors.receiver}
                                </span>
                            )}
                        </div>
                        <ToastContainer />

                        <div className="w-full mb-4 ">
                            {isLoading ? (
                                <button className="flex items-center justify-center w-full bg-black text-white rounded-lg p-2 disabled:opacity-80 cursor-not-allowed">
                                    <LoadingSpinner /> Loading...
                                </button>
                            ) : (
                                <button className="customButton w-full bg-black text-white rounded-lg p-2" type="submit">
                                    Send
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>


    );
}
export default InitiateTransaction;

