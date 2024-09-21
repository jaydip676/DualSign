'use client'
import TransactionAccordion, { Transaction } from "@/components/common/TransactionAccordian";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { gql, useQuery, useApolloClient } from "@apollo/client";
import { Address } from "viem";
import Header from "@/components/header/Header";

interface Attestation {
    attestationId: string;
    attester: string;
    attestTimestamp: number;  // Use number for timestamp values
    linkedAttestation: string | null;  // Empty strings are allowed
    chainId: string;  // The chainId is a string (e.g., "arweave")
    chainType: "offchain" | "onchain";  // Use union types for chainType if it only has these two values
    data: string;  // The data field contains JSON as a string
    dataLocation: string;  // Data location like "arweave"
    transactionHash: string;
    revokeTransactionHash: string | null;  // Transaction hash can be null
    id: string;
    indexingValue: string;
    mode: "offchain" | "onchain";  // Mode could be offchain or onchain
    recipients: string[];  // Recipients is an array of strings (addresses)
    revoked: boolean;  // Boolean for revocation status
    revokeReason: string | null;  // Revoke reason can be null
    revokeTimestamp: number | null;  // Revoke timestamp can be null
    schema: {
        id: string;
        name: string;
        registrant: string;
    };
    validUntil: number;  // Timestamp or 0 if there is no validity period
}

const fetchAttestationDetails = async (attestationId: string | undefined): Promise<Attestation | null> => {
    const query = `
query getAttestation {
  attestation(id: "${attestationId}") {
    # Write your query or mutation here
    attestationId
    attester
    attestTimestamp
    linkedAttestation
    chainId
    chainType
    data
    dataLocation
    transactionHash
    revokeTransactionHash
    id
    indexingValue
    mode
    recipients
    revoked
    revokeReason
    revokeTimestamp
    schema {
      id
      name
      registrant
    }
    validUntil
  }
}
    `;
    const response = await fetch("https://testnet-rpc.sign.global/api/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
    });

    const result = await response.json();
    return result.data?.attestation ?? null;
};
const fetchTransactions = async (address: string) => {
    if (!address) return [];

    const url = `/api/fetch-transaction?address=${address}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Failed to fetch transactions, response not OK");
            return [];
        }

        const data: Transaction[] = await response.json();
        console.log("Raw transaction data:", data);

        if (!data.length) {
            console.warn("No transactions found for the given address");
            return [];
        }

        const transactionsWithAttestation = await Promise.all(
            data.map(async (transaction: Transaction) => {
                const attestation = await fetchAttestationDetails(transaction.attestationId);
                return { ...transaction, attestation };
            })
        );
        console.log("Transactions with attestation data:", transactionsWithAttestation);
        return transactionsWithAttestation;
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return [];
    }
};

const Dashboard: React.FC = () => {
    const { address } = useAccount()
    const [transactions, setTransaction] = useState([]);


    useEffect(() => {
        if (!address) {
            console.log("Address is undefined, skipping transaction fetch.");
            return;
        }

        const loadTransactions = async () => {
            const transactionData: any = await fetchTransactions(address as Address);
            setTransaction(transactionData);
        };

        loadTransactions();
    }, [address]);

    return (
        <>
            <Header />
            <div className="mt-20">
                <h1 className="m-6 font-bold text-3xl">All Transactions</h1>
                <main className="m-6">
                    <TransactionAccordion transactions={transactions} />
                </main>
            </div>
        </>
    )
}

export default Dashboard;