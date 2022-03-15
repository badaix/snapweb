class PlayBuffer {
    constructor(buffer: AudioBuffer, playTime: number, source: AudioBufferSourceNode, destination: AudioNode) {
        this.buffer = buffer;
        this.playTime = playTime;
        this.source = source;
        this.source.buffer = this.buffer;
        this.source.connect(destination);
        this.onended = (_playBuffer: PlayBuffer) => { };
    }

    public onended: (playBuffer: PlayBuffer) => void

    start() {
        this.source.onended = () => {
            this.onended(this);
        }
        this.source.start(this.playTime);
    }

    buffer: AudioBuffer;
    playTime: number;
    source: AudioBufferSourceNode;
    num: number = 0;
}
export default PlayBuffer