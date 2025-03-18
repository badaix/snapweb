import Flac from 'libflacjs/dist/libflac.js'
import { OpusDecoder as WasmOpusDecoder } from 'opus-decoder'
import { getPersistentValue } from './config.ts'
import { AudioContext, IAudioBuffer, IAudioContext, IAudioBufferSourceNode, IGainNode } from 'standardized-audio-context'
import { Logger, LogLevel } from './snapstreamLogger'

const LOGLEVEL = LogLevel.INFO
declare global {
    // declare window.webkitAudioContext for the ts compiler
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}

// declare AudioContext.outputLatency for the ts compiler
interface IAudioContextPatched extends IAudioContext {
    readonly getOutputTimestamp?: () => AudioTimestamp;
    readonly outputLatency: number;
}

class AudioContextPatched extends AudioContext implements IAudioContextPatched {
    get outputLatency(): number {
        const ctx = (<any>this)._nativeAudioContext;
        if (ctx && ctx.outputLatency !== undefined) {
            return ctx.outputLatency;
        }
        return 0;
    }
}

function getChromeVersion(): number | null {
    const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2]) : null;
}

function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
}


class Tv {
    constructor(sec: number, usec: number) {
        this.sec = sec;
        this.usec = usec;
    }

    setMilliseconds(ms: number) {
        this.sec = Math.floor(ms / 1000);
        this.usec = Math.floor(ms * 1000) % 1000000;
    }

    getMilliseconds(): number {
        return this.sec * 1000 + this.usec / 1000;
    }

    sec: number = 0;
    usec: number = 0;
}


class BaseMessage {
    deserialize(buffer: ArrayBuffer) {
        const view = new DataView(buffer);
        this.type = view.getUint16(0, true);
        this.id = view.getUint16(2, true);
        this.refersTo = view.getUint16(4, true);
        this.received = new Tv(view.getInt32(6, true), view.getInt32(10, true));
        this.sent = new Tv(view.getInt32(14, true), view.getInt32(18, true));
        this.size = view.getUint32(22, true);
    }

    serialize(): ArrayBuffer {
        this.size = 26 + this.getSize();
        const buffer = new ArrayBuffer(this.size);
        const view = new DataView(buffer);
        view.setUint16(0, this.type, true);
        view.setUint16(2, this.id, true);
        view.setUint16(4, this.refersTo, true);
        view.setInt32(6, this.sent.sec, true);
        view.setInt32(10, this.sent.usec, true);
        view.setInt32(14, this.received.sec, true);
        view.setInt32(18, this.received.usec, true);
        view.setUint32(22, this.size, true);
        return buffer;
    }

    getSize() {
        return 0;
    }

    type: number = 0;
    id: number = 0;
    refersTo: number = 0;
    received: Tv = new Tv(0, 0);
    sent: Tv = new Tv(0, 0);
    size: number = 0;
}


class CodecMessage extends BaseMessage {
    constructor(buffer?: ArrayBuffer) {
        super();
        this.payload = new ArrayBuffer(0);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 1;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        const view = new DataView(buffer);
        const codecSize = view.getInt32(26, true);
        const decoder = new TextDecoder("utf-8");
        this.codec = decoder.decode(buffer.slice(30, 30 + codecSize));
        const payloadSize = view.getInt32(30 + codecSize, true);
        console.debug("payload size: " + payloadSize);
        this.payload = buffer.slice(34 + codecSize, 34 + codecSize + payloadSize);
        console.debug("payload: " + this.payload);
    }

    codec: string = "";
    payload: ArrayBuffer;
}


class TimeMessage extends BaseMessage {
    constructor(buffer?: ArrayBuffer) {
        super();
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 4;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        const view = new DataView(buffer);
        this.latency = new Tv(view.getInt32(26, true), view.getInt32(30, true));
    }

    serialize(): ArrayBuffer {
        const buffer = super.serialize();
        const view = new DataView(buffer);
        view.setInt32(26, this.latency.sec, true);
        view.setInt32(30, this.latency.usec, true);
        return buffer;
    }

    getSize() {
        return 8;
    }

    latency: Tv = new Tv(0, 0);
}


class JsonMessage extends BaseMessage {
    constructor(buffer?: ArrayBuffer) {
        super();
        if (buffer) {
            this.deserialize(buffer);
        }
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        const view = new DataView(buffer);
        const size = view.getUint32(26, true);
        const decoder = new TextDecoder();
        this.json = JSON.parse(decoder.decode(buffer.slice(30, 30 + size)));
    }

    serialize(): ArrayBuffer {
        const buffer = super.serialize();
        const view = new DataView(buffer);
        const jsonStr = JSON.stringify(this.json);
        view.setUint32(26, jsonStr.length, true);
        const encoder = new TextEncoder();
        const encoded = encoder.encode(jsonStr);
        for (let i = 0; i < encoded.length; ++i)
            view.setUint8(30 + i, encoded[i]);
        return buffer;
    }

    getSize() {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(JSON.stringify(this.json));
        return encoded.length + 4;
        // return JSON.stringify(this.json).length;
    }

    json: any;
}


class HelloMessage extends JsonMessage {
    constructor(buffer?: ArrayBuffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 5;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        this.mac = this.json["MAC"];
        this.hostname = this.json["HostName"];
        this.version = this.json["Version"];
        this.clientName = this.json["ClientName"];
        this.os = this.json["OS"];
        this.arch = this.json["Arch"];
        this.instance = this.json["Instance"];
        this.uniqueId = this.json["ID"];
        this.snapStreamProtocolVersion = this.json["SnapStreamProtocolVersion"];
    }

    serialize(): ArrayBuffer {
        this.json = { "MAC": this.mac, "HostName": this.hostname, "Version": this.version, "ClientName": this.clientName, "OS": this.os, "Arch": this.arch, "Instance": this.instance, "ID": this.uniqueId, "SnapStreamProtocolVersion": this.snapStreamProtocolVersion };
        return super.serialize();
    }

    mac: string = "";
    hostname: string = "";
    version: string = import.meta.env.VITE_APP_VERSION;
    clientName = import.meta.env.VITE_APP_NAME;
    os: string = "";
    arch: string = "web";
    instance: number = 1;
    uniqueId: string = "";
    snapStreamProtocolVersion: number = 2;
}


class ServerSettingsMessage extends JsonMessage {
    constructor(buffer?: ArrayBuffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 3;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        this.bufferMs = this.json["bufferMs"];
        this.latency = this.json["latency"];
        this.volumePercent = this.json["volume"];
        this.muted = this.json["muted"];
    }

    serialize(): ArrayBuffer {
        this.json = { "bufferMs": this.bufferMs, "latency": this.latency, "volume": this.volumePercent, "muted": this.muted };
        return super.serialize();
    }

    bufferMs: number = 0;
    latency: number = 0;
    volumePercent: number = 0;
    muted: boolean = false;
}


class PcmChunkMessage extends BaseMessage {
    constructor(buffer: ArrayBuffer, sampleFormat: SampleFormat) {
        super();
        this.deserialize(buffer);
        this.sampleFormat = sampleFormat;
        this.type = 2;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        const view = new DataView(buffer);
        this.timestamp = new Tv(view.getInt32(26, true), view.getInt32(30, true));
        // this.payloadSize = view.getUint32(34, true);
        this.payload = buffer.slice(38);//, this.payloadSize + 38));// , this.payloadSize);
        // console.log("ts: " + this.timestamp.sec + " " + this.timestamp.usec + ", payload: " + this.payloadSize + ", len: " + this.payload.byteLength);
    }

    readFrames(frames: number): ArrayBuffer {
        let frameCnt = frames;
        const frameSize = this.sampleFormat.frameSize();
        if (this.idx + frames > this.payloadSize() / frameSize)
            frameCnt = (this.payloadSize() / frameSize) - this.idx;
        const begin = this.idx * frameSize;
        this.idx += frameCnt;
        const end = begin + frameCnt * frameSize;
        // console.log("readFrames: " + frames + ", result: " + frameCnt + ", begin: " + begin + ", end: " + end + ", payload: " + this.payload.byteLength);
        return this.payload.slice(begin, end);
    }

    getFrameCount(): number {
        return (this.payloadSize() / this.sampleFormat.frameSize());
    }

    isEndOfChunk(): boolean {
        return this.idx >= this.getFrameCount();
    }

    startMs(): number {
        return this.timestamp.getMilliseconds() + 1000 * (this.idx / this.sampleFormat.rate);
    }

    duration(): number {
        return 1000 * ((this.getFrameCount() - this.idx) / this.sampleFormat.rate);
    }

    payloadSize(): number {
        return this.payload.byteLength;
    }

    clearPayload(): void {
        this.payload = new ArrayBuffer(0);
    }

    addPayload(buffer: ArrayBuffer) {
        const payload = new ArrayBuffer(this.payload.byteLength + buffer.byteLength);
        const view = new DataView(payload);
        const viewOld = new DataView(this.payload);
        const viewNew = new DataView(buffer);
        for (let i = 0; i < viewOld.byteLength; ++i) {
            view.setInt8(i, viewOld.getInt8(i));
        }
        for (let i = 0; i < viewNew.byteLength; ++i) {
            view.setInt8(i + viewOld.byteLength, viewNew.getInt8(i));
        }
        this.payload = payload;
    }

    timestamp: Tv = new Tv(0, 0);
    // payloadSize: number = 0;
    payload: ArrayBuffer = new ArrayBuffer(0);
    idx: number = 0;
    sampleFormat: SampleFormat;
}


class AudioStream {
    private logger: Logger;

    constructor(public _timeProvider: TimeProvider, public _sampleFormat: SampleFormat, public _bufferMs: number) {
        this.logger = new Logger('AudioStream', LOGLEVEL);
    }

    chunks: Array<PcmChunkMessage> = new Array<PcmChunkMessage>();

    setVolume(percent: number, muted: boolean) {
      // let base = 10;
      this.volume = percent / 100; // (Math.pow(base, percent / 100) - 1) / (base - 1);
      this.logger.debug(
        "setVolume:",
        percent,
        "=>",
        this.volume,
        "muted:",
        muted
      );
      this.muted = muted;
    }

    addChunk(chunk: PcmChunkMessage) {
        this.chunks.push(chunk);
        // let oldest = this.timeProvider.serverNow() - this.chunks[0].timestamp.getMilliseconds();
        // let newest = this.timeProvider.serverNow() - this.chunks[this.chunks.length - 1].timestamp.getMilliseconds();
        // console.debug("chunks: " + this.chunks.length + ", oldest: " + oldest.toFixed(2) + ", newest: " + newest.toFixed(2));

        while (this.chunks.length > 0) {
            const age = this._timeProvider.serverNow() - this.chunks[0].timestamp.getMilliseconds();
            // todo: consider buffer ms
            if (age > 5000 + this._bufferMs) {
                this.chunks.shift();
                this.logger.debug("Dropping old chunk:", age.toFixed(2), "left:", this.chunks.length);
            }
            else
                break;
        }
    }

    getNextBuffer(buffer: AudioBuffer, playTimeMs: number) {
        if (!this.chunk) {
            this.chunk = this.chunks.shift()
        }
        // let age = this.timeProvider.serverTime(this.playTime * 1000) - startMs;
        const frames = buffer.length;
        // console.debug("getNextBuffer: " + frames + ", play time: " + playTimeMs.toFixed(2));
        const left = new Float32Array(frames);
        const right = new Float32Array(frames);
        let read = 0;
        let pos = 0;
        // let volume = this.muted ? 0 : this.volume;
        const serverPlayTimeMs = this._timeProvider.serverTime(playTimeMs);
        if (this.chunk) {
            let age = serverPlayTimeMs - this.chunk.startMs();
            const reqChunkDuration = frames / this._sampleFormat.msRate();
            const secs = Math.floor(Date.now() / 1000);
            if (this.lastLog !== secs) {
                this.lastLog = secs;
                this.logger.debugRaw("age:", age.toFixed(2), "req:", reqChunkDuration);
            }
            if (age < -reqChunkDuration) {
                this.logger.debug("age:", age.toFixed(2), "<", reqChunkDuration * -1, "chunk.startMs:", this.chunk.startMs().toFixed(2), "timestamp:", this.chunk.timestamp.getMilliseconds().toFixed(2));
                this.logger.debug("Chunk too young, returning silence");
            } else {
                if (Math.abs(age) > 5) {
                    // We are 5ms apart, do a hard sync, i.e. don't play faster/slower,
                    // but seek to the desired position instead
                    while (this.chunk && age > this.chunk.duration()) {
                        this.logger.debug("Chunk too old, dropping (age:", age.toFixed(2), ">", this.chunk.duration().toFixed(2), ")");
                        this.chunk = this.chunks.shift();
                        if (!this.chunk)
                            break;
                        age = serverPlayTimeMs - (this.chunk as PcmChunkMessage).startMs();
                    }
                    if (this.chunk) {
                        if (age > 0) {
                            this.logger.debug("Fast forwarding", age.toFixed(2) + "ms");
                            this.chunk.readFrames(Math.floor(age * this.chunk.sampleFormat.msRate()));
                        }
                        else if (age < 0) {
                            this.logger.debug("Playing silence", (-age).toFixed(2) + "ms");
                            const silentFrames = Math.floor(-age * this.chunk.sampleFormat.msRate());
                            left.fill(0, 0, silentFrames);
                            right.fill(0, 0, silentFrames);
                            read = silentFrames;
                            pos = silentFrames;
                        }
                        age = 0;
                    }
                }
                // else if (age > 0.1) {
                //     let rate = age * 0.0005;
                //     rate = 1.0 - Math.min(rate, 0.0005);
                //     console.debug("Age > 0, rate: " + rate);
                //     // we are late (age > 0), this means we are not playing fast enough
                //     // => the real sample rate seems to be lower, we have to drop some frames
                //     this.setRealSampleRate(this.sampleFormat.rate * rate); // 0.9999);
                // }
                // else if (age < -0.1) {
                //     let rate = -age * 0.0005;
                //     rate = 1.0 + Math.min(rate, 0.0005);
                //     console.debug("Age < 0, rate: " + rate);
                //     // we are early (age > 0), this means we are playing too fast
                //     // => the real sample rate seems to be higher, we have to insert some frames
                //     this.setRealSampleRate(this.sampleFormat.rate * rate); // 0.9999);
                // }
                // else {
                //     this.setRealSampleRate(this.sampleFormat.rate);
                // }


                let addFrames = 0;
                let everyN = 0;
                if (age > 0.1) {
                    addFrames = Math.ceil(age);
                } else if (age < -0.1) {
                    addFrames = Math.floor(age);
                }
                // addFrames = -2;
                const readFrames = frames + addFrames - read;
                if (addFrames !== 0)
                    everyN = Math.ceil((frames + addFrames - read) / (Math.abs(addFrames) + 1));

                // addFrames = 0;
                // console.debug("frames: " + frames + ", readFrames: " + readFrames + ", addFrames: " + addFrames + ", everyN: " + everyN);
                while ((read < readFrames) && this.chunk) {
                    const pcmChunk = this.chunk as PcmChunkMessage;
                    const pcmBuffer = pcmChunk.readFrames(readFrames - read);
                    const normalize: number = 2 ** pcmChunk.sampleFormat.bits;
                    let payload: any;
                    if (pcmChunk.sampleFormat.bits >= 24)
                        payload = new Int32Array(pcmBuffer);
                    else
                        payload = new Int16Array(pcmBuffer);
                    // this.logger.debug("readFrames: " + (frames - read) + ", read: " + pcmBuffer.byteLength + ", payload: " + payload.length);
                    // read += (pcmBuffer.byteLength / this.sampleFormat.frameSize());
                    for (let i = 0; i < payload.length; i += 2) {
                        read++;
                        left[pos] = (payload[i] / normalize);
                        right[pos] = (payload[i + 1] / normalize);
                        if ((everyN !== 0) && (read % everyN === 0)) {
                            if (addFrames > 0) {
                                pos--;
                            } else {
                                left[pos + 1] = left[pos];
                                right[pos + 1] = right[pos];
                                pos++;
                                this.logger.debug("Add: " + pos);
                            }
                        }
                        pos++;
                    }
                    if (pcmChunk.isEndOfChunk()) {
                        this.chunk = this.chunks.shift();
                    }
                }
                if (addFrames !== 0)
                    this.logger.debugRaw("Pos:", pos, "frames:", frames, "add:", addFrames, "everyN:", everyN);
                if (read === readFrames)
                    read = frames;
            }
        }

        if (read < frames) {
            this.logger.debug("Failed to get chunk, read:", read + "/" + frames, "chunks left:", this.chunks.length);
            left.fill(0, pos);
            right.fill(0, pos);
        }

        // copyToChannel is not supported by Safari
        buffer.getChannelData(0).set(left);
        buffer.getChannelData(1).set(right);
    }


    // setRealSampleRate(sampleRate: number) {
    //     if (sampleRate == this.sampleFormat.rate) {
    //         this.correctAfterXFrames = 0;
    //     }
    //     else {
    //         this.correctAfterXFrames = Math.ceil((this.sampleFormat.rate / sampleRate) / (this.sampleFormat.rate / sampleRate - 1.));
    //         console.debug("setRealSampleRate: " + sampleRate + ", correct after X: " + this.correctAfterXFrames);
    //     }
    // }


    chunk?: PcmChunkMessage = undefined;
    volume: number = 1;
    muted: boolean = false;
    lastLog: number = 0;
    // correctAfterXFrames: number = 0;
}


class TimeProvider {
    private logger: Logger;

    constructor(ctx?: IAudioContextPatched) {
        this.logger = new Logger('TimeProvider', LOGLEVEL);
        if (ctx) {
            this.setAudioContext(ctx);
        }
    }

    setAudioContext(ctx: IAudioContextPatched) {
        this.ctx = ctx;
        this.reset();
    }

    reset() {
        this.diffBuffer.length = 0;
        this.diff = 0;
    }

    setDiff(c2s: number, s2c: number) {
        if (this.now() === 0) {
            this.reset()
        } else {
            if (this.diffBuffer.push((c2s - s2c) / 2) > 100)
                this.diffBuffer.shift();
            const sorted = [...this.diffBuffer];
            sorted.sort()
            this.diff = sorted[Math.floor(sorted.length / 2)];
        }
        this.logger.debugRaw("c2s:", c2s.toFixed(2), "s2c:", s2c.toFixed(2), "diff:", this.diff.toFixed(2), "now:", this.now().toFixed(2), "server.now:", this.serverNow().toFixed(2), "win.now:", window.performance.now().toFixed(2));
    }

    now() {
        if (!this.ctx) {
            return window.performance.now();
        } else {
            const ctx = this.ctx as IAudioContextPatched;
            // Use the more accurate getOutputTimestamp if available, fallback to ctx.currentTime otherwise.
            const contextTime = ctx.getOutputTimestamp ? ctx.getOutputTimestamp().contextTime : undefined;
            return (contextTime !== undefined ? contextTime : ctx.currentTime) * 1000;
        }
    }

    nowSec() {
        return this.now() / 1000;
    }

    serverNow() {
        return this.serverTime(this.now());
    }

    serverTime(localTimeMs: number) {
        return localTimeMs + this.diff;
    }

    diffBuffer: Array<number> = new Array<number>();
    diff: number = 0;
    ctx?: AudioContext;
}


class SampleFormat {
    rate: number = 48000;
    channels: number = 2;
    bits: number = 16;

    public msRate(): number {
        return this.rate / 1000;
    }

    public toString(): string {
        return this.rate + ":" + this.bits + ":" + this.channels;
    }

    public sampleSize(): number {
        if (this.bits === 24) {
            return 4;
        }
        return this.bits / 8;
    }

    public frameSize(): number {
        return this.channels * this.sampleSize();
    }

    public durationMs(bytes: number) {
        return (bytes / this.frameSize()) * this.msRate();
    }
}


class Decoder {
    setHeader(_buffer: ArrayBuffer): SampleFormat | null {
        return new SampleFormat();
    }

    decode(_chunk: PcmChunkMessage): Promise<PcmChunkMessage | null> | PcmChunkMessage | null {
        return null;
    }
}


class OpusDecoder extends Decoder {
    private logger: Logger;

    constructor() {
        super();
        this.logger = new Logger('OpusDecoder', LOGLEVEL);
        this.sampleFormat = new SampleFormat();
        this.decoder = null;
    }

    async initDecoder() {
        if (!this.decoder) {
            this.decoder = new WasmOpusDecoder();
            await this.decoder.ready;
            await this.decoder.reset();
        }
    }

    setHeader(buffer: ArrayBuffer): SampleFormat | null {
        const view = new DataView(buffer);
        const ID_OPUS = 0x4F505553;
        if (buffer.byteLength < 12) {
            this.logger.error("Opus header too small:", buffer.byteLength);
            return null;
        } else if (view.getUint32(0, true) !== ID_OPUS) {
            this.logger.error("Invalid Opus header magic");
            return null;
        }

        this.sampleFormat.rate = view.getUint32(4, true);
        this.sampleFormat.bits = view.getUint16(8, true);
        this.sampleFormat.channels = view.getUint16(10, true);
        
        this.initDecoder()
            .catch(err => this.logger.error("Failed to initialize Opus decoder:", err));
            
        this.logger.info("Opus sampleformat:", this.sampleFormat.toString());
        return this.sampleFormat;
    }

    async decode(chunk: PcmChunkMessage): Promise<PcmChunkMessage | null> {
        if (!this.decoder) {
            this.logger.error("Opus decoder not initialized");
            return null;
        }

        try {
            const decoded = await this.decoder.decodeFrame(new Uint8Array(chunk.payload));
            
            const bytesPerSample = this.sampleFormat.sampleSize();
            const buffer = new ArrayBuffer(decoded.channelData[0].length * bytesPerSample * this.sampleFormat.channels);
            const view = new DataView(buffer);

            for (let i = 0; i < decoded.channelData[0].length; i++) {
                for (let channel = 0; channel < this.sampleFormat.channels; channel++) {
                    const sample = Math.max(-1, Math.min(1, decoded.channelData[channel][i])) * ((1 << (this.sampleFormat.bits - 1)) - 1);
                    if (bytesPerSample === 4) {
                        view.setInt32((i * this.sampleFormat.channels + channel) * 4, sample, true);
                    } else {
                        view.setInt16((i * this.sampleFormat.channels + channel) * 2, sample, true);
                    }
                }
            }
            
            chunk.clearPayload();
            chunk.addPayload(buffer);
            return chunk;
        } catch (err) {
            this.logger.error("Failed to decode Opus frame:", err);
            return null;
        }
    }

    private decoder: WasmOpusDecoder | null;
    private sampleFormat: SampleFormat;
}


class FlacDecoder extends Decoder {
    private logger: Logger;

    constructor() {
        super();
        this.logger = new Logger('FlacDecoder', LOGLEVEL);
        this.decoder = Flac.create_libflac_decoder(true);
        if (this.decoder) {
            const init_status = Flac.init_decoder_stream(this.decoder, this.read_callback_fn.bind(this), this.write_callback_fn.bind(this), this.error_callback_fn.bind(this), this.metadata_callback_fn.bind(this), false);
            this.logger.info("Init status:", init_status);
            Flac.setOptions(this.decoder, { analyseSubframes: true, analyseResiduals: true });
        }
        this.sampleFormat = new SampleFormat();
        this.flacChunk = new ArrayBuffer(0);
        // this.pcmChunk  = new PcmChunkMessage();

        // Flac.setOptions(this.decoder, {analyseSubframes: analyse_frames, analyseResiduals: analyse_residuals});
        // flac_ok &= init_status == 0;
        // this.logger.debug("flac init     : " + flac_ok);
    }

    decode(chunk: PcmChunkMessage): PcmChunkMessage | null {
        this.logger.debug("Decoding chunk, payload size:", chunk.payload.byteLength);
        this.flacChunk = chunk.payload.slice(0);
        this.pcmChunk = chunk;
        this.pcmChunk!.clearPayload();
        this.cacheInfo = { cachedBlocks: 0, isCachedChunk: true };
        this.logger.debug("Flac chunk length:", this.flacChunk.byteLength);
        
        while (this.flacChunk.byteLength > 0) {
            if (!Flac.FLAC__stream_decoder_process_single(this.decoder)) {
                this.logger.error("Failed to process FLAC frame");
                return null;
            }
            const state = Flac.FLAC__stream_decoder_get_state(this.decoder);
            this.logger.debug("Decoder state:", state);
        }
        
        this.logger.debug("PCM payload size:", this.pcmChunk!.payloadSize());
        if (this.cacheInfo.cachedBlocks > 0) {
            const diffMs = this.cacheInfo.cachedBlocks / this.sampleFormat.msRate();
            this.logger.debug("Cached blocks:", this.cacheInfo.cachedBlocks, "duration:", diffMs + "ms");
            this.pcmChunk!.timestamp.setMilliseconds(this.pcmChunk!.timestamp.getMilliseconds() - diffMs);
        }
        return this.pcmChunk!;
    }

    read_callback_fn(bufferSize: number): Flac.ReadResult | Flac.CompletedReadResult {
        this.logger.debug('Read callback, buffer bytes max:', bufferSize);
        if (this.header) {
            this.logger.debug("Reading header, size:", this.header.byteLength);
            const data = new Uint8Array(this.header);
            this.header = null;
            return { buffer: data, readDataLength: data.byteLength, error: false };
        } else if (this.flacChunk) {
            this.logger.debug("Reading flac chunk:", this.flacChunk.byteLength);
            this.cacheInfo.isCachedChunk = false;
            const data = new Uint8Array(this.flacChunk.slice(0, Math.min(bufferSize, this.flacChunk.byteLength)));
            this.flacChunk = this.flacChunk.slice(data.byteLength);
            return { buffer: data, readDataLength: data.byteLength, error: false };
        }
        return { buffer: new Uint8Array(0), readDataLength: 0, error: false };
    }

    write_callback_fn(data: Array<Uint8Array>, frameInfo: Flac.BlockMetadata) {
        this.logger.debug("Writing frame metadata blocksize:", frameInfo.blocksize, "channels:", frameInfo.channels, "data length:", data.length);
        if (this.cacheInfo.isCachedChunk) {
            // there was no call to read, so it's some cached data
            this.cacheInfo.cachedBlocks += frameInfo.blocksize;
        }
        const payload = new ArrayBuffer(this.sampleFormat.frameSize() * frameInfo.blocksize);
        const view = new DataView(payload);
        for (let channel: number = 0; channel < frameInfo.channels; ++channel) {
            const channelData = new DataView(data[channel].buffer, 0, data[channel].buffer.byteLength);
            this.logger.debug("Channel data size:", channelData.byteLength, "blocksize:", frameInfo.blocksize);
            const sample_size = this.sampleFormat.sampleSize()
            for (let i: number = 0; i < frameInfo.blocksize; ++i) {
                const write_idx = sample_size * (frameInfo.channels * i + channel);
                const read_idx = sample_size * i;
                if (sample_size == 4)
                    view.setInt32(write_idx, channelData.getInt32(read_idx, true), true);
                else
                    view.setInt16(write_idx, channelData.getInt16(read_idx, true), true);
            }
        }
        this.pcmChunk!.addPayload(payload);
        this.logger.debug("Write complete, payload size:", payload.byteLength, "total size:", this.pcmChunk!.payloadSize());
    }

    /** @memberOf decode */
    metadata_callback_fn(data: any) {
        this.logger.info('Metadata:', data);
        this.sampleFormat.rate = data.sampleRate;
        this.sampleFormat.channels = data.channels;
        this.sampleFormat.bits = data.bitsPerSample;
        this.logger.debug("Sample format:", this.sampleFormat.toString());
    }

    /** @memberOf decode */
    error_callback_fn(err: any, errMsg: any) {
        this.logger.error('Error:', err, errMsg);
    }

    setHeader(buffer: ArrayBuffer): SampleFormat | null {
        this.logger.debug("Setting header, size:", buffer.byteLength);
        this.header = buffer.slice(0);
        Flac.FLAC__stream_decoder_process_until_end_of_metadata(this.decoder);
        return this.sampleFormat;
    }

    sampleFormat: SampleFormat;
    decoder: number;
    header: ArrayBuffer | null = null;
    flacChunk: ArrayBuffer;
    pcmChunk?: PcmChunkMessage;

    cacheInfo: { isCachedChunk: boolean, cachedBlocks: number } = { isCachedChunk: false, cachedBlocks: 0 };
}

class PlayBuffer {
    constructor(buffer: IAudioBuffer, playTime: number, source: IAudioBufferSourceNode<IAudioContext>, destination: IGainNode<IAudioContext>) {
        this.buffer = buffer;
        this.playTime = playTime;
        this.source = source;
        this.source.buffer = this.buffer;
        this.source.connect(destination);
        this.onended = (_playBuffer: PlayBuffer) => { };
    }

    public onended: (_playBuffer: PlayBuffer) => void

    start() {
        this.source.onended = () => {
            this.onended(this);
        }
        this.source.start(this.playTime);
    }

    buffer: IAudioBuffer;
    playTime: number;
    source: IAudioBufferSourceNode<IAudioContext>;
    num: number = 0;
}


class PcmDecoder extends Decoder {
    setHeader(buffer: ArrayBuffer): SampleFormat | null {
        const sampleFormat = new SampleFormat();
        const view = new DataView(buffer);
        sampleFormat.channels = view.getUint16(22, true);
        sampleFormat.rate = view.getUint32(24, true);
        sampleFormat.bits = view.getUint16(34, true);
        return sampleFormat;
    }

    decode(chunk: PcmChunkMessage): PcmChunkMessage | null {
        return chunk;
    }
}


class SnapStream {
    private logger: Logger;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.timeProvider = new TimeProvider();
        this.logger = new Logger('SnapStream', LOGLEVEL);

        if (this.setupAudioContext()) {
            this.connect();
        } else {
            alert("Sorry, but the Web Audio API is not supported by your browser");
        }
    }

    public resume() {
        this.ctx.resume();
    }

    private setupAudioContext(): boolean {
        if (AudioContext) {
            let options: AudioContextOptions | undefined;
            options = { latencyHint: "interactive", sampleRate: this.sampleFormat ? this.sampleFormat.rate : undefined };

            const chromeVersion = getChromeVersion();
            if ((chromeVersion !== null && chromeVersion < 55) || !window.AudioContext) {
                // Some older browsers won't decode the stream if options are provided.
                options = undefined;
            }

            this.ctx = new AudioContextPatched(options);
            this.gainNode = this.ctx.createGain();
            this.gainNode.connect(this.ctx.destination);
        } else {
            // Web Audio API is not supported
            return false;
        }
        return true;
    }

    public static getClientId(): string {
        return getPersistentValue("uniqueId", uuidv4());
    }

    private connect() {
        this.streamsocket = new WebSocket(this.baseUrl + '/stream');
        this.streamsocket.binaryType = "arraybuffer";
        this.streamsocket.onmessage = (ev) => this.onMessage(ev);

        this.streamsocket.onopen = () => {
            this.logger.info("WebSocket connection opened");
            const hello = new HelloMessage();

            hello.mac = "00:00:00:00:00:00";
            hello.arch = "web";
            hello.os = navigator?.platform || "unknown";
            hello.hostname = "Snapweb client";
            hello.uniqueId = SnapStream.getClientId();

            this.sendMessage(hello);
            this.syncTime();
            this.syncHandle = window.setInterval(() => this.syncTime(), 1000);
        }
        this.streamsocket.onerror = (ev) => { this.logger.error('WebSocket error:', ev); };
        this.streamsocket.onclose = () => {
            window.clearInterval(this.syncHandle);
            this.logger.info('Connection lost, reconnecting in 1s');
            setTimeout(() => this.connect(), 1000);
        }
    }

    private async onMessage(msg: MessageEvent) {
        const view = new DataView(msg.data);
        const type = view.getUint16(0, true);
        if (type === 1) {
            const codec = new CodecMessage(msg.data);
            this.logger.info("Codec:", codec.codec);
            if (codec.codec === "flac") {
                this.decoder = new FlacDecoder();
            } else if (codec.codec === "pcm") {
                this.decoder = new PcmDecoder();
            } else if (codec.codec === "opus") {
                this.decoder = new OpusDecoder();
            } else {
                alert("Codec not supported: " + codec.codec);
                return;
            }
            if (this.decoder) {
                this.sampleFormat = this.decoder.setHeader(codec.payload)!;
                this.logger.info("Sampleformat:", this.sampleFormat.toString());
                if ((this.sampleFormat.channels !== 2) || (this.sampleFormat.bits < 16)) {
                    alert("Stream must be stereo with 16, 24 or 32 bit depth, actual format: " + this.sampleFormat.toString());
                } else {
                    if (this.bufferDurationMs !== 0) {
                        this.bufferFrameCount = Math.floor(this.bufferDurationMs * this.sampleFormat.msRate());
                    }

                    // NOTE (curiousercreative): this breaks iOS audio output on v15.7.5 at least
                    if (window.AudioContext) {
                        if (this.sampleFormat.rate !== this.ctx.sampleRate.valueOf()) {
                            this.logger.info("Stream samplerate != audio context samplerate (" + this.sampleFormat.rate + " != " + this.ctx.sampleRate.valueOf() + "), switching audio context to " + this.sampleFormat.rate + " Hz")
                            this.stopAudio();
                            this.setupAudioContext();
                        }
                    }

                    this.ctx.resume();
                    this.timeProvider.setAudioContext(this.ctx);
                    this.gainNode.gain.value = this.serverSettings!.muted ? 0 : this.serverSettings!.volumePercent / 100;
                    // this.timeProvider = new TimeProvider(this.ctx);
                    this.stream = new AudioStream(this.timeProvider, this.sampleFormat, this.bufferMs);
                    this.latency = (this.ctx.baseLatency !== undefined ? this.ctx.baseLatency : 0) + (this.ctx.outputLatency !== undefined ? this.ctx!.outputLatency : 0)
                    this.logger.debug("Base latency:", this.ctx.baseLatency, "output latency:", this.ctx!.outputLatency, "latency:", this.latency);
                    this.play();
                }
            }
        } else if (type === 2) {
            const pcmChunk = new PcmChunkMessage(msg.data, this.sampleFormat as SampleFormat);
            if (this.decoder) {
                const decoded = await Promise.resolve(this.decoder.decode(pcmChunk));
                if (decoded) {
                    this.stream!.addChunk(decoded);
                }
            }
        } else if (type === 3) {
            this.serverSettings = new ServerSettingsMessage(msg.data);
            this.gainNode.gain.value = this.serverSettings.muted ? 0 : this.serverSettings.volumePercent / 100;
            this.bufferMs = this.serverSettings.bufferMs - this.serverSettings.latency;
            this.logger.debug("ServerSettings bufferMs:", this.serverSettings.bufferMs, "latency:", this.serverSettings.latency, "volume:", this.serverSettings.volumePercent, "muted:", this.serverSettings.muted);
        } else if (type === 4) {
            if (this.timeProvider) {
                const time = new TimeMessage(msg.data);
                this.timeProvider.setDiff(time.latency.getMilliseconds(), this.timeProvider.now() - time.sent.getMilliseconds());
            }
        } else {
            this.logger.info("Message not handled, type:", type);
        }
    }

    private sendMessage(msg: BaseMessage) {
        msg.sent = new Tv(0, 0);
        msg.sent.setMilliseconds(this.timeProvider.now());
        msg.id = ++this.msgId;
        if (this.streamsocket.readyState === this.streamsocket.OPEN) {
            this.streamsocket.send(msg.serialize());
        }
    }

    private syncTime() {
        const t = new TimeMessage();
        t.latency.setMilliseconds(this.timeProvider.now());
        this.sendMessage(t);
        // this.logger.debugRaw("prepareSource median: " + Math.round(this.median * 10) / 10);
    }

    private stopAudio() {
        // if (this.ctx) {
        //     this.ctx.close();
        // }
        this.ctx.suspend();
        while (this.audioBuffers.length > 0) {
            const buffer = this.audioBuffers.pop();
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
        if (this.streamsocket.readyState === WebSocket.OPEN || this.streamsocket.readyState === WebSocket.CONNECTING) {
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
        const buffer = this.freeBuffers.pop() || this.ctx!.createBuffer(this.sampleFormat!.channels, this.bufferFrameCount, this.sampleFormat!.rate);
        const playTimeMs = (this.playTime + this.latency) * 1000 - this.bufferMs;
        this.stream!.getNextBuffer(buffer, playTimeMs);

        const source = this.ctx!.createBufferSource();
        const playBuffer = new PlayBuffer(buffer, this.playTime, source, this.gainNode!);
        this.audioBuffers.push(playBuffer);
        playBuffer.num = ++this.bufferNum;
        playBuffer.onended = (buffer: PlayBuffer) => {
            // let diff = this.timeProvider.nowSec() - buffer.playTime;
            this.freeBuffers.push(this.audioBuffers.splice(this.audioBuffers.indexOf(buffer), 1)[0].buffer);
            // this.logger.debug("PlayBuffer " + playBuffer.num + " ended after: " + (diff * 1000) + ", in flight: " + this.audioBuffers.length);
            this.playNext();
        }
        playBuffer.start();
        this.playTime += this.bufferFrameCount / (this.sampleFormat as SampleFormat).rate;
    }

    baseUrl: string;
    streamsocket!: WebSocket;
    playTime: number = 0;
    msgId: number = 0;
    bufferDurationMs: number = 80;
    bufferFrameCount: number = 3844;
    syncHandle: number = -1;
    audioBuffers: Array<PlayBuffer> = new Array<PlayBuffer>();
    freeBuffers: Array<AudioBuffer> = new Array<AudioBuffer>();

    timeProvider: TimeProvider;
    stream: AudioStream | undefined;
    ctx!: IAudioContextPatched;
    gainNode!: IGainNode<IAudioContext>;
    serverSettings: ServerSettingsMessage | undefined;
    decoder: Decoder | undefined;
    sampleFormat: SampleFormat | undefined;

    // median: number = 0;
    audioBufferCount: number = 3;
    bufferMs: number = 1000;
    bufferNum: number = 0;

    latency: number = 0;
}

export { SnapStream }
