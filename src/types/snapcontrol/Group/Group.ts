import Client from 'types/snapcontrol/Client'

interface Group {
    name: string
    id: string
    stream_id: string
    muted: boolean
    clients: Client[]
}

export default Group