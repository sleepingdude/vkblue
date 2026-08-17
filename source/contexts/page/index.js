import '../../modules/subscribeToGroup/page';
import { getNestedValue } from '../../utils/js-utils';

const EVENT_TYPES = ['play', 'pause', 'stop', 'playing'];
const activeAudios = new Set();

const getCurrentAudio = () => {
    let currentAudioElement = null;
    //old vk:
    currentAudioElement = (window?.ap?._impl?._currentAudioEl?.audioElement
        ? window?.ap?._impl?._currentAudioEl?.audioElement
        : window?.ap?._impl?._currentAudioEl) || null;

    //new vk:
    if (!currentAudioElement) {
        currentAudioElement = getNestedValue(window.ap._impl, '*__currentNode.*__element', {
            regExp: true,
            ownPropertyNames: true
        }) || null;
    }

    return currentAudioElement;
};
const postMessage = (type, audioId) => {
    const message = { type: 'CURRENT_AUDIO', eventType: type, audioId };

    window.postMessage(message, window.location.origin);
};

let prevTimestampOfTimeupdate = 0;

const _Audio = window.Audio;
window.Audio = function (src) {
    const audio = new _Audio(src);

    const id = '' + Date.now() + '_' + Math.random();
    audio.setAttribute('id', id);

    activeAudios.add(audio);

    document.head.appendChild(audio);

    EVENT_TYPES.forEach(eventName => {
        audio.addEventListener(eventName, function (event) {
            const currentAudio = getCurrentAudio();

            if (currentAudio === event.target) {
                postMessage(event.type, currentAudio.id);
            }
        });
    });

    audio.addEventListener('timeupdate', function (event) {
        const currentAudio = getCurrentAudio();

        if (currentAudio === event.target) {
            const now = Date.now();
            const diff = now - prevTimestampOfTimeupdate;

            if (diff > 1000) {
                postMessage(event.type, currentAudio.id);
                prevTimestampOfTimeupdate = now;
            }
        }
    });

    return audio;
};

let _createMediaElementSource = window.AudioContext.prototype.createMediaElementSource;

window.AudioContext.prototype.createMediaElementSource = function (audio) {
    let mediaSource;
    //try {
    mediaSource = _createMediaElementSource.call(this, audio);
    // } catch (error) {
    //     mediaSource = _createMediaElementSource.call(this, new _Audio());
    // }

    return mediaSource;
};
