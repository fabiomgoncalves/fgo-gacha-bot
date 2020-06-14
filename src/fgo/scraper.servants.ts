import axios, { AxiosResponse } from 'axios';
import { Scraper } from './scraper';
import { CardType, IServant } from './types';
import { constants } from '../config/constants';

export class ScraperServants extends Scraper<IServant> {
    constructor() {
        super(constants.servantListPage, 'flytabs_ActiveSkillMain', constants.servantCacheKey);
    }

    subPagesFn(subPages: string[]): Promise<AxiosResponse>[] {
        return subPages.filter((text) => !text.includes('Beast'))
            .map(async (classUrl) => axios.get(classUrl));
    }

    cardParseFn(cells: Cheerio, subPageResponse?: AxiosResponse): void {
        if (!cells.eq(1).find("img[alt='Unavailable']").length) {
            const id = this.getId(cells.eq(3));
            const { name, url } = this.getNameAndUrl(cells.eq(1).find('a').eq(0));
            const cls = subPageResponse?.request.path.split('/').pop();
            const rarity = this.getRarity(cells.eq(2));

            if (id && name && url && rarity) {
                const servant: IServant = {
                    id,
                    name,
                    class: cls,
                    rarity,
                    url,
                    type: CardType.Servant,
                };

                this.cards.push(servant);
            }
        }
    }
}
