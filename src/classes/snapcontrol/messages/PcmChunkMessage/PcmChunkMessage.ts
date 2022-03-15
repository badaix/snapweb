import BaseMessage from 'classes/snapcontrol/messages/BaseMessage'
import SampleFormat from 'classes/snapcontrol/SampleFormat'
import TV from 'classes/snapcontrol/TV'

class PcmChunkMessage extends BaseMessage {
    constructor(buffer: ArrayBuffer, sampleFormat: SampleFormat) {
        super(buffer);
        this.deserialize(buffer);
        this.sampleFormat = sampleFormat;
        this.type = 2;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        this.timestamp = new TV(view.getInt32(26, true), view.getInt32(30, true));
        // this.payloadSize = view.getUint32(34, true);
        this.payload = buffer.slice(38);//, this.payloadSize + 38));// , this.payloadSize);
        // console.log("ts: " + this.timestamp.sec + " " + this.timestamp.usec + ", payload: " + this.payloadSize + ", len: " + this.payload.byteLength);
    }

    readFrames(frames: number): ArrayBuffer {
        let frameCnt = frames;
        let frameSize = this.sampleFormat.frameSize();
        if (this.idx + frames > this.payloadSize() / frameSize)
            frameCnt = (this.payloadSize() / frameSize) - this.idx;
        let begin = this.idx * frameSize;
        this.idx += frameCnt;
        let end = begin + frameCnt * frameSize;
        // console.log("readFrames: " + frames + ", result: " + frameCnt + ", begin: " + begin + ", end: " + end + ", payload: " + this.payload.byteLength);
        return this.payload.slice(begin, end);
    }

    getFrameCount(): number {
        return (this.payloadSize() / this.sampleFormat.frameSize());
    }

    isEndOfChunk(): boolean {
        return this.idx >= this.getFrameCount();
    }

    startMs(): number {
        return this.timestamp.getMilliseconds() + 1000 * (this.idx / this.sampleFormat.rate);
    }

    duration(): number {
        return 1000 * ((this.getFrameCount() - this.idx) / this.sampleFormat.rate);
    }

    payloadSize(): number {
        return this.payload.byteLength;
    }

    clearPayload(): void {
        this.payload = new ArrayBuffer(0);
    }

    addPayload(buffer: ArrayBuffer) {
        let payload = new ArrayBuffer(this.payload.byteLength + buffer.byteLength);
        let view = new DataView(payload);
        let viewOld = new DataView(this.payload);
        let viewNew = new DataView(buffer);
        for (let i = 0; i < viewOld.byteLength; ++i) {
            view.setInt8(i, viewOld.getInt8(i));
        }
        for (let i = 0; i < viewNew.byteLength; ++i) {
            view.setInt8(i + viewOld.byteLength, viewNew.getInt8(i));
        }
        this.payload = payload;
    }

    timestamp: TV = new TV(0, 0);
    // payloadSize: number = 0;
    payload: ArrayBuffer = new ArrayBuffer(0);
    idx: number = 0;
    sampleFormat: SampleFormat;
}

export default PcmChunkMessage