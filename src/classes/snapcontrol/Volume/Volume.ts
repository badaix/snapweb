import { Volume as Interface } from 'types/snapcontrol'

class Volume implements Interface {
    muted: boolean = true
    percent: number = 0

    constructor(params: Interface) {
        this.update(params)
    }

    public update(params: Interface): boolean {

        const changedBooleans = [
            this.getPercent() != this.setPercent(params.percent),
            this.getMuted() != this.setMuted(params.muted),
        ]
        
        const noUpdate = changedBooleans.every((changed: boolean) => {
            return !changed
        })
        // Do UI Updates Here
        return !noUpdate
    }

    public getPercent(): number {
        return this.percent
    }

    public setPercent(percent: number): number {
        this.percent = Math.max(Math.min(100, percent), 0)
        return this.getPercent()
    }

    public getMuted(): boolean {
        return this.muted
    }

    public setMuted(muted: boolean): boolean {
        this.muted = muted
        return this.getMuted()
    }

}

export default Volume