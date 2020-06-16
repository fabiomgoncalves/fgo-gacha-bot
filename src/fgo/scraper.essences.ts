import axios from 'axios';
import cheerio from 'cheerio';
import { Scraper } from './scraper';
import { CardType, ICard } from './types';
import { constants } from '../config/constants';

export class ScraperEssences extends Scraper<ICard> {
    constructor() {
        super(constants.essenceListPage, 'flytabs_CraftEssenceListByIDMain', constants.essenceCacheKey);
    }

    cardParseFn(cells: Cheerio): void {
        const id = this.getId(cells.eq(3));
        const { name, url } = this.getNameAndUrl(cells.eq(1).find('a').eq(0));
        const rarity = this.getRarity(cells.eq(2));

        if (id && name && url && rarity) {
            const essence: ICard = {
                id,
                name,
                rarity,
                url,
                type: CardType.Essence,
            };

            this.cards.push(essence);
        }
    }

    async getCardImage(card: ICard): Promise<string> {
        if (this.cardImageExists(card)) {
            return this.getCardImagePath(card);
        }

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
