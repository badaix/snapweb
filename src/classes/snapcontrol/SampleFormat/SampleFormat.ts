class SampleFormat {
    rate: number = 48000;
    channels: number = 2;
    bits: number = 16;

    public msRate(): number {
        return this.rate / 1000;
    }

    public toString(): string {
        return this.rate + ":" + this.bits + ":" + this.channels;
    }

    public sampleSize(): number {
        if (this.bits == 24) {
            return 4;
        }
        return this.bits / 8;
    }

    public frameSize(): number {
        return this.channels * this.sampleSize();
    }

    public durationMs(bytes: number) {
        return (bytes / this.frameSize()) * this.msRate();
    }
}

export default SampleFormat