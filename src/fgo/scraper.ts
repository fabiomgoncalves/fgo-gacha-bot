import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import { constants } from '../config/constants';
import { cache } from '../util/cache';
import { ICard } from './types';

export abstract class Scraper<T> {
    protected cards: ICard[];

    private readonly listPage: string;

    private readonly listPageTableId: string;

    private readonly cacheKey: string;

    protected constructor(listPage: string, listPageTableId: string, cacheKey: string) {
        this.cards = [];
        this.listPage = listPage;
        this.listPageTableId = listPageTableId;
        this.cacheKey = cacheKey;
    }

    protected buildPageUrl = (pageName: string): string => `${constants.wikiBaseUrl}/wiki/${pageName.replace('/wiki/', '')}`;

    protected getId = (e: Cheerio): number => parseInt(e.text(), 10);

    protected getNameAndUrl = (e: Cheerio): {name: string, url: string} => {
        const name = e.text();
        const url = this.buildPageUrl(e.attr('href') || '');

        return { name, url };
    };

    protected getRarity = (e: Cheerio): number => e.text().split('★').length - 1;

    protected subPagesFn(subPages: string[]): Promise<AxiosResponse>[] {
        return subPages.map(async (classUrl) => axios.get(classUrl));
    }

    protected abstract cardParseFn(cells: Cheerio, subPageResponse: AxiosResponse): void;

    public scrape: () => Promise<void> = async () => {
        console.log('scrape');

        const response = await axios.get(this.buildPageUrl(this.listPage));
        let $ = cheerio.load(response.data);

        const subPages: string[] = [];
        $(`#${this.listPageTableId} a`).each((_, e) => {
            const page = $(e).attr('href');

            if (page) {
                subPages.push(this.buildPageUrl(page));
            }
        });

        const subPagesResponses = await Promise.all(
            this.subPagesFn(subPages),
        );

        subPagesResponses.forEach((subPageResponse) => {
            $ = cheerio.load(subPageResponse.data);

            $('#WikiaArticle .wikitable tr').each((_, e) => {
                const cells = $(e).find('td');

                this.cardParseFn(cells, subPageResponse);
            });
        });

        cache.set(this.cacheKey, this.cards);
    }
}
