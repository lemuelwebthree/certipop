import { AppBar } from "@/components/AppBar";
import CertipopCard from "@/components/CertipopCard";
import { useEffect, useState } from "react";
import { Certipop } from "@/models/Certipop";
import * as web3 from "@solana/web3.js";
import { fetchCertipops } from "@/util/fetchCertipops";
import { useWallet } from "@solana/wallet-adapter-react";
import CertipopForm from "@/components/Form";

const CERTIPOP_PROGRAM_ID = "97kzinuWECZYtpK48UDXZYKwW6QrdV6727XAcTXvNmdB";

export default function Home() {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
    const { publicKey, sendTransaction } = useWallet();
    const [txid, setTxid] = useState("");

    const [certipops, setCertipops] = useState<Certipop[]>([]);

    const [transactionReference, setTransactionReference] = useState("");
    const [rating, setRating] = useState(0);
    const [tansactionSignature, setTransactionSignature] = useState("");

    useEffect(() => {
        const fetchAccounts = async () => {
            await fetchCertipops(CERTIPOP_PROGRAM_ID, connection).then(setCertipops);
        };
        fetchAccounts();
    }, []);

    const handleSubmit = () => {
        const certipop = new Certipop(transactionReference, rating, tansactionSignature);
        handleTransactionSubmit(certipop);
    };

    const handleTransactionSubmit = async (certipop: Certipop) => {
        if (!publicKey) {
            alert("Please connect your wallet!");
            return;
        }

        const buffer = certipop.serialize();
        const transaction = new web3.Transaction();

        const [pda] = await web3.PublicKey.findProgramAddressSync(
            [publicKey.toBuffer(), Buffer.from(certipop.transactionReference)],
            new web3.PublicKey(CERTIPOP_PROGRAM_ID)
        );

        const instruction = new web3.TransactionInstruction({
            keys: [
                {
                    pubkey: publicKey,
                    isSigner: true,
                    isWritable: false,
                },
                {
                    pubkey: pda,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: web3.SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                },
            ],
            data: buffer,
            programId: new web3.PublicKey(CERTIPOP_PROGRAM_ID),
        });

        transaction.add(instruction);

        try {
            let txid = await sendTransaction(transaction, connection);
            setTxid(
                `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`
            );
        } catch (e) {
            console.log(JSON.stringify(e));
            alert(JSON.stringify(e));
        }
    };

    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24 `}
        >
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <AppBar />
            </div>

            <div className="after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
                <CertipopForm
                    transactionReference={transactionReference}
                    tansactionSignature={tansactionSignature}
                    rating={rating}
                    setTransactionReference={setTransactionReference}
                    setTransactionSignature={setTransactionSignature}
                    setRating={setRating}
                    handleSubmit={handleSubmit}
                />
            </div>

            {txid && <div>{txid}</div>}

            <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
                {certipops &&
                    certipops.map((certipop) => {
                        return (
                            <CertipopCard key={certipop.transactionReference} certipop={certipop} />
                        );
                    })}
            </div>
        </main>
    );
}
