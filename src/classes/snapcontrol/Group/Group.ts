import { Group as Interface, Client as ClientInterface } from 'types/snapcontrol'
import Client from 'classes/snapcontrol/Client'


class Group implements Interface {
    id: string = ""
    stream_id: string = ""
    name: string = ""
    muted: boolean = false
    clients: Client[] = []

    clientsById: Record<string, Client> = {}

    constructor(params: Interface) {
        this.update(params)
    }

    update(params: Interface) {
        const changedBooleans = [
            this.getId() != this.setId(params.id),
            this.updateClients(params.clients),
            this.getMuted() != this.setMuted(params.muted),
            this.getName() != this.setName(params.name),
            this.getStreamId() != this.setStreamId(params.stream_id),
        ]
        
        const noUpdate = changedBooleans.every((changed: boolean) => {
            return !changed
        })
        // Do UI Updates Here
        return !noUpdate
    }

    updateClients(params: ClientInterface[]): boolean {
        let changed = false;
        params.forEach((param: ClientInterface) => {
            if (this.updateClient(param, false)) {
                changed = true
            }
        })

        if (changed) {
            this.clients = Object.values(this.clientsById)
        }
        return changed
    }

    getClient(id: string): Client | undefined {
        return this.clientsById[id]
    }

    updateClient(params: ClientInterface, update: boolean = true): boolean {
        const client = this.getClient(params.id)
        let didUpdate = false
        if (client) {
            didUpdate = this.clientsById[params.id].update(params)
        } else {
            this.clientsById[params.id] = new Client(params)
            didUpdate = true
        }
        if (update) {
            this.clients = Object.values(this.clientsById)
        }
        return didUpdate
    }

    deleteClient(id: string): boolean {
        if (this.clientsById[id]) {
            delete this.clientsById[id]
            this.clients = Object.values(this.clientsById)
            return true
        }
        return false
    }

    getId(): string {
        return this.id
    }

    setId(id: string): string {
        this.id = id
        return this.getId()
    }

    getName(): string {
        return this.id
    }

    setName(name: string): string {
        this.name = name
        return this.getName()
    }

    getStreamId(): string {
        return this.stream_id
    }

    setStreamId(streamId: string): string {
        this.stream_id = streamId
        return this.getStreamId()
    }

    getMuted(): boolean {
        return this.muted
    }

    setMuted(muted: boolean): boolean {
        this.muted = muted
        return this.getMuted()
    }

}

export default Group