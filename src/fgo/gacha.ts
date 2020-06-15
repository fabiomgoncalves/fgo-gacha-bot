import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import { cache } from '../util/cache';
import { CardType, ICard, IServant } from './types';
import { constants } from '../config/constants';
import { IRate } from '../config/types';
import { ScraperEssences } from './scraper.essences';
import { ScraperServants } from './scraper.servants';

export class Gacha {
    private scraperServants: ScraperServants;

    private scraperEssences: ScraperEssences;

    constructor() {
        this.scraperServants = new ScraperServants();
        this.scraperEssences = new ScraperEssences();
    }

    private async drawCanvas(cards: ICard[], stage: string): Promise<string> {
        const cardsWithImage = await Promise.all(
            cards.map((card) => this.getCardWithImage(card, stage)),
        );
        const canvas = createCanvas(
            constants.images.frame.width * 5,
            constants.images.frame.height * 2,
        );
        const canvasContext = canvas.getContext('2d');

        await Gacha.drawCanvasRow(cardsWithImage, true, canvasContext);
        await Gacha.drawCanvasRow(cardsWithImage, false, canvasContext);

        return `<img src="${canvas.toDataURL()}" alt="Gacha" width="50%" />`;
    }

    private static async drawCanvasRow(
        cardsWithImage: ICard[],
        top: boolean, canvasContext: CanvasRenderingContext2D,
    ): Promise<void> {
        for (let i = 0; i < 5; i += 1) {
            const index = top ? i : i + 5;
            const card = cardsWithImage[index];
            const image = await loadImage(`${card.imageUrl}`);
            const dx = i * constants.images.frame.width;
            const dy = top ? 0 : constants.images.frame.height;

            canvasContext.drawImage(
                image,
                dx,
                dy + (card.type === CardType.Servant ? 24 : 0),
                constants.images[card.type].width,
                constants.images[card.type].height,
            );

            const overlay = await loadImage(`${__dirname}/../../resources/images/${card.type}/frame/${card.rarity}.png`);

            canvasContext.drawImage(overlay, dx, dy);

            if (card.type === CardType.Servant) {
                const servant = card as IServant;
                const cls = await loadImage(`${__dirname}/../../resources/images/servant/classes/${servant.class.toLowerCase()}_${card.rarity}.png`);

                canvasContext.drawImage(
                    cls,
                    i * constants.images.frame.width + constants.images.frame.width / 2 - 80 / 2,
                    dy + (874 - 104),
                );
            }
        }
    }

    private async getCardWithImage(card: ICard, stage: string): Promise<ICard> {
        return {
            ...card,
            imageUrl: await this.getCardImage(card, stage),
        };
    }

    private async getCardImage(card: ICard, stage: string): Promise<string> {
        if (card.type === CardType.Servant) {
            return this.scraperServants.getCardImage(card, stage);
        }

        return this.scraperEssences.getCardImage(card);
    }

    private sample(rates: IRate[]): IRate {
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
    }

    private get3StarServant(): IRate {
        const fixedRates = constants.rates.servant[4].rate + constants.rates.servant[5].rate;
        const rates: IRate[] = [
            {
                ...constants.rates.servant[3],
                rate: 1 - fixedRates,
            },
            constants.rates.servant[4],
            constants.rates.servant[5],
        ];

        return this.sample(rates);
    }

    private get4StarCard(): IRate {
        const fixedRates = constants.rates.servant[4].rate + constants.rates.servant[5].rate
            + constants.rates.essence[5].rate;
        const rates: IRate[] = [
            constants.rates.servant[4],
            constants.rates.servant[5],
            {
                ...constants.rates.essence[4],
                rate: 1 - fixedRates,
            },
            constants.rates.essence[5],
        ];

        return this.sample(rates);
    }

    private getRandomCard() {
        return this.sample([...constants.rates.servant, ...constants.rates.essence]);
    }

    public async gacha(stage: string): Promise<string> {
        const cardPool = {
            [CardType.Servant]: cache.get(constants.servantCacheKey),
            [CardType.Essence]: cache.get(constants.essenceCacheKey),
        };

        const randomCards = [];
        randomCards.push(this.get3StarServant());
        randomCards.push(this.get4StarCard());

        for (let i = 0; i < 8; i += 1) {
            randomCards.push(this.getRandomCard());
        }

        const banner = randomCards.map((card: IRate) => {
            const slice = cardPool[card.type].filter((p) => p.rarity === card.rarity);

            return slice[Math.floor(Math.random() * slice.length)];
        }).sort(() => Math.random() - 0.5);

        const canvasImage = await this.drawCanvas(banner, stage);
        const cardInfo = banner.map((card) => `[<a href="${card.url}" target="_blank">${`${card.id}`.padStart(4, '0')}</a>]`);

        return `${cardInfo.slice(0, 5).join(' ')}<br>${cardInfo.slice(5, 10).join(' ')}<br>${canvasImage}`;
    }
}
