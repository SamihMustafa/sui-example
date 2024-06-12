import { TransactionBlock } from "@mysten/sui.js/transactions"
import { PACKAGE_ID, TREASURY_CAP_ID } from "../deployed_objects.json"

export const mint_token_transaction = (amount: number): TransactionBlock => {
    let correctAmount = amount * 1_000_000;
    const trx = new TransactionBlock()
    trx.moveCall({
        target: `${PACKAGE_ID}::pumpmint::mint`,
        arguments: [trx.object(TREASURY_CAP_ID), trx.pure(correctAmount)]
    })
    return trx
}