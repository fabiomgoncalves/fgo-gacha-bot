import { Cache } from './types';
import { Card } from '../fgo/types';
import NodeCache from 'node-cache';

const registryManager = () => {
    const _registry: Cache = {};

    return {
        get(key: string) {
            return _registry[key];
        },

        set(key: string, val: Card[]) {
            _registry[key] = val;
        },
    };
};

export const registry = registryManager();
export const cache = new NodeCache({ stdTTL: 600, useClones: false });