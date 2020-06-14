import { IConstants } from './types';
import { CardType } from '../fgo/types';

export const constants: IConstants = {
    wikiBaseUrl: 'https://fategrandorder.fandom.com',
    servantListPage: 'Servant_List',
    essenceListPage: 'Craft_Essence_List/By_ID',

    servantCacheKey: 'servants',
    essenceCacheKey: 'essences',

    rates: {
        servants: [
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

        essences: [
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
};
