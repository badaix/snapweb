import AudioContext from "types/snapcontrol/AudioContext";
class TimePro {
    constructor(ctx: AudioContext | undefined = undefined) {
        if (ctx) {
            this.setAudioContext(ctx);
        }
    }

    setAudioContext(ctx: AudioContext) {
        this.ctx = ctx;
        this.reset();
    }

    reset() {
        this.diffBuffer.length = 0;
        this.diff = 0;
    }

    setDiff(c2s: number, s2c: number) {
        if (this.now() == 0) {
            this.reset()
        } else {
            if (this.diffBuffer.push((c2s - s2c) / 2) > 100)
                this.diffBuffer.shift();
            let sorted = [...this.diffBuffer];
            sorted.sort()
            this.diff = sorted[Math.floor(sorted.length / 2)];
        }
        // console.debug("c2s: " + c2s.toFixed(2) + ", s2c: " + s2c.toFixed(2) + ", diff: " + this.diff.toFixed(2) + ", now: " + this.now().toFixed(2) + ", server.now: " + this.serverNow().toFixed(2) + ", win.now: " + window.performance.now().toFixed(2));
        // console.log("now: " + this.now() + "\t" + this.now() + "\t" + this.now());
    }

    now() {
        if (!this.ctx) {
            return window.performance.now();
        } else {
            // Use the more accurate getOutputTimestamp if available, fallback to ctx.currentTime otherwise.
            const contextTime = !!this.ctx.getOutputTimestamp ? this.ctx.getOutputTimestamp().contextTime : undefined;
            return (contextTime !== undefined ? contextTime : this.ctx.currentTime) * 1000;
        }
    }

    nowSec() {
        return this.now() / 1000;
    }

    serverNow() {
        return this.serverTime(this.now());
    }

    serverTime(localTimeMs: number) {
        return localTimeMs + this.diff;
    }

    diffBuffer: Array<number> = new Array<number>();
    diff: number = 0;
    ctx: AudioContext | undefined;
}

export default TimePro