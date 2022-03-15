import TV from 'classes/snapcontrol/TV'

class BaseMessage {
    constructor(_buffer?: ArrayBuffer) {
    }

    deserialize(buffer: ArrayBuffer) {
        let view = new DataView(buffer);
        this.type = view.getUint16(0, true);
        this.id = view.getUint16(2, true);
        this.refersTo = view.getUint16(4, true);
        this.received = new TV(view.getInt32(6, true), view.getInt32(10, true));
        this.sent = new TV(view.getInt32(14, true), view.getInt32(18, true));
        this.size = view.getUint32(22, true);
    }

    serialize(): ArrayBuffer {
        this.size = 26 + this.getSize();
        let buffer = new ArrayBuffer(this.size);
        let view = new DataView(buffer);
        view.setUint16(0, this.type, true);
        view.setUint16(2, this.id, true);
        view.setUint16(4, this.refersTo, true);
        view.setInt32(6, this.sent.sec, true);
        view.setInt32(10, this.sent.usec, true);
        view.setInt32(14, this.received.sec, true);
        view.setInt32(18, this.received.usec, true);
        view.setUint32(22, this.size, true);
        return buffer;
    }

    getSize() {
        return 0;
    }

    type: number = 0;
    id: number = 0;
    refersTo: number = 0;
    received: TV = new TV(0, 0);
    sent: TV = new TV(0, 0);
    size: number = 0;
}


export default BaseMessage