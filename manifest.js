const manifestVersion = +process.env.MANIFEST_VERSION;
const nodeEnv = process.env.NODE_ENV;
const permissions = [
    'tabs',
    'storage',
    'unlimitedStorage',
    'identity',
    'contextMenus',
    'alarms'
];
const hostPermissions = [
    //vk
    '*://vk.com/*',
    '*://m.vk.com/*',
    '*://vk.ru/*',
    '*://m.vk.ru/*',
    //lyrics
    '*://www.megalyrics.ru/*',
    '*://megalyrics.ru/*',
    '*://lyricshare.net/*',
    '*://*.genius.com/*',
    '*://*.musixmatch.com/*',
    //api
    '*://ws.audioscrobbler.com/*',
    '*://www.last.fm/*',
    '*://lastfm.freetls.fastly.net/*',
    '*://searx.space/*',
    '*://web.archive.org/*',
    //search
    '*://uk.ask.com/*',
    '*://www.bing.com/*',
    '*://duckduckgo.com/*',
    '*://xo.wtf/*',
    '*://www.startpage.com/*',
    //search searx (from https://searx.space/)
    "*://searxng.website/searxng/*",
    "*://priv.au/*",
    "*://search.einfachzocken.eu/*",
    "*://opnxng.com/*",
    "*://searx.redgarden.cv/*",
    "*://search.pi.vps.pw/*",
    "*://kantan.cat/*",
    "*://searx.rhscz.eu/*",
    "*://searxng.shreven.org/*",
    "*://search.ctq.ro/*",
    "*://searx.ro/*",
    "*://search.rhscz.eu/*",
    "*://search.hbubli.cc/*",
    "*://search.bladerunn.in/*",
    "*://searxng.site/*",
    "*://search.mdosch.de/*",
    "*://searx.tiekoetter.com/*",
    "*://search.ononoki.org/*",
    "*://ooglester.com/*",
    "*://etsi.me/*",
    "*://grep.vim.wtf/*",
    "*://search.femboy.ad/*",
    "*://search.2b9t.xyz/*",
    "*://searxng.canine.tools/*",
    "*://search.seddens.net/*",
    "*://failsearx.culturanerd.it/*",
    "*://searxng.deggo.fyi/*",
    "*://search.abohiccups.com/*",
    "*://searx.namejeff.xyz/*",
    "*://search.wdpserver.com/*",
    "*://searx.party/*",
    "*://searx.rajimayur.me/*",
    "*://www.gruble.de/*",
    "*://searx.oloke.xyz/*",
    "*://search.serpensin.com/*",
    "*://searxng.fishfvch.com/*",
    "*://search.privacyredirect.com/*",
    "*://searxng.gr/*",
    "*://search.url4irl.com/*",
    "*://search.chocolatemoo53.com/*",
    "*://searx.sev.monster/*",
    "*://search.sapti.me/*",
    "*://baresearch.org/*",
    "*://find.xenorio.xyz/*",
    "*://search.anoni.net/*",
    "*://search.catboy.house/*",
    "*://search.ethibox.fr/*",
    "*://search.im-in.space/*",
    "*://search.indst.eu/*",
    "*://search.internetsucks.net/*",
    "*://search.pereira.is/*",
    "*://search.rowie.at/*",
    "*://search.zina.dev/*",
    "*://searx.ankha.ac/*",
    "*://searx.perennialte.ch/*",
    "*://searx.tsmdt.de/*",
    "*://searx.tuxcloud.net/*",
    "*://searxng.gdebest.net/*",
    "*://seek.fyi/*",
    "*://search.unredacted.org/*",
    "*://searx.dresden.network/*",
    "*://paulgo.io/*",
    "*://searx.mxchange.org/*",
    "*://search.undertale.uk/*",
    "*://searx.mbuf.net/*",
    "*://sx.catgirl.cloud/*"
];

const resources = Object.assign([
    '*.mp3', '*.png', '*.jpg', '*.gif', '*.ttf', '*.svg', '*.wav', '*.webp',
    'page.js', 'SignalsmithStretch.min.js', 'search_album_redirect_injection.js'
], (nodeEnv !== 'production' ? ["*.map"] : []));

const manifest = Object.assign({
    manifest_version: manifestVersion,
    name: '__MSG_extName__',
    short_name: 'VK Blue',
    description: '__MSG_extDescription__',
    version: '0.7.7',
    version_name: '0.7.7',
    author: 'hadaev.ivan@gmail.com',
    default_locale: 'ru',
    homepage_url: 'https://vk.ru/blue_player',
    icons: {
        '128': 'icon-128.png',
    },
    background: manifestVersion == 2 ? {
        scripts: ['background.js']
    } : {
        service_worker: "serviceWorker.js"
    },
    [manifestVersion == 2 ? 'browser_action' : 'action']: {
        default_icon: 'icon-128.png',
        default_title: '__MSG_extDefaultTitle__',
    },
    content_scripts: [
        {
            run_at: 'document_start',
            matches: ['*://vk.com/*', '*://vk.ru/*'],
            css: ['content.css'],
            js: ['inject.js', 'content.js'],
        },
    ],
    permissions: manifestVersion == 2 ? [...permissions, ...hostPermissions] : permissions,


}, manifestVersion == 2 ? {
    web_accessible_resources: resources,
    content_security_policy: "script-src 'self' https://ssl.google-analytics.com; object-src 'self'",
} : {
    host_permissions: hostPermissions,
    web_accessible_resources: [
        {
            resources: resources,
            matches: [
                "<all_urls>"
            ]
        }
    ],
    content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'"
    },
});

if (process.env.BROWSER === 'chrome') {
    manifest.minimum_chrome_version = manifestVersion == 2 ? '40' : '88';
    if (process.env.MANIFEST_KEY) {
        manifest.key = process.env.MANIFEST_KEY
    }
}

module.exports = manifest;
