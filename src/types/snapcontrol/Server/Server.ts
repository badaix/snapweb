import Stream from 'types/snapcontrol/Stream'
import Group from 'types/snapcontrol/Group'
import Host from 'types/snapcontrol/Host'

export interface ServerDetails {
    host: Host;
    snapserver: {
        controlProtocolVersion: number;
        name: string;
        protocolVersion: number;
        version: string;
    }
}

interface Server {
    groups: Group[]
    server: ServerDetails
    streams: Stream[]
}

export default Server