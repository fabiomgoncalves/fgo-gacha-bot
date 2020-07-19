import { Constants } from './types';
import { CardType } from '../fgo/types';

export const constants: Constants = {
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

    get waifuRates() {
        delete this.waifuRates;
        return this.waifuRates = [
            {
                ...this.rates.servant[0],
                rate: 0.0001,
            },
            {
                ...this.rates.servant[1],
                rate: 0.12,
            },
            {
                ...this.rates.servant[2],
                rate: 0.26 - 0.0001,
            },
            this.rates.servant[3],
            this.rates.servant[4],
            this.rates.servant[5],
        ];
    },

    get gachaRates() {
        delete this.gachaRates;
        return this.gachaRates = [...this.rates.servant, ...this.rates.essence];
    },

    get silverServantRates() {
        const fixedRates = this.rates.servant[4].rate + this.rates.servant[5].rate;

        delete this.silverServantRates;
        return this.silverServantRates = [
            {
                ...this.rates.servant[3],
                rate: 1 - fixedRates,
            },
            this.rates.servant[4],
            this.rates.servant[5],
        ];
    },

    get goldenRates() {
        const fixedRates = this.rates.servant[4].rate
            + this.rates.servant[5].rate
            + this.rates.essence[5].rate;

        delete this.goldenRates;
        return this.goldenRates = [
            this.rates.servant[4],
            this.rates.servant[5],
            {
                ...this.rates.essence[4],
                rate: 1 - fixedRates,
            },
            this.rates.essence[5],
        ];
    },

    images: {
        scale: 0.5,
        frame: {
            width: 512,
            height: 874,
            offset: 0,
        },

        class: {
            width: 80,
            height: 80,
            offset: 104,
        },

        [CardType.Servant]: {
            width: 512,
            height: 724,
            offset: 24,
        },

        [CardType.Essence]: {
            width: 512,
            height: 874,
            offset: 0,
        },
    },
};
