'use client'
import TransactionAccordion from "@/components/common/TransactionAccordian";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface DashboardProps {

}

const Dashboard: React.FC<DashboardProps> = () => {
    const { address } = useAccount()
    const [transactions, setTransaction] = useState([]);

    useEffect(() => {
        if (address) {
            const fetchTransactions = async () => {
                const url = `/api/fetch-transaction?address=${address}`;
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    console.log(data);
                    setTransaction(data);
                    // Assuming the API returns a single transaction object
                } catch (error) {
                    console.error("Failed to fetch transactions:", error);
                }
            };
            fetchTransactions();
        }
    }, [address]);
    return (
        <div style={{ backgroundColor: "#f4f4f4" }}>
            <main>
                <TransactionAccordion transactions={transactions} />
            </main>
        </div>
    )
}

export default Dashboard;