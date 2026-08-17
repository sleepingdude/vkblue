import browser from 'webextension-polyfill';
import { FFT_SIZE, reduce } from './reduce';

let audioContext: AudioContext;

let mediaElementSource: MediaElementAudioSourceNode;
const mediaElementSourceCache = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
let mainInputNode: GainNode;

let firstBiquadFilter: BiquadFilterNode;
let secondBiquadFilter: BiquadFilterNode;
let thirdBiquadFilter: BiquadFilterNode;
let fourthBiquadFilter: BiquadFilterNode;
let fifthBiquadFilter: BiquadFilterNode;
let sixthBiquadFilter: BiquadFilterNode;
let seventhBiquadFilter: BiquadFilterNode;
let eighthBiquadFilter: BiquadFilterNode;
let ninthBiquadFilter: BiquadFilterNode;
let tenthBiquadFilter: BiquadFilterNode;

let channelSplitterNode: ChannelSplitterNode;
let channelMergerNode: ChannelMergerNode;
let centerChannelMergerNode: ChannelMergerNode;
let subChannelMergerNode: ChannelMergerNode;
let surroundInputNode: GainNode;
let surroundOutputNode: GainNode;
let defaultChannelCount: number;

let convolverNode: ConvolverNode;
let dryGainNode: GainNode;
let wetGainNode: GainNode;
let convolverOutputNode: GainNode;

let analyserNode: AnalyserNode;
let analyserBuffer: Uint8Array;
let analyserRafId: number | null = null;
let analyserRunning = false;

let dynamicsCompressorNode: DynamicsCompressorNode;

let pitchInputNode: GainNode;
let pitchOutputNode: GainNode;
let pitchNode: AudioWorkletNode | null = null;
let pitchReady = false;
let pitchInitPromise: Promise<void> | null = null;

let currentAudio: HTMLAudioElement | null = null;

let currentPitchSettings: PitchSettings = {
    pitchValueSemitones: 0,
    pitchValueCents: 0,
    windowSizeMilliseconds: 120,
    applySmartProcessing: true,
    speedUnits: 0,
    speedFine: 0,
    preservePitch: true,
};


export const analyserListeners: ((buffer: Float32Array) => Float32Array)[] = [];

type BiquadFilterConfig = {
    frequency: number;
    gain: number;
    type: BiquadFilterType;
    q?: number;
};

export type PitchSettings = {
    pitchValueSemitones: number;
    pitchValueCents: number;
    windowSizeMilliseconds: number;
    applySmartProcessing: boolean;
    speedUnits: number;
    speedFine: number;
    preservePitch: boolean;
};

export const biquadFilterConfigs: BiquadFilterConfig[] = [
    { frequency: 31.5, gain: 0, type: 'lowshelf' },
    { frequency: 63, gain: 0, type: 'peaking', q: 1.414214 },
    { frequency: 125, gain: 0, type: 'peaking', q: 1.414214 },
    { frequency: 250, gain: 0, type: 'peaking', q: 1.414214 },
    { frequency: 500, gain: 0, type: 'peaking', q: 1.414214 },
    { frequency: 1000, gain: 0, type: 'peaking', q: 1.414214 },
    { frequency: 2000, gain: 0, type: 'peaking', q: 1.414214 },
    { frequency: 4000, gain: 0, type: 'peaking', q: 1.414214 },
    { frequency: 8000, gain: 0, type: 'peaking', q: 1.414214 },
    { frequency: 16000, gain: 0, type: 'highshelf' },
];

const updateBiquadFilter: (
    biquadFilterNode: BiquadFilterNode,
    biquadFilterConfig: BiquadFilterConfig,
) => BiquadFilterNode = (biquadFilterNode, biquadFilterConfig) => {
    biquadFilterNode.frequency.value = biquadFilterConfig.frequency;
    biquadFilterNode.type = biquadFilterConfig.type;

    if (biquadFilterConfig.q) {
        biquadFilterNode.Q.value = biquadFilterConfig.q;
    }

    return biquadFilterNode;
};

export type EqualizerSettings = {
    equalizer: boolean;
    equalizerSurround: boolean;
    equalizerEffects: boolean;
    equalizerAnalyser: boolean;
    equalizerCompressor: boolean;
    equalizerCompressorThreshold: number;
    equalizerCompressorKnee: number;
    equalizerCompressorRatio: number;
    equalizerCompressorAttack: number;
    equalizerCompressorRelease: number;
};

export const initEqualizer = (audio: HTMLAudioElement, config: EqualizerSettings) => {
    console.log('INIT_EQUALIZER', config, audio);
    if (!config.equalizer) return;

    audioContext = new AudioContext();
    mainInputNode = audioContext.createGain();

    pitchInputNode = audioContext.createGain();
    pitchOutputNode = audioContext.createGain();

    mainInputNode.connect(pitchInputNode);

    routePitch();

    updateAudio(audio);

    void updatePitchSettings(currentPitchSettings);

    let lastNode: AudioNode = pitchOutputNode;//mainInputNode;

    firstBiquadFilter = audioContext.createBiquadFilter();
    secondBiquadFilter = audioContext.createBiquadFilter();
    thirdBiquadFilter = audioContext.createBiquadFilter();
    fourthBiquadFilter = audioContext.createBiquadFilter();
    fifthBiquadFilter = audioContext.createBiquadFilter();
    sixthBiquadFilter = audioContext.createBiquadFilter();
    seventhBiquadFilter = audioContext.createBiquadFilter();
    eighthBiquadFilter = audioContext.createBiquadFilter();
    ninthBiquadFilter = audioContext.createBiquadFilter();
    tenthBiquadFilter = audioContext.createBiquadFilter();

    updateBiquadFilter(firstBiquadFilter, biquadFilterConfigs[0]);
    updateBiquadFilter(secondBiquadFilter, biquadFilterConfigs[1]);
    updateBiquadFilter(thirdBiquadFilter, biquadFilterConfigs[2]);
    updateBiquadFilter(fourthBiquadFilter, biquadFilterConfigs[3]);
    updateBiquadFilter(fifthBiquadFilter, biquadFilterConfigs[4]);
    updateBiquadFilter(sixthBiquadFilter, biquadFilterConfigs[5]);
    updateBiquadFilter(seventhBiquadFilter, biquadFilterConfigs[6]);
    updateBiquadFilter(eighthBiquadFilter, biquadFilterConfigs[7]);
    updateBiquadFilter(ninthBiquadFilter, biquadFilterConfigs[8]);
    updateBiquadFilter(tenthBiquadFilter, biquadFilterConfigs[9]);

    firstBiquadFilter.connect(secondBiquadFilter);
    secondBiquadFilter.connect(thirdBiquadFilter);
    thirdBiquadFilter.connect(fourthBiquadFilter);
    fourthBiquadFilter.connect(fifthBiquadFilter);
    fifthBiquadFilter.connect(sixthBiquadFilter);
    sixthBiquadFilter.connect(seventhBiquadFilter);
    seventhBiquadFilter.connect(eighthBiquadFilter);
    eighthBiquadFilter.connect(ninthBiquadFilter);
    ninthBiquadFilter.connect(tenthBiquadFilter);

    lastNode.connect(firstBiquadFilter);
    lastNode = tenthBiquadFilter;

    if (config.equalizerSurround) {
        defaultChannelCount = audioContext.destination.channelCount;

        switch (audioContext.destination.maxChannelCount) {
            case 4:
            case 6:
            case 8: {
                channelSplitterNode = audioContext.createChannelSplitter(2);
                channelMergerNode = audioContext.createChannelMerger(8);
                centerChannelMergerNode = audioContext.createChannelMerger(1);
                subChannelMergerNode = audioContext.createChannelMerger(1);

                channelSplitterNode.connect(centerChannelMergerNode, 0, 0);
                channelSplitterNode.connect(centerChannelMergerNode, 1, 0);
                channelSplitterNode.connect(subChannelMergerNode, 0, 0);
                channelSplitterNode.connect(subChannelMergerNode, 1, 0);
                channelSplitterNode.connect(channelMergerNode, 0, 0);
                channelSplitterNode.connect(channelMergerNode, 1, 1);
                centerChannelMergerNode.connect(channelMergerNode, 0, 2);
                subChannelMergerNode.connect(channelMergerNode, 0, 3);
                channelSplitterNode.connect(channelMergerNode, 0, 4);
                channelSplitterNode.connect(channelMergerNode, 1, 5);
                channelSplitterNode.connect(channelMergerNode, 0, 6);
                channelSplitterNode.connect(channelMergerNode, 1, 7);
                break;
            }
            default: {
                channelSplitterNode = audioContext.createChannelSplitter(2);
                channelMergerNode = audioContext.createChannelMerger(6);
                centerChannelMergerNode = audioContext.createChannelMerger(1);

                channelSplitterNode.connect(centerChannelMergerNode, 0, 0);
                channelSplitterNode.connect(centerChannelMergerNode, 1, 0);

                const fixedCenter = audioContext.createGain();
                fixedCenter.gain.value = 0.2;
                centerChannelMergerNode.connect(fixedCenter, 0);

                channelSplitterNode.connect(channelMergerNode, 0, 0);
                channelSplitterNode.connect(channelMergerNode, 1, 1);
                fixedCenter.connect(channelMergerNode, 0, 2);
                break;
            }
        }

        surroundInputNode = audioContext.createGain();
        surroundOutputNode = audioContext.createGain();

        lastNode.connect(surroundInputNode);
        surroundInputNode.connect(channelSplitterNode);
        channelMergerNode.connect(surroundOutputNode);

        lastNode = surroundOutputNode;
    }

    if (config.equalizerEffects) {
        convolverNode = audioContext.createConvolver();
        convolverOutputNode = audioContext.createGain();
        dryGainNode = audioContext.createGain();
        wetGainNode = audioContext.createGain();

        wetGainNode.gain.value = 0.5;

        lastNode.connect(dryGainNode);
        lastNode.connect(convolverNode);
        convolverNode.connect(wetGainNode);
        dryGainNode.connect(convolverOutputNode);
        wetGainNode.connect(convolverOutputNode);

        lastNode = convolverOutputNode;
    }

    if (config.equalizerAnalyser) {
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = FFT_SIZE;
        analyserBuffer = new Uint8Array(analyserNode?.frequencyBinCount || (FFT_SIZE / 2));

        let smoothFrequencies: Uint8Array = new Uint8Array();
        let smoothStep = 0;

        const sendFrequencies = () => {
            if (analyserListeners.length && mediaElementSource && analyserNode) {
                const mediaEl = mediaElementSource.mediaElement;

                if (!mediaEl.paused) {
                    (analyserNode as any).getByteFrequencyData(analyserBuffer);

                    smoothFrequencies = analyserBuffer.slice();
                    smoothStep = 256;

                    const frequencies = reduce(analyserBuffer);

                    for (let i = 0, length = analyserListeners.length; i < length; i++) {
                        if (typeof analyserListeners[i] === 'function') {
                            setTimeout(analyserListeners[i], 0, frequencies);
                        }
                    }
                } else if (smoothStep > 0) {
                    for (let index = 0, length = analyserBuffer.length; index < length; index++) {
                        const newValue = smoothFrequencies[index] - 1;
                        smoothFrequencies[index] = newValue < 0 ? 0 : newValue;
                    }

                    smoothStep--;

                    const frequencies = reduce(smoothFrequencies);

                    for (let i = 0, length = analyserListeners.length; i < length; i++) {
                        if (typeof analyserListeners[i] === 'function') {
                            setTimeout(analyserListeners[i], 0, frequencies);
                        }
                    }
                }
            }

            analyserRafId = window.requestAnimationFrame(sendFrequencies);
        };

        if (!analyserRunning) {
            analyserRunning = true;
            analyserRafId = window.requestAnimationFrame(sendFrequencies);
        }
        lastNode.connect(analyserNode);
        lastNode = analyserNode;
    }

    if (config.equalizerCompressor) {
        dynamicsCompressorNode = audioContext.createDynamicsCompressor();
        dynamicsCompressorNode.threshold.setValueAtTime(config.equalizerCompressorThreshold, audioContext.currentTime);
        dynamicsCompressorNode.knee.setValueAtTime(config.equalizerCompressorKnee, audioContext.currentTime);
        dynamicsCompressorNode.ratio.setValueAtTime(config.equalizerCompressorRatio, audioContext.currentTime);
        dynamicsCompressorNode.attack.setValueAtTime(config.equalizerCompressorAttack, audioContext.currentTime);
        dynamicsCompressorNode.release.setValueAtTime(config.equalizerCompressorRelease, audioContext.currentTime);

        lastNode.connect(dynamicsCompressorNode);
        lastNode = dynamicsCompressorNode;
    }

    window.document.documentElement.addEventListener('click', () => {
        if (audioContext.state !== 'running') {
            audioContext.resume();
        }
    });

    lastNode.connect(audioContext.destination);
};

export const MAX_BIQUAD_FILTER_VALUE: number = 10;
export const MIN_BIQUAD_FILTER_VALUE: number = -10;

export const updateFilters = (
    first: number, second: number, third: number, fourth: number, fifth: number,
    sixth: number, seventh: number, eighth: number, ninth: number, tenth: number,
) => {
    if (!audioContext) return;

    firstBiquadFilter.gain.value = Math.round(first * MAX_BIQUAD_FILTER_VALUE);
    secondBiquadFilter.gain.value = Math.round(second * MAX_BIQUAD_FILTER_VALUE);
    thirdBiquadFilter.gain.value = Math.round(third * MAX_BIQUAD_FILTER_VALUE);
    fourthBiquadFilter.gain.value = Math.round(fourth * MAX_BIQUAD_FILTER_VALUE);
    fifthBiquadFilter.gain.value = Math.round(fifth * MAX_BIQUAD_FILTER_VALUE);
    sixthBiquadFilter.gain.value = Math.round(sixth * MAX_BIQUAD_FILTER_VALUE);
    seventhBiquadFilter.gain.value = Math.round(seventh * MAX_BIQUAD_FILTER_VALUE);
    eighthBiquadFilter.gain.value = Math.round(eighth * MAX_BIQUAD_FILTER_VALUE);
    ninthBiquadFilter.gain.value = Math.round(ninth * MAX_BIQUAD_FILTER_VALUE);
    tenthBiquadFilter.gain.value = Math.round(tenth * MAX_BIQUAD_FILTER_VALUE);
};

export const updateSurround = (enabled: boolean) => {
    if (!channelSplitterNode) return;

    if (enabled) {
        audioContext.destination.channelCount = audioContext.destination.maxChannelCount;
        surroundInputNode.disconnect();
        channelMergerNode.disconnect();
        surroundInputNode.connect(channelSplitterNode);
        channelMergerNode.connect(surroundOutputNode);
    } else {
        audioContext.destination.channelCount = defaultChannelCount;
        surroundInputNode.disconnect();
        channelMergerNode.disconnect();
        surroundInputNode.connect(surroundOutputNode);
    }
};

let mediaIsConnected: boolean = false;

const handleEmptied = () => {
    mediaElementSource.disconnect();
    mediaIsConnected = false;
};
const handlePlaying = () => {
    if (!mediaIsConnected) {
        mediaElementSource.connect(mainInputNode);
        mediaIsConnected = true;
    }

    applySpeedSettings(mediaElementSource.mediaElement, currentPitchSettings);
};

const handleRateChange = (e: Event) => {
    const el = e.target as HTMLMediaElement | null;
    if (!el) return;

    applySpeedSettings(el as HTMLAudioElement, currentPitchSettings);
};

const handleLoadedMetadata = () => {
    applySpeedSettings(mediaElementSource.mediaElement, currentPitchSettings);
};

export type EqualizerConvolverEffectName = 'ambience' | 'plate' | 'hall' | 'space' | null;

const convolverCache: Map<string, AudioBuffer> = new Map();

export const updateEffectName = (effect: EqualizerConvolverEffectName) => {
    if (!convolverNode) {
        return;
    }
    console.log('EQUALIZER_UPDATE_EFFECT_NAME', effect);

    if (convolverCache.has(effect as string)) {
        convolverNode.buffer = convolverCache.get(effect as string) as any;
        return;
    }

    if (!effect) {
        convolverNode.buffer = null;
        return;
    }

    const sound = browser.runtime.getURL(`sounds/${effect}.wav`);
    fetch(sound)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            return (audioContext as any).decodeAudioData(arrayBuffer);
        })
        .then(audioBufferProxy => {
            convolverCache.set(effect as string, audioBufferProxy as any);
            convolverNode.buffer = audioBufferProxy as any;
        })
        .catch(e => {
            console.error('EQUALIZER_LOAD_EFFECT_FAILED', e);
        });
};

export const updateEffectGain = (gain: number) => {
    if (!wetGainNode) return;
    wetGainNode.gain.value = gain;
};

const calcSpeedPercentage = (units: number, fine: number) => {
    const base = units < 0 ? 100 + units : 100 + 5 * units;
    return (base + fine) / 100;
};

const applySpeedSettings = (mediaEl: HTMLAudioElement, s = currentPitchSettings) => {
    const playbackRate = calcSpeedPercentage(s.speedUnits, s.speedFine);

    if (mediaEl.playbackRate !== playbackRate) {
        mediaEl.playbackRate = playbackRate;
    }
    if (mediaEl.defaultPlaybackRate !== playbackRate) {
        mediaEl.defaultPlaybackRate = playbackRate;
    }

    const preservePitch = !!s.preservePitch;

    if (mediaEl.preservesPitch !== preservePitch) {
        mediaEl.preservesPitch = preservePitch;
    }

    if ('webkitPreservesPitch' in mediaEl && mediaEl.webkitPreservesPitch !== preservePitch) {
        mediaEl.webkitPreservesPitch = preservePitch;
    }

    if ('mozPreservesPitch' in mediaEl && (mediaEl as any).mozPreservesPitch !== preservePitch) {
        (mediaEl as any).mozPreservesPitch = preservePitch;
    }
};

const applyPitchSettingsToNode = () => {
    if (!pitchNode || !pitchReady) return;

    const totalSemitones =
        currentPitchSettings.pitchValueSemitones +
        currentPitchSettings.pitchValueCents / 100;

    console.log('[Pitch] apply', currentPitchSettings, totalSemitones);

    pitchNode.port.postMessage([null, 'configure', {
        blockMs: currentPitchSettings.windowSizeMilliseconds,
        splitComputation: !currentPitchSettings.applySmartProcessing,
    }]);

    pitchNode.port.postMessage([null, 'start', {
        active: true,
        semitones: totalSemitones,
        tonalityHz: 8800,
    }]);
};

const routePitch = () => {
    if (!pitchInputNode || !pitchOutputNode) return;

    try {
        pitchInputNode.disconnect();
    } catch { }

    try {
        pitchNode?.disconnect();
    } catch { }

    if (pitchNode && pitchReady) {
        pitchInputNode.connect(pitchNode);
        pitchNode.connect(pitchOutputNode);
    } else {
        pitchInputNode.connect(pitchOutputNode);
    }
};

const ensurePitchNode = async () => {
    if (!audioContext) return;
    if (pitchNode) return;
    if (pitchInitPromise) return pitchInitPromise;

    pitchInitPromise = (async () => {
        await audioContext.audioWorklet.addModule(
            browser.runtime.getURL('SignalsmithStretch.min.js'),
        );

        pitchNode = new AudioWorkletNode(audioContext, 'signalsmith-stretch', {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [2],
        });

        pitchNode.port.onmessage = (e) => {
            const data = e?.data;
            console.log('[Pitch] worklet msg', data);

            if (data && data[0] === 'ready') {
                pitchReady = true;
                routePitch();
                applyPitchSettingsToNode();
            }
        };

        routePitch();
    })().catch((err) => {
        pitchInitPromise = null;
        console.error('[PitchShifter] init failed:', err);
    });

    return pitchInitPromise;
};

export const updatePitchSettings = async (settings: PitchSettings) => {
    currentPitchSettings = { ...currentPitchSettings, ...settings };

    if (currentAudio) {
        applySpeedSettings(currentAudio, currentPitchSettings);
    }

    if (!audioContext) return;

    await ensurePitchNode();
    applyPitchSettingsToNode();
};

export const updateAudio = (audio: HTMLAudioElement) => {
    currentAudio = audio;

    if (!audioContext) return;

    if (mediaElementSource && (mediaElementSource as any).mediaElement === audio) {
        return;
    }

    if (mediaElementSource) {
        try {
            mediaElementSource.mediaElement.removeEventListener('playing', handlePlaying);
            mediaElementSource.mediaElement.removeEventListener('emptied', handleEmptied);
            mediaElementSource.mediaElement.removeEventListener('ratechange', handleRateChange);
            mediaElementSource.mediaElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        } catch {}

        try {
            mediaElementSource.disconnect();
        } catch { }
    }

    mediaIsConnected = false;

    let source = mediaElementSourceCache.get(audio);
    
    if (!source) {
        try {
            source = audioContext.createMediaElementSource(audio);
            mediaElementSourceCache.set(audio, source);
        } catch (e) {
            console.error('EQUALIZER_GET_SOURCE_FAILED', e);
            return;
        }
    }

    mediaElementSource = source;
    mediaElementSource.connect(mainInputNode);
    mediaIsConnected = true;

    mediaElementSource.mediaElement.addEventListener('playing', handlePlaying);
    mediaElementSource.mediaElement.addEventListener('emptied', handleEmptied);
    mediaElementSource.mediaElement.addEventListener('ratechange', handleRateChange);
    mediaElementSource.mediaElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    applySpeedSettings(audio, currentPitchSettings);
};