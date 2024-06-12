import { SuiMoveObject, SuiClient, getFullnodeUrl,} from '@mysten/sui.js/client';
import { TREASURY_CAP_ID } from "./../../deployed_objects.json";

export interface TREASUERY_CAP {
    fields: {
        id: {
            id: string;
        };
        total_supply: {
            fields: {
                value: string;
            }
        }
    }
}

export interface PUMPMINT_TREASURY {
    id: {
        id: string;
    };
    max_supply: number;
    pumpmint_treasury_cap: TREASUERY_CAP;
}

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

export const fetch_pumpmint_treasury = async (): Promise<PUMPMINT_TREASURY | null> => {
    try {
        const response = await client.getObject({
            id: TREASURY_CAP_ID,
            options: { showContent: true }
        });
        const parsedObject = response?.data?.content as SuiMoveObject;
        const { fields } = parsedObject;
        return fields as unknown as PUMPMINT_TREASURY;
    } catch (error) {
        console.error('Failed to fetch current supply:', error);
        return null
    }
};