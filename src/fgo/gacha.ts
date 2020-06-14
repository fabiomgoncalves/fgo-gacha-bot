import { cache } from '../util/cache';
import { constants } from '../config/constants';
import { IRate } from '../config/types';
import { CardType, ICard } from './types';

const sample = (rates: IRate[]): IRate => {
    const sum = rates.reduce((a, b) => a + b.rate, 0);

    if (sum <= 0) {
        throw Error('Rates must sum to a value greater than zero');
    }

    const normalized = rates.map((rate) => rate.rate / sum);
    const random = Math.random();
    let total = 0;

    for (let i = 0; i < normalized.length; i += 1) {
        total += normalized[i];

        if (random < total) {
            return rates[i];
        }
    }

    return rates[Math.floor(Math.random() * rates.length)];
};

const get3StarServant = (): IRate => {
    const fixedRates = constants.rates.servants[4].rate + constants.rates.servants[5].rate;
    const rates: IRate[] = [
        {
            ...constants.rates.servants[3],
            rate: 1 - fixedRates,
        },
        constants.rates.servants[4],
        constants.rates.servants[5],
    ];

    return sample(rates);
};

const get4StarCard = (): IRate => {
    const fixedRates = constants.rates.servants[4].rate + constants.rates.servants[5].rate
        + constants.rates.essences[5].rate;
    const rates: IRate[] = [
        constants.rates.servants[4],
        constants.rates.servants[5],
        {
            ...constants.rates.essences[4],
            rate: 1 - fixedRates,
        },
        constants.rates.essences[5],
    ];

    return sample(rates);
};

const getRandomCard = () => sample([...constants.rates.servants, ...constants.rates.essences]);

export const gacha = (): ICard[] => {
    const cardPool = {
        [CardType.Servant]: cache.get(constants.servantCacheKey),
        [CardType.Essence]: cache.get(constants.essenceCacheKey),
    };

    const randomCards = [];
    randomCards.push(get3StarServant());
    randomCards.push(get4StarCard());

    for (let i = 0; i < 7; i += 1) {
        randomCards.push(getRandomCard());
    }

    return randomCards.map((card) => {
        const slice = cardPool[card.type].filter((p) => p.rarity === card.rarity);

        return slice[Math.floor(Math.random() * slice.length)];
    }).sort(() => Math.random() - 0.5);
};
