import { IConstants } from './types';
import { CardType } from '../fgo/types';

export const constants: IConstants = {
    wikiBaseUrl: 'https://fategrandorder.fandom.com',
    servantListPage: 'Servant_List',
    essenceListPage: 'Craft_Essence_List/By_ID',

    servantCacheKey: CardType.Servant,
    essenceCacheKey: CardType.Essence,

    stages: ['1', '2', '3', '4', 'april'],

    rates: {
        [CardType.Servant]: [
            {
                type: CardType.Servant,
                rarity: 0,
                rate: 0,
            },
            {
                type: CardType.Servant,
                rarity: 1,
                rate: 0,
            },
            {
                type: CardType.Servant,
                rarity: 2,
                rate: 0.0,
            },
            {
                type: CardType.Servant,
                rarity: 3,
                rate: 0.40,
            },
            {
                type: CardType.Servant,
                rarity: 4,
                rate: 0.03,
            },
            {
                type: CardType.Servant,
                rarity: 5,
                rate: 0.01,
            },
        ],

        [CardType.Essence]: [
            {
                type: CardType.Essence,
                rarity: 0,
                rate: 0,
            },
            {
                type: CardType.Essence,
                rarity: 1,
                rate: 0,
            },
            {
                type: CardType.Essence,
                rarity: 2,
                rate: 0.0,
            },
            {
                type: CardType.Essence,
                rarity: 3,
                rate: 0.40,
            },
            {
                type: CardType.Essence,
                rarity: 4,
                rate: 0.12,
            },
            {
                type: CardType.Essence,
                rarity: 5,
                rate: 0.04,
            },
        ],
    },

    images: {
        frame: {
            width: 512,
            height: 874,
        },

        [CardType.Servant]: {
            width: 512,
            height: 724,
        },

        [CardType.Essence]: {
            width: 512,
            height: 874,
        },
    },
};
