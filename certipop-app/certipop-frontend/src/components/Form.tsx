import { FC } from "react";

interface FormProps {
    transactionReference: string;
    transactionSignature: string;
    rating: number;
    setTransactionReference: (value: string) => void;
    setTransactionSignature: (value: string) => void;
    setRating: (value: number) => void;
    handleSubmit: () => void;
}
const CertipopForm: FC<FormProps> = ({
    transactionReference,
    transactionSignature,
    rating,
    setTransactionReference,
    setTransactionSignature,
    setRating,
    handleSubmit,
}) => {
    const formSubmit = (e: any) => {
        e.preventDefault();
        if (rating < 0 || rating > 10) {
            alert("Rating must be between 0 and 10.");
            return;
        }
        handleSubmit();
    };
    return (
        <form
            className="shadow-md rounded px-8 pt-6 pb-8 mb-4"
            onSubmit={(e) => formSubmit(e)}
        >
            <div className="w-full max-w-xs">
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">
                        Transaction Reference
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="transactionReference"
                        type="text"
                        placeholder="Transaction Reference (PO, Invoice, Quotation # etc)"
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">
                        Transaction Signature
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="transactionSignature"
                        type="text"
                        placeholder="Transaction Signature Of Transaction"
                        value={transactionSignature}
                        onChange={(e) => setTransactionSignature(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2">
                        Rating
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="rating"
                        type="number"
                        placeholder="Description"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        max={10}
                        min={0}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Certipop!
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CertipopForm;
