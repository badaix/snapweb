import Decoder from 'classes/snapcontrol/decoders/Decoder'
import SampleFormat from 'classes/snapcontrol/SampleFormat'
import PcmChunkMessage from 'classes/snapcontrol/messages/PcmChunkMessage'
import libFactory from 'libflacjs'

const Flac = libFactory('release.wasm')

class FlacDecoder extends Decoder {
    constructor() {
        super();
        this.decoder = Flac.create_libflac_decoder(true);
        if (this.decoder) {
            let init_status = Flac.init_decoder_stream(this.decoder, this.read_callback_fn.bind(this), this.write_callback_fn.bind(this), this.error_callback_fn.bind(this), this.metadata_callback_fn.bind(this), false);
            console.log("Flac init: " + init_status);
            Flac.setOptions(this.decoder, { analyseSubframes: true, analyseResiduals: true });
        }
        this.sampleFormat = new SampleFormat();
        this.flacChunk = new ArrayBuffer(0);
        // this.pcmChunk  = new PcmChunkMessage();

        // Flac.setOptions(this.decoder, {analyseSubframes: analyse_frames, analyseResiduals: analyse_residuals});
        // flac_ok &= init_status == 0;
        // console.log("flac init     : " + flac_ok);//DEBUG
    }

    decode(chunk: PcmChunkMessage): PcmChunkMessage | null {
        // console.log("Flac decode: " + chunk.payload.byteLength);
        this.flacChunk = chunk.payload.slice(0);
        this.pcmChunk = chunk;
        this.pcmChunk!.clearPayload();
        this.cacheInfo = { cachedBlocks: 0, isCachedChunk: true };
        // console.log("Flac len: " + this.flacChunk.byteLength);
        while (this.flacChunk.byteLength && Flac.FLAC__stream_decoder_process_single(this.decoder)) {
            Flac.FLAC__stream_decoder_get_state(this.decoder);
            // let state = Flac.FLAC__stream_decoder_get_state(this.decoder);
            // console.log("State: " + state);
        }
        // console.log("Pcm payload: " + this.pcmChunk!.payloadSize());
        if (this.cacheInfo.cachedBlocks > 0) {
            let diffMs = this.cacheInfo.cachedBlocks / this.sampleFormat.msRate();
            // console.log("Cached: " + this.cacheInfo.cachedBlocks + ", " + diffMs + "ms");
            this.pcmChunk!.timestamp.setMilliseconds(this.pcmChunk!.timestamp.getMilliseconds() - diffMs);
        }
        return this.pcmChunk!;
    }

    read_callback_fn(bufferSize: number): Flac.ReadResult | Flac.CompletedReadResult {
        // console.log('  decode read callback, buffer bytes max=', bufferSize);
        if (this.header) {
            console.log("  header: " + this.header.byteLength);
            let data = new Uint8Array(this.header);
            this.header = null;
            return { buffer: data, readDataLength: data.byteLength, error: false };
        } else if (this.flacChunk) {
            // console.log("  flacChunk: " + this.flacChunk.byteLength);
            // a fresh read => next call to write will not be from cached data
            this.cacheInfo.isCachedChunk = false;
            let data = new Uint8Array(this.flacChunk.slice(0, Math.min(bufferSize, this.flacChunk.byteLength)));
            this.flacChunk = this.flacChunk.slice(data.byteLength);
            return { buffer: data, readDataLength: data.byteLength, error: false };
        }
        return { buffer: new Uint8Array(0), readDataLength: 0, error: false };
    }

    write_callback_fn(data: Array<Uint8Array>, frameInfo: Flac.BlockMetadata) {
        // console.log("  write frame metadata: " + frameInfo + ", len: " + data.length);
        if (this.cacheInfo.isCachedChunk) {
            // there was no call to read, so it's some cached data
            this.cacheInfo.cachedBlocks += frameInfo.blocksize;
        }
        let payload = new ArrayBuffer((frameInfo.bitsPerSample / 8) * frameInfo.channels * frameInfo.blocksize);
        let view = new DataView(payload);
        for (let channel: number = 0; channel < frameInfo.channels; ++channel) {
            let channelData = new DataView(data[channel].buffer, 0, data[channel].buffer.byteLength);
            // console.log("channelData: " + channelData.byteLength + ", blocksize: " + frameInfo.blocksize);
            for (let i: number = 0; i < frameInfo.blocksize; ++i) {
                view.setInt16(2 * (frameInfo.channels * i + channel), channelData.getInt16(2 * i, true), true);
            }
        }
        this.pcmChunk!.addPayload(payload);
        // console.log("write: " + payload.byteLength + ", len: " + this.pcmChunk!.payloadSize());
    }

    /** @memberOf decode */
    metadata_callback_fn(data: any) {
        console.info('meta data: ', data);
        // let view = new DataView(data);
        this.sampleFormat.rate = data.sampleRate;
        this.sampleFormat.channels = data.channels;
        this.sampleFormat.bits = data.bitsPerSample;
        console.log("metadata_callback_fn, sampleformat: " + this.sampleFormat.toString());
    }

    /** @memberOf decode */
    error_callback_fn(err: any, errMsg: any) {
        console.error('decode error callback', err, errMsg);
    }

    setHeader(buffer: ArrayBuffer): SampleFormat | null {
        this.header = buffer.slice(0);
        Flac.FLAC__stream_decoder_process_until_end_of_metadata(this.decoder);
        return this.sampleFormat;
    }

    sampleFormat: SampleFormat;
    decoder: number;
    header: ArrayBuffer | null = null;
    flacChunk: ArrayBuffer;
    pcmChunk?: PcmChunkMessage;

    cacheInfo: { isCachedChunk: boolean, cachedBlocks: number } = { isCachedChunk: false, cachedBlocks: 0 };
}

export default FlacDecoder