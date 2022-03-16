import AudioStream from 'classes/snapcontrol/AudioStream';
import TimeProvider from 'classes/snapcontrol/TimePro'
import Decoder from 'classes/snapcontrol/decoders/Decoder';
import FlacDecoder from 'classes/snapcontrol/decoders/FlacDecoder';
import OpusDecoder from 'classes/snapcontrol/decoders/OpusDecoder';
import PcmDecoder from 'classes/snapcontrol/decoders/PcmDecoder';
import CodecMessage from 'classes/snapcontrol/messages/CodecMessage';
import HelloMessage from 'classes/snapcontrol/messages/HelloMessage';
import SampleFormat from 'classes/snapcontrol/SampleFormat';
import PcmChunkMessage from 'classes/snapcontrol/messages/PcmChunkMessage';
import BaseMessage from 'classes/snapcontrol/messages/BaseMessage';
import PlayBuffer from 'classes/snapcontrol/PlayBuffer';
import TimeMessage from 'classes/snapcontrol/messages/TimeMessage';
import ServerSettingsMessage from 'classes/snapcontrol/messages/ServerSettingsMessage';
import TV from 'classes/snapcontrol/TV';
import AudioContext from 'types/snapcontrol/AudioContext';
import storage from 'localforage'
import configureStore from 'state/snapserverStore'
import { setMyClientId } from 'state/snapserverSlice';

function getChromeVersion(): number | null {
    const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2]) : null;
}

function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class SnapStream {
    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl;
        this.timeProvider = new TimeProvider();

        if (this.setupAudioContext()) {
        } else {
            alert("Sorry, but the Web Audio API is not supported by your browser");
        }
    }

    private setupAudioContext(): boolean {
        let AudioContext = (window.AudioContext) // Default
            || window['webkitAudioContext'] // Safari and old versions of Chrome
            || false;
        console.log(AudioContext)

        if (AudioContext) {
            let options: AudioContextOptions | undefined;
            options = { latencyHint: "playback", sampleRate: this.sampleFormat ? this.sampleFormat.rate : undefined };

            const chromeVersion = getChromeVersion();
            if ((chromeVersion !== null && chromeVersion < 55) || !window.AudioContext) {
                // Some older browsers won't decode the stream if options are provided.
                options = undefined;
            }

            this.ctx = new AudioContext(options);
            this.gainNode = this.ctx.createGain();
            this.gainNode.connect(this.ctx.destination);
        } else {
            // Web Audio API is not supported
            return false;
        }
        return true;
    }

    public static async getClientId(): Promise<string> {
        const { store } = configureStore()
        let clientId = store.getState().myClientId
        if (!clientId) {
            clientId = uuidv4()
            store.dispatch(setMyClientId(clientId))
        }
        return clientId
    }

    connect() {
        this.streamsocket = new WebSocket(this.baseUrl);
        this.streamsocket.binaryType = "arraybuffer";
        this.streamsocket.onmessage = (ev) => this.onMessage(ev);

        this.streamsocket.onopen = async () => {
            console.log("on open");
            let hello = new HelloMessage();

            hello.mac = "00:00:00:00:00:00";
            hello.arch = "web";
            hello.os = navigator.platform;
            hello.hostname = "Snapweb client";
            hello.uniqueId = await SnapStream.getClientId();
            const versionElem = null // document.getElementsByTagName("meta").namedItem("version");
            hello.version = versionElem ? versionElem.content : "0.0.0";

            this.sendMessage(hello);
            this.syncTime();
            this.syncHandle = window.setInterval(() => this.syncTime(), 1000);
        }
        this.streamsocket.onerror = (ev) => { console.error('error:', ev); };
        this.streamsocket.onclose = () => {
            window.clearInterval(this.syncHandle);
            console.info('connection lost, reconnecting in 1s');
            setTimeout(() => this.connect(), 1000);
        }
    }

    private onMessage(msg: MessageEvent) {
        let view = new DataView(msg.data);
        let type = view.getUint16(0, true);
        if (type == 1) {
            let codec = new CodecMessage(msg.data);
            console.log("Codec: " + codec.codec);
            if (codec.codec == "flac") {
                this.decoder = new FlacDecoder();
            } else if (codec.codec == "pcm") {
                this.decoder = new PcmDecoder();
            } else if (codec.codec == "opus") {
                this.decoder = new OpusDecoder();
                alert("Codec not supported: " + codec.codec);
            } else {
                alert("Codec not supported: " + codec.codec);
            }
            if (this.decoder) {
                this.sampleFormat = this.decoder.setHeader(codec.payload)!;
                console.log("Sampleformat: " + this.sampleFormat.toString());
                if ((this.sampleFormat.channels != 2) || (this.sampleFormat.bits != 16)) {
                    alert("Stream must be stereo with 16 bit depth, actual format: " + this.sampleFormat.toString());
                } else {
                    if (this.bufferDurationMs != 0) {
                        this.bufferFrameCount = Math.floor(this.bufferDurationMs * this.sampleFormat.msRate());
                    }

                    if (window.AudioContext) {
                        // we are not using webkitAudioContext, so it's safe to setup a new AudioContext with the new samplerate
                        // since this code is not triggered by direct user input, we cannt create a webkitAudioContext here
                        this.stopAudio();
                        this.setupAudioContext();
                    }

                    this.ctx.resume();
                    this.timeProvider.setAudioContext(this.ctx);
                    this.gainNode.gain.value = this.serverSettings!.muted ? 0 : this.serverSettings!.volumePercent / 100;
                    // this.timeProvider = new TimeProvider(this.ctx);
                    this.stream = new AudioStream(this.timeProvider, this.sampleFormat, this.bufferMs);
                    this.latency = (this.ctx.baseLatency !== undefined ? this.ctx.baseLatency : 0) + (this.ctx.outputLatency !== undefined ? this.ctx.outputLatency : 0)
                    console.log("Base latency: " + this.ctx.baseLatency + ", output latency: " + this.ctx.outputLatency + ", latency: " + this.latency);
                    this.play();
                }
            }
        } else if (type == 2) {
            let pcmChunk = new PcmChunkMessage(msg.data, this.sampleFormat as SampleFormat);
            if (this.decoder) {
                let decoded = this.decoder.decode(pcmChunk);
                if (decoded) {
                    this.stream!.addChunk(decoded);
                }
            }
        } else if (type == 3) {
            this.serverSettings = new ServerSettingsMessage(msg.data);
            this.gainNode.gain.value = this.serverSettings.muted ? 0 : this.serverSettings.volumePercent / 100;
            this.bufferMs = this.serverSettings.bufferMs - this.serverSettings.latency;
            console.log("ServerSettings bufferMs: " + this.serverSettings.bufferMs + ", latency: " + this.serverSettings.latency + ", volume: " + this.serverSettings.volumePercent + ", muted: " + this.serverSettings.muted);
        } else if (type == 4) {
            if (this.timeProvider) {
                let time = new TimeMessage(msg.data);
                this.timeProvider.setDiff(time.latency.getMilliseconds(), this.timeProvider.now() - time.sent.getMilliseconds());
            }
            // console.log("Time sec: " + time.latency.sec + ", usec: " + time.latency.usec + ", diff: " + this.timeProvider.diff);
        } else {
            console.info("Message not handled, type: " + type);
        }
    }

    private sendMessage(msg: BaseMessage) {
        msg.sent = new TV(0, 0);
        msg.sent.setMilliseconds(this.timeProvider.now());
        msg.id = ++this.msgId;
        if (this.streamsocket.readyState == this.streamsocket.OPEN) {
            this.streamsocket.send(msg.serialize());
        }
    }

    private syncTime() {
        let t = new TimeMessage();
        t.latency.setMilliseconds(this.timeProvider.now());
        this.sendMessage(t);
        // console.log("prepareSource median: " + Math.round(this.median * 10) / 10);
    }

    private stopAudio() {
        // if (this.ctx) {
        //     this.ctx.close();
        // }
        this.ctx.suspend();
        while (this.audioBuffers.length > 0) {
            let buffer = this.audioBuffers.pop();
            buffer!.onended = () => { };
            buffer!.source.stop();
        }
        while (this.freeBuffers.length > 0) {
            this.freeBuffers.pop();
        }
    }

    public stop() {
        window.clearInterval(this.syncHandle);
        this.stopAudio();
        if ([WebSocket.OPEN, WebSocket.CONNECTING].includes(this.streamsocket.readyState)) {
            this.streamsocket.onclose = () => { };
            this.streamsocket.close();
        }
    }

    public play() {
        this.playTime = this.timeProvider.nowSec() + 0.1;
        for (let i = 1; i <= this.audioBufferCount; ++i) {
            this.playNext();
        }
    }

    public playNext() {
        let buffer = this.freeBuffers.pop() || this.ctx!.createBuffer(this.sampleFormat!.channels, this.bufferFrameCount, this.sampleFormat!.rate);
        let playTimeMs = (this.playTime + this.latency) * 1000 - this.bufferMs;
        this.stream!.getNextBuffer(buffer, playTimeMs);

        let source = this.ctx!.createBufferSource();
        let playBuffer = new PlayBuffer(buffer, this.playTime, source, this.gainNode!);
        this.audioBuffers.push(playBuffer);
        playBuffer.num = ++this.bufferNum;
        playBuffer.onended = (buffer: PlayBuffer) => {
            // let diff = this.timeProvider.nowSec() - buffer.playTime;
            this.freeBuffers.push(this.audioBuffers.splice(this.audioBuffers.indexOf(buffer), 1)[0].buffer);
            // console.debug("PlayBuffer " + playBuffer.num + " ended after: " + (diff * 1000) + ", in flight: " + this.audioBuffers.length);
            this.playNext();
        }
        playBuffer.start();
        this.playTime += this.bufferFrameCount / (this.sampleFormat as SampleFormat).rate;
    }

    baseUrl: string;
    streamsocket!: WebSocket;
    playTime: number = 0;
    msgId: number = 0;
    bufferDurationMs: number = 80; // 0;
    bufferFrameCount: number = 3844; // 9600; // 2400;//8192;
    syncHandle: number = -1;
    // ageBuffer: Array<number>;
    audioBuffers: Array<PlayBuffer> = new Array<PlayBuffer>();
    freeBuffers: Array<AudioBuffer> = new Array<AudioBuffer>();

    timeProvider: TimeProvider;
    stream: AudioStream | undefined;
    ctx!: AudioContext; // | undefined;
    gainNode!: GainNode;
    serverSettings: ServerSettingsMessage | undefined;
    decoder: Decoder | undefined;
    sampleFormat: SampleFormat | undefined;

    // median: number = 0;
    audioBufferCount: number = 3;
    bufferMs: number = 1000;
    bufferNum: number = 0;

    latency: number = 0;
}
export default SnapStream