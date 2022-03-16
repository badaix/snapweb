import SampleFormat from "classes/snapcontrol/SampleFormat";
import PcmChunkMessage from "classes/snapcontrol/messages/PcmChunkMessage";
import TimeProvider from "classes/snapcontrol/TimePro";

class AudioStream {
    constructor(public timeProvider: TimeProvider, public sampleFormat: SampleFormat, public bufferMs: number) {
    }

    chunks: Array<PcmChunkMessage> = new Array<PcmChunkMessage>();

    setVolume(percent: number, muted: boolean) {
        // let base = 10;
        this.volume = percent / 100; // (Math.pow(base, percent / 100) - 1) / (base - 1);
        console.log("setVolume: " + percent + " => " + this.volume + ", muted: " + this.muted);
        this.muted = muted;
    }

    addChunk(chunk: PcmChunkMessage) {
        this.chunks.push(chunk);
        // let oldest = this.timeProvider.serverNow() - this.chunks[0].timestamp.getMilliseconds();
        // let newest = this.timeProvider.serverNow() - this.chunks[this.chunks.length - 1].timestamp.getMilliseconds();
        // console.debug("chunks: " + this.chunks.length + ", oldest: " + oldest.toFixed(2) + ", newest: " + newest.toFixed(2));

        while (this.chunks.length > 0) {
            let age = this.timeProvider.serverNow() - this.chunks[0].timestamp.getMilliseconds();
            // todo: consider buffer ms
            if (age > 5000 + this.bufferMs) {
                this.chunks.shift();
                console.log("Dropping old chunk: " + age.toFixed(2) + ", left: " + this.chunks.length);
            }
            else
                break;
        }
    }

    getNextBuffer(buffer: AudioBuffer, playTimeMs: number) {
        if (!this.chunk) {
            this.chunk = this.chunks.shift()
        }
        // let age = this.timeProvider.serverTime(this.playTime * 1000) - startMs;
        let frames = buffer.length;
        // console.debug("getNextBuffer: " + frames + ", play time: " + playTimeMs.toFixed(2));
        let left = new Float32Array(frames);
        let right = new Float32Array(frames);
        let read = 0;
        let pos = 0;
        // let volume = this.muted ? 0 : this.volume;
        let serverPlayTimeMs = this.timeProvider.serverTime(playTimeMs);
        if (this.chunk) {
            let age = serverPlayTimeMs - this.chunk.startMs();// - 500;
            let reqChunkDuration = frames / this.sampleFormat.msRate();
            let secs = Math.floor(Date.now() / 1000);
            if (this.lastLog != secs) {
                this.lastLog = secs;
                console.log("age: " + age.toFixed(2) + ", req: " + reqChunkDuration);
            }
            if (age < -reqChunkDuration) {
                console.log("age: " + age.toFixed(2) + " < req: " + reqChunkDuration * -1 + ", chunk.startMs: " + this.chunk.startMs().toFixed(2) + ", timestamp: " + this.chunk.timestamp.getMilliseconds().toFixed(2));
                console.log("Chunk too young, returning silence");
            } else {
                if (Math.abs(age) > 5) {
                    // We are 5ms apart, do a hard sync, i.e. don't play faster/slower, 
                    // but seek to the desired position instead
                    while (this.chunk && age > this.chunk.duration()) {
                        console.log("Chunk too old, dropping (age: " + age.toFixed(2) + " > " + this.chunk.duration().toFixed(2) + ")");
                        this.chunk = this.chunks.shift();
                        if (!this.chunk)
                            break;
                        age = serverPlayTimeMs - (this.chunk as PcmChunkMessage).startMs();
                    }
                    if (this.chunk) {
                        if (age > 0) {
                            console.log("Fast forwarding " + age.toFixed(2) + "ms");
                            this.chunk.readFrames(Math.floor(age * this.chunk.sampleFormat.msRate()));
                        }
                        else if (age < 0) {
                            console.log("Playing silence " + -age.toFixed(2) + "ms");
                            let silentFrames = Math.floor(-age * this.chunk.sampleFormat.msRate());
                            left.fill(0, 0, silentFrames);
                            right.fill(0, 0, silentFrames);
                            read = silentFrames;
                            pos = silentFrames;
                        }
                        age = 0;
                    }
                }
                // else if (age > 0.1) {
                //     let rate = age * 0.0005;
                //     rate = 1.0 - Math.min(rate, 0.0005);
                //     console.debug("Age > 0, rate: " + rate);
                //     // we are late (age > 0), this means we are not playing fast enough
                //     // => the real sample rate seems to be lower, we have to drop some frames
                //     this.setRealSampleRate(this.sampleFormat.rate * rate); // 0.9999);    
                // }
                // else if (age < -0.1) {
                //     let rate = -age * 0.0005;
                //     rate = 1.0 + Math.min(rate, 0.0005);
                //     console.debug("Age < 0, rate: " + rate);
                //     // we are early (age > 0), this means we are playing too fast
                //     // => the real sample rate seems to be higher, we have to insert some frames
                //     this.setRealSampleRate(this.sampleFormat.rate * rate); // 0.9999);    
                // }
                // else {
                //     this.setRealSampleRate(this.sampleFormat.rate);
                // }


                let addFrames = 0;
                let everyN = 0;
                if (age > 0.1) {
                    addFrames = Math.ceil(age); // / 5);
                } else if (age < -0.1) {
                    addFrames = Math.floor(age); // / 5);
                }
                // addFrames = -2;
                let readFrames = frames + addFrames - read;
                if (addFrames != 0)
                    everyN = Math.ceil((frames + addFrames - read) / (Math.abs(addFrames) + 1));

                // addFrames = 0;
                // console.debug("frames: " + frames + ", readFrames: " + readFrames + ", addFrames: " + addFrames + ", everyN: " + everyN);
                while ((read < readFrames) && this.chunk) {
                    let pcmChunk = this.chunk as PcmChunkMessage;
                    let pcmBuffer = pcmChunk.readFrames(readFrames - read);
                    let payload = new Int16Array(pcmBuffer);
                    // console.debug("readFrames: " + (frames - read) + ", read: " + pcmBuffer.byteLength + ", payload: " + payload.length);
                    // read += (pcmBuffer.byteLength / this.sampleFormat.frameSize());
                    for (let i = 0; i < payload.length; i += 2) {
                        read++;
                        left[pos] = (payload[i] / 32768); // * volume;
                        right[pos] = (payload[i + 1] / 32768); // * volume;
                        if ((everyN != 0) && (read % everyN == 0)) {
                            if (addFrames > 0) {
                                pos--;
                            } else {
                                left[pos + 1] = left[pos];
                                right[pos + 1] = right[pos];
                                pos++;
                                // console.log("Add: " + pos);
                            }
                        }
                        pos++;
                    }
                    if (pcmChunk.isEndOfChunk()) {
                        this.chunk = this.chunks.shift();
                    }
                }
                if (addFrames != 0)
                    console.debug("Pos: " + pos + ", frames: " + frames + ", add: " + addFrames + ", everyN: " + everyN);
                if (read == readFrames)
                    read = frames;
            }
        }

        if (read < frames) {
            console.log("Failed to get chunk, read: " + read + "/" + frames + ", chunks left: " + this.chunks.length);
            left.fill(0, pos);
            right.fill(0, pos);
        }

        // copyToChannel is not supported by Safari
        buffer.getChannelData(0).set(left);
        buffer.getChannelData(1).set(right);
    }


    // setRealSampleRate(sampleRate: number) {
    //     if (sampleRate == this.sampleFormat.rate) {
    //         this.correctAfterXFrames = 0;
    //     }
    //     else {
    //         this.correctAfterXFrames = Math.ceil((this.sampleFormat.rate / sampleRate) / (this.sampleFormat.rate / sampleRate - 1.));
    //         console.debug("setRealSampleRate: " + sampleRate + ", correct after X: " + this.correctAfterXFrames);
    //     }
    // }


    chunk?: PcmChunkMessage = undefined;
    volume: number = 1;
    muted: boolean = false;
    lastLog: number = 0;
    // correctAfterXFrames: number = 0;
}

export default AudioStream