import { createCanvas, loadImage } from 'canvas';
import { cache } from '../util/cache';
import { CardType, ICard, IServant } from './types';
import { constants } from '../config/constants';
import { IRate } from '../config/types';
import { ScraperEssences } from './scraper.essences';
import { ScraperServants } from './scraper.servants';

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

export class Gacha {
    private scraperServants: ScraperServants;

    private scraperEssences: ScraperEssences;

    constructor() {
        this.scraperServants = new ScraperServants();
        this.scraperEssences = new ScraperEssences();
    }

    public gacha = async (stage: string): Promise<string> => {
        const cardPool = {
            [CardType.Servant]: cache.get(constants.servantCacheKey),
            [CardType.Essence]: cache.get(constants.essenceCacheKey),
        };

        const randomCards = [];
        randomCards.push(get3StarServant());
        randomCards.push(get4StarCard());

        for (let i = 0; i < 8; i += 1) {
            randomCards.push(getRandomCard());
        }

        const banner = randomCards.map((card) => {
            const slice = cardPool[card.type].filter((p) => p.rarity === card.rarity);

            return slice[Math.floor(Math.random() * slice.length)];
        }).sort(() => Math.random() - 0.5);

        const updatedBanner = await Promise.all(
            banner.map((card) => this.getCardWithImageUrl(card, stage)),
        );

        const canvas = createCanvas(512 * 5, 874 * 2);
        const ctx = canvas.getContext('2d');

        for (let i = 0; i < 5; i += 1) {
            const card = updatedBanner[i];
            const image = await loadImage(`${card.imageUrl}`);
            ctx.drawImage(
                image, i * 512,
                card.type === CardType.Servant ? 24 : 0,
            );

            const overlay = await loadImage(`${__dirname}/../../resources/images/${card.type}/frame/${card.rarity}.png`);
            ctx.drawImage(overlay, i * 512, 0);

            if (card.type === CardType.Servant) {
                const servant = card as IServant;

                const cls = await loadImage(`${__dirname}/../../resources/images/servant/classes/${servant.class.toLowerCase()}_${card.rarity}.png`);
                ctx.drawImage(cls, i * 512 + 512 / 2 - 80 / 2, 874 - 104);
            }
        }

        for (let i = 5; i < 10; i += 1) {
            const card = updatedBanner[i];
            const image = await loadImage(`${card.imageUrl}`);
            ctx.drawImage(
                image, (i - 5) * 512,
                card.type === CardType.Servant ? 874 + 24 : 874,
            );

            const overlay = await loadImage(`${__dirname}/../../resources/images/${card.type}/frame/${card.rarity}.png`);
            ctx.drawImage(overlay, (i - 5) * 512, 874);

            if (card.type === CardType.Servant) {
                const servant = card as IServant;

                const cls = await loadImage(`${__dirname}/../../resources/images/servant/classes/${servant.class.toLowerCase()}_${card.rarity}.png`);
                ctx.drawImage(cls, (i - 5) * 512 + 512 / 2 - 80 / 2, 874 + (874 - 104));
            }
        }

        return `<img src="${canvas.toDataURL()}" />`;
    }

    private getCardWithImageUrl = async (card: ICard, stage: string): Promise<ICard> => ({
        ...card,
        imageUrl: await this.getCardImage(card, stage),
    })

    private getCardImage(card: ICard, stage: string): Promise<string> {
        if (card.type === CardType.Servant) {
            return this.scraperServants.getCardImage(card.url, stage);
        }

        return this.scraperEssences.getCardImage(card.url);
    }
}
