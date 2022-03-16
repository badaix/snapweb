import SampleFormat from "classes/snapcontrol/SampleFormat";
import PcmChunkMessage from "classes/snapcontrol/messages/PcmChunkMessage";

class Decoder {
    setHeader(_buffer: ArrayBuffer): SampleFormat | null {
        return new SampleFormat();
    }

    decode(_chunk: PcmChunkMessage): PcmChunkMessage | null {
        return null;
    }
}

export default Decoder