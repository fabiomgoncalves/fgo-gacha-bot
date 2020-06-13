interface IRate {
    rarity: number,
    rate: number,
}

interface IConstants {
    wikiBaseUrl: string,
    servantListPage: string,
    essenceListPage: string,

    servantCacheKey: string,
    essenceCacheKey: string,

    rates: {
        servants: IRate[],
        essences: IRate[],
    }
}

export const constants: IConstants = {
    wikiBaseUrl: 'https://fategrandorder.fandom.com',
    servantListPage: 'Servant_List',
    essenceListPage: 'Craft_Essence_List/By_ID',

    servantCacheKey: 'servants',
    essenceCacheKey: 'essences',

    rates: {
        servants: [
            {
                rarity: 3,
                rate: 0.40,
            },
            {
                rarity: 4,
                rate: 0.03,
            },
            {
                rarity: 5,
                rate: 0.01,
            },
        ],

        essences: [
            {
                rarity: 3,
                rate: 0.40,
            },
            {
                rarity: 4,
                rate: 0.12,
            },
            {
                rarity: 5,
                rate: 0.04,
            },
        ],
    },
};
