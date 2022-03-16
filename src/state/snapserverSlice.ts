import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  Server,
  Stream,
  Group,
  Client,
  ServerDetails,
  Volume
} from 'types/snapcontrol'
import { API } from 'types/snapcontrol/SnapServer'

// Define a type for the slice state
export interface CounterState {
  // controller: Controller
  server_id: number
  stream_id: number
  playing: boolean
  myClientId: string
  serverUrl?: string
  customUrl?: string
  streamUrl?: string
  showOfflineClients: boolean
  server?: Server
  details?: ServerDetails
  groupsById: Record<string, Group>
  streamsById: Record<string, Stream>
  clientsById: Record<string, Client>
  groupIdByClientId: Record<string, string>
}

// Define the initial state using that type
const initialState: CounterState = {
  server_id: -1,
  stream_id: -1,
  playing: false,
  myClientId: '',
  showOfflineClients: false,
  serverUrl: process.env.GATSBY_SNAPSERVER,
  streamUrl: process.env.GATSBY_SNAPSTREAM,
  groupIdByClientId: {},
  groupsById: {},
  streamsById: {},
  clientsById: {}
  // controller: Controller.getInstance()
}

export const counterSlice = createSlice({
  name: 'counter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setServerId: (state, action: PayloadAction<number>) => {
      state.server_id = action.payload
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.playing = action.payload
      state.stream_id = 1
    },
    setStreamId: (state, action: PayloadAction<number>) => {
      state.stream_id = action.payload
    },
    setShowOfflineClients: (state, action: PayloadAction<boolean>) => {
      state.showOfflineClients = action.payload
    },
    setServerUrl: (state, action: PayloadAction<string>) => {
      console.log('Setting server URL to', action.payload)
      state.serverUrl = action.payload.trim()
      state.server_id = -1
    },
    setMyClientId: (state, action: PayloadAction<string>) => {
      console.log('Setting my client ID to', action.payload)
      state.myClientId = action.payload
    },
    setStreamUrl: (state, action: PayloadAction<string>) => {
      console.log('Setting stream URL to', action.payload)
      state.streamUrl = action.payload.trim()
      state.stream_id = -1
    },
    setCustomUrl: (state, action: PayloadAction<string>) => {
      console.log('Setting custom URL to', action.payload)
      state.customUrl = action.payload.trim()
      state.streamUrl = `${state.customUrl}/stream`
      state.stream_id = -1
      state.serverUrl = `${state.customUrl}/jsonrpc`
      state.server_id = -1
    },
    updateServer: (state, action: PayloadAction<Server | undefined>) => {
      state.details = action.payload?.server
      const newStreamsById = {}
      action.payload?.streams?.forEach((stream) => {
        newStreamsById[stream.id] = stream
      })
      state.streamsById = newStreamsById
      const newGroupIdByClientId = {}
      const newGroupsById = {}
      const newClientsById = {}
      action.payload?.groups?.forEach((group) => {
        group.clients?.forEach((client) => {
          newGroupIdByClientId[client.id] = group.id
          newClientsById[client.id] = client
        })
        newGroupsById[group.id] = group
      })
      state.groupIdByClientId = newGroupIdByClientId
      state.groupsById = newGroupsById
      state.clientsById = newClientsById
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const client = action.payload
      state.clientsById[client.id] = client
    },
    updateClientLatency: (state, action: PayloadAction<{ id: string, latency: number }>) => {
      const clientId = action.payload.id
      state.clientsById[clientId].config.latency = action.payload.latency
    },
    updateClientName: (state, action: PayloadAction<{ id: string, name: string }>) => {
      const clientId = action.payload.id
      state.clientsById[clientId].config.name = action.payload.name
    },
    updateClientVolume: (state, action: PayloadAction<{ id: string, volume: Volume }>) => {
      const clientId = action.payload.id
      state.clientsById[clientId].config.volume = action.payload.volume
    },
    updateGroup: (state, action: PayloadAction<Group>) => {
      const group = action.payload
      state.groupsById[group.id] = group
      const newGroupIdByClientId = {}
      const newGroupsById = {}
      const newClientsById = {}
      Object.values(state.groupsById).forEach((group) => {
        group.clients.forEach((client) => {
          newGroupIdByClientId[client.id] = group.id
          newClientsById[client.id] = client
        })
        newGroupsById[group.id] = group
      })
      state.groupIdByClientId = newGroupIdByClientId
      state.groupsById = newGroupsById
    },
    updateGroupStream: (state, action: PayloadAction<{ id: string, stream_id: string }>) => {
      const groupId = action.payload.id
      state.groupsById[groupId].stream_id = action.payload.stream_id
    },
    updateGroupMute: (state, action: PayloadAction<{ id: string, mute: boolean }>) => {
      const groupId = action.payload.id
      state.groupsById[groupId].muted = action.payload.mute
    },
    updateGroupName: (state, action: PayloadAction<{ id: string, name: string }>) => {
      const groupId = action.payload.id
      state.groupsById[groupId].name = action.payload.name
    },
    updateGroupClients: (state, action: PayloadAction<{ id: string, clients: Client[] }>) => {
      const groupId = action.payload.id
      state.groupsById[groupId].clients = action.payload.clients
      const newGroupIdByClientId = {}
      const newGroupsById = {}
      const newClientsById = {}
      Object.values(state.groupsById).forEach((group) => {
        group.clients.forEach((client) => {
          newGroupIdByClientId[client.id] = group.id
          newClientsById[client.id] = client
        })
        newGroupsById[group.id] = group
      })
      state.groupIdByClientId = newGroupIdByClientId
      state.groupsById = newGroupsById
    },
    updateStream: (state, action: PayloadAction<Stream>) => {
      const streamId = action.payload.id
      state.streamsById[streamId] = action.payload
    },
    updateStreamProperties: (state, action: PayloadAction<API.StreamOnProperties>) => {
      const { id } = action.payload
      state.streamsById[id].properties = action.payload
    },
  },
})

export const { setShowOfflineClients, setCustomUrl, setPlaying, setMyClientId, setStreamUrl, setServerUrl, updateClient, updateClientLatency, setStreamId, setServerId, updateClientName, updateClientVolume, updateGroup, updateGroupClients, updateGroupMute, updateGroupName, updateGroupStream, updateServer, updateStream, updateStreamProperties } = counterSlice.actions

// // Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.value


export default counterSlice.reducer