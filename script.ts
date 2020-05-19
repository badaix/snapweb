// import { Server, Client, Group, Stream } from './types';

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
    constructor(json: any) {
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



//let connection = new WebSocket('ws://' + window.location.hostname + ':1780/jsonrpc');
let connection = new WebSocket('ws://127.0.0.1:1780/jsonrpc');
let server: Server;
let msg_id: number = 23;
let status_req_id: number = -1;

connection.onmessage = function (msg: MessageEvent) {
    let recv = msg.data
    // console.log(recv); 
    let answer = JSON.parse(recv);
    console.log(answer)
    if (answer.id == status_req_id) {
        server = new Server(answer.result.server);
    } else if (Array.isArray(answer)) {
        for (let a of answer) {
            action(a);
        }
    } else {
        action(answer);
    }
    show()
}

connection.onopen = function () {
    status_req_id = send('Server.GetStatus');
}

connection.onerror = function () {
    alert("error");
}

function action(answer: any) {
    switch (answer.method) {
        case 'Client.OnVolumeChanged':
            (server.getClient(answer.params.id) as Client).config.volume = answer.params.volume;
            break;
        case 'Client.OnLatencyChanged':
            (server.getClient(answer.params.id) as Client).config.latency = answer.params.latency;
            break;
        case 'Client.OnNameChanged':
            (server.getClient(answer.params.id) as Client).config.name = answer.params.name;
            break;
        case 'Client.OnConnect':
        case 'Client.OnDisconnect':
            (server.getClient(answer.params.client.id) as Client).fromJson(answer.params.client);
            break;
        case 'Group.OnMute':
            (server.getGroup(answer.params.id) as Group).muted = Boolean(answer.params.mute);
            break;
        case 'Group.OnStreamChanged':
            (server.getGroup(answer.params.id) as Group).stream_id = answer.params.stream_id;
            break;
        case 'Stream.OnUpdate':
            (server.getStream(answer.params.id) as Stream).fromJson(answer.params.stream);
            break;
        case 'Server.OnUpdate':
            server.fromJson(answer.params.server);
            break;
        default:
            break;
    }
}

function send(method: string, params?: string): number {
    let msg = '{"id": ' + (++msg_id) + ',"jsonrpc":"2.0","method":"' + method + '"';
    if (params)
        msg += ',"params": ' + params;
    msg += '}';
    console.log("Sending: " + msg);
    connection.send(msg);
    return msg_id;
}


function show() {
    // Render the page
    let content = "";

    for (let group of server.groups) {
        // Set mute variables
        let classgroup;
        let muted: boolean;
        let mutetext;
        if (group.muted == true) {
            classgroup = 'groupmuted';
            muted = true;
            mutetext = '&#x1F507';
        } else {
            classgroup = 'group';
            muted = false;
            mutetext = '&#128266';
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
        content += streamselect;

        // Group mute and refresh button
        content += " <a href=\"javascript:setMuteGroup('" + group.id + "'," + !muted + ");\" class='mutebuttongroup'>" + mutetext + "</a>";
        content += "<input type='button' value='Refresh' class='refreshbutton' onclick='javascript: location.reload()'>";
        content += "<br/>";

        // Create clients in group
        for (let client of group.clients) {
            // Set name and connection state vars, start client div
            let name;
            let clas = 'client'
            if (client.config.name != "") {
                name = client.config.name;
            } else {
                name = client.host.name;
            }
            if (client.connected == false) {
                clas = 'disconnected';
            }
            content = content + "<div id='c_" + client.id + "' class='" + clas + "'>";

            // Client mute status vars
            let muted: boolean;
            let sliderclass;
            if (client.config.volume.muted == true) {
                muted = true;
                sliderclass = 'slidermute';
                mutetext = '&#128263';
            } else {
                sliderclass = 'slider'
                muted = false;
                mutetext = '&#128266';
            }

            // Client group selection vars
            let groupselect = "<select id='group_" + client.id + "' onchange='setGroup(\"" + client.id + "\")'>";
            let group_num = 0;
            for (let ogroup of server.groups) {
                groupselect = groupselect + "<option value='" + ogroup.id + "' " + ((ogroup == group) ? "selected" : "") + ">Group " + (group_num++) + " (" + ogroup.clients.length + " Clients)</option>";
            }

            groupselect = groupselect + "<option value='new'>new</option>";
            groupselect = groupselect + "</select>"

            // Populate client div
            content = content + " <a href=\"javascript:setVolume('" + client.id + "'," + !muted + ");\" class='mutebutton'>" + mutetext + "</a>";
            content = content + "<div class='sliders'><div class='sliderdiv'><input type='range' min=0 max=100 step=1 id='vol_" + client.id + "' onchange='javascript:setVolume(\"" + client.id + "\"," + client.config.volume.muted + ")' value=" + client.config.volume.percent + " class='" + sliderclass + "' orient='vertical'></div>";
            content = content + "<div class='finebg'>++<br>+<br>0<br>-<br>--</div><div class='sliderdiv_fine'><input type='range' min=0 max=10 step=1 id='vol_fine_" + client.id + "' onchange='javascript:setVolume(\"" + client.id + "\"," + client.config.volume.muted + ")' value=5 class='" + sliderclass + "_fine' orient='vertical'></div></div>";
            content = content + " <a href=\"javascript:setName('" + client.id + "');\" class='edit'>&#9998</a>";
            content = content + name;
            content = content + groupselect;
            content = content + "</div>";
        }

        content = content + "</div>"
    }

    // Pad then update page
    content = content + "<br><br>";
    (document.getElementById('show') as HTMLInputElement).innerHTML = content;
}

function setVolume(id: string, mute: boolean) {
    let percent = Number((document.getElementById('vol_' + id) as HTMLInputElement).value);
    let percent_fine = Number((document.getElementById('vol_fine_' + id) as HTMLInputElement).value);

    // Take away 5 as it's the default of the fine slider. Only relevant if it
    // has changed
    percent = Number(percent) + Number(percent_fine) - 5;
    percent = Math.max(0, Math.min(100, percent));

    // Request changes
    send('Client.SetVolume', '{"id":"' + id + '","volume":{"muted":' + (mute ? "true" : "false") + ',"percent":' + percent + '}}');
    (server.getClient(id) as Client).config.volume = { muted: mute, percent: percent };
    show()
}

function setMuteGroup(id: string, mute: boolean) {
    send('Group.SetMute', '{"id":"' + id + '","mute":' + (mute ? "true" : "false") + '}');
    (server.getGroup(id) as Group).muted = mute;
    show()
}

function setStream(id: string) {
    send('Group.SetStream', '{"id":"' + id + '","stream_id":"' + (document.getElementById('stream_' + id) as HTMLInputElement).value + '"}');
    (server.getGroup(id) as Group).stream_id = (document.getElementById('stream_' + id) as HTMLInputElement).value;
    show()
}

function setGroup(id: string) {
    let group = (document.getElementById('group_' + id) as HTMLInputElement).value;
    console.log("setGroup id: " + id + ", group: " + group);

    // Get client group id
    let current_group: string = "";
    groups:
    for (let i_group = 0; i_group < server.groups.length; i_group++) {
        for (let i_client = 0; i_client < server.groups[i_group].clients.length; i_client++) {
            if (id == server.groups[i_group].clients[i_client].id) {
                current_group = server.groups[i_group].id;
                break groups;
            }
        }
    }

    // Get
    //   List of target group's clients
    // OR
    //   List of current group's other clients
    let send_clients = [];
    for (let i_group = 0; i_group < server.groups.length; i_group++) {
        if (server.groups[i_group].id == group || (group == "new" && server.groups[i_group].id == current_group)) {
            for (let i_client = 0; i_client < server.groups[i_group].clients.length; i_client++) {
                if (group == "new" && server.groups[i_group].clients[i_client].id == id) { }
                else {
                    send_clients[send_clients.length] = server.groups[i_group].clients[i_client].id;
                }
            }
        }
    }

    if (group == "new") {
        group = current_group
    }
    else {
        send_clients[send_clients.length] = id;
    }

    let send_clients_string = JSON.stringify(send_clients);
    status_req_id = send('Group.SetClients', '{"clients":' + send_clients_string + ',"id":"' + group + '"}');
}

function setName(id: string) {
    // Get current name and lacency
    let client = server.getClient(id) as Client;
    let current_name: string = (client.config.name != "") ? client.config.name : client.host.name;
    let current_latency: number = client.config.latency;

    let new_name = window.prompt("New Name", current_name);
    let new_latency = Number(window.prompt("New Latency", String(current_latency)));

    // Don't change anything if user cancel's
    if (new_name != null && new_name != current_name) {
        send('Client.SetName', '{"id":"' + id + '","name":"' + new_name + '"}');
        client.config.name = new_name;
    }
    if (new_latency != null && new_latency != current_latency) {
        send('Client.SetLatency', '{"id":"' + id + '","latency":' + new_latency + '}');
        client.config.latency = new_latency;
    }
    show()
}
