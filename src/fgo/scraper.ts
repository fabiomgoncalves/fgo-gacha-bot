import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { constants } from '../config/constants';
import { registry } from '../util/cache';
import { Card } from './types';

export abstract class Scraper<T> {
    protected cards: Card[];

    private readonly listPage: string;

    private readonly listPageTableId: string;

    private readonly cacheKey: string;

    protected constructor(listPage: string, listPageTableId: string, cacheKey: string) {
        this.cards = [];
        this.listPage = listPage;
        this.listPageTableId = listPageTableId;
        this.cacheKey = cacheKey;
    }

    protected buildPageUrl(pageName: string): string {
        return `${constants.wikiBaseUrl}/wiki/${pageName.replace('/wiki/', '')}`;
    }

    protected getId(e: Cheerio): number {
        return parseInt(e.text(), 10);
    }

    protected getNameAndUrl(e: Cheerio): {name: string, url: string} {
        const name = e.text();
        const url = this.buildPageUrl(e.attr('href') || 'MISSING_URL');

        return { name, url };
    }

    protected getRarity(e: Cheerio): number {
        return e.text().split('★').length - 1;
    }

    protected subPagesFn(subPages: string[]): Promise<AxiosResponse>[] {
        return subPages.map(async (classUrl) => axios.get(classUrl));
    }

    protected async saveCardImage(cardUrl: string, filePath: string): Promise<string> {
        const response = await axios.get(cardUrl, {
            responseType: 'stream',
        });
        const stream = fs.createWriteStream(filePath);

        await new Promise((resolve) => {
            response.data.pipe(stream);
            stream.on('close', resolve);
            stream.on('error', console.error);
        });

        return filePath;
    }

    protected getCardImagePath(card: Card, stage?: string): string {
        return `${__dirname}/../../resources/images/${card.type}/cards/${card.id + (stage ? `_${stage}` : '')}.png`;
    }

    protected pathExists(path: string): Promise<boolean> {
        return new Promise((resolve) => {
            fs.access(path, fs.constants.F_OK, err => {
                if(err)
                    resolve(false);
                else
                    resolve(true);
            })
        });
    }

    protected abstract cardParseFn(cells: Cheerio, subPageResponse: AxiosResponse): void;

    public abstract getCardImage(card: Card, stage?: string): Promise<string>;

    public async scrape(): Promise<void> {
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

        registry.set(this.cacheKey, this.cards);
    }
}
