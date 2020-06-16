import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import { Scraper } from './scraper';
import { CardType, ICard, IServant } from './types';
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
                && !rules.servant.find((rule) => rule.includes(name))) {
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

    async getCardImage(card: ICard, stage: string): Promise<string> {
        if (this.cardImageExists(card, stage)) {
            return this.getCardImagePath(card, stage);
        }

        const page = await axios.get(card.url);
        const $ = cheerio.load(page.data);
        const normalizedStage = constants.stages.includes(stage) ? stage : '1';
        const stageImages: Record<string, string> = {};

        $('figure a').each((_, e) => {
            let linkStage = $(e).attr('title')?.toLowerCase().replace(/[^\w\d]/g, '').replace('stage', '') ?? 'INVALID';

            if (linkStage.startsWith('april')) {
                linkStage = 'april';
            }

            if (!Object.keys(stageImages).includes(linkStage)) {
                stageImages[linkStage] = $(e).attr('href') ?? 'MISSING_URL';
            }
        });

        let cardImage = stageImages[normalizedStage];

        if (!cardImage) {
            cardImage = stageImages['13'];
        }

        if (!cardImage) {
            console.log(`Error: ${card}`);
        } else {
            await this.saveCardImage(cardImage, this.getCardImagePath(card, stage));
        }

        return cardImage;
    }
}
