import { Certipop } from "@/models/Certipop";
import React, { FC } from "react";

interface CardProps {
    certipop: Certipop;
}

const CertipopCard: FC<CardProps> = ({ certipop }) => {
    const { transactionReference, transactionSignature, rating } = certipop;

    return (
        <div className="relative group rounded-lg border border-transparent px-5 py-4 transition-colors border-gray-300 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/30 m-4">
            <h2 className={`mb-3 text-2xl font-semibold text-ellipsis overflow-hidden`}>
                {transactionReference}{" "}
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                {transactionSignature.toUpperCase()}
            </p>
            <p
                className={`mt-6 max-w-[30ch] text-sm opacity-75`}
            >{`${rating}/10`}</p>
        </div>
    );
};

export default CertipopCard;
