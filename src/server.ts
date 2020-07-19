import express from 'express';

import { ScraperEssences } from './fgo/scraper.essences';
import { ScraperServants } from './fgo/scraper.servants';
import { Gacha } from './fgo/gacha';
import { constants } from './config/constants';
import { registry } from './util/cache';

const app: express.Application = express();
const gacha = new Gacha();

app.get('/', (_, res) => {
    res.json({
        [constants.servantCacheKey]: registry.get(constants.servantCacheKey),
        [constants.essenceCacheKey]: registry.get(constants.essenceCacheKey),
    });
});

app.get('/waifu', async (req, res) => {
    res.send(await gacha.waifu(`${req.query.s}`));
});

app.get('/gacha', async (req, res) => {
    res.send(await gacha.gacha(`${req.query.s}`, req.query.n ? parseInt(`${req.query.n}`) : NaN));
});

app.get('/pic/gacha', async (req, res) => {
    res.set('Content-Type', 'image/png');
    res.send((await gacha.gacha(req.query.s as string, req.query.n ? parseInt(`${req.query.n}`) : NaN)).image);
});

app.get('/pic/waifu', async (req, res) => {
    res.set('Content-Type', 'image/png');
    res.send((await gacha.waifu(req.query.s as string)).image);
});

Promise.all([
    new ScraperServants().scrape(),
    new ScraperEssences().scrape(),
]).then(() => {
    app.listen(3000, () => {
        console.log('App is listening on port 3000!');
    });
});
