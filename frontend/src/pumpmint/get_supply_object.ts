import { useEffect, useState, useCallback } from 'react';
import { fetch_pumpmint_treasury  } from './types/pumpmint_treasury';

export interface SupplyData {
    currentSupply: number;
    maxSupply: number;
}

export const get_current_supply_object = (interval: number): [SupplyData | null, () => void] => {
    const [object, setObject] = useState<SupplyData | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const data = await fetch_pumpmint_treasury();
            if(data === null) return null;
            let currentSupply = parseInt(data.pumpmint_treasury_cap.fields.total_supply.fields.value);
            if (currentSupply !== 0) {
                    currentSupply = currentSupply / 1_000_000;
            }
            let maxSupply = data.max_supply / 1_000_000;
            setObject({ currentSupply: currentSupply, maxSupply: maxSupply});
        } catch (error) {
            setObject(null);
        }
    }, []);

    useEffect(() => {
        fetchData(); // Initial fetch

        const intervalId = setInterval(fetchData, interval * 1000);

        return () => clearInterval(intervalId);
    }, [fetchData, interval]);

    return [object, fetchData];
};
