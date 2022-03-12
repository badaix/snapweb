import { Host as Interface } from 'types/snapcontrol'

class Host implements Interface {
    arch: string = ""
    mac: string = ""
    os: string = ""
    ip: string = ""
    name: string = ""


    constructor(params: Interface) {
        this.update(params)
    }

    public update(params: Interface): boolean {

        const changedBooleans = [
            this.getMac() != this.setMac(params.mac),
            this.getArch() != this.setArch(params.arch),
            this.getName() != this.setName(params.name),
            this.getIp() != this.setIp(params.ip),
            this.getOs() != this.setOs(params.os),
        ]
        
        const noUpdate = changedBooleans.every((changed: boolean) => {
            return !changed
        })
        // Do UI Updates Here
        return !noUpdate
    }

    public getMac(): string {
        return this.mac
    }

    public setMac(mac: string): string {
        this.mac = mac
        return this.getMac()
    }

    public getArch(): string {
        return this.arch
    }

    public setArch(arch: string): string {
        this.arch = arch
        return this.getArch()
    }

    public getOs(): string {
        return this.os
    }

    public setOs(os: string): string {
        this.os = os
        return this.getOs()
    }

    public getIp(): string {
        return this.ip
    }

    public setIp(ip: string): string {
        this.ip = ip
        return this.getIp()
    }

    public getName(): string {
        return this.name
    }

    public setName(name: string): string {
        this.name = name
        return this.getName()
    }

}

export default Host