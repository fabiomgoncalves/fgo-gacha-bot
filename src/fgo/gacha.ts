import { CanvasRenderingContext2D, createCanvas, loadImage, Image } from 'canvas';
import { cache, registry } from '../util/cache';
import { CardType, Card, Result, Servant, Pity } from './types';
import { constants } from '../config/constants';
import { Rate } from '../config/types';
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
        rows: Promise<Card>[][],
        cards: number,
    ): Promise<Buffer> {
        const perRow = Math.min(config.cardsPerRow, cards);
        const w = constants.images.frame.width * perRow + config.cardMargin * (perRow - 1);
        const h = constants.images.frame.height * rows.length + config.cardMargin * (rows.length - 1);
        const canvas = createCanvas(w * constants.images.scale, h * constants.images.scale);
        const canvasContext = canvas.getContext('2d');
        canvasContext.scale(constants.images.scale, constants.images.scale);

        await Gacha.drawCanvasRows(rows, canvasContext, w);

        return canvas.toBuffer('image/png', { compressionLevel: 6 });
    }

    private static async drawCanvasRows(rows: Promise<Card>[][], canvasContext: CanvasRenderingContext2D, cw: number): Promise<void> {
        const results = rows.map((row, r) => row.map((p, c) => p.then(card => {
            const path = card.image as string;
            const frame = `${__dirname}/../../resources/images/${card.type}/frame/${card.rarity}.png`;

            const image = cache.get(path) as Promise<Image> ?? loadImage(path);
            const overlay = cache.get(frame) as Promise<Image> ?? loadImage(frame);
            if(!cache.has(path)) cache.set(path, image);
            if(!cache.has(frame)) cache.set(frame, overlay);

            const dxI = constants.images.frame.width + config.cardMargin;
            const dx = c * dxI + (cw - row.length * dxI + config.cardMargin) / 2;
            const dy = r * (constants.images.frame.height + config.cardMargin);

            const result = image.then(img => {
                canvasContext.drawImage(
                    img,
                    dx,
                    dy + constants.images[card.type].offset,
                    constants.images[card.type].width,
                    constants.images[card.type].height,
                );

                return overlay;
            }).then(ovl => {
                canvasContext.drawImage(ovl, dx, dy);
            });

            if (card.type === CardType.Servant) {
                const icon = `${__dirname}/../../resources/images/servant/classes/${(card as Servant).class.toLowerCase()}_${card.rarity}.png`;
                const classIcon = cache.get(icon) as Promise<Image> ?? loadImage(icon);
                if(!cache.has(icon)) cache.set(icon, classIcon);

                return result.then(() => classIcon).then(icn => {
                    canvasContext.drawImage(
                        icn,
                        dx + (constants.images.frame.width - constants.images.class.width) / 2,
                        dy + (constants.images.frame.height - constants.images.class.offset)
                    );
                });
            }

            return result;
        })));

        return Promise.all(results.map((rr) => Promise.all(rr))).then(() => {});
    }

    private async getCardImage(card: Card, stage: string): Promise<Card> {
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

    private sample(rates: Rate[], random = Math.random): Rate {
        const sum = rates.reduce((a, b) => a + b.rate, 0);

        if (sum <= 0) {
            throw Error('Rates must sum to a value greater than zero');
        }

        const normalized = rates.map((rate) => rate.rate / sum);
        const r = random();
        let total = 0;

        for (let i = 0; i < normalized.length; i += 1) {
            total += normalized[i];

            if (r < total) {
                return rates[i];
            }
        }

        return rates[Math.floor(random() * rates.length)];
    }

    private async getRandomCard(rates: Rate[], stage = '1', random = Math.random, pity?: Pity): Promise<Card> {
        const rate = this.sample(rates, random);
        const slice = registry.get(rate.type === CardType.Servant ? constants.servantCacheKey : constants.essenceCacheKey)
            .filter((p) => p.rarity === rate.rarity);

        const card = slice[Math.floor(random() * slice.length)];

        if (pity) {
            pity.servant = pity.servant || card.type === CardType.Servant;
            pity.golden = pity.golden || card.rarity > 3;
        }

        return this.getCardImage(card, stage);
    }

    private static async getRollDescription(rows: Promise<Card>[][], perRow: number): Promise<string> {
        const maxLineLength = 7 * perRow + 3 * (perRow - 1);

        const linkCard = (card: Card) =>
            `${card.type === CardType.Servant ? 'S ' : 'CE'} [${`${card.id}`.padStart(4, '0')}](${card.url})`;

        const lines: Promise<string>[] = [];
        rows.forEach((row) => {
            const addSize = (maxLineLength - (7 * row.length + 3 * (row.length - 1)));
            lines.push(
                Promise.all(row.map((c) => c.then(linkCard)))
                    .then((l) => {
                        const line = l.join(' | ');
                        return `${' ‎'.repeat(Math.max(0, (addSize))) + line}`;
                    }));
        });

        return Promise.all(lines).then((all) => all.join('\n'));
    }

    public async gacha(rawStage: string, cards: number, user = ''): Promise<Result> {
        const total = Math.max(1, Math.min(!cards || Number.isNaN(cards) ? config.cardsPerRoll : cards, 12));

        const parsedStage = rawStage ? `${rawStage}` : '1';
        const seeded = !constants.stages.includes(parsedStage)
        const random = !seeded ? Math.random : require('seedrandom')(`${user}.${total}.${parsedStage}`);
        const stage = seeded ? constants.stages[Math.floor(random() * constants.stages.length)] : parsedStage;

        const rates = constants.gachaRates;
        const rolls: Promise<Card>[] = [];

        const straightRoll = total < 10 ? total : total - 2;
        const pity: Pity = {} as Pity;
        for (let i = 0; i < straightRoll; i += 1) {
            rolls.push(this.getRandomCard(rates, stage, random, pity));
        }

        if (straightRoll < total) {
            rolls.push(
                this.getRandomCard(
                    pity.servant ? constants.gachaRates : constants.silverServantRates, stage, random, pity));

            rolls.push(
                this.getRandomCard(
                    pity.golden ? constants.gachaRates : constants.goldenRates, stage, random));
        }

        const rows = chunk<Promise<Card>>(rolls, config.cardsPerRow);
        const description = Gacha.getRollDescription(rows, Math.min(total, config.cardsPerRow));
        const image = Gacha.drawCanvas(rows, total);

        return {
            description: await description,
            image: await image
        };
    }

    public async waifu(rawStage?: string, user = ''): Promise<Result> {
        const parsedStage = rawStage
            ? `${rawStage}` : constants.stages[Math.floor(Math.random() * constants.stages.length)];
        const seeded = !constants.stages.includes(parsedStage)
        const random = !seeded ? Math.random : require('seedrandom')(`${user}.${parsedStage}`);
        const stage = seeded ? constants.stages[Math.floor(random() * constants.stages.length)] : parsedStage;

        const card = await this.getRandomCard(constants.waifuRates, stage, random);
        const path = card.image as string;
        const image = cache.get(path) as Promise<Image> ?? loadImage(path);
        if(!cache.has(path)) cache.set(path, image);

        const canvas = createCanvas(
            constants.images[CardType.Servant].width,
            constants.images[CardType.Servant].height,
        );

        canvas.getContext('2d').drawImage(
            await image,
            0,
            0,
            constants.images[CardType.Servant].width,
            constants.images[CardType.Servant].height,
        );

        return {
            description: `[${card.name}](${card.url}) (${card.id})`,
            image: canvas.toBuffer('image/png', { compressionLevel: 6 })
        };
    }
}
