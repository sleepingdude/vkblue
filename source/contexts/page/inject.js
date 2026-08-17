function injectScript(file) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file); 
    script.type = 'text/javascript';
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
}


if (['vk.com','vk.ru'].some(item=>window.location.hostname.endsWith(item)) ) {
    injectScript('page.js'); 
}
