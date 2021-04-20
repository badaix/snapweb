import {zip} from "./util";

export interface Data {
  host: Host;
  snapserver: Snapserver;
  groups: Group[];
  streams: Stream[];
}

export interface Host {
  arch: string;
  ip: string;
  mac: string;
  name: string;
  os: string;
}

export interface Group {
  name: string;
  id: string;
  stream_id: string;
  muted: boolean;
  clients: Client[];
}

export interface Volume {
  muted: boolean;
  percent: number;
}

export interface Client {
  id: string;
  connected: boolean;
  host: Host;
  snapclient: SnapPeer;
  config: {
    instance: number;
    latency: number;
    name: string;
    volume: Volume;
  };
  lastSeen: {
    sec: number;
    usec: number;
  };
}

export interface Stream {
  id: string;
  status: string;
  meta: object;
  uri: {
    raw: string;
    scheme: string;
    host: string;
    path: string;
    fragment: string;
    query: Object;
  };
}

export interface SnapPeer {
  name: string;
  protocolVersion: number;
  version: string;
}

export interface Snapserver extends SnapPeer {
  controlProtocolVersion: number;
}

export interface SnapResponse {
  id: number;
  result: any;
}

export interface SnapEvent {
  method: string;
  params: any;
}

interface Request {
  id: number;
  jsonrpc: string;
  method: string;
  params: any;
}

type Status = { groups: Group[], streams: Stream[], server: { host: Host; snapserver: Snapserver } };

export type ClientVolume = { clientId: string; volume: Volume };

export default class Rpc {
  connect(baseUrl: string) {
    this.data = undefined;
    this.ws = new WebSocket(baseUrl + '/jsonrpc');
    this.ws!.onmessage = (msg: MessageEvent) => this.onMessage(msg.data);
    this.ws!.onopen = () => {
      this.sendPromisedRequest<{ server: Status }>("Server.GetStatus")
        .then(result => {
          this.data = <Data>{
            host: result.server.server.host,
            snapserver: result.server.server.snapserver,
            groups: result.server.groups,
            streams: result.server.streams,
          };
        });
    };
    this.ws!.onerror = (ev) => {
      console.error("WebSocket error:", ev);
    };
    this.ws!.onclose = () => {
      console.warn("connection lost, reconnecting in 1s");
      setTimeout(() => this.connect(baseUrl), 1000);
    };
  };

  setGroupName(groupId: string, name: string) {
    this.sendPromisedRequest<{ name: string }>("Group.SetName", {
      id: groupId,
      name,
    }).then(result => this.getGroup(groupId).name = result.name);
  }

  setGroupMuted(groupId: string, muted: boolean) {
    this.sendPromisedRequest<{ mute: boolean }>("Group.SetMute", {
      id: groupId,
      mute: muted,
    }).then(result => this.getGroup(groupId).muted = result.mute);
  }

  setGroupStream(groupId: string, streamId: string) {
    this.sendPromisedRequest<{ stream_id: string }>("Group.SetStream", {
      id: groupId,
      stream_id: streamId,
    }).then(result => this.getGroup(groupId).stream_id = result.stream_id);
  }

  setGroupClients(groupId: string, clientIds: string[]) {
    this.sendPromisedRequest<{ server: Status }>("Group.SetClients", {
      id: groupId,
      clients: clientIds,
    }).then(result => this.handleFullStatus(result.server));
  }

  setClientVolumes(volumes: ClientVolume[]) {
    const promises = this.sendPromisedBatchRequest<{ volume: Volume }>(volumes
      .map(({clientId: id, volume}) => this.buildRequest(
        "Client.SetVolume",
        {id, volume},
      )));
    zip(volumes, promises)
      .map(([v, promise]) => {
        promise.then((result: any) => this.getClient(v.clientId).config.volume = result.volume);
      });
  }

  setClientMuted(clientId: string, muted: boolean) {
    this.sendPromisedRequest<{ volume: Volume }>("Client.SetVolume", {
      id: clientId,
      volume: {
        muted,
        percent: this.getClient(clientId).config.volume.percent,
      },
    }).then(result => this.getClient(clientId).config.volume = result.volume);
  }

  setClientVolume(clientId: string, percent: number) {
    this.sendPromisedRequest<{ volume: Volume }>("Client.SetVolume", {
      id: clientId,
      volume: {
        muted: this.getClient(clientId).config.volume.muted,
        percent,
      },
    }).then(result => this.getClient(clientId).config.volume = result.volume);
  }

  setClientName(clientId: string, name: string) {
    this.sendPromisedRequest<{ name: string }>("Client.SetName", {
      id: clientId,
      name,
    }).then(result => this.getClient(clientId).config.name = result.name);
  }

  setClientLatency(clientId: string, latency: number) {
    this.sendPromisedRequest<{ latency: number }>("Client.SetLatency", {
      id: clientId,
      latency: latency,
    }).then(result => this.getClient(clientId).config.latency = result.latency);
  }

  setClientGroup(clientId: string, groupId: string) {
    const clientIds = this.getGroup(groupId).clients.map(c => c.id);
    clientIds.push(clientId);
    this.setGroupClients(groupId, clientIds);
  }

  moveClientToNewGroup(clientId: string, currentGroupId: string) {
    const clientIds = this.getGroup(currentGroupId).clients.map(c => c.id).filter(id => id !== clientId);
    this.setGroupClients(currentGroupId, clientIds);
  }

  deleteClient(clientId: string) {
    this.sendPromisedRequest<{ server: Status }>("Server.DeleteClient", {
      id: clientId,
    }).then(result => this.handleFullStatus(result.server));
  }

  private handleFullStatus(status: Status) {
    if (this.data) {
      Object.assign(this.data.snapserver, status.server.snapserver);
      Object.assign(this.data.host, status.server.host);
      this.data.groups = status.groups;
      this.data.streams = status.streams;
    }
  }

  private onMessage(payload: any) {
    const raw: any = JSON.parse(payload);
    const rawArray: any[] = Array.isArray(raw) ? raw : [raw];
    rawArray.forEach(r => {
      if (r.id !== undefined) {
        this.handleResponse(r as SnapResponse);
      } else {
        this.handleEvent(r as SnapEvent);
      }
    });
  }

  private handleResponse(response: SnapResponse) {
    const promise = this.responsePromises[response.id];
    if (promise !== undefined) {
      const [resolve, , timeout] = promise;
      clearTimeout(timeout);
      delete this.responsePromises[response.id];
      resolve(response.result);
    }
  }

  private buildRequest(method: string, params: any = undefined): Request {
    const id = ++this.nextMessageId;
    return <Request>{
      id: id,
      jsonrpc: "2.0",
      method: method,
      params: params,
    };
  }

  private sendRequest(method: string, params?: any): number {
    const msg = this.buildRequest(method, params);
    this.ws?.send(JSON.stringify(msg));
    return msg.id;
  }

  private sendPromisedRequest<T>(method: string, params?: any): Promise<T> {
    const id = this.sendRequest(method, params);
    return new Promise<any>((resolve, reject) =>
      this.schedulePromise(id, resolve, reject));
  }

  private sendBatchRequest(payloads: Array<{ method: string, params?: any }>): Array<number> {
    const batch = payloads.map(p => this.buildRequest(p.method, p.params));
    this.ws?.send(JSON.stringify(batch));
    return batch.map(b => b.id);
  }

  private sendPromisedBatchRequest<T>(payloads: Array<{ method: string, params?: any }>): Array<Promise<T>> {
    return this.sendBatchRequest(payloads)
      .map(id => new Promise<any>((resolve, reject) =>
        this.schedulePromise(id, resolve, reject)));
  }

  private schedulePromise(id: number, resolve: Function, reject: Function) {
    const timeout = setTimeout(
      () => this.timeoutPromise(id),
      2000);
    this.responsePromises[id] = [resolve, reject, timeout];
  }

  private timeoutPromise(id: number) {
    const promise = this.responsePromises[id];
    if (promise === undefined) return;
    delete this.responsePromises[id];
    const [, reject,] = promise;
    reject("timeout");
  }

  private handleEvent(event: SnapEvent) {
    const {method, params} = event;
    switch (method) {
      case "Group.OnMute":
        this.getGroup(params.id).muted = params.mute;
        break;
      case "Group.OnStreamChanged":
        this.getGroup(params.id).stream_id = params.stream_id;
        break;
      case "Group.OnNameChanged":
        this.getGroup(params.id).name = params.name;
        break;
      case "Stream.OnUpdate":
        Object.assign(this.getStream(params.id), params.stream);
        break;
      case "Server.OnUpdate":
        this.handleFullStatus(params.server as Status);
        break;
      case "Client.OnVolumeChanged":
        this.getClient(params.id).config.volume = params.volume;
        break;
      case "Client.OnLatencyChanged":
        this.getClient(params.id).config.latency = params.latency;
        break;
      case "Client.OnNameChanged":
        this.getClient(params.id).config.name = params.name;
        break;
      case "Client.OnConnect":
      case "Client.OnDisconnect":
        Object.assign(this.getClient(params.client.id), params.client as Client);
        break;
      default:
        console.warn("unhandled event:", method);
    }
  }

  private getGroup(id: string): Group {
    return this.data?.groups.find(g => g.id === id) ||
      <Group>{id: "", muted: false, name: "", clients: [], stream_id: ""};
  }

  private getStream(id: string): Stream {
    return this.data?.streams.find(s => s.id === id) ||
      <Stream>{
        id: "",
        status: "",
        meta: {},
        uri: {fragment: "", host: "", path: "", query: {}, raw: "", scheme: ""}
      };
  }

  private getClient(id: string): Client {
    return this.data?.groups.flatMap(g => g.clients).find(c => c.id === id) ||
      <Client>{
        id: "",
        config: {instance: 0, latency: 0, name: "", volume: {muted: false, percent: 0}},
        connected: false,
        host: {name: "", arch: "", ip: "", mac: "", os: ""},
        lastSeen: {sec: 0, usec: 0},
        snapclient: {name: "", protocolVersion: 0, version: ""},
      };
  }

  data?: Data = undefined

  private ws?: WebSocket;
  private nextMessageId: number = 0;
  private responsePromises: { [id: number]: [Function, Function, number] } = {};
}
