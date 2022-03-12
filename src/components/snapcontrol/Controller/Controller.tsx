import React from "react"
import Controller from "classes/snapcontrol/Controller"
import GroupComponent from "components/snapcontrol/Group"
import { API } from "types/snapcontrol/SnapServer"
import { useAppSelector, useAppDispatch } from 'state/snapserverHooks'
import * as Actions from 'state/snapserverSlice'
import {Box} from 'grommet'
// let snapcontrol!: SnapControl;
// let snapstream: SnapStream | null = null;
// let hide_offline: boolean = true;
// let autoplay_done: boolean = false;
// let audio: HTMLAudioElement = document.createElement('audio');

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
    const serverId = useAppSelector((state) => state.server_id)
    const groupsById = useAppSelector((state) => state.groupsById)
    const dispatch = useAppDispatch()

    const snapserver = Controller.getInstance().serverInstance


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
                dispatch(Actions.updateGroupName({ id: response.result.id, name: response.result.name }))
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

    const connectToServer = React.useCallback((url: string) => {
        const cleanedUrl = url ? url.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') : ''
        if (cleanedUrl) {
            snapserver.connect(cleanedUrl, false, undefined, onConnect, undefined, messageMethods, notificationMethods)
        }
    }, [server, notificationMethods, messageMethods, onConnect])

    const audio: HTMLAudioElement = React.useMemo(() => {
        const existingAudio = document.getElementsByTagName('audio')
        if (existingAudio) {
            for (let index = existingAudio.length - 1; index >= 0; index--) {
                existingAudio[index].parentNode?.removeChild(existingAudio[index]);
            }
        }
        return document.createElement('audio')
    }, [])

    const playbackState = React.useMemo(() => {
        return navigator.mediaSession!.playbackState
    }, [navigator.mediaSession])

    const groups = React.useMemo(() => {
        return Object.values(groupsById).map((group) => {
            return (
                <GroupComponent key={group.id} id={group.id} />
            )
        })
    }, [groupsById])

    React.useEffect(() => {
        if (serverId == -1 && serverUrl) {
            connectToServer(serverUrl)
        }
    }, [connectToServer, serverId, serverUrl])

    return (
        <div>
            <Box fill={true} gap="small">
                {groups}
            </Box>
        </div>
    )
}

export default ControllerComponent