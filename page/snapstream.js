"use strict";
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
        if (buffer) {
            this.deserialize(buffer);
        }
        // console.log("Type: " + this.type + " id: " + this.id + ", refers to: " + this.refersTo + ", sent: " + this.sent.sec + " " + this.sent.usec + ", size: " + this.size);
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
        this.version = "";
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
        this.payloadSize = 0;
        this.payload = new ArrayBuffer(0);
        this.idx = 0;
        this.deserialize(buffer);
        this.sampleFormat = sampleFormat;
        this.type = 2;
    }
    deserialize(buffer) {
        let view = new DataView(buffer);
        this.timestamp = new Tv(view.getInt32(26, true), view.getInt32(30, true));
        this.payloadSize = view.getUint32(34, true);
        this.payload = buffer.slice(38); //, this.payloadSize + 38));// , this.payloadSize);
        // console.log("ts: " + this.timestamp.sec + " " + this.timestamp.usec + ", payload: " + this.payloadSize + ", len: " + this.payload.byteLength);
    }
    readFrames(frames) {
        let frameCnt = frames;
        if (this.idx + frames > this.payloadSize / 4)
            frameCnt = (this.payloadSize / 4) - this.idx;
        let begin = this.idx * 4;
        this.idx += frameCnt;
        let end = begin + frameCnt * 4;
        // console.log("readFrames: " + frames + ", result: " + frameCnt + ", begin: " + begin + ", end: " + end + ", payload: " + this.payload.byteLength);
        return this.payload.slice(begin, end);
    }
    getFrameCount() {
        return (this.payloadSize / 4);
    }
    isEndOfChunk() {
        return this.idx >= this.getFrameCount();
    }
    start() {
        return this.timestamp.getMilliseconds() + 1000 * (this.idx / this.sampleFormat.rate);
    }
}
class AudioStream {
    constructor(timeProvider) {
        this.chunks = new Array();
        this.chunk = undefined;
        this.volume = 1;
        this.muted = false;
        this.timeProvider = timeProvider;
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
        let startMs = 0;
        if (this.chunk) {
            startMs = this.chunk.start();
            while (read < frames) {
                let pcmChunk = this.chunk;
                let pcmBuffer = pcmChunk.readFrames(frames - read);
                let payload = new Int16Array(pcmBuffer);
                // console.log("readFrames: " + (frames - read) + ", read: " + pcmBuffer.byteLength + ", payload: " + payload.length);
                read += (pcmBuffer.byteLength / 4);
                for (let i = 0; i < payload.length; i += 2) {
                    left[pos] = (payload[i] / 32768) * volume;
                    right[pos] = (payload[i + 1] / 32768) * volume;
                    pos++;
                }
                if (pcmChunk.isEndOfChunk()) {
                    this.chunk = this.chunks.shift();
                    if (this.chunk) {
                        let age = this.timeProvider.serverNow() - this.chunk.timestamp.getMilliseconds();
                        // console.log("Age: " + age + ", server now: " + this.timeProvider.serverNow() + ", chunk: " + (this.chunk as PcmChunkMessage).timestamp.getMilliseconds());
                    }
                }
            }
        }
        if (read < frames) {
            console.log("Failed to get chunk");
            left.fill(0, pos);
            right.fill(0, pos);
        }
        buffer.copyToChannel(left, 0, 0);
        buffer.copyToChannel(right, 1, 0);
        return startMs;
    }
}
class TimeProvider {
    constructor(ctx) {
        this.diffBuffer = new Array();
        this.diff = 0;
        this.ctx = ctx;
    }
    setDiff(c2s, s2c) {
        if (this.now() == 0)
            this.diffBuffer.length = 0;
        if (this.diffBuffer.push((c2s - s2c) / 2) > 100)
            this.diffBuffer.shift();
        let sorted = [...this.diffBuffer];
        sorted.sort();
        this.diff = sorted[Math.floor(sorted.length / 2)];
        console.log("c2s: " + c2s + ", s2c: " + s2c + ", diff: " + this.diff + ", now: " + this.now() + ", win.now: " + window.performance.now());
    }
    now() {
        return this.ctx.currentTime * 1000;
        // return window.performance.now();
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
    toString() {
        return this.rate + ":" + this.bits + ":" + this.channels;
    }
}
class Decoder {
    setHeader(buffer) {
        return new SampleFormat();
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
}
class SnapStream {
    constructor(host, port) {
        this.playTime = 0;
        this.msgId = 0;
        this.bufferSize = 2400; // 9600; // 2400;//8192;
        this.syncHandle = -1;
        this.sampleFormat = null;
        this.streamsocket = new WebSocket('ws://' + host + ':' + port + '/stream');
        this.streamsocket.binaryType = "arraybuffer";
        this.streamsocket.onmessage = (msg) => {
            let view = new DataView(msg.data);
            let type = view.getUint16(0, true);
            if (type == 1) {
                // todo: decoder, extract sampleformat
                let codec = new CodecMessage(msg.data);
                console.log("Codec: " + codec.codec);
                if (codec.codec == "pcm") {
                    let decoder = new PcmDecoder();
                    this.sampleFormat = decoder.setHeader(codec.payload);
                    console.log("Sampleformat: " + this.sampleFormat.toString());
                }
                this.play();
            }
            else if (type == 2) {
                if (this.sampleFormat) {
                    let pcmChunk = new PcmChunkMessage(msg.data, this.sampleFormat);
                    this.stream.addChunk(pcmChunk);
                }
            }
            else if (type == 3) {
                let serverSettings = new JsonMessage(msg.data);
                let json = serverSettings.json;
                this.gainNode.gain.value = json["muted"] ? 0 : json["volume"] / 100;
                // this.stream.setVolume(json["volume"] as number, json["muted"] as boolean);
                console.log("json: " + JSON.stringify(json) + ", bufferMs: " + json["bufferMs"] + ", latency: " + json["latency"] + ", volume: " + json["volume"] + ", muted: " + json["muted"]);
            }
            else if (type == 4) {
                let time = new TimeMessage(msg.data);
                this.timeProvider.setDiff(time.latency.getMilliseconds(), this.timeProvider.now() - time.sent.getMilliseconds());
                // console.log("Time sec: " + time.latency.sec + ", usec: " + time.latency.usec + ", diff: " + this.timeProvider.diff);
            }
            else {
                console.log("onmessage: " + type);
            }
        };
        this.streamsocket.onopen = (ev) => {
            console.log("on open");
            let hello = new HelloMessage();
            hello.arch = "web";
            // let loc = new Location();
            hello.hostname = location.hostname; // "T405";
            hello.uniqueId = "1234";
            this.sendMessage(hello);
            this.syncTime();
            this.syncHandle = window.setInterval(() => this.syncTime(), 1000);
        };
        this.streamsocket.onerror = (ev) => { alert("error: " + ev.type); }; //this.onError(ev);
        this.ageBuffer = new Array();
        this.ctx = new AudioContext();
        this.timeProvider = new TimeProvider(this.ctx);
        this.stream = new AudioStream(this.timeProvider);
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
        this.gainNode.gain.value = 1;
    }
    sendMessage(msg) {
        msg.sent = new Tv(0, 0);
        msg.sent.setMilliseconds(this.timeProvider.now());
        msg.id = ++this.msgId;
        this.streamsocket.send(msg.serialize());
    }
    syncTime() {
        let t = new TimeMessage();
        t.latency.setMilliseconds(this.timeProvider.now());
        this.sendMessage(t);
    }
    prepareSource() {
        let source = this.ctx.createBufferSource();
        let buffer;
        // if (this.freeBuffers.length) {
        //     buffer = this.freeBuffers.pop() as AudioBuffer;
        // } else {
        buffer = this.ctx.createBuffer(2, this.bufferSize, this.sampleFormat.rate);
        // }
        let startMs = this.stream.getNextBuffer(buffer, this.playTime * 1000);
        let age = this.timeProvider.serverTime(this.playTime * 1000) - startMs;
        // this.ageBuffer.push(age);
        // if (this.ageBuffer.length > 200)
        //     this.ageBuffer.shift();
        // let sorted = [...this.ageBuffer];
        // sorted.sort()
        // let median = sorted[Math.floor(sorted.length / 2)];
        console.log("prepareSource age: " + age); // + ", median: " + median);
        source.buffer = buffer;
        source.connect(this.gainNode); // this.ctx.destination);
        return source;
    }
    stop() {
        window.clearInterval(this.syncHandle);
        this.ctx.close();
        this.streamsocket.close();
    }
    play() {
        this.playTime = this.ctx.currentTime;
        this.playNext();
        this.playNext();
        this.playNext();
    }
    playNext() {
        let source = this.prepareSource();
        source.start(this.playTime);
        source.onended = (ev) => {
            // console.log("onended: " + this.ctx.currentTime * 1000);
            // this.freeBuffers.push(source.buffer as AudioBuffer);
            this.playNext();
        };
        this.playTime += this.bufferSize / this.sampleFormat.rate;
    }
}
//# sourceMappingURL=snapstream.js.map