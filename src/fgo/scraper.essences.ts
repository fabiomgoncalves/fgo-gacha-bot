import axios from 'axios';
import cheerio from 'cheerio';
import { Scraper } from './scraper';
import { CardType, Card } from './types';
import { constants } from '../config/constants';

export class ScraperEssences extends Scraper<Card> {
    constructor() {
        super(constants.essenceListPage, 'flytabs_CraftEssenceListByIDMain', constants.essenceCacheKey);
    }

    cardParseFn(cells: Cheerio): void {
        const id = this.getId(cells.eq(3));
        const { name, url } = this.getNameAndUrl(cells.eq(1).find('a').eq(0));
        const rarity = this.getRarity(cells.eq(2));

        if (id && name && url && rarity) {
            const essence: Card = {
                id,
                name,
                rarity,
                url,
                type: CardType.Essence,
            };

            this.cards.push(essence);
        }
    }

    async getCardImage(card: Card): Promise<string> {
        const path = this.getCardImagePath(card);
        if (await this.pathExists(path)) {
            return path;
        }

        console.log(`missing CE ${card.id}, ${card.name}`);

        const page = await axios.get(card.url);
        const $ = cheerio.load(page.data);
        const cardImage = $('figure > a').attr('href');

        if (!cardImage) {
            console.log(`Error: ${card}`);
        } else {
            await this.saveCardImage(cardImage, this.getCardImagePath(card));
        }

        return cardImage ?? 'MISSING';
    }
}
