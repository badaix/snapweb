namespace Snapcast {

    export class Host {
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


    export class Client {
        constructor(json: any) {
            this.fromJson(json);
        }

        fromJson(json: any) {
            this.id = json.id;
            this.host = new Host(json.host);
            const jsnapclient = json.snapclient;
            this.snapclient = { name: jsnapclient.name, protocolVersion: jsnapclient.protocolVersion, version: jsnapclient.version }
            const jconfig = json.config;
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

        getName(): string {
            return this.config.name.length === 0 ? this.host.name : this.config.name;
        }
    }


    export class Group {
        constructor(json: any) {
            this.fromJson(json);
        }

        fromJson(json: any) {
            this.name = json.name;
            this.id = json.id;
            this.stream_id = json.stream_id;
            this.muted = Boolean(json.muted);
            for (const client of json.clients)
                this.clients.push(new Client(client));
        }

        name: string = "";
        id: string = "";
        stream_id: string = "";
        muted: boolean = false;
        clients: Client[] = [];

        getClient(id: string): Client | null {
            for (const client of this.clients) {
                if (client.id === id)
                    return client;
            }
            return null;
        }
    }

    export class Metadata {
        constructor(json: any) {
            this.fromJson(json);
        }

        fromJson(json: any) {
            this.title = json.title;
            this.artist = json.artist;
            this.album = json.album;
            this.artUrl = json.artUrl;
            this.duration = json.duration;
        }

        title?: string;
        artist?: string[];
        album?: string;
        artUrl?: string;
        duration?: number;
    }

    type PlaybackStatus = 'stopped' | 'paused' | 'playing';

    export class Properties {
        constructor(json: any) {
            this.fromJson(json);
        }

        fromJson(json: any) {
            this.loopStatus = json.loopStatus;
            this.shuffle = json.shuffle;
            this.volume = json.volume;
            this.rate = json.rate;
            this.playbackStatus = json.playbackStatus;
            this.position = json.position;
            this.minimumRate = json.minimumRate;
            this.maximumRate = json.maximumRate;
            this.canGoNext = Boolean(json.canGoNext);
            this.canGoPrevious = Boolean(json.canGoPrevious);
            this.canPlay = Boolean(json.canPlay);
            this.canPause = Boolean(json.canPause);
            this.canSeek = Boolean(json.canSeek);
            this.canControl = Boolean(json.canControl);
            if (json.metadata !== undefined) {
                this.metadata = new Metadata(json.metadata);
            } else {
                this.metadata = undefined;
            }
        }

        loopStatus?: string;
        shuffle?: boolean
        volume?: number;
        rate?: number;
        playbackStatus?: PlaybackStatus;
        position?: number;
        minimumRate?: number;
        maximumRate?: number;
        canGoNext: boolean = false;
        canGoPrevious: boolean = false;
        canPlay: boolean = false;
        canPause: boolean = false;
        canSeek: boolean = false;
        canControl: boolean = false;
        metadata?: Metadata;
    }

    export class Stream {
        constructor(json: any) {
            this.fromJson(json);
        }

        fromJson(json: any) {
            this.id = json.id;
            this.status = json.status;
            if (json.properties !== undefined) {
                this.properties = new Properties(json.properties);
            } else {
                this.properties = new Properties({});
            }
            const juri = json.uri;
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

        properties!: Properties;
    }


    export class Server {
        constructor(json?: any) {
            if (json)
                this.fromJson(json);
        }

        fromJson(json: any) {
            this.groups = []
            for (const jgroup of json.groups)
                this.groups.push(new Group(jgroup));
            const jsnapserver: any = json.server.snapserver;
            this.server = { host: new Host(json.server.host), snapserver: { controlProtocolVersion: jsnapserver.controlProtocolVersion, name: jsnapserver.name, protocolVersion: jsnapserver.protocolVersion, version: jsnapserver.version } };
            this.streams = []
            for (const jstream of json.streams) {
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
            for (const group of this.groups) {
                const client = group.getClient(id);
                if (client)
                    return client;
            }
            return null;
        }

        getGroup(id: string): Group | null {
            for (const group of this.groups) {
                if (group.id === id)
                    return group;
            }
            return null;
        }

        getStream(id: string): Stream | null {
            for (const stream of this.streams) {
                if (stream.id === id)
                    return stream;
            }
            return null;
        }
    }
}

// interface OnChange { (_server: Snapcast.Server): void }
// interface OnStreamChange { (id: string): void };

class SnapControl {

    constructor() {
        this.onChange = null;
        this.onConnectionChanged = null;
        this.server = new Snapcast.Server();
        this.msg_id = 0;
        this.status_req_id = -1;
        this.timer = null;
    }

    public connect(baseUrl: string) {
        this.disconnect();
        try {
            this.connection = new WebSocket(baseUrl + '/jsonrpc');
            this.connection.onmessage = (msg: MessageEvent) => this.onMessage(msg.data);
            this.connection.onopen = () => {
                this.status_req_id = this.sendRequest('Server.GetStatus');
                if (this.onConnectionChanged)
                    this.onConnectionChanged(this, true);
            };
            this.connection.onerror = (ev: Event) => { console.error('error:', ev); };
            this.connection.onclose = () => {
                if (this.onConnectionChanged)
                    this.onConnectionChanged(this, false, 'Connection lost, trying to reconnect.');
                console.info('connection lost, reconnecting in 1s');
                this.timer = setTimeout(() => this.connect(baseUrl), 1000);
            };
        } catch (e) {
            console.info('Exception while connecting: "' + e + '", reconnecting in 1s');
            if (this.onConnectionChanged)
                this.onConnectionChanged(this, false, 'Exception while connecting: "' + e + '", trying to reconnect.');
            this.timer = setTimeout(() => this.connect(baseUrl), 1000);
        }
    }

    public disconnect() {
        if (this.timer)
            clearTimeout(this.timer);
        if (this.connection) {
            this.connection.onclose = () => { };
            if (this.connection.readyState === WebSocket.OPEN) {
                this.connection.close();
            }
        }
        if (this.onConnectionChanged)
            this.onConnectionChanged(this, false);
    }

    onChange: ((_this: SnapControl, _server: Snapcast.Server) => any) | null;
    onConnectionChanged: ((_this: SnapControl, _connected: boolean, _error?: string) => any) | null;

    private onNotification(notification: any): boolean {
        let stream!: Snapcast.Stream;
        switch (notification.method) {
            case 'Client.OnVolumeChanged':
                this.getClient(notification.params.id).config.volume = notification.params.volume;
                // updateGroupVolume(this.getGroupFromClient(client.id));
                return true;
            case 'Client.OnLatencyChanged':
                this.getClient(notification.params.id).config.latency = notification.params.latency;
                return false;
            case 'Client.OnNameChanged':
                this.getClient(notification.params.id).config.name = notification.params.name;
                return true;
            case 'Client.OnConnect':
            case 'Client.OnDisconnect':
                this.getClient(notification.params.client.id).fromJson(notification.params.client);
                return true;
            case 'Group.OnMute':
                this.getGroup(notification.params.id).muted = Boolean(notification.params.mute);
                return true;
            case 'Group.OnStreamChanged':
                this.getGroup(notification.params.id).stream_id = notification.params.stream_id;
                return true;
            case 'Stream.OnUpdate':
                stream = this.getStream(notification.params.id);
                stream.fromJson(notification.params.stream);
                return true;
            case 'Server.OnUpdate':
                this.server.fromJson(notification.params.server);
                return true;
            case 'Stream.OnProperties':
                stream = this.getStream(notification.params.id);
                stream.properties.fromJson(notification.params.properties);
                return true;
            default:
                return false;
        }
    }

    public getClient(client_id: string): Snapcast.Client {
        const client = this.server.getClient(client_id);
        if (client == null) {
            throw new Error(`client ${client_id} was null`);
        }
        return client;
    }

    public getGroup(group_id: string): Snapcast.Group {
        const group = this.server.getGroup(group_id);
        if (group == null) {
            throw new Error(`group ${group_id} was null`);
        }
        return group;
    }

    public getGroupVolume(group: Snapcast.Group, online: boolean): number {
        if (group.clients.length === 0)
            return 0;
        let group_vol: number = 0;
        let client_count: number = 0;
        for (const client of group.clients) {
            if (online && !client.connected)
                continue;
            group_vol += client.config.volume.percent;
            ++client_count;
        }
        if (client_count === 0)
            return 0;
        return group_vol / client_count;
    }

    public getGroupFromClient(client_id: string): Snapcast.Group {
        for (const group of this.server.groups)
            for (const client of group.clients)
                if (client.id === client_id)
                    return group;
        throw new Error(`group for client ${client_id} was null`);
    }

    public getStreamFromClient(client_id: string): Snapcast.Stream {
        const group: Snapcast.Group = this.getGroupFromClient(client_id);
        return this.getStream(group.stream_id);
    }

    // public getMyStreamId(): string {
    //     try {
    //         let group: Group = this.getGroupFromClient(SnapStream.getClientId());
    //         return this.getStream(group.stream_id).id;
    //     } catch (e) {
    //         return "";
    //     }
    //     return "";
    // }

    public getStream(stream_id: string): Snapcast.Stream {
        const stream = this.server.getStream(stream_id);
        if (stream == null) {
            throw new Error(`stream ${stream_id} was null`);
        }
        return stream;
    }

    public setVolume(client_id: string, percent: number, mute?: boolean) {
        percent = Math.max(0, Math.min(100, percent));
        const client = this.getClient(client_id);
        client.config.volume.percent = percent;
        if (mute !== undefined)
            client.config.volume.muted = mute;
        this.sendRequest('Client.SetVolume', { id: client_id, volume: { muted: client.config.volume.muted, percent: client.config.volume.percent } });
    }

    public setClientName(client_id: string, name: string) {
        const client = this.getClient(client_id);
        const current_name: string = (client.config.name !== "") ? client.config.name : client.host.name;
        if (name !== current_name) {
            this.sendRequest('Client.SetName', { id: client_id, name: name });
            client.config.name = name;
        }
    }

    public setClientLatency(client_id: string, latency: number) {
        const client = this.getClient(client_id);
        const current_latency: number = client.config.latency;
        if (latency !== current_latency) {
            this.sendRequest('Client.SetLatency', { id: client_id, latency: latency });
            client.config.latency = latency;
        }
    }

    public deleteClient(client_id: string) {
        this.sendRequest('Server.DeleteClient', { id: client_id });
        this.server.groups.forEach((g: Snapcast.Group, gi: number) => {
            g.clients.forEach((c: Snapcast.Client, ci: number) => {
                if (c.id === client_id) {
                    this.server.groups[gi].clients.splice(ci, 1);
                }
            })
        })

        this.server.groups.forEach((g: Snapcast.Group, gi: number) => {
            if (g.clients.length === 0) {
                this.server.groups.splice(gi, 1);
            }
        });
        // show();
    }

    public setStream(group_id: string, stream_id: string) {
        this.getGroup(group_id).stream_id = stream_id;
        this.sendRequest('Group.SetStream', { id: group_id, stream_id: stream_id });
    }

    public setClients(group_id: string, clients: string[]) {
        this.status_req_id = this.sendRequest('Group.SetClients', { id: group_id, clients: clients });
    }

    public muteGroup(group_id: string, mute: boolean) {
        this.getGroup(group_id).muted = mute;
        this.sendRequest('Group.SetMute', { id: group_id, mute: mute });
    }

    public control(stream_id: string, command: string, params?: any) {
        const json: any = { id: stream_id, command: command };
        if (params) {
            json.params = params;
        }
        this.sendRequest('Stream.Control', json);
    }

    private sendRequest(method: string, params?: any): number {
        const msg: any = {
            id: ++this.msg_id,
            jsonrpc: '2.0',
            method: method
        };
        if (params)
            msg.params = params;

        const msgJson = JSON.stringify(msg);
        console.debug("Sending: " + msgJson);
        this.connection.send(msgJson);
        return this.msg_id;
    }

    private onMessage(msg: string) {
        let refresh: boolean = false;
        const json_msg = JSON.parse(msg);
        const is_response: boolean = (json_msg.id !== undefined);
        // console.debug("Received " + (is_response ? "response" : "notification") + ", json: " + JSON.stringify(json_msg))
        if (is_response) {
            if (json_msg.id === this.status_req_id) {
                this.server = new Snapcast.Server(json_msg.result.server);
                refresh = true;
            }
        }
        else {
            if (Array.isArray(json_msg)) {
                for (const notification of json_msg) {
                    refresh = this.onNotification(notification) || refresh;
                }
            } else {
                refresh = this.onNotification(json_msg);
            }
            refresh = true;

            // TODO: don't update everything, but only the changed, 
            // e.g. update the values for the volume sliders
            // if (refresh)
            //     show();
        }
        if (refresh) {
            if (this.onChange) {
                console.debug("onChange");
                this.onChange(this, this.server);
            } else {
                console.debug("no onChange");
            }
        }
    }

    // public onChange?: OnChange;
    // public onStreamChange?: OnStreamChange;

    connection!: WebSocket;
    server: Snapcast.Server;
    msg_id: number;
    status_req_id: number;
    timer: ReturnType<typeof setTimeout> | null;
}


export { SnapControl }
export { Snapcast }
