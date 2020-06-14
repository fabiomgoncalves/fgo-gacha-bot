import express from 'express';

import { ScraperEssences } from './fgo/scraper.essences';
import { ScraperServants } from './fgo/scraper.servants';
import { gacha } from './fgo/gacha';
import { constants } from './config/constants';
import { cache } from './util/cache';

const app: express.Application = express();

app.get('/', (_, res) => {
    res.json({
        [constants.servantCacheKey]: cache.get(constants.servantCacheKey),
        [constants.essenceCacheKey]: cache.get(constants.essenceCacheKey),
    });
});

app.get('/gacha', (_, res) => {
    res.json({
        r: gacha(),
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
