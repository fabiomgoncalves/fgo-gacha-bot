import { CardType } from '../fgo/types';

export interface Rate {
    type: CardType,
    rarity: number,
    rate: number,
}

export interface ImageSize {
    width: number,
    height: number,
    offset: number,
}

export interface Constants {
    wikiBaseUrl: string,
    servantListPage: string,
    essenceListPage: string,

    servantCacheKey: string,
    essenceCacheKey: string,

    stages: string[],

    rates: {
        [CardType.Servant]: Rate[],
        [CardType.Essence]: Rate[],
    },

    waifuRates: Rate[]
    gachaRates: Rate[]
    silverServantRates: Rate[]
    goldenRates: Rate[]

    images: {
        scale: number,
        frame: ImageSize,
        class: ImageSize,
        [CardType.Servant]: ImageSize,
        [CardType.Essence]: ImageSize,
    }
}

export interface Rules {
    [CardType.Servant]: string[]
}

export interface Config {
    cardsPerRoll: number,
    cardsPerRow: number,
    cardMargin: number,
}
