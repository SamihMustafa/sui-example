import "dotenv/config"
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519"
import { fromB64 } from "@mysten/sui.js/utils"
import { SuiClient } from "@mysten/sui.js/client"
import { SuiObjectChange } from "@mysten/sui.js/client"
import { TransactionBlock } from "@mysten/sui.js/transactions"

import path, { dirname } from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"
import { writeFileSync } from "fs"

console.log("Hello World")
const priv_key = process.env.PRIVATE_KEY
if(!priv_key){
    console.log("ERROR private key not set")
    process.exit(1)
}

const keypair = Ed25519Keypair.fromSecretKey(fromB64(priv_key).slice(1))
const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" })

const path_to_scripts = dirname(fileURLToPath(import.meta.url))
const path_to_contracts = path.join(path_to_scripts, "../../pumpmint")

console.log(path_to_contracts)

console.log("Building Contracts")
const {dependencies, modules } = JSON.parse(
    execSync(`sui move build --dump-bytecode-as-base64 --path ${path_to_contracts}`, { encoding: "utf-8"})
)

console.log("Deploying Contracts")
console.log(`Deploying from ${keypair.toSuiAddress()}`)

const deploy_trx = new TransactionBlock()
const [upgrade_cap] = deploy_trx.publish({
    modules, dependencies
})


deploy_trx.transferObjects([upgrade_cap], deploy_trx.pure(keypair.toSuiAddress()))

const { objectChanges, balanceChanges } = await client.signAndExecuteTransactionBlock({
    signer: keypair, transactionBlock: deploy_trx, options: {
        showBalanceChanges: true,
        showEffects: true,
        showEvents: true,
        showInput: false,
        showObjectChanges: true,
        showRawInput: false 
    }
})

console.log(objectChanges, balanceChanges)

if(!balanceChanges){
    console.log("Error: Balance changes was undefined")
    process.exit(1)
}

if(!objectChanges){
    console.log("Error: Object changes was undefined")
    process.exit(1)
}


function parse_amount(amount: string): number {
    return parseInt(amount) / 1_000_000_000
}

console.log(`Spent ${Math.abs(parse_amount(balanceChanges[0].amount))} on deploy`)

const published_change = objectChanges.find(change =>  change.type == "published")

if(published_change?.type != "published"){
    console.log("Error: Did not find correct published change")
    process.exit(1)
}

function find_one_by_type(changes: SuiObjectChange[], type: string) {
    const objectChange = changes.find(
        change => change.type === "created" && change.objectType == type
    )
    if(objectChange?.type === "created"){
        return objectChange.objectId
    }
}

const packageId = published_change.packageId
const deployed_address: any = {
    PACKAGE_ID: published_change.packageId
}

const treasuryCap_type = `${packageId}::pumpmint::PUMPMINT_TREASURY`;
const treasuryCap_id = find_one_by_type(objectChanges, treasuryCap_type);
if (!treasuryCap_id) {
  console.log("Error: could not find treasuryCap object");
  process.exit(1);
}

deployed_address.TREASURY_CAP_ID = treasuryCap_id;

const deployed_path = path.join(path_to_scripts, "../src/deployed_objects.json")
//const index_path = path.join(path_to_scripts, "../../sui-place-indexer/get-place-board/deployed_objects.json")
writeFileSync(deployed_path, JSON.stringify(deployed_address, null, 4))
//writeFileSync(index_path, JSON.stringify(deployed_address, null, 4))