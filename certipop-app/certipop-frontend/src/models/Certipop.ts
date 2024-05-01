import * as borsh from "@project-serum/borsh";

export class Certipop {
    transactionReference: string;
    rating: number;
    transactionSignature: string;

    constructor(transactionReference: string, rating: number, transactionSignature: string) {
        this.transactionReference = transactionReference;
        this.rating = rating;
        this.transactionSignature = transactionSignature;
    }

    borshInstructionSchema = borsh.struct([
        borsh.u8("variant"),
        borsh.str("transactionReference"),
        borsh.u8("rating"),
        borsh.str("transactionSignature"),
    ]);

    static borshAccountSchema = borsh.struct([
        borsh.bool("initialized"),
        borsh.u8("rating"),
        borsh.str("transactionSignature"),
        borsh.str("transactionReference"),
    ]);

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000);
        this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
    }

    static deserialize(buffer?: Buffer): Certipop | null {
        if (!buffer) {
            return null;
        }

        try {
            const { transactionReference, rating, transactionSignature } =
                this.borshAccountSchema.decode(buffer);
            return new Certipop(transactionReference, rating, transactionSignature);
        } catch (e) {
            console.log("Deserialization error:", e);
            console.log(buffer);
            return null;
        }
    }
}
