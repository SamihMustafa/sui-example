import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { GasStationClient, SponsoredTransaction } from "@shinami/clients";


// Initialize the SSM client
const ssmClient = new SSMClient({ region: 'eu-north-1' });

// Cache for the Shinami key and its timestamp
let cachedShinamiKey: { value: string, timestamp: number } | null = null;

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000;


const getShinamiKey = async (): Promise<string> => {
    const now = Date.now();

    // Check if cached key exists and is not expired
    if (cachedShinamiKey && (now - cachedShinamiKey.timestamp < CACHE_EXPIRATION_TIME)) {
        console.log('Returning cached Shinami key');
        return cachedShinamiKey.value;
    }

    console.log('Fetching Shinami key from Parameter Store');
    const command = new GetParameterCommand({
        Name: 'SHINAMI_KEY',
        WithDecryption: true
    });
    const response = await ssmClient.send(command);
    if (!response.Parameter || !response.Parameter.Value) {
        throw new Error('Shinami key not found in Parameter Store');
    }

    // Cache the key with current timestamp
    cachedShinamiKey = {
        value: response.Parameter.Value,
        timestamp: now
    };
    return cachedShinamiKey.value;
}
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let shinami_key;
    try {
        shinami_key = await getShinamiKey();
    } catch (e) {
        console.log("Could not find shinami key in Parameter Store: " + e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                "error": "Could not find the key - Internal server error"
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        };
    }

    const trx_bytes = event.queryStringParameters?.["trx_bytes"];
    if (!trx_bytes) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                "error": "Need to include trx_bytes"
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        };
    }

    const sender_addr = event.queryStringParameters?.["sender_addr"];
    if (!sender_addr) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                "error": "Need to include sender_addr param"
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        };
    }

    try {
        // Initialize the GasStationClient with the Shinami key
        const gasClient = new GasStationClient(shinami_key);

        // Sponsor the transaction
        const response: SponsoredTransaction = await gasClient.sponsorTransactionBlock(trx_bytes, sender_addr, 15_000_000);

        return {
            statusCode: 200,
            body: JSON.stringify({
                sponsored_bytes: response.txBytes,
                signature: response.signature
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        };
    } catch (e) {
        console.error("Error sponsoring transaction: ", e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                "error": "Error sponsoring transaction - Internal server error"
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        };
    }
};
