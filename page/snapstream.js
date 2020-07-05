"use strict";
function setCookie(key, value, exdays = -1) {
    let d = new Date();
    if (exdays < 0)
        exdays = 10 * 365;
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = key + "=" + value + ";" + expires + ";sameSite=Strict;path=/";
}
function getCookie(key, defaultValue = "") {
    let name = key + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let c of ca) {
        c = c.trimLeft();
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    setCookie(key, defaultValue);
    return defaultValue;
}
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
class Tv {
    constructor(sec, usec) {
        this.sec = 0;
        this.usec = 0;
        this.sec = sec;
        this.usec = usec;
    }
    setMilliseconds(ms) {
        this.sec = Math.floor(ms / 1000);
        this.usec = Math.floor(ms * 1000) % 1000000;
    }
    getMilliseconds() {
        return this.sec * 1000 + this.usec / 1000;
    }
}
class BaseMessage {
    constructor(buffer) {
        this.type = 0;
        this.id = 0;
        this.refersTo = 0;
        this.received = new Tv(0, 0);
        this.sent = new Tv(0, 0);
        this.size = 0;
    }
    deserialize(buffer) {
        let view = new DataView(buffer);
        this.type = view.getUint16(0, true);
        this.id = view.getUint16(2, true);
        this.refersTo = view.getUint16(4, true);
        this.received = new Tv(view.getInt32(6, true), view.getInt32(10, true));
        this.sent = new Tv(view.getInt32(14, true), view.getInt32(18, true));
        this.size = view.getUint32(22, true);
    }
    serialize() {
        this.size = 26 + this.getSize();
        let buffer = new ArrayBuffer(this.size);
        let view = new DataView(buffer);
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
}
class CodecMessage extends BaseMessage {
    constructor(buffer) {
        super(buffer);
        this.codec = "";
        this.payload = new ArrayBuffer(0);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 1;
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        let codecSize = view.getInt32(26, true);
        let decoder = new TextDecoder("utf-8");
        this.codec = decoder.decode(buffer.slice(30, 30 + codecSize));
        let payloadSize = view.getInt32(30 + codecSize, true);
        console.log("payload size: " + payloadSize);
        this.payload = buffer.slice(34 + codecSize, 34 + codecSize + payloadSize);
        console.log("payload: " + this.payload);
    }
}
class TimeMessage extends BaseMessage {
    constructor(buffer) {
        super(buffer);
        this.latency = new Tv(0, 0);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 4;
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        this.latency = new Tv(view.getInt32(26, true), view.getInt32(30, true));
    }
    serialize() {
        let buffer = super.serialize();
        let view = new DataView(buffer);
        view.setInt32(26, this.latency.sec, true);
        view.setInt32(30, this.latency.sec, true);
        return buffer;
    }
    getSize() {
        return 8;
    }
}
class JsonMessage extends BaseMessage {
    constructor(buffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        let size = view.getInt32(26, true);
        let decoder = new TextDecoder();
        this.json = JSON.parse(decoder.decode(buffer.slice(30)));
    }
    serialize() {
        let buffer = super.serialize();
        let view = new DataView(buffer);
        let jsonStr = JSON.stringify(this.json);
        view.setUint32(26, jsonStr.length, true);
        let encoder = new TextEncoder();
        let encoded = encoder.encode(jsonStr);
        for (let i = 0; i < encoded.length; ++i)
            view.setUint8(30 + i, encoded[i]);
        return buffer;
    }
    getSize() {
        let encoder = new TextEncoder();
        let encoded = encoder.encode(JSON.stringify(this.json));
        return encoded.length + 4;
        // return JSON.stringify(this.json).length;
    }
}
class HelloMessage extends JsonMessage {
    constructor(buffer) {
        super(buffer);
        this.mac = "";
        this.hostname = "";
        this.version = "0.1.0";
        this.clientName = "Snapweb";
        this.os = "";
        this.arch = "web";
        this.instance = 1;
        this.uniqueId = "";
        this.snapStreamProtocolVersion = 2;
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 5;
    }
    deserialize(buffer) {
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
    serialize() {
        this.json = { "MAC": this.mac, "HostName": this.hostname, "Version": this.version, "ClientName": this.clientName, "OS": this.os, "Arch": this.arch, "Instance": this.instance, "ID": this.uniqueId, "SnapStreamProtocolVersion": this.snapStreamProtocolVersion };
        return super.serialize();
    }
}
class ServerSettingsMessage extends JsonMessage {
    constructor(buffer) {
        super(buffer);
        this.bufferMs = 0;
        this.latency = 0;
        this.volumePercent = 0;
        this.muted = false;
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 3;
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.bufferMs = this.json["bufferMs"];
        this.latency = this.json["latency"];
        this.volumePercent = this.json["volume"];
        this.muted = this.json["muted"];
    }
    serialize() {
        this.json = { "bufferMs": this.bufferMs, "latency": this.latency, "volume": this.volumePercent, "muted": this.muted };
        return super.serialize();
    }
}
class PcmChunkMessage extends BaseMessage {
    constructor(buffer, sampleFormat) {
        super(buffer);
        this.timestamp = new Tv(0, 0);
        // payloadSize: number = 0;
        this.payload = new ArrayBuffer(0);
        this.idx = 0;
        this.deserialize(buffer);
        this.sampleFormat = sampleFormat;
        this.type = 2;
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        this.timestamp = new Tv(view.getInt32(26, true), view.getInt32(30, true));
        // this.payloadSize = view.getUint32(34, true);
        this.payload = buffer.slice(38); //, this.payloadSize + 38));// , this.payloadSize);
        // console.log("ts: " + this.timestamp.sec + " " + this.timestamp.usec + ", payload: " + this.payloadSize + ", len: " + this.payload.byteLength);
    }
    readFrames(frames) {
        let frameCnt = frames;
        let frameSize = this.sampleFormat.frameSize();
        if (this.idx + frames > this.payloadSize() / frameSize)
            frameCnt = (this.payloadSize() / frameSize) - this.idx;
        let begin = this.idx * frameSize;
        this.idx += frameCnt;
        let end = begin + frameCnt * frameSize;
        // console.log("readFrames: " + frames + ", result: " + frameCnt + ", begin: " + begin + ", end: " + end + ", payload: " + this.payload.byteLength);
        return this.payload.slice(begin, end);
    }
    getFrameCount() {
        return (this.payloadSize() / this.sampleFormat.frameSize());
    }
    isEndOfChunk() {
        return this.idx >= this.getFrameCount();
    }
    startMs() {
        return this.timestamp.getMilliseconds() + 1000 * (this.idx / this.sampleFormat.rate);
    }
    payloadSize() {
        return this.payload.byteLength;
    }
    clearPayload() {
        this.payload = new ArrayBuffer(0);
    }
    addPayload(buffer) {
        let payload = new ArrayBuffer(this.payload.byteLength + buffer.byteLength);
        let view = new DataView(payload);
        let viewOld = new DataView(this.payload);
        let viewNew = new DataView(buffer);
        for (let i = 0; i < viewOld.byteLength; ++i) {
            view.setInt8(i, viewOld.getInt8(i));
        }
        for (let i = 0; i < viewNew.byteLength; ++i) {
            view.setInt8(i + viewOld.byteLength, viewNew.getInt8(i));
        }
        this.payload = payload;
    }
}
class AudioStream {
    constructor(timeProvider, sampleFormat) {
        this.chunks = new Array();
        this.chunk = undefined;
        this.volume = 1;
        this.muted = false;
        this.lastLog = 0;
        this.timeProvider = timeProvider;
        this.sampleFormat = sampleFormat;
    }
    setVolume(percent, muted) {
        let base = 10;
        this.volume = percent / 100; // (Math.pow(base, percent / 100) - 1) / (base - 1);
        console.log("setVolume: " + percent + " => " + this.volume + ", muted: " + this.muted);
        this.muted = muted;
    }
    addChunk(chunk) {
        this.chunks.push(chunk);
        // console.log("chunks: " + this.chunks.length);
        while (this.chunks.length > 0) {
            let age = this.timeProvider.serverNow() - this.chunks[0].timestamp.getMilliseconds();
            // todo: consider buffer ms
            if (age > 1500) {
                this.chunks.shift();
                // console.log("Dropping old chunk: " + age + ", left: " + this.chunks.length);
            }
            else
                break;
        }
    }
    getNextBuffer(buffer, playTimeMs) {
        if (!this.chunk) {
            this.chunk = this.chunks.shift();
        }
        // let age = this.timeProvider.serverTime(this.playTime * 1000) - startMs;
        let frames = buffer.length;
        let read = 0;
        let left = new Float32Array(frames);
        let right = new Float32Array(frames);
        let pos = 0;
        let volume = this.muted ? 0 : this.volume;
        let serverPlayTimeMs = this.timeProvider.serverTime(playTimeMs);
        if (this.chunk) {
            let age = serverPlayTimeMs - this.chunk.startMs(); // - 500;
            let reqChunkDuration = frames / this.sampleFormat.msRate();
            let secs = Math.floor(Date.now() / 1000);
            if (this.lastLog != secs) {
                this.lastLog = secs;
                console.log("age: " + Math.round(age * 10) / 10 + ", req: " + reqChunkDuration);
            }
            if (age < -reqChunkDuration) {
                console.log("Chunk too young, returning silence");
            }
            else {
                while (age > reqChunkDuration) {
                    console.log("Chunk too old, dropping");
                    this.chunk = this.chunks.shift();
                    if (!this.chunk)
                        break;
                    age = serverPlayTimeMs - this.chunk.startMs();
                }
                let addFrames = 0;
                let everyN = 0;
                if (age > 1) {
                    addFrames = Math.ceil(age / 5);
                }
                else if (age < 1) {
                    addFrames = Math.floor(age / 5);
                }
                let readFrames = frames + addFrames;
                if (addFrames != 0)
                    everyN = Math.floor((frames + addFrames) / (Math.abs(addFrames) + 1));
                // addFrames = 0;
                // console.log("frames: " + frames + ", readFrames: " + readFrames + ", everyN: " + everyN);
                while ((read < readFrames) && this.chunk) {
                    let pcmChunk = this.chunk;
                    let pcmBuffer = pcmChunk.readFrames(readFrames - read);
                    let payload = new Int16Array(pcmBuffer);
                    // console.log("readFrames: " + (frames - read) + ", read: " + pcmBuffer.byteLength + ", payload: " + payload.length);
                    read += (pcmBuffer.byteLength / this.sampleFormat.frameSize());
                    for (let i = 0; i < payload.length; i += 2) {
                        left[pos] = (payload[i] / 32768) * volume;
                        right[pos] = (payload[i + 1] / 32768) * volume;
                        if ((everyN != 0) && (i > 0) && (i % (2 * everyN) == 0)) {
                            if (addFrames > 0) {
                                pos--;
                            }
                            else {
                                left[pos + 1] = left[pos];
                                right[pos + 1] = right[pos];
                                pos++;
                            }
                        }
                        pos++;
                    }
                    if (pcmChunk.isEndOfChunk()) {
                        this.chunk = this.chunks.shift();
                    }
                }
                // console.log("Pos: " + pos + ", frames: " + frames + ", add: " + addFrames + ", everyN: " + everyN);
                if (read == readFrames)
                    read = frames;
            }
        }
        if (read < frames) {
            console.log("Failed to get chunk");
            left.fill(0, pos);
            right.fill(0, pos);
        }
        buffer.copyToChannel(left, 0, 0);
        buffer.copyToChannel(right, 1, 0);
    }
}
class TimeProvider {
    constructor(ctx = undefined) {
        this.diffBuffer = new Array();
        this.diff = 0;
        if (ctx) {
            this.setAudioContext(ctx);
        }
    }
    setAudioContext(ctx) {
        this.ctx = ctx;
        this.reset();
    }
    reset() {
        this.diffBuffer.length = 0;
        this.diff = 0;
    }
    setDiff(c2s, s2c) {
        if (this.now() == 0) {
            this.reset();
        }
        else {
            if (this.diffBuffer.push((c2s - s2c) / 2) > 100)
                this.diffBuffer.shift();
            let sorted = [...this.diffBuffer];
            sorted.sort();
            this.diff = sorted[Math.floor(sorted.length / 2)];
        }
        // console.log("c2s: " + c2s + ", s2c: " + s2c + ", diff: " + this.diff + ", now: " + this.now() + ", win.now: " + window.performance.now());
        // console.log("now: " + this.now() + "\t" + this.now() + "\t" + this.now());
    }
    now() {
        if (!this.ctx) {
            return window.performance.now();
        }
        else {
            return this.ctx.getOutputTimestamp().contextTime * 1000;
        }
    }
    serverNow() {
        return this.serverTime(this.now());
    }
    serverTime(localTimeMs) {
        return localTimeMs + this.diff;
    }
}
class SampleFormat {
    constructor() {
        this.rate = 48000;
        this.channels = 2;
        this.bits = 16;
    }
    msRate() {
        return this.rate / 1000;
    }
    toString() {
        return this.rate + ":" + this.bits + ":" + this.channels;
    }
    sampleSize() {
        if (this.bits == 24) {
            return 4;
        }
        return this.bits / 8;
    }
    frameSize() {
        return this.channels * this.sampleSize();
    }
    durationMs(bytes) {
        return (bytes / this.frameSize()) * this.msRate();
    }
}
class Decoder {
    setHeader(buffer) {
        return new SampleFormat();
    }
    decode(chunk) {
        return null;
    }
}
class FlacDecoder extends Decoder {
    constructor() {
        super();
        this.header = null;
        this.cacheInfo = { isCachedChunk: false, cachedBlocks: 0 };
        this.decoder = Flac.create_libflac_decoder(true);
        if (this.decoder) {
            let init_status = Flac.init_decoder_stream(this.decoder, this.read_callback_fn.bind(this), this.write_callback_fn.bind(this), this.error_callback_fn.bind(this), this.metadata_callback_fn.bind(this), false);
            console.log("Flac init: " + init_status);
            Flac.setOptions(this.decoder, { analyseSubframes: true, analyseResiduals: true });
        }
        this.sampleFormat = new SampleFormat();
        this.flacChunk = new ArrayBuffer(0);
        // this.pcmChunk  = new PcmChunkMessage();
        // Flac.setOptions(this.decoder, {analyseSubframes: analyse_frames, analyseResiduals: analyse_residuals});
        // flac_ok &= init_status == 0;
        // console.log("flac init     : " + flac_ok);//DEBUG
    }
    decode(chunk) {
        // console.log("Flac decode: " + chunk.payload.byteLength);
        this.flacChunk = chunk.payload.slice(0);
        this.pcmChunk = chunk;
        this.pcmChunk.clearPayload();
        this.cacheInfo = { cachedBlocks: 0, isCachedChunk: true };
        // console.log("Flac len: " + this.flacChunk.byteLength);
        while (this.flacChunk.byteLength && Flac.FLAC__stream_decoder_process_single(this.decoder)) {
            let state = Flac.FLAC__stream_decoder_get_state(this.decoder);
            // console.log("State: " + state);
        }
        // console.log("Pcm payload: " + this.pcmChunk!.payloadSize());
        if (this.cacheInfo.cachedBlocks > 0) {
            let diffMs = this.cacheInfo.cachedBlocks / this.sampleFormat.msRate();
            // console.log("Cached: " + this.cacheInfo.cachedBlocks + ", " + diffMs + "ms");
            this.pcmChunk.timestamp.setMilliseconds(this.pcmChunk.timestamp.getMilliseconds() - diffMs);
        }
        return this.pcmChunk;
    }
    read_callback_fn(bufferSize) {
        // console.log('  decode read callback, buffer bytes max=', bufferSize);
        if (this.header) {
            console.log("  header: " + this.header.byteLength);
            let data = new Uint8Array(this.header);
            this.header = null;
            return { buffer: data, readDataLength: data.byteLength, error: false };
        }
        else if (this.flacChunk) {
            // console.log("  flacChunk: " + this.flacChunk.byteLength);
            // a fresh read => next call to write will not be from cached data
            this.cacheInfo.isCachedChunk = false;
            let data = new Uint8Array(this.flacChunk.slice(0, Math.min(bufferSize, this.flacChunk.byteLength)));
            this.flacChunk = this.flacChunk.slice(data.byteLength);
            return { buffer: data, readDataLength: data.byteLength, error: false };
        }
        return { buffer: new Uint8Array(0), readDataLength: 0, error: false };
    }
    write_callback_fn(data, frameInfo) {
        // console.log("  write frame metadata: " + frameInfo + ", len: " + data.length);
        if (this.cacheInfo.isCachedChunk) {
            // there was no call to read, so it's some cached data
            this.cacheInfo.cachedBlocks += frameInfo.blocksize;
        }
        let payload = new ArrayBuffer((frameInfo.bitsPerSample / 8) * frameInfo.channels * frameInfo.blocksize);
        let view = new DataView(payload);
        for (let channel = 0; channel < frameInfo.channels; ++channel) {
            let channelData = new DataView(data[channel].buffer, 0, data[channel].buffer.byteLength);
            // console.log("channelData: " + channelData.byteLength + ", blocksize: " + frameInfo.blocksize);
            for (let i = 0; i < frameInfo.blocksize; ++i) {
                view.setInt16(2 * (frameInfo.channels * i + channel), channelData.getInt16(2 * i, true), true);
            }
        }
        this.pcmChunk.addPayload(payload);
        // console.log("write: " + payload.byteLength + ", len: " + this.pcmChunk!.payloadSize());
    }
    /** @memberOf decode */
    metadata_callback_fn(data) {
        console.info('meta data: ', data);
        // let view = new DataView(data);
        this.sampleFormat.rate = data.sampleRate;
        this.sampleFormat.channels = data.channels;
        this.sampleFormat.bits = data.bitsPerSample;
        console.log("metadata_callback_fn, sampleformat: " + this.sampleFormat.toString());
    }
    /** @memberOf decode */
    error_callback_fn(err, errMsg) {
        console.error('decode error callback', err, errMsg);
    }
    setHeader(buffer) {
        this.header = buffer.slice(0);
        Flac.FLAC__stream_decoder_process_until_end_of_metadata(this.decoder);
        return this.sampleFormat;
    }
}
class PcmDecoder extends Decoder {
    setHeader(buffer) {
        let sampleFormat = new SampleFormat();
        let view = new DataView(buffer);
        sampleFormat.channels = view.getUint16(22, true);
        sampleFormat.rate = view.getUint32(24, true);
        sampleFormat.bits = view.getUint16(34, true);
        return sampleFormat;
    }
    decode(chunk) {
        return chunk;
    }
}
class SnapStream {
    constructor(host, port) {
        this.playTime = 0;
        this.msgId = 0;
        this.bufferDurationMs = 0; //50;
        this.bufferFrameCount = 3844; // 9600; // 2400;//8192;
        this.syncHandle = -1;
        // median: number = 0;
        this.audioBuffers = 3;
        this.bufferMs = 1000;
        this.streamsocket = new WebSocket('ws://' + host + ':' + port + '/stream');
        this.streamsocket.binaryType = "arraybuffer";
        this.streamsocket.onmessage = (msg) => {
            let view = new DataView(msg.data);
            let type = view.getUint16(0, true);
            if (type == 1) {
                let codec = new CodecMessage(msg.data);
                console.log("Codec: " + codec.codec);
                if (codec.codec == "flac") {
                    this.decoder = new FlacDecoder();
                }
                else if (codec.codec == "pcm") {
                    this.decoder = new PcmDecoder();
                }
                else {
                    alert("Codec not supported: " + codec.codec);
                }
                if (this.decoder) {
                    this.sampleFormat = this.decoder.setHeader(codec.payload);
                    console.log("Sampleformat: " + this.sampleFormat.toString());
                    if ((this.sampleFormat.channels != 2) || (this.sampleFormat.bits != 16)) {
                        alert("Stream must be stereo with 16 bit depth, actual format: " + this.sampleFormat.toString());
                    }
                    else {
                        if (this.bufferDurationMs != 0) {
                            this.bufferFrameCount = Math.floor(this.bufferDurationMs * this.sampleFormat.msRate());
                        }
                        this.ctx = new AudioContext({ latencyHint: "playback", sampleRate: this.sampleFormat.rate });
                        this.timeProvider.setAudioContext(this.ctx);
                        this.gainNode = this.ctx.createGain();
                        this.gainNode.connect(this.ctx.destination);
                        this.gainNode.gain.value = this.serverSettings.muted ? 0 : this.serverSettings.volumePercent / 100;
                        this.timeProvider = new TimeProvider(this.ctx);
                        this.stream = new AudioStream(this.timeProvider, this.sampleFormat);
                        console.log("Base latency: " + this.ctx.baseLatency + ", output latency: " + this.ctx.outputLatency);
                        this.play();
                    }
                }
            }
            else if (type == 2) {
                let pcmChunk = new PcmChunkMessage(msg.data, this.sampleFormat);
                let decoded = this.decoder?.decode(pcmChunk);
                if (decoded) {
                    this.stream.addChunk(decoded);
                }
            }
            else if (type == 3) {
                this.serverSettings = new ServerSettingsMessage(msg.data);
                if (this.gainNode) {
                    this.gainNode.gain.value = this.serverSettings.muted ? 0 : this.serverSettings.volumePercent / 100;
                }
                this.bufferMs = this.serverSettings.bufferMs - this.serverSettings.latency;
                console.log("ServerSettings bufferMs: " + this.serverSettings.bufferMs + ", latency: " + this.serverSettings.latency + ", volume: " + this.serverSettings.volumePercent + ", muted: " + this.serverSettings.muted);
            }
            else if (type == 4) {
                if (this.timeProvider) {
                    let time = new TimeMessage(msg.data);
                    this.timeProvider.setDiff(time.latency.getMilliseconds(), this.timeProvider.now() - time.sent.getMilliseconds());
                }
                // console.log("Time sec: " + time.latency.sec + ", usec: " + time.latency.usec + ", diff: " + this.timeProvider.diff);
            }
            else {
                console.log("Message not handled, type: " + type);
            }
        };
        this.streamsocket.onopen = (ev) => {
            console.log("on open");
            let hello = new HelloMessage();
            hello.mac = "00:00:00:00:00:00";
            hello.arch = "web";
            hello.os = navigator.platform;
            hello.hostname = location.hostname;
            hello.uniqueId = getCookie("uniqueId", uuidv4());
            this.sendMessage(hello);
            this.syncTime();
            this.syncHandle = window.setInterval(() => this.syncTime(), 1000);
        };
        this.streamsocket.onerror = (ev) => { alert("error: " + ev.type); }; //this.onError(ev);
        this.streamsocket.onclose = (ev) => {
            stop();
        };
        // this.ageBuffer = new Array<number>();
        this.timeProvider = new TimeProvider();
    }
    sendMessage(msg) {
        msg.sent = new Tv(0, 0);
        msg.sent.setMilliseconds(this.timeProvider.now());
        msg.id = ++this.msgId;
        if (this.streamsocket.readyState != this.streamsocket.OPEN) {
            stop();
        }
        else {
            this.streamsocket.send(msg.serialize());
        }
    }
    syncTime() {
        let t = new TimeMessage();
        t.latency.setMilliseconds(this.timeProvider.now());
        this.sendMessage(t);
        // console.log("prepareSource median: " + Math.round(this.median * 10) / 10);
    }
    prepareSource() {
        let source = this.ctx.createBufferSource();
        let buffer;
        // if (this.freeBuffers.length) {
        //     buffer = this.freeBuffers.pop() as AudioBuffer;
        // } else {
        buffer = this.ctx.createBuffer(this.sampleFormat.channels, this.bufferFrameCount, this.sampleFormat.rate);
        // }
        let playTimeMs = (this.playTime + this.ctx.baseLatency) * 1000 - this.bufferMs;
        // let nextBuffer = 
        this.stream.getNextBuffer(buffer, playTimeMs);
        // if (nextBuffer.success) {
        //     let age = this.timeProvider!.serverTime(playTimeMs) - nextBuffer.chunkTime;
        //     // let age = this.timeProvider.serverTime(this.endTime) - startMs;
        //     this.ageBuffer.push(age);
        //     if (this.ageBuffer.length > 100)
        //         this.ageBuffer.shift();
        //     let sorted = [...this.ageBuffer];
        //     sorted.sort()
        //     this.median = sorted[Math.floor(sorted.length / 2)];
        // }
        // console.log("prepareSource age: " + age + ", median: " + this.median);
        source.buffer = buffer;
        source.connect(this.gainNode); // this.ctx.destination);
        return source;
    }
    stop() {
        window.clearInterval(this.syncHandle);
        if (this.ctx) {
            this.ctx.close();
        }
        if ([WebSocket.OPEN, WebSocket.CONNECTING].includes(this.streamsocket.readyState)) {
            this.streamsocket.close();
        }
    }
    play() {
        this.playTime = this.ctx.currentTime;
        for (let i = 1; i <= this.audioBuffers; ++i) {
            this.playNext();
        }
    }
    playNext() {
        let source = this.prepareSource();
        source.start(this.playTime);
        source.onended = (ev) => {
            // this.endTime = window.performance.now() + (this.audioBuffers - 1) * (this.bufferSize / (this.sampleFormat as SampleFormat).rate) * 1000;
            // console.log("Perf: " + this.ctx.getOutputTimestamp().performanceTime);
            // console.log("onended: " + window.performance.now());
            // console.log("onended: " + this.ctx.currentTime * 1000);
            // this.freeBuffers.push(source.buffer as AudioBuffer);
            this.playNext();
        };
        this.playTime += this.bufferFrameCount / this.sampleFormat.rate;
    }
}
//# sourceMappingURL=snapstream.js.map