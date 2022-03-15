import BaseMessage from 'classes/snapcontrol/BaseMessage'

class JsonMessage extends BaseMessage {
    constructor(buffer?: ArrayBuffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        let size = view.getUint32(26, true);
        let decoder = new TextDecoder();
        this.json = JSON.parse(decoder.decode(buffer.slice(30, 30 + size)));
    }

    serialize(): ArrayBuffer {
        let buffer = super.serialize();
        let view = new DataView(buffer);
        let jsonStr = JSON.stringify(this.json);
        view.setUint32(26, jsonStr.length, true);
        let encoder = new TextEncoder();
        let encoded = encoder.encode(jsonStr);
        for (let i = 0; i < encoded.length; ++i)
            view.setUint8(30 + i, encoded[i]);
        return buffer;
    }

    getSize() {
        let encoder = new TextEncoder();
        let encoded = encoder.encode(JSON.stringify(this.json));
        return encoded.length + 4;
        // return JSON.stringify(this.json).length;
    }

    json: any;
}

export default JsonMessage