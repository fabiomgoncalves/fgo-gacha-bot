interface ICache<T> {
    [key: string]: T
}

const cacheManager = () => {
    const registry: ICache<unknown> = {};

    return {
        get(key: string) {
            return registry[key];
        },

        set(key: string, val: unknown) {
            registry[key] = val;
        },
    };
};

export const cache = cacheManager();
