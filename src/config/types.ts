import { CardType } from '../fgo/types';

export interface IRate {
    type: CardType,
    rarity: number,
    rate: number,
}

export interface IConstants {
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
