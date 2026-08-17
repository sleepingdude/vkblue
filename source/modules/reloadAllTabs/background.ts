import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener(message => {
    if (message.type === 'RELOAD_ALL_TABS') {
        browser.tabs.query({
            url: [
                '*://vk.com/*',
                '*://vk.ru/*'
            ]
        }).then(tabs => {
            tabs.forEach(tab => {
                browser.tabs.reload(tab.id);
            });
        });
    }
});
