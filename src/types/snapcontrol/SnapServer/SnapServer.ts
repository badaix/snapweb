import { 
    ClientSetLatency,
    ClientSetName,
    ClientSetVolume,
    GroupSetClients,
    GroupSetMute,
    GroupSetName,
    GroupSetStream,
    MessageMethods,
    NotificationMethods,
    ServerDeleteClient,
    StreamControlNextParams,
    StreamControlPauseParams,
    StreamControlPlayParams,
    StreamControlPlayPauseParams,
    StreamControlPreviousParams,
    StreamControlSeekParams,
    StreamControlSetPositionParams,
    StreamControlStopParams,
} from './api'

// A Wrapper for the JSON RPC Websocket API
class SnapServer {

    private url?: string;
    private connection?: WebSocket;
    private msg_id: number = 0;
    private pending_response: Record<string, any> = {}
    private pending_response_requests: Record<string, Record<string, any>> = {}

    private handleMessageMethods: MessageMethods = {}
    private handleNotificationMethods: NotificationMethods = {}

    private _handleError?: (event: Event) => void
    private _handleOpen?: () => void
    private _handleClose?: () => void


    constructor() {}

    public connect(
        url: string,
        preventAutomaticReconnect?: boolean,
        handleError?: (event: Event) => void,
        handleOpen?: () => void,
        handleClose?: () => void,
        handleMessageMethods?: MessageMethods,
        handleNotificationMethods?: NotificationMethods
    ) {
        if (this.connection) {
            this.connection.close()
        }
        this.url = url
        this.msg_id = 0;

        this._handleOpen = handleOpen
        this._handleClose = handleClose
        this._handleError = handleError
        this.handleMessageMethods = handleMessageMethods || {}
        this.handleNotificationMethods = handleNotificationMethods || {}

        this._connect(
            preventAutomaticReconnect
        );

    }

    private openSocket() {
        try {
            console.log("Opening connection to", this.url)
            this.connection = new WebSocket(this.url);
            console.log("Opened connection to", this.url)
        } catch (e) {
            console.error('Invalid connection', e)
            return false
        }
        return true

    }

    private _connect(
        preventAutomaticReconnect?: boolean,
    ) {
        if (!this.url) {
            console.error('No URL to connect to')
            return;
        }
        if (this.openSocket()) {
            this.connection.onmessage = (msg: MessageEvent) => {
                const msgData = JSON.parse(msg.data);
                const isResponse: boolean = (msgData.id != undefined)
                if (isResponse) {
                    console.log("Received message", msgData)
                    if (this.pending_response[msgData.id]) {
                        const func = this.handleMessageMethods[this.pending_response[msgData.id] as keyof MessageMethods]
                        if (func) {
                            console.log(`Calling function ${this.pending_response[msgData.id] as keyof MessageMethods}`, {request: this.pending_response_requests[msgData.id] as any, result: msgData['result']})
                            func({request: this.pending_response_requests[msgData.id] as any, result: msgData['result']})
                        }
                        delete this.pending_response[msgData.id]
                        delete this.pending_response_requests[msgData.id]
                    }
                } else {
                    console.log("Received notification", msgData)
                    const func = this.handleNotificationMethods[msgData['method'] as keyof NotificationMethods]
                    if (func) {
                        func(msgData['params'])
                    }
                }
            };
            this.connection.onopen = () => { 
                console.log("connected to webserver")
                if (this._handleOpen) {
                    this._handleOpen()
                }
            };
            this.connection.onerror = (ev: Event) => { 
                console.error('error:', ev); 
                if (this._handleError) {
                    this._handleError(ev)
                }
            };
            this.connection.onclose = () => {
                console.info('connection lost, reconnecting in 1s');
                if (this._handleClose) {
                    this._handleClose()
                }
                if (!preventAutomaticReconnect) {
                    setTimeout(() => this._connect(
                        preventAutomaticReconnect
                    ), 1000);
                }
                
            };
        } else {
            console.log("Failed to open socket")
        }
        
    }

    public serverGetStatus(): number {
        return this.sendRequest('Server.GetStatus')
    }

    public streamControlSetPosition(options: StreamControlSetPositionParams): number {
        return this.sendRequest('Stream.Control', { id: options.id, command: 'setPosition', params: options.params})
    }

    public streamControlSeek(options: StreamControlSeekParams): number {
        return this.sendRequest('Stream.Control', { id: options.id, command: 'seek', params: options.params})
    }

    public streamControlPrevious(options: StreamControlPreviousParams): number {
        return this.sendRequest('Stream.Control', { id: options.id, command: 'previous', params: options.params})
    }

    public streamControlNext(options: StreamControlNextParams): number {
        return this.sendRequest('Stream.Control', { id: options.id, command: 'next', params: options.params})
    }

    public streamControlStop(options: StreamControlStopParams): number {
        return this.sendRequest('Stream.Control', { id: options.id, command: 'stop', params: options.params})
    }

    public streamControlPlayPause(options: StreamControlPlayPauseParams): number {
        return this.sendRequest('Stream.Control', { id: options.id, command: 'playPause', params: options.params})
    }

    public streamControlPause(options: StreamControlPauseParams): number {
        return this.sendRequest('Stream.Control', { id: options.id, command: 'pause', params: options.params})
    }

    public streamControlPlay(options: StreamControlPlayParams): number {
        return this.sendRequest('Stream.Control', { id: options.id, command: 'play', params: options.params})
    }

    public clientSetVolume(options: ClientSetVolume): number {
        return this.sendRequest('Client.SetVolume', options)
    }

    public clientSetName(options: ClientSetName): number {
        return this.sendRequest('Client.SetName', options)
    }

    public clientSetLatency(options: ClientSetLatency): number {
        return this.sendRequest('Client.SetLatency', options)
    }

    public serverDeleteClient(options: ServerDeleteClient): number {
        return this.sendRequest('Server.DeleteClient', options)
    }


    public groupSetStream(options: GroupSetStream): number {
        return this.sendRequest('Group.SetStream', options)
    }

    public groupSetClients(options: GroupSetClients): number {
        return this.sendRequest('Group.SetClients', options)

    }

    public groupSetMute(options: GroupSetMute): number {
        return this.sendRequest('Group.SetMute', options)
    }

    public groupSetName(options: GroupSetName): number {
        return this.sendRequest('Group.SetName', options)
    }

    // Sends a request through the websocket connection and increments our counter for requests to the server
    private sendRequest(method: string, params?: any): number {
        let newMsgId = ++this.msg_id
        let msg: any = {
            id: newMsgId,
            jsonrpc: '2.0',
            method: method
        };
        if (params)
            msg.params = params;

        let msgJson = JSON.stringify(msg);
        console.log("Sending: " + msgJson);
        this.connection?.send(msgJson);
        let methodId = method
        if (msg.params?.command || msg.params?.property) {
            methodId = `${method}.${msg.params?.command || msg.params?.property}`
        }
        this.pending_response[newMsgId] = methodId
        this.pending_response_requests[newMsgId] = msg.params || {}
        return this.msg_id;
    }
}

export default SnapServer