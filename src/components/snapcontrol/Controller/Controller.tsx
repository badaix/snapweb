import React from "react"
import Controller from "classes/snapcontrol/Controller"
import GroupComponent from "components/snapcontrol/Group"
import { API } from "types/snapcontrol/SnapServer"
import { useAppSelector, useAppDispatch, } from 'state/snapserverHooks'
import * as Actions from 'state/snapserverSlice'
import {Box} from 'grommet'

// This class acts as a Controller for the web page, and the controllers and stream

function getDefaultBaseUrl(): string {
    return (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host
}

// Use this process env variable to set the default URL for the site, if one exists
// Allow user to update the site stored in their storage via the web interface
// console.log(process.env.GATSBY_SNAPSERVER)

const ControllerComponent: React.FC = () => {

    const server = useAppSelector((state) => state.details)
    const serverUrl = useAppSelector((state) => state.serverUrl)
    const streamUrl = useAppSelector((state) => state.streamUrl)
    const serverId = useAppSelector((state) => state.server_id)
    const streamId = useAppSelector((state) => state.stream_id)
    const showOfflineClients = useAppSelector((state) => state.showOfflineClients)
    const groupsById = useAppSelector((state) => state.groupsById)
    const clientsById = useAppSelector((state) => state.clientsById)
    const dispatch = useAppDispatch()

    const snapserver = Controller.getInstance().serverInstance
    const snapstream = Controller.getInstance().streamInstance


    const messageMethods: API.MessageMethods = React.useMemo(() => {
        return {
            'Server.DeleteClient': (response: API.ServerDeleteClientResponse) => {
                dispatch(Actions.updateServer(response.result.server))
            },
            'Server.GetStatus': (response: API.ServerGetStatusResponse) => {
                dispatch(Actions.updateServer(response.result.server))
            },
            'Client.GetStatus': (response: API.ClientGetStatusResponse) => {
                dispatch(Actions.updateClient(response.result.client))
            },
            'Client.SetLatency': (response: API.ClientSetLatencyResponse) => {
                dispatch(Actions.updateClientLatency({ id: response.request.id, latency: response.result.latency }))
            },
            'Client.SetName': (response: API.ClientSetNameResponse) => {
                dispatch(Actions.updateClientName({ id: response.request.id, name: response.result.name }))
            },
            'Client.SetVolume': (response: API.ClientSetVolumeResponse) => {
                dispatch(Actions.updateClientVolume({ id: response.request.id, volume: response.result.volume }))
            },
            'Group.GetStatus': (response: API.GroupGetStatusResponse) => {
                dispatch(Actions.updateGroup(response.result.group))
            },
            'Group.SetStream': (response: API.GroupSetStreamResponse) => {
                dispatch(Actions.updateGroupStream({ id: response.request.id, stream_id: response.result.stream_id }))
            },
            'Group.SetName': (response: API.GroupSetNameResponse) => {
                dispatch(Actions.updateGroupName({ id: response.request.id, name: response.result.name }))
            },
            'Group.SetMute': (response: API.GroupSetMuteResponse) => {
                dispatch(Actions.updateGroupMute({ id: response.request.id, mute: response.result.mute }))
            },
            'Group.SetClients': (response: API.GroupSetClientsResponse) => {
                dispatch(Actions.updateServer(response.result.server))
            },
        }
    }, [dispatch])

    const notificationMethods: API.NotificationMethods = React.useMemo(() => {
        return {
            'Server.OnUpdate': (response: API.ServerOnUpdateResponse) => {
                dispatch(Actions.updateServer(response.server))
            },
            'Stream.OnUpdate': ({ stream }: API.StreamOnUpdateResponse) => {
                dispatch(Actions.updateStream(stream))
            },
            'Stream.OnProperties': (params: API.StreamOnProperties) => {
                dispatch(Actions.updateStreamProperties(params))
            },
            'Group.OnMute': (params: API.GroupOnMuteResponse) => {
                dispatch(Actions.updateGroupMute(params))
            },
            'Group.OnNameChanged': (params: API.GroupOnNameChangedResponse) => {
                dispatch(Actions.updateGroupName(params))
            },
            'Group.OnStreamChanged': (params: API.GroupOnStreamChangedResponse) => {
                dispatch(Actions.updateGroupStream(params))
            },
            'Client.OnConnect': (params: API.ClientOnConnectResponse) => {
                dispatch(Actions.updateClient(params.client))
            },
            'Client.OnDisconnect': (params: API.ClientOnDisconnectResponse) => {
                dispatch(Actions.updateClient(params.client))
            },
            'Client.OnLatencyChanged': (params: API.ClientOnLatencyChangedResponse) => {
                dispatch(Actions.updateClientLatency(params))
            },
            'Client.OnNameChanged': (params: API.ClientOnNameChangedResponse) => {
                dispatch(Actions.updateClientName(params))
            },
            'Client.OnVolumeChanged': (params: API.ClientOnVolumeChangedResponse) => {
                dispatch(Actions.updateClientVolume(params))
            },
        }
    }, [dispatch, server])

    const onConnect = React.useCallback(() => {
        dispatch(Actions.setServerId(snapserver.serverGetStatus()))
    }, [snapserver, dispatch])

    const onClose = React.useCallback(() => {
        dispatch(Actions.updateServer(undefined))
    }, [dispatch])

    const connectToServer = React.useCallback((url: string) => {
        const cleanedUrl = url ? url.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') : ''
        if (cleanedUrl) {
            snapserver.connect(cleanedUrl, false, undefined, onConnect, onClose, messageMethods, notificationMethods)
        }
    }, [snapserver, notificationMethods, messageMethods, onConnect, onClose])

    React.useEffect(() => {
        const cleanedUrl = streamUrl ? streamUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') : ''
        if (cleanedUrl) {
            snapstream.baseUrl = cleanedUrl
        }
    }, [streamUrl])

    const groups = React.useMemo(() => {
        let gs = Object.values(groupsById)
        if (!showOfflineClients) {
            gs = gs.filter((g) => !g.clients.map((c) => clientsById[c.id]).every((v) => !v.connected))
        }
        return gs.map((group) => {
            return (
                <GroupComponent key={group.id} id={group.id} />
            )
        })
    }, [groupsById, showOfflineClients, clientsById])

    React.useEffect(() => {
        if (serverId == -1 && serverUrl && connectToServer) {
            connectToServer(serverUrl)
        }
    }, [connectToServer, serverId, serverUrl])

    // React.useEffect(() => {
    //     if (streamId == -1 && streamUrl && connectToStream) {
    //         connectToStream(streamUrl)
    //     }
    // }, [connectToStream, streamId, streamUrl])

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            if (window.location.search) {
                const queryParams = new URLSearchParams(window.location.search)
                const api = queryParams.get('api')
                const stream = queryParams.get('stream')
                const server = queryParams.get('server')
                if (server) {
                    dispatch(Actions.setCustomUrl(server))
                    queryParams.delete('server')
                    queryParams.delete('stream')
                    queryParams.delete('api')
                    const params = queryParams.toString()
                    const currentURL = window.location.protocol + "//" + window.location.host + window.location.pathname +  `${params ? `?${params}` : ''}`;  
                    window.history.pushState({ path: currentURL }, '', currentURL)
                } else {
                    if (api) {
                        dispatch(Actions.setServerUrl(api))
                        queryParams.delete('api')
                        const params = queryParams.toString()
                        const currentURL = window.location.protocol + "//" + window.location.host + window.location.pathname +  `${params ? `?${params}` : ''}`;  
                        window.history.pushState({ path: currentURL }, '', currentURL)
                    }
                    if (stream) {
                        dispatch(Actions.setStreamUrl(stream))
                        queryParams.delete('stream')
                        const params = queryParams.toString()
                        const currentURL = window.location.protocol + "//" + window.location.host + window.location.pathname +  `${params ? `?${params}` : ''}`;  
                        window.history.pushState({ path: currentURL }, '', currentURL)
                    }
                }

            }
        }
    })

    return (
        // Must be div
        <div>
            <Box fill={true} gap="small">
                {groups}
            </Box>
        </div>
    )
}

export default ControllerComponent