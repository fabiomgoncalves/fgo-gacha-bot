import { Scraper } from './scraper';
import { CardType, ICard } from './card';
import { constants } from '../config';

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
}
