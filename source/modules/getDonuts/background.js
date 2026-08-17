import * as cheerio from 'cheerio';
import browser from 'webextension-polyfill';

import { REQUEST_DONATS } from './utils';

browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === REQUEST_DONATS) {
        try {
            const res = await fetch('https://m.vk.ru/blue_player');
            const body = await res.text();

            const $ = cheerio.load(body);

            const result = $('a[href="/app6887721_-130956055?act=app_r"] + .appWidget__list').html();

            browser.tabs.sendMessage(sender.tab.id, { type: REQUEST_DONATS, data: result });
        } catch (error) {
            console.error(error)
        }
    }
});
