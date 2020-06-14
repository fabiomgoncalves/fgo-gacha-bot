import { ICache } from './types';
import { ICard } from '../fgo/types';

const cacheManager = () => {
    const registry: ICache = {};

    return {
        get(key: string) {
            return registry[key];
        },

        set(key: string, val: ICard[]) {
            registry[key] = val;
        },
    };
};

export const cache = cacheManager();
