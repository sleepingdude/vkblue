const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const browser = process.argv[2];

if (!browser) {
    console.error('Usage: node pack.js <chrome|firefox>');
    process.exit(1);
}

const VERSION_SOURCE = 'manifest'; // 'package' | 'manifest'

function getVersion() {
    switch (VERSION_SOURCE) {
        case 'package':
            return require('./package.json').version;

        case 'manifest': {
            const manifestPath = path.resolve(
                `./build/${browser}/prod/manifest.json`
            );

            if (!fs.existsSync(manifestPath)) {
                throw new Error(`Manifest not found: ${manifestPath}`);
            }

            return JSON.parse(
                fs.readFileSync(manifestPath, 'utf8')
            ).version;
        }

        default:
            throw new Error(
                `Unknown VERSION_SOURCE: ${VERSION_SOURCE}`
            );
    }
}

const version = getVersion();

const source = path.resolve(`./build/${browser}/prod`);
const output = path.resolve(
    `./build/vk-blue-${version}_${browser}.zip`
);

if (!fs.existsSync(source)) {
    console.error(`Build directory not found: ${source}`);
    process.exit(1);
}

const stream = fs.createWriteStream(output);
const archive = archiver('zip', {
    zlib: { level: 9 }
});

stream.on('close', () => {
    console.log(
        `Created ${output} (${archive.pointer()} bytes)`
    );
});

archive.on('error', err => {
    throw err;
});

archive.pipe(stream);

archive.directory(source, false);

archive.finalize();