import { Stream as Interface, StreamUri, Properties as PInterface } from 'types/snapcontrol'
import Properties from '../Properties'

class Stream implements Interface {
    id: string = ""
    status: string = ""
    uri: StreamUri = {
        raw: '',
        scheme: '',
        fragment: '',
        host: '',
        path: '',
        query: ''
    }
    properties!: Properties


    constructor(params: Interface) {
        this.update(params)
    }

    public update(params: Interface): boolean {

        const changedBooleans = [
            this.getId() != this.setId(params.id),
            this.getStatus() != this.setStatus(params.status),
            this.getUri() != this.setUri(params.uri),
            this.updateProperties(params.properties),
        ]
        
        const noUpdate = changedBooleans.every((changed: boolean) => {
            return !changed
        })
        // Do UI Updates Here
        return !noUpdate
    }

    getProperties(): Properties {
        return this.properties
    }

    updateProperties(properties: PInterface): boolean {
        if (!this.properties) {
            this.properties = new Properties(properties)
            return true
        }
        return this.properties.update(properties)
    }

    getId(): string {
        return this.id
    }

    setId(id: string): string{
        this.id = id
        return this.getId()
    }

    getStatus(): string {
        return this.status
    }

    setStatus(status: string): string{
        this.status = status
        return this.getStatus()
    }

    getUri(): StreamUri {
        return this.uri
    }

    setUri(uri: StreamUri): StreamUri{
        this.uri = uri
        return this.getUri()
    }

}

export default Stream