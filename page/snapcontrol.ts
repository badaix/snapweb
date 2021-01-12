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


class Server {
    constructor(json?: any) {
        if (json)
            this.fromJson(json);
    }

    fromJson(json: any) {
        this.groups = []
        for (let jgroup of json.groups)
            this.groups.push(new Group(jgroup));
        let jsnapserver: any = json.server.snapserver;
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

class SnapControl {
    constructor(baseUrl: string) {
        this.server = new Server();
        this.baseUrl = baseUrl;
        this.msg_id = 0;
        this.status_req_id = -1;
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

    private action(answer: any) {
        switch (answer.method) {
            case 'Client.OnVolumeChanged':
                let client = this.getClient(answer.params.id);
                client.config.volume = answer.params.volume;
                updateGroupVolume(this.getGroupFromClient(client.id));
                break;
            case 'Client.OnLatencyChanged':
                this.getClient(answer.params.id).config.latency = answer.params.latency;
                break;
            case 'Client.OnNameChanged':
                this.getClient(answer.params.id).config.name = answer.params.name;
                break;
            case 'Client.OnConnect':
            case 'Client.OnDisconnect':
                this.getClient(answer.params.client.id).fromJson(answer.params.client);
                break;
            case 'Group.OnMute':
                this.getGroup(answer.params.id).muted = Boolean(answer.params.mute);
                break;
            case 'Group.OnStreamChanged':
                this.getGroup(answer.params.id).stream_id = answer.params.stream_id;
                break;
            case 'Stream.OnUpdate':
                this.getStream(answer.params.id).fromJson(answer.params.stream);
                break;
            case 'Server.OnUpdate':
                this.server.fromJson(answer.params.server);
                break;
            default:
                break;
        }
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

    public getGroupFromClient(client_id: string): Group {
        for (let group of this.server.groups)
            for (let client of group.clients)
                if (client.id == client_id)
                    return group;
        throw new Error(`group for client ${client_id} was null`);
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
        this.connection.send(msgJson);
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

    baseUrl: string;
    connection!: WebSocket;
    server: Server;
    msg_id: number;
    status_req_id: number;
}


let snapcontrol!: SnapControl;
let snapstream: SnapStream | null = null;
let hide_offline: boolean = true;
let autoplay_done: boolean = false;

function autoplayRequested(): boolean {
    return document.location.hash.match(/autoplay/) !== null;
}

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
    let serverVersion = snapcontrol.server.server.snapserver.version.split('.');
    if ((serverVersion.length >= 2) && (+serverVersion[1] >= 21)) {
        content += "    <img src='" + play_img + "' class='play-button' id='play-button'></a>";
        // Stream became ready and was not playing. If autoplay is requested, start playing.
        if (!snapstream && !autoplay_done && autoplayRequested()) {
            autoplay_done = true;
            play();
        }
    }
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
        let clientCount = 0;
        for (let client of group.clients)
            if (!hide_offline || client.connected)
                clientCount++;
        if (clientCount > 1) {
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
            content += "    <span class='edit-icons'>";
            content += "        <a href=\"javascript:openClientSettings('" + client.id + "');\" class='edit-icon'>&#9998</a>";
            if (client.connected == false) {
                content += "      <a href=\"javascript:deleteClient('" + client.id + "');\" class='delete-icon'>&#128465</a>";
                content += "   </span>";
            } else {
                content += "</span>";
            }
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
    content += "        <input type='number' class='client-input' min='-10000' max='10000' id='client-latency' name='client-latency' placeholder='Latency in ms..'>";
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
    let playElem = (document.getElementById('play-button') as HTMLElement);
    playElem.onclick = () => {
        play();
    };

    for (let group of snapcontrol.server.groups) {
        if (group.clients.length > 1) {
            let slider = document.getElementById("vol_" + group.id) as HTMLInputElement;
            if (slider == null)
                continue;
            slider.addEventListener('pointerdown', function () {
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
    let group = snapcontrol.getGroup(group_id);
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
    let group = snapcontrol.getGroup(group_id);
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
    let client = snapcontrol.getClient(id);
    let needs_update = (mute != client.config.volume.muted);
    snapcontrol.setVolume(id, percent, mute);
    let group = snapcontrol.getGroupFromClient(id);
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
        snapstream = new SnapStream(config.baseUrl);
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
    let current_group = snapcontrol.getGroupFromClient(client_id);

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
    let client = snapcontrol.getClient(id);
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
    let client = snapcontrol.getClient(id);
    let current_name: string = (client.config.name != "") ? client.config.name : client.host.name;
    let name = document.getElementById("client-name") as HTMLInputElement;
    name.name = id;
    name.value = current_name;
    let latency = document.getElementById("client-latency") as HTMLInputElement;
    latency.valueAsNumber = client.config.latency;

    let group = snapcontrol.getGroupFromClient(id);
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

function deleteClient(id: string) {
    if (confirm('Are you sure?')) {
        snapcontrol.deleteClient(id);
    }
}

window.onload = function () {
    snapcontrol = new SnapControl(config.baseUrl);
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event: any) {
    let modal = document.getElementById("client-settings") as HTMLElement;
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
