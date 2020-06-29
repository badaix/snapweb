class Host {
    constructor(json: any) {
        this.fromJson(json);
    }

    fromJson(json: any) {
        this.arch = json.arch;
        this.ip = json.ip;
        this.mac = json.mac;
        this.name = json.name;
        this.os = json.os;
    }

    arch: string = "";
    ip: string = "";
    mac: string = "";
    name: string = "";
    os: string = "";
}

class Client {
    constructor(json: any) {
        this.fromJson(json);
    }

    fromJson(json: any) {
        this.id = json.id;
        this.host = new Host(json.host);
        let jsnapclient = json.snapclient;
        this.snapclient = { name: jsnapclient.name, protocolVersion: jsnapclient.protocolVersion, version: jsnapclient.version }
        let jconfig = json.config;
        this.config = { instance: jconfig.instance, latency: jconfig.latency, name: jconfig.name, volume: { muted: jconfig.volume.muted, percent: jconfig.volume.percent } }
        this.lastSeen = { sec: json.lastSeen.sec, usec: json.lastSeen.usec }
        this.connected = Boolean(json.connected);
    }

    id: string = "";
    host!: Host;
    snapclient!: {
        name: string;
        protocolVersion: number;
        version: string;
    }
    config!: {
        instance: number;
        latency: number;
        name: string;
        volume: {
            muted: boolean;
            percent: number;
        }
    };
    lastSeen!: {
        sec: number;
        usec: number;
    };
    connected: boolean = false;
}

class Group {
    constructor(json: any) {
        this.fromJson(json);
    }

    fromJson(json: any) {
        this.name = json.name;
        this.id = json.id;
        this.stream_id = json.stream_id;
        this.muted = Boolean(json.muted);
        for (let client of json.clients)
            this.clients.push(new Client(client));
    }

    name: string = "";
    id: string = "";
    stream_id: string = "";
    muted: boolean = false;
    clients: Client[] = [];

    getClient(id: string): Client | null {
        for (let client of this.clients) {
            if (client.id == id)
                return client;
        }
        return null;
    }
}

class Stream {
    constructor(json: any) {
        this.fromJson(json);
    }

    fromJson(json: any) {
        this.id = json.id;
        this.status = json.status;
        let juri = json.uri;
        this.uri = { raw: juri.raw, scheme: juri.scheme, host: juri.host, path: juri.path, fragment: juri.fragment, query: juri.query }
    }

    id: string = "";
    status: string = "";
    uri!: {
        raw: string;
        scheme: string;
        host: string;
        path: string;
        fragment: string;
        query: string;
    }
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
    constructor(buffer?: ArrayBuffer) {
        if (buffer) {
            this.deserialize(buffer);
        }
        // console.log("Type: " + this.type + " id: " + this.id + ", refers to: " + this.refersTo + ", sent: " + this.sent.sec + " " + this.sent.usec + ", size: " + this.size);
    }

    deserialize(buffer: ArrayBuffer) {
        let view = new DataView(buffer);
        this.type = view.getUint16(0, true);
        this.id = view.getUint16(2, true);
        this.refersTo = view.getUint16(4, true);
        this.received = new Tv(view.getInt32(6, true), view.getInt32(10, true));
        this.sent = new Tv(view.getInt32(14, true), view.getInt32(18, true));
        this.size = view.getUint32(22, true);
    }

    serialize(): ArrayBuffer {
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

    type: number = 0;
    id: number = 0;
    refersTo: number = 0;
    received: Tv = new Tv(0, 0);
    sent: Tv = new Tv(0, 0);
    size: number = 0;
}

class CodecMessage extends BaseMessage {
    constructor(buffer?: ArrayBuffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 1;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        let size = view.getInt32(26, true);
        let decoder = new TextDecoder("utf-8");
        this.codec = decoder.decode(buffer.slice(30, 30 + size));
        size = view.getInt32(30 + size, true);
        this.payload = buffer.slice(34 + size);
    }

    codec: string = "";
    payload: ArrayBuffer = new ArrayBuffer(0);
}


class TimeMessage extends BaseMessage {
    constructor(buffer?: ArrayBuffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 4;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        this.latency = new Tv(view.getInt32(26, true), view.getInt32(30, true));
    }

    serialize(): ArrayBuffer {
        let buffer = super.serialize();
        let view = new DataView(buffer);
        view.setInt32(26, this.latency.sec, true);
        view.setInt32(30, this.latency.sec, true);
        return buffer;
    }

    getSize() {
        return 8;
    }

    latency: Tv = new Tv(0, 0);
}


class JsonMessage extends BaseMessage {
    constructor(buffer?: ArrayBuffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        let size = view.getInt32(26, true);
        let decoder = new TextDecoder();
        this.json = JSON.parse(decoder.decode(buffer.slice(30)));
    }

    serialize(): ArrayBuffer {
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
    version: string = "";
    clientName = "Snapweb";
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
    constructor(buffer?: ArrayBuffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 2;
    }

    deserialize(buffer: ArrayBuffer) {
        let view = new DataView(buffer);
        this.timestamp = new Tv(view.getInt32(26, true), view.getInt32(30, true));
        this.payloadSize = view.getUint32(34, true);
        this.payload = buffer.slice(38);//, this.payloadSize + 38));// , this.payloadSize);
        // console.log("ts: " + this.timestamp.sec + " " + this.timestamp.usec + ", payload: " + this.payloadSize + ", len: " + this.payload.byteLength);
    }

    readFrames(frames: number): ArrayBuffer {
        let frameCnt = frames;
        if (this.idx + frames > this.payloadSize / 4)
            frameCnt = (this.payloadSize / 4) - this.idx;
        let begin = this.idx * 4;
        this.idx += frameCnt;
        let end = begin + frameCnt * 4;
        // console.log("readFrames: " + frames + ", result: " + frameCnt + ", begin: " + begin + ", end: " + end + ", payload: " + this.payload.byteLength);
        return this.payload.slice(begin, end);
    }

    getFrameCount(): number {
        return (this.payloadSize / 4);
    }

    isEndOfChunk(): boolean {
        return this.idx >= this.getFrameCount();
    }

    start(): number {
        return this.timestamp.getMilliseconds() + 1000 * (this.idx / 48000);
    }

    timestamp: Tv = new Tv(0, 0);
    payloadSize: number = 0;
    payload: ArrayBuffer = new ArrayBuffer(0);
    idx: number = 0;
}


class AudioStream {
    constructor(timeProvider: TimeProvider) {
        this.timeProvider = timeProvider;
    }

    chunks: Array<PcmChunkMessage> = new Array<PcmChunkMessage>();

    setVolume(percent: number, muted: boolean) {
        let base = 10;
        this.volume = (Math.pow(base, percent / 100) - 1) / (base - 1);
        console.log("setVolume: " + percent + " => " + this.volume + ", muted: " + this.muted);
        this.muted = muted;
    }

    addChunk(chunk: PcmChunkMessage) {
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

    getNextBuffer(buffer: AudioBuffer, playTimeMs: number): number {
        if (!this.chunk) {
            this.chunk = this.chunks.shift()
        }
        let age = this.timeProvider.serverTime(this.playTime * 1000) - startMs;

        let frames = buffer.length;
        let read = 0;
        let left = new Float32Array(frames);
        let right = new Float32Array(frames);
        let pos = 0;
        let volume = this.muted ? 0 : this.volume;
        let startMs: number = 0;
        if (this.chunk) {
            startMs = this.chunk.start();
            while (read < frames) {
                let pcmChunk = this.chunk as PcmChunkMessage;
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
                        let age = this.timeProvider.serverNow() - (this.chunk as PcmChunkMessage).timestamp.getMilliseconds();
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

    chunk?: PcmChunkMessage = undefined;
    volume: number = 1;
    muted: boolean = false;
    timeProvider: TimeProvider;
}

class Server {
    constructor(json?: any) {
        if (json)
            this.fromJson(json);
    }

    fromJson(json: any) {
        this.groups = []
        for (let jgroup of json.groups)
            this.groups.push(new Group(jgroup));
        let jsnapserver: any = json.server.host;
        this.server = { host: new Host(json.server.host), snapserver: { controlProtocolVersion: jsnapserver.controlProtocolVersion, name: jsnapserver.name, protocolVersion: jsnapserver.protocolVersion, version: jsnapserver.version } };
        this.streams = []
        for (let jstream of json.streams) {
            this.streams.push(new Stream(jstream));
        }
    }

    groups: Group[] = [];
    server!: {
        host: Host;
        snapserver: {
            controlProtocolVersion: number;
            name: string;
            protocolVersion: number;
            version: string;
        }
    };
    streams: Stream[] = [];

    getClient(id: string): Client | null {
        for (let group of this.groups) {
            let client = group.getClient(id);
            if (client)
                return client;
        }
        return null;
    }

    getGroup(id: string): Group | null {
        for (let group of this.groups) {
            if (group.id == id)
                return group;
        }
        return null;
    }

    getStream(id: string): Stream | null {
        for (let stream of this.streams) {
            if (stream.id == id)
                return stream;
        }
        return null;
    }
}

class TimeProvider {
    constructor(ctx: AudioContext) {
        this.ctx = ctx;
    }

    setDiff(c2s: number, s2c: number) {
        if (this.now() == 0)
            this.diffBuffer.length = 0;
        if (this.diffBuffer.push((c2s - s2c) / 2) > 100)
            this.diffBuffer.shift();
        let sorted = [...this.diffBuffer];
        sorted.sort()
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

    serverTime(localTimeMs: number) {
        return localTimeMs + this.diff;
    }

    diffBuffer: Array<number> = new Array<number>();
    diff: number = 0;
    ctx: AudioContext;
}

class Decoder {
}

class PcmDecoder extends Decoder {
}


class SnapStream {
    constructor(host: string, port: number) {
        this.streamsocket = new WebSocket('ws://' + host + ':' + port + '/stream');
        this.streamsocket.binaryType = "arraybuffer";
        this.streamsocket.onmessage = (msg) => {
            let view = new DataView(msg.data);
            let type = view.getUint16(0, true);
            if (type == 1) {
                // todo: decoder, extract sampleformat
                let codec = new CodecMessage(msg.data);
                console.log("Codec: " + codec.codec);
                this.play();
            } else if (type == 2) {
                let pcmChunk = new PcmChunkMessage(msg.data);
                this.stream.addChunk(pcmChunk);
            } else if (type == 3) {
                let serverSettings = new JsonMessage(msg.data);
                let json = serverSettings.json;
                this.stream.setVolume(json["volume"] as number, json["muted"] as boolean);
                console.log("json: " + JSON.stringify(json) + ", bufferMs: " + json["bufferMs"] + ", latency: " + json["latency"] + ", volume: " + json["volume"] + ", muted: " + json["muted"]);
            } else if (type == 4) {
                let time = new TimeMessage(msg.data);
                this.timeProvider.setDiff(time.latency.getMilliseconds(), this.timeProvider.now() - time.sent.getMilliseconds());
                // console.log("Time sec: " + time.latency.sec + ", usec: " + time.latency.usec + ", diff: " + this.timeProvider.diff);
            } else {
                console.log("onmessage: " + type);
            }
        }

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
        }
        this.streamsocket.onerror = (ev) => { alert("error: " + ev.type); }; //this.onError(ev);
        this.ageBuffer = new Array<number>();
        this.ctx = new AudioContext();
        this.timeProvider = new TimeProvider(this.ctx);
        this.stream = new AudioStream(this.timeProvider);
    }


    private sendMessage(msg: BaseMessage) {
        msg.sent = new Tv(0, 0);
        msg.sent.setMilliseconds(this.timeProvider.now());
        msg.id = ++this.msgId;
        this.streamsocket.send(msg.serialize());
    }

    private syncTime() {
        let t = new TimeMessage();
        t.latency.setMilliseconds(this.timeProvider.now());
        this.sendMessage(t);
    }

    private prepareSource(): AudioBufferSourceNode {
        let source = this.ctx.createBufferSource();
        let buffer: AudioBuffer;
        // if (this.freeBuffers.length) {
        //     buffer = this.freeBuffers.pop() as AudioBuffer;
        // } else {
        buffer = this.ctx.createBuffer(2, this.bufferSize, 48000);
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
        source.connect(this.ctx.destination);
        return source;
    }

    public stop() {
        window.clearInterval(this.syncHandle);
        this.ctx.close();
        this.streamsocket.close();
    }

    public play() {
        this.playTime = this.ctx.currentTime;
        this.playNext();
        this.playNext();
    }

    public playNext() {
        let source = this.prepareSource();
        source.start(this.playTime);
        source.onended = (ev: Event) => {
            // console.log("onended: " + this.ctx.currentTime * 1000);
            // this.freeBuffers.push(source.buffer as AudioBuffer);
            this.playNext();
        }
        this.playTime += this.bufferSize / 48000;
    }

    streamsocket: WebSocket;
    stream: AudioStream;
    ctx: AudioContext;
    playTime: number = 0;
    msgId: number = 0;
    bufferSize: number = 2400; // 9600; // 2400;//8192;
    timeProvider: TimeProvider;
    syncHandle: number = -1;
    ageBuffer: Array<number>;
}


class SnapControl {
    constructor(host: string, port: number) {
        this.server = new Server();
        this.connection = new WebSocket('ws://' + host + ':' + port + '/jsonrpc');
        this.msg_id = 0;
        this.status_req_id = -1;

        this.connection.onmessage = (msg: MessageEvent) => this.onMessage(msg.data);
        this.connection.onopen = (ev: Event) => { this.status_req_id = this.sendRequest('Server.GetStatus'); }
        this.connection.onerror = (ev: Event) => { alert("error: " + ev.type); }//this.onError(ev);
    }

    private action(answer: any) {
        switch (answer.method) {
            case 'Client.OnVolumeChanged':
                let client = (this.getClient(answer.params.id) as Client)
                client.config.volume = answer.params.volume;
                updateGroupVolume(this.getGroupFromClient(client.id) as Group);
                break;
            case 'Client.OnLatencyChanged':
                (this.getClient(answer.params.id) as Client).config.latency = answer.params.latency;
                break;
            case 'Client.OnNameChanged':
                (this.getClient(answer.params.id) as Client).config.name = answer.params.name;
                break;
            case 'Client.OnConnect':
            case 'Client.OnDisconnect':
                (this.getClient(answer.params.client.id) as Client).fromJson(answer.params.client);
                break;
            case 'Group.OnMute':
                (this.getGroup(answer.params.id) as Group).muted = Boolean(answer.params.mute);
                break;
            case 'Group.OnStreamChanged':
                (this.getGroup(answer.params.id) as Group).stream_id = answer.params.stream_id;
                break;
            case 'Stream.OnUpdate':
                (this.getStream(answer.params.id) as Stream).fromJson(answer.params.stream);
                break;
            case 'Server.OnUpdate':
                this.server.fromJson(answer.params.server);
                break;
            default:
                break;
        }
    }

    public getClient(client_id: string): Client | null {
        return this.server.getClient(client_id);
    }

    public getGroup(group_id: string): Group | null {
        return this.server.getGroup(group_id);
    }

    public getGroupVolume(group: Group, online: boolean): number {
        if (group.clients.length == 0)
            return 0;
        let group_vol: number = 0;
        let client_count: number = 0;
        for (let client of group.clients) {
            if (online && !client.connected)
                continue;
            group_vol += client.config.volume.percent;
            ++client_count;
        }
        if (client_count == 0)
            return 0;
        return group_vol / client_count;
    }

    public getGroupFromClient(client_id: string): Group | null {
        for (let group of this.server.groups)
            for (let client of group.clients)
                if (client.id == client_id)
                    return group;
        return null;
    }

    public getStream(stream_id: string): Stream | null {
        return this.server.getStream(stream_id);
    }

    public setVolume(client_id: string, percent: number, mute?: boolean) {
        percent = Math.max(0, Math.min(100, percent));
        let client = (this.getClient(client_id) as Client);
        client.config.volume.percent = percent;
        if (mute != undefined)
            client.config.volume.muted = mute;
        this.sendRequest('Client.SetVolume', '{"id":"' + client_id + '","volume":{"muted":' + (client.config.volume.muted ? "true" : "false") + ',"percent":' + client.config.volume.percent + '}}');
    }

    public setClientName(client_id: string, name: string) {
        let client = this.getClient(client_id) as Client;
        let current_name: string = (client.config.name != "") ? client.config.name : client.host.name;
        if (name != current_name) {
            this.sendRequest('Client.SetName', '{"id":"' + client_id + '","name":"' + name + '"}');
            client.config.name = name;
        }
    }

    public setClientLatency(client_id: string, latency: number) {
        let client = this.getClient(client_id) as Client;
        let current_latency: number = client.config.latency;
        if (latency != current_latency) {
            this.sendRequest('Client.SetLatency', '{"id":"' + client_id + '","latency":' + latency + '}');
            client.config.latency = latency;
        }
    }

    public setStream(group_id: string, stream_id: string) {
        (this.getGroup(group_id) as Group).stream_id = stream_id;
        this.sendRequest('Group.SetStream', '{"id":"' + group_id + '","stream_id":"' + stream_id + '"}');
    }

    public setClients(group_id: string, clients: string[]) {
        this.status_req_id = this.sendRequest('Group.SetClients', '{"clients":' + JSON.stringify(clients) + ',"id":"' + group_id + '"}');
    }

    public muteGroup(group_id: string, mute: boolean) {
        (this.getGroup(group_id) as Group).muted = mute;
        this.sendRequest('Group.SetMute', '{"id":"' + group_id + '","mute":' + (mute ? "true" : "false") + '}');
    }

    private sendRequest(method: string, params?: string): number {
        let msg = '{"id": ' + (++this.msg_id) + ',"jsonrpc":"2.0","method":"' + method + '"';
        if (params)
            msg += ',"params": ' + params;
        msg += '}';
        console.log("Sending: " + msg);
        this.connection.send(msg);
        return this.msg_id;
    }

    private onMessage(msg: string) {
        let answer = JSON.parse(msg);
        let is_response: boolean = (answer.id != undefined);
        console.log("Received " + (is_response ? "response" : "notification") + ", json: " + JSON.stringify(answer))
        if (is_response) {
            if (answer.id == this.status_req_id) {
                this.server = new Server(answer.result.server);
                show();
            }
        }
        else {
            if (Array.isArray(answer)) {
                for (let a of answer) {
                    this.action(a);
                }
            } else {
                this.action(answer);
            }
            // TODO: don't update everything, but only the changed, 
            // e.g. update the values for the volume sliders
            show();
        }
    }

    connection: WebSocket;
    server: Server;
    msg_id: number;
    status_req_id: number;
}


let snapcontrol = new SnapControl(window.location.hostname, 1780);
let snapstream: SnapStream | null = null;
let hide_offline: boolean = true;

function show() {
    // Render the page
    let play_img: string;
    if (snapstream) {
        play_img = 'stop.png';
    } else {
        play_img = 'play.png';
    }

    let content = "";
    content += "<div class='navbar'>Snapcast";
    content += "    <a href=\"javascript:play();\"><img src='" + play_img + "' class='play-button'></a>";
    content += "</div>";
    content += "<div class='content'>";

    let server = snapcontrol.server;
    for (let group of server.groups) {
        if (hide_offline) {
            let groupActive = false;
            for (let client of group.clients) {
                if (client.connected) {
                    groupActive = true;
                    break;
                }
            }
            if (!groupActive)
                continue;
        }

        // Set mute variables
        let classgroup;
        let muted: boolean;
        let mute_img: string;
        if (group.muted == true) {
            classgroup = 'group muted';
            muted = true;
            mute_img = 'mute_icon.png';
        } else {
            classgroup = 'group';
            muted = false;
            mute_img = 'speaker_icon.png';
        }

        // Start group div
        content += "<div id='g_" + group.id + "' class='" + classgroup + "'>";

        // Create stream selection dropdown
        let streamselect = "<select id='stream_" + group.id + "' onchange='setStream(\"" + group.id + "\")' class='stream'>"
        for (let i_stream = 0; i_stream < server.streams.length; i_stream++) {
            let streamselected = "";
            if (group.stream_id == server.streams[i_stream].id) {
                streamselected = 'selected'
            }
            streamselect += "<option value='" + server.streams[i_stream].id + "' " + streamselected + ">" + server.streams[i_stream].id + ": " + server.streams[i_stream].status + "</option>";
        }

        streamselect += "</select>";

        // Group mute and refresh button
        content += "<div class='groupheader'>";
        content += streamselect;
        if (group.clients.length > 1) {
            let volume = snapcontrol.getGroupVolume(group, hide_offline);
            content += "<a href=\"javascript:setMuteGroup('" + group.id + "'," + !muted + ");\"><img src='" + mute_img + "' class='mute-button'></a>";
            content += "<div class='slidergroupdiv'>";
            content += "    <input type='range' draggable='false' min=0 max=100 step=1 id='vol_" + group.id + "' oninput='javascript:setGroupVolume(\"" + group.id + "\")' value=" + volume + " class='slider'>";
            // content += "    <input type='range' min=0 max=100 step=1 id='vol_" + group.id + "' oninput='javascript:setVolume(\"" + client.id + "\"," + client.config.volume.muted + ")' value=" + client.config.volume.percent + " class='" + sliderclass + "'>";
            content += "</div>";
        }
        // transparent placeholder edit icon
        content += "<div class='edit-group-icon'>&#9998</div>";
        content += "</div>";
        content += "<hr class='groupheader-separator'>";

        // Create clients in group
        for (let client of group.clients) {
            if (!client.connected && hide_offline)
                continue;
            // Set name and connection state vars, start client div
            let name;
            let clas = 'client'
            if (client.config.name != "") {
                name = client.config.name;
            } else {
                name = client.host.name;
            }
            if (client.connected == false) {
                clas = 'client disconnected';
            }
            content += "<div id='c_" + client.id + "' class='" + clas + "'>";

            // Client mute status vars
            let muted: boolean;
            let mute_img: string;
            let sliderclass;
            if (client.config.volume.muted == true) {
                muted = true;
                sliderclass = 'slider muted';
                mute_img = 'mute_icon.png';
            } else {
                sliderclass = 'slider'
                muted = false;
                mute_img = 'speaker_icon.png';
            }

            // Populate client div
            content += "<a href=\"javascript:setVolume('" + client.id + "'," + !muted + ");\"><img src='" + mute_img + "' class='mute-button'></a>";
            content += "    <div class='sliderdiv'>";
            content += "        <input type='range' min=0 max=100 step=1 id='vol_" + client.id + "' oninput='javascript:setVolume(\"" + client.id + "\"," + client.config.volume.muted + ")' value=" + client.config.volume.percent + " class='" + sliderclass + "'>";
            content += "    </div>";
            content += "    <a href=\"javascript:openClientSettings('" + client.id + "');\" class='edit-icon'>&#9998</a>";
            content += "    <div class='name'>" + name + "</div>";
            content += "</div>";
        }
        content += "</div>";
    }
    content += "</div>"; // content

    content += "<div id='client-settings' class='client-settings'>";
    content += "    <div class='client-setting-content'>";
    content += "        <form action='javascript:closeClientSettings()'>";
    content += "        <label for='client-name'>Name</label>";
    content += "        <input type='text' class='client-input' id='client-name' name='client-name' placeholder='Client name..'>";
    content += "        <label for='client-latency'>Latency</label>";
    content += "        <input type='number' class='client-input' min='-1000' max='1000' id='client-latency' name='client-latency' placeholder='Latency in ms..'>";
    content += "        <label for='client-group'>Group</label>";
    content += "        <select id='client-group' class='client-input' name='client-group'>";
    content += "        </select>";
    content += "        <input type='submit' value='Submit'>";
    content += "        </form>";
    content += "    </div>";
    content += "</div>";

    // Pad then update page
    content = content + "<br><br>";
    (document.getElementById('show') as HTMLInputElement).innerHTML = content;

    for (let group of snapcontrol.server.groups) {
        if (group.clients.length > 1) {
            let slider = document.getElementById("vol_" + group.id) as HTMLInputElement;
            if (slider == null)
                continue;
            slider.addEventListener('pointerdown', function (ev: PointerEvent) {
                groupVolumeEnter(group.id);
            });
            slider.addEventListener('touchstart', function () {
                groupVolumeEnter(group.id);
            });
        }
    }
}

function updateGroupVolume(group: Group) {
    let group_vol = snapcontrol.getGroupVolume(group, hide_offline);
    let slider = document.getElementById("vol_" + group.id) as HTMLInputElement;
    if (slider == null)
        return;
    console.log("updateGroupVolume group: " + group.id + ", volume: " + group_vol + ", slider: " + (slider != null));
    slider.value = String(group_vol);
}

let client_volumes: Array<number>;
let group_volume: number;
function setGroupVolume(group_id: string) {
    let group = snapcontrol.getGroup(group_id) as Group;
    let percent = (document.getElementById('vol_' + group.id) as HTMLInputElement).valueAsNumber;
    console.log("setGroupVolume id: " + group.id + ", volume: " + percent);
    // show()
    let delta = percent - group_volume;
    let ratio: number;
    if (delta < 0)
        ratio = (group_volume - percent) / group_volume;
    else
        ratio = (percent - group_volume) / (100 - group_volume);

    for (let i = 0; i < group.clients.length; ++i) {
        let new_volume = client_volumes[i];
        if (delta < 0)
            new_volume -= ratio * client_volumes[i];
        else
            new_volume += ratio * (100 - client_volumes[i]);
        let client_id = group.clients[i].id;
        // TODO: use batch request to update all client volumes at once
        snapcontrol.setVolume(client_id, new_volume);
        let slider = document.getElementById('vol_' + client_id) as HTMLInputElement;
        if (slider)
            slider.value = String(new_volume);
    }
}

function groupVolumeEnter(group_id: string) {
    let group = snapcontrol.getGroup(group_id) as Group;
    let percent = (document.getElementById('vol_' + group.id) as HTMLInputElement).valueAsNumber;
    console.log("groupVolumeEnter id: " + group.id + ", volume: " + percent);
    group_volume = percent;
    client_volumes = [];
    for (let i = 0; i < group.clients.length; ++i) {
        client_volumes.push(group.clients[i].config.volume.percent);
    }
    // show()
}

function setVolume(id: string, mute: boolean) {
    console.log("setVolume id: " + id + ", mute: " + mute);
    let percent = (document.getElementById('vol_' + id) as HTMLInputElement).valueAsNumber;
    let client = snapcontrol.getClient(id) as Client;
    let needs_update = (mute != client.config.volume.muted);
    snapcontrol.setVolume(id, percent, mute);
    let group = snapcontrol.getGroupFromClient(id) as Group;
    updateGroupVolume(group);
    if (needs_update)
        show();
}

function play() {
    if (snapstream) {
        snapstream.stop();
        snapstream = null;
    }
    else {
        snapstream = new SnapStream(window.location.hostname, 1780);
    }
    show();
}

function setMuteGroup(id: string, mute: boolean) {
    snapcontrol.muteGroup(id, mute);
    show();
}

function setStream(id: string) {
    snapcontrol.setStream(id, (document.getElementById('stream_' + id) as HTMLInputElement).value);
    show();
}

function setGroup(client_id: string, group_id: string) {
    console.log("setGroup id: " + client_id + ", group: " + group_id);

    let server = snapcontrol.server;
    // Get client group id
    let current_group = snapcontrol.getGroupFromClient(client_id) as Group;

    // Get
    //   List of target group's clients
    // OR
    //   List of current group's other clients
    let send_clients = [];
    for (let i_group = 0; i_group < server.groups.length; i_group++) {
        if (server.groups[i_group].id == group_id || (group_id == "new" && server.groups[i_group].id == current_group.id)) {
            for (let i_client = 0; i_client < server.groups[i_group].clients.length; i_client++) {
                if (group_id == "new" && server.groups[i_group].clients[i_client].id == client_id) { }
                else {
                    send_clients[send_clients.length] = server.groups[i_group].clients[i_client].id;
                }
            }
        }
    }

    if (group_id == "new")
        group_id = current_group.id;
    else
        send_clients[send_clients.length] = client_id;
    snapcontrol.setClients(group_id, send_clients);
}

function setName(id: string) {
    // Get current name and lacency
    let client = snapcontrol.getClient(id) as Client;
    let current_name: string = (client.config.name != "") ? client.config.name : client.host.name;
    let current_latency: number = client.config.latency;

    let new_name = window.prompt("New Name", current_name);
    let new_latency = Number(window.prompt("New Latency", String(current_latency)));

    if (new_name != null)
        snapcontrol.setClientName(id, new_name);
    if (new_latency != null)
        snapcontrol.setClientLatency(id, new_latency);
    show()
}


function openClientSettings(id: string) {
    let modal = document.getElementById("client-settings") as HTMLElement;
    let client = snapcontrol.getClient(id) as Client;
    let current_name: string = (client.config.name != "") ? client.config.name : client.host.name;
    let name = document.getElementById("client-name") as HTMLInputElement;
    name.name = id;
    name.value = current_name;
    let latency = document.getElementById("client-latency") as HTMLInputElement;
    latency.valueAsNumber = client.config.latency;

    let group = snapcontrol.getGroupFromClient(id) as Group;
    let group_input = document.getElementById("client-group") as HTMLSelectElement;
    while (group_input.length > 0)
        group_input.remove(0);
    let group_num = 0;
    for (let ogroup of snapcontrol.server.groups) {
        let option = document.createElement('option');
        option.value = ogroup.id;
        option.text = "Group " + (group_num + 1) + " (" + ogroup.clients.length + " Clients)";
        group_input.add(option);
        if (ogroup == group) {
            console.log("Selected: " + group_num);
            group_input.selectedIndex = group_num;
        }
        ++group_num;
    }
    let option = document.createElement('option');
    option.value = option.text = "new";
    group_input.add(option);

    modal.style.display = "block";
}

function closeClientSettings() {
    let name = document.getElementById("client-name") as HTMLInputElement;
    let id = name.name;
    console.log("onclose " + id + ", value: " + name.value);
    snapcontrol.setClientName(id, name.value);

    let latency = document.getElementById("client-latency") as HTMLInputElement;
    snapcontrol.setClientLatency(id, latency.valueAsNumber);

    let group_input = document.getElementById("client-group") as HTMLSelectElement;
    let option = group_input.options[group_input.selectedIndex];
    setGroup(id, option.value);

    let modal = document.getElementById("client-settings") as HTMLElement;
    modal.style.display = "none";
    show();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event: any) {
    let modal = document.getElementById("client-settings") as HTMLElement;
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
