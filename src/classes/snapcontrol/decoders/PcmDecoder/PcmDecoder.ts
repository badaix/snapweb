import Decoder from 'classes/snapcontrol/decoders/Decoder'
import SampleFormat from 'classes/snapcontrol/SampleFormat'
import PcmChunkMessage from 'classes/snapcontrol/messages/PcmChunkMessage'

class PcmDecoder extends Decoder {
    setHeader(buffer: ArrayBuffer): SampleFormat | null {
        let sampleFormat = new SampleFormat();
        let view = new DataView(buffer);
        sampleFormat.channels = view.getUint16(22, true);
        sampleFormat.rate = view.getUint32(24, true);
        sampleFormat.bits = view.getUint16(34, true);
        return sampleFormat;
    }

    decode(chunk: PcmChunkMessage): PcmChunkMessage | null {
        return chunk;
    }
}

export default PcmDecoder