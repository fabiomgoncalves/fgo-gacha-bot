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

app.get('/gacha', async (req, res) => {
    const stage = req.query.stage ? `${req.query.stage}` : '1';
    const images = (await gacha.gacha(stage)).map((image) => `<img src="${image}" width="15%"/>`);
    const top = images.splice(0, 5);
    res.send(`${top.join('')}<br><br>${images.join('')}`);
});

Promise.all([
    new ScraperServants().scrape(),
    new ScraperEssences().scrape(),
]).then(() => {
    app.listen(3000, () => {
        console.log('App is listening on port 3000!');
    });
});
