import browser from 'webextension-polyfill';
import { EVENT_NAME } from './vendor';

if(browser.commands){
    browser.commands.onCommand.addListener(async command => {
        const tabs = await browser.tabs.query({ url: [
                '*://vk.com/*',
                '*://vk.ru/*'
            ] });
        let { id } = tabs.find(({ audible }) => audible) || tabs[0];
        await browser.tabs.sendMessage(id, { action: EVENT_NAME, command });
    });
}
