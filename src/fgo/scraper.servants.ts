import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import { Scraper } from './scraper';
import { CardType, IServant } from './types';
import { constants } from '../config/constants';
import { rules } from '../config/rules';

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

            if (id && name && url && rarity
                && !rules.servants.find((rule) => rule.includes(name))) {
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

    async getCardImage(cardPage: string, stage: string): Promise<string> {
        const page = await axios.get(cardPage);
        const $ = cheerio.load(page.data);
        const normalizedStage = Math.max(0, Math.min((parseInt(stage || '1', 10)), 5));
        let cardImage;

        if (normalizedStage !== 5) {
            cardImage = $(`figure a[title='Stage ${stage}']`).attr('href');

            if (!cardImage) {
                cardImage = $(`figure a[title='Stage${stage}']`).attr('href');
            }

            if (!cardImage && normalizedStage < 4) {
                cardImage = $('figure a[title=\'Stage 1-3\']').attr('href');
            }
        } else {
            cardImage = $('figure a[title^=\'April\']').attr('href');
        }

        return cardImage || 'MISSING_SERVANT_IMAGE';
    }
}
