import { SuiClient, Unsubscribe, getFullnodeUrl } from '@mysten/sui.js/client';
import { useEffect, useState } from 'react';
import { PACKAGE_ID } from "../deployed_objects.json";

const client = new SuiClient({
	url: getFullnodeUrl("testnet")
});

interface MintEventData {
    amount: string,
    current_supply: string,
    [key: string]: any; // to allow other properties
}

const isMintEventData = (parsedJson: unknown): parsedJson is MintEventData => {
    return (
        typeof parsedJson === 'object' &&
        parsedJson !== null &&
        'current_supply' in parsedJson &&
        typeof (parsedJson as any).current_supply === 'string'
    );
};

export const get_current_supply = (): number => {
    const [currentSupply, setCurrentSupply] = useState<number>(0);

    useEffect(() => {
        let unsubscribe: Unsubscribe | undefined;

        const subscribe = async () => {

            try{
         unsubscribe = await client.subscribeEvent({
                filter: { Package: PACKAGE_ID },
                onMessage(event) {
                    console.log("Mint event recieved")
                    if (isMintEventData(event.parsedJson)) {
                        const newSupply = parseInt(event.parsedJson.current_supply);
                        if (!isNaN(newSupply)) {
                            setCurrentSupply(newSupply);
                        }
                    }else{
                        console.log("Error: Invalid mint event data");
                    }
                },
            });
        }catch(err){
            console.log(err)
        }
        };

        subscribe();

        return () => {
            if (unsubscribe) {
                unsubscribe().catch(error => console.error('Failed to unsubscribe:', error));
            }
        };
    }, []);

    return currentSupply;

}