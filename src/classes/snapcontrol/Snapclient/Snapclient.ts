import { Snapclient as Interface } from 'types/snapcontrol'

class Snapclient implements Interface {
    protocolVersion: number = 0
    version: string = ""
    name: string = ""


    constructor(params: Interface) {
        this.update(params)
    }

    public update(params: Interface): boolean {

        const changedBooleans = [
            this.getName() != this.setName(params.name),
            this.getVersion() != this.setVersion(params.version),
            this.getProtocolVersion() != this.setProtocolVersion(params.protocolVersion),
        ]
        
        const noUpdate = changedBooleans.every((changed: boolean) => {
            return !changed
        })
        // Do UI Updates Here
        return !noUpdate
    }

    public getProtocolVersion(): number {
        return this.protocolVersion
    }

    public setProtocolVersion(protocolVersion: number): number {
        this.protocolVersion = protocolVersion
        return this.getProtocolVersion()
    }

    public getVersion(): string {
        return this.version
    }

    public setVersion(version: string): string {
        this.version = version
        return this.getVersion()
    }

    public getName(): string {
        return this.name
    }

    public setName(name: string): string {
        this.name = name
        return this.getName()
    }

}

export default Snapclient