import express from 'express';

import { ScraperEssences } from './fgo/scraper.essences';
import { ScraperServants } from './fgo/scraper.servants';
import { Gacha } from './fgo/gacha';
import { constants } from './config/constants';
import { cache } from './util/cache';

const app: express.Application = express();
const gacha = new Gacha();

app.get('/', (_, res) => {
    res.json({
        [constants.servantCacheKey]: cache.get(constants.servantCacheKey),
        [constants.essenceCacheKey]: cache.get(constants.essenceCacheKey),
    });
});

app.get('/waifu', async (req, res) => {
    res.send(await gacha.waifu(`${req.query.stage}`));
});

app.get('/gacha', async (req, res) => {
    res.send(await gacha.gacha(`${req.query.stage}`, parseInt(`${req.query.howManyCards}`, 10)));
});

Promise.all([
    new ScraperServants().scrape(),
    new ScraperEssences().scrape(),
]).then(() => {
    app.listen(3000, () => {
        console.log('App is listening on port 3000!');
    });
});
