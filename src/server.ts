import express from 'express';
import { cache } from './util';
import { constants } from './config';
import { ScraperEssences } from './fgo/scraper.essences';
import { ScraperServants } from './fgo/scraper.servants';

const app: express.Application = express();

app.get('/', (_, res) => {
    res.json({
        [constants.servantCacheKey]: cache.get(constants.servantCacheKey),
        [constants.essenceCacheKey]: cache.get(constants.essenceCacheKey),
    });
});

Promise.all([
    new ScraperServants().scrape(),
    new ScraperEssences().scrape(),
]).then(() => {
    app.listen(3000, () => {
        console.log('App is listening on port 3000!');
    });
});
