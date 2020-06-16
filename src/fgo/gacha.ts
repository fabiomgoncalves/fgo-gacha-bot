import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas';
import { cache } from '../util/cache';
import {
    CardType, ICard, IResponse, IServant,
} from './types';
import { constants } from '../config/constants';
import { IRate } from '../config/types';
import { ScraperEssences } from './scraper.essences';
import { ScraperServants } from './scraper.servants';
import { config } from '../config/config';
import { chunk } from '../util/array';

export class Gacha {
    private scraperServants: ScraperServants;

    private scraperEssences: ScraperEssences;

    constructor() {
        this.scraperServants = new ScraperServants();
        this.scraperEssences = new ScraperEssences();
    }

    private static async drawCanvas(
        rows: ICard[][],
        numberOfCards: number,
    ): Promise<Buffer> {
        const canvas = createCanvas(
            constants.images.frame.width * config.cardsPerRow
            + config.cardMargin * (config.cardsPerRow - 1),

            constants.images.frame.height * (Math.ceil(numberOfCards / config.cardsPerRow))
            + config.cardMargin,
        );
        const canvasContext = canvas.getContext('2d');

        await Gacha.drawCanvasRows(rows, canvasContext);

        return canvas.toBuffer();
    }

    private static async drawCanvasRows(
        rows: ICard[][],
        canvasContext: CanvasRenderingContext2D,
    ): Promise<void> {
        for (let row = 0; row < rows.length; row += 1) {
            for (let column = 0; column < rows[row].length; column += 1) {
                const card = rows[row][column];
                const image = await loadImage(`${card.image}`);
                const overlay = await loadImage(`${__dirname}/../../resources/images/${card.type}/frame/${card.rarity}.png`);
                const dxI = constants.images.frame.width + config.cardMargin;
                const dx = column * dxI + (canvasContext.canvas.width
                    - (constants.images.frame.width + (rows[row].length - 1) * dxI)) / 2;
                const dy = row * constants.images.frame.height + row * config.cardMargin;

                canvasContext.drawImage(
                    image,
                    dx,
                    dy + constants.images[card.type].offset,
                    constants.images[card.type].width,
                    constants.images[card.type].height,
                );

                canvasContext.drawImage(overlay, dx, dy);

                if (card.type === CardType.Servant) {
                    const classIcon = await loadImage(
                        `${__dirname}/../../resources/images/servant/classes/${(card as IServant).class.toLowerCase()}_${card.rarity}.png`,
                    );

                    canvasContext.drawImage(
                        classIcon,
                        dx + constants.images.frame.width / 2 - constants.images.class.width / 2,
                        dy + (constants.images.frame.height - constants.images.class.offset),
                    );
                }
            }
        }
    }

    private async getCardWithImage(card: ICard, stage: string): Promise<ICard> {
        if (card.type === CardType.Servant) {
            return {
                ...card,
                image: await this.scraperServants.getCardImage(card, stage),
            };
        }

        return {
            ...card,
            image: await this.scraperEssences.getCardImage(card),
        };
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

    private getRandomCard(): IRate {
        return this.sample([...constants.rates.servant, ...constants.rates.essence]);
    }

    private static getBannerInfo(rows: ICard[][]): string {
        let bannerInfo = '';
        const maxLineLength = 7 * config.cardsPerRow + 3 * (config.cardsPerRow - 1);

        rows.forEach((row) => {
            const addSize = (maxLineLength - (7 * row.length + 3 * (row.length - 1)));
            const line = `${row.map((card) => `${card.type === CardType.Servant ? 'S ' : 'CE'} [${`${card.id}`.padStart(4, '0')}](${card.url})`).join(' | ')}`;

            bannerInfo += `${' ‎'.repeat(Math.max(0, (addSize))) + line}\n`;
        });

        return bannerInfo;
    }

    public async gacha(stage: string, howManyCards: number): Promise<IResponse> {
        const stageAsString = stage ? `${stage}` : '1';
        const numberOfCards = howManyCards ?? config.cardsPerRoll;

        const cardPool = {
            [CardType.Servant]: cache.get(constants.servantCacheKey),
            [CardType.Essence]: cache.get(constants.essenceCacheKey),
        };

        const randomCards: IRate[] = [];
        randomCards.push(this.get3StarServant());
        randomCards.push(this.get4StarCard());

        for (let i = 0; i < numberOfCards - 2; i += 1) {
            randomCards.push(this.getRandomCard());
        }

        const banner = randomCards.map((card: IRate) => {
            const slice = cardPool[card.type].filter((p) => p.rarity === card.rarity);

            return slice[Math.floor(Math.random() * slice.length)];
        }).sort(() => Math.random() - 0.5);

        const cardsWithImage = await Promise.all(
            banner.map((card) => this.getCardWithImage(card, stageAsString)),
        );

        const rows = chunk<ICard>(cardsWithImage, config.cardsPerRow).reverse();
        const bannerInfo = Gacha.getBannerInfo(rows);
        const bannerImage = await Gacha.drawCanvas(rows, numberOfCards);

        return {
            description: bannerInfo,
            image: bannerImage,
        };
    }

    public async waifu(stage?: string): Promise<IResponse> {
        const stageAsString = stage ? `${stage}` : constants.stages[Math.floor(Math.random() * constants.stages.length)];

        const rates: IRate[] = [
            {
                ...constants.rates.servant[0],
                rate: 0.0001,
            },
            {
                ...constants.rates.servant[1],
                rate: 0.12,
            },
            {
                ...constants.rates.servant[2],
                rate: 0.26 - 0.0001,
            },
            constants.rates.servant[3],
            constants.rates.servant[4],
            constants.rates.servant[5],
        ];

        const rate = this.sample(rates);
        const slice = cache.get(constants.servantCacheKey).filter((p) => p.rarity === rate.rarity);
        const card = slice[Math.floor(Math.random() * slice.length)];
        const cardWithImage = await this.getCardWithImage(
            card,
            stageAsString,
        );

        const canvas = createCanvas(
            constants.images[CardType.Servant].width,
            constants.images[CardType.Servant].height,
        );
        const canvasContext = canvas.getContext('2d');
        const image = await loadImage(`${cardWithImage.image}`);
        canvasContext.drawImage(
            image,
            0,
            0,
            constants.images[CardType.Servant].width,
            constants.images[CardType.Servant].height,
        );

        return {
            description: `[${cardWithImage.name}](${cardWithImage.url}) (${cardWithImage.id})`,
            image: canvas.toBuffer(),
        };
    }
}
