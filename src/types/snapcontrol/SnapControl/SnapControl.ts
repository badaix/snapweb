import Server from 'types/snapcontrol/Server'
import Stream from 'types/snapcontrol/Stream'
import Properties from 'types/snapcontrol/Properties'
import Metadata from 'types/snapcontrol/Metadata'
import Group from 'types/snapcontrol/Group'
import Client from 'types/snapcontrol/Client'
import PlaybackStatus from 'types/snapcontrol/PlaybackStatus'

class SnapControl {
    constructor(updateGroupVolume: (group: Group) => void, updatePlaybackState: (playbackState: PlaybackStatus) => void, baseUrl?: string) {
        this.server = new Server();
        this.updateGroupVolume = updateGroupVolume
        this.updatePlaybackState = updatePlaybackState
        if (baseUrl) {
            this.updateBaseUrl(baseUrl)
        }
    }

    public updateBaseUrl(baseUrl: string) {
        if (this.connection) {
            this.connection.close()
        }
        this.server = new Server();
        this.baseUrl = baseUrl
        this.status_req_id = -1
        this.msg_id = 0;
        this.connect();
    }

    private connect() {
        this.connection = new WebSocket(this.baseUrl + '/jsonrpc');
        this.connection.onmessage = (msg: MessageEvent) => this.onMessage(msg.data);
        this.connection.onopen = () => { this.status_req_id = this.sendRequest('Server.GetStatus'); };
        this.connection.onerror = (ev: Event) => { console.error('error:', ev); };
        this.connection.onclose = () => {
            console.info('connection lost, reconnecting in 1s');
            setTimeout(() => this.connect(), 1000);
        };
    }

    private onNotification(notification: any): boolean {
        let stream!: Stream;
        switch (notification.method) {
            case 'Client.OnVolumeChanged':
                let client = this.getClient(notification.params.id);
                client.config.volume = notification.params.volume;
                this.updateGroupVolume(this.getGroupFromClient(client.id));
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
                this.updateProperties(notification.params.stream_id);
                return true;
            case 'Stream.OnUpdate':
                stream = this.getStream(notification.params.id);
                stream.fromJson(notification.params.stream);
                this.updateProperties(stream.id);
                return true;
            case 'Server.OnUpdate':
                this.server.fromJson(notification.params.server);
                this.updateProperties(this.getMyStreamId());
                return true;
            case 'Stream.OnProperties':
                stream = this.getStream(notification.params.id);
                stream.properties.fromJson(notification.params.properties);
                if (this.getMyStreamId() == stream.id)
                    this.updateProperties(stream.id);
                return false;
            default:
                return false;
        }
    }

    public updateProperties(stream_id: string) {
        if (!('mediaSession' in navigator)) {
            console.log('updateProperties: mediaSession not supported');
            return;
        }

        if (stream_id != this.getMyStreamId()) {
            console.log('updateProperties: not my stream id: ' + stream_id + ', mine: ' + this.getMyStreamId());
            return;
        }

        let props!: Properties;
        let metadata!: Metadata;
        try {
            props = this.getStreamFromClient(SnapStream.getClientId()).properties;
            metadata = this.getStreamFromClient(SnapStream.getClientId()).properties.metadata;
        }
        catch (e) {
            console.log('updateProperties failed: ' + e);
            return;
        }

        // https://developers.google.com/web/updates/2017/02/media-session
        // https://github.com/googlechrome/samples/tree/gh-pages/media-session
        // https://googlechrome.github.io/samples/media-session/audio.html
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler#seekto
        console.log('updateProperties: ', props);
        if (props.playbackStatus != undefined) {
            this.updatePlaybackState(props.playbackStatus as PlaybackStatus)
        }

        let mediaSession = navigator.mediaSession!;
        // if (props.canGoNext == undefined || !props.canGoNext!)
        mediaSession.setActionHandler('play', () => {
            props.canPlay ?
                this.sendRequest('Stream.Control', { id: stream_id, command: 'play' }) : null
        });
        mediaSession.setActionHandler('pause', () => {
            props.canPause ?
                this.sendRequest('Stream.Control', { id: stream_id, command: 'pause' }) : null
        });
        mediaSession.setActionHandler('previoustrack', () => {
            props.canGoPrevious ?
                this.sendRequest('Stream.Control', { id: stream_id, command: 'previous' }) : null
        });
        mediaSession.setActionHandler('nexttrack', () => {
            props.canGoNext ?
                this.sendRequest('Stream.Control', { id: stream_id, command: 'next' }) : null
        });
        try {
            mediaSession.setActionHandler('stop', () => {
                props.canControl ?
                    this.sendRequest('Stream.Control', { id: stream_id, command: 'stop' }) : null
            });
        } catch (error) {
            console.log('Warning! The "stop" media session action is not supported.');
        }

        let defaultSkipTime: number = 10; // Time to skip in seconds by default
        mediaSession.setActionHandler('seekbackward', (event: MediaSessionActionDetails) => {
            let offset: number = (event.seekOffset || defaultSkipTime) * -1;
            if (props.position != undefined)
                Math.max(props.position! + offset, 0);
            props.canSeek ?
                this.sendRequest('Stream.Control', { id: stream_id, command: 'seek', params: { 'offset': offset } }) : null
        });

        mediaSession.setActionHandler('seekforward', (event: MediaSessionActionDetails) => {
            let offset: number = event.seekOffset || defaultSkipTime;
            if ((metadata.duration != undefined) && (props.position != undefined))
                Math.min(props.position! + offset, metadata.duration!);
            props.canSeek ?
                this.sendRequest('Stream.Control', { id: stream_id, command: 'seek', params: { 'offset': offset } }) : null
        });

        try {
            mediaSession.setActionHandler('seekto', (event: MediaSessionActionDetails) => {
                let position: number = event.seekTime || 0;
                if (metadata.duration != undefined)
                    Math.min(position, metadata.duration!);
                props.canSeek ?
                    this.sendRequest('Stream.Control', { id: stream_id, command: 'setPosition', params: { 'position': position } }) : null
            });
        } catch (error) {
            console.log('Warning! The "seekto" media session action is not supported.');
        }

        if ((metadata.duration != undefined) && (props.position != undefined) && (props.position! <= metadata.duration!)) {
            if ('setPositionState' in mediaSession) {
                console.log('Updating position state: ' + props.position! + '/' + metadata.duration!);
                mediaSession.setPositionState!({
                    duration: metadata.duration!,
                    playbackRate: 1.0,
                    position: props.position!
                });
            }
        }
        else {
            mediaSession.setPositionState!({
                duration: 0,
                playbackRate: 1.0,
                position: 0
            });
        }


        console.log('updateMetadata: ', metadata);
        // https://github.com/Microsoft/TypeScript/issues/19473
        let title: string = metadata.title || "Unknown Title";
        let artist: string = (metadata.artist != undefined) ? metadata.artist[0] : "Unknown Artist";
        let album: string = metadata.album || "";
        let artwork: string = metadata.artUrl || 'snapcast-512.png';
        console.log('Metadata title: ' + title + ', artist: ' + artist + ', album: ' + album + ", artwork: " + artwork);
        navigator.mediaSession!.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            album: album,
            artwork: [
                // { src: artwork, sizes: '250x250', type: 'image/jpeg' },
                // 'https://dummyimage.com/96x96', sizes: '96x96', type: 'image/png' },
                { src: artwork, sizes: '128x128', type: 'image/png' },
                { src: artwork, sizes: '192x192', type: 'image/png' },
                { src: artwork, sizes: '256x256', type: 'image/png' },
                { src: artwork, sizes: '384x384', type: 'image/png' },
                { src: artwork, sizes: '512x512', type: 'image/png' },
            ]
        });

        // mediaSession.setActionHandler('seekbackward', function () { });
        // mediaSession.setActionHandler('seekforward', function () { });
    }

    public getClient(client_id: string): Client {
        let client = this.server.getClient(client_id);
        if (client == null) {
            throw new Error(`client ${client_id} was null`);
        }
        return client;
    }

    public getGroup(group_id: string): Group {
        let group = this.server.getGroup(group_id);
        if (group == null) {
            throw new Error(`group ${group_id} was null`);
        }
        return group;
    }

    public getGroupVolume(group: Group, online?: boolean): number {
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

    public getGroupFromClient(client_id: string): Group {
        for (let group of this.server.groups)
            for (let client of group.clients)
                if (client.id == client_id)
                    return group;
        throw new Error(`group for client ${client_id} was null`);
    }

    public getStreamFromClient(client_id: string): Stream {
        let group: Group = this.getGroupFromClient(client_id);
        return this.getStream(group.stream_id);
    }

    public getMyStreamId(): string {
        try {
            let group: Group = this.getGroupFromClient(SnapStream.getClientId());
            return this.getStream(group.stream_id).id;
        } catch (e) {
            return "";
        }
    }

    public getStream(stream_id: string): Stream {
        let stream = this.server.getStream(stream_id);
        if (stream == null) {
            throw new Error(`stream ${stream_id} was null`);
        }
        return stream;
    }

    public setVolume(client_id: string, percent: number, mute?: boolean) {
        percent = Math.max(0, Math.min(100, percent));
        let client = this.getClient(client_id);
        client.config.volume.percent = percent;
        if (mute != undefined)
            client.config.volume.muted = mute;
        this.sendRequest('Client.SetVolume', { id: client_id, volume: { muted: client.config.volume.muted, percent: client.config.volume.percent } });
    }

    public setClientName(client_id: string, name: string) {
        let client = this.getClient(client_id);
        let current_name: string = (client.config.name != "") ? client.config.name : client.host.name;
        if (name != current_name) {
            this.sendRequest('Client.SetName', { id: client_id, name: name });
            client.config.name = name;
        }
    }

    public setClientLatency(client_id: string, latency: number) {
        let client = this.getClient(client_id);
        let current_latency: number = client.config.latency;
        if (latency != current_latency) {
            this.sendRequest('Client.SetLatency', { id: client_id, latency: latency });
            client.config.latency = latency;
        }
    }

    public deleteClient(client_id: string) {
        this.sendRequest('Server.DeleteClient', { id: client_id });
        this.server.groups.forEach((g: Group, gi: number) => {
            g.clients.forEach((c: Client, ci: number) => {
                if (c.id == client_id) {
                    this.server.groups[gi].clients.splice(ci, 1);
                }
            })
        })

        this.server.groups.forEach((g: Group, gi: number) => {
            if (g.clients.length == 0) {
                this.server.groups.splice(gi, 1);
            }
        });
        show();
    }

    public setStream(group_id: string, stream_id: string) {
        this.getGroup(group_id).stream_id = stream_id;
        this.updateProperties(stream_id);
        this.sendRequest('Group.SetStream', { id: group_id, stream_id: stream_id });
    }

    public setClients(group_id: string, clients: string[]) {
        this.status_req_id = this.sendRequest('Group.SetClients', { id: group_id, clients: clients });
    }

    public muteGroup(group_id: string, mute: boolean) {
        this.getGroup(group_id).muted = mute;
        this.sendRequest('Group.SetMute', { id: group_id, mute: mute });
    }

    private sendRequest(method: string, params?: any): number {
        let msg: any = {
            id: ++this.msg_id,
            jsonrpc: '2.0',
            method: method
        };
        if (params)
            msg.params = params;

        let msgJson = JSON.stringify(msg);
        console.log("Sending: " + msgJson);
        this.connection?.send(msgJson);
        return this.msg_id;
    }

    private onMessage(msg: string) {
        let json_msg = JSON.parse(msg);
        let is_response: boolean = (json_msg.id != undefined);
        console.log("Received " + (is_response ? "response" : "notification") + ", json: " + JSON.stringify(json_msg))
        if (is_response) {
            if (json_msg.id == this.status_req_id) {
                this.server = new Server(json_msg.result.server);
                this.updateProperties(this.getMyStreamId());
                show();
            }
        }
        else {
            let refresh: boolean = false;
            if (Array.isArray(json_msg)) {
                for (let notification of json_msg) {
                    refresh = this.onNotification(notification) || refresh;
                }
            } else {
                refresh = this.onNotification(json_msg);
            }
            // TODO: don't update everything, but only the changed, 
            // e.g. update the values for the volume sliders
            if (refresh)
                show();
        }
    }

    baseUrl?: string;
    connection?: WebSocket;
    server: Server;
    msg_id: number = 0;
    status_req_id: number = -1;
    updateGroupVolume!: (group: Group) => void;
    updatePlaybackState!: (playbackState: PlaybackStatus) => void;
}

export default SnapControl