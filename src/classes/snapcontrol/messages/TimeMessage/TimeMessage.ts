import BaseMessage from 'classes/snapcontrol/BaseMessage'
import TV from 'classes/snapcontrol/TV'

class TimeMessage extends BaseMessage {
    constructor(buffer?: ArrayBuffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 4;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        let view = new DataView(buffer);
        this.latency = new TV(view.getInt32(26, true), view.getInt32(30, true));
    }

    serialize(): ArrayBuffer {
        let buffer = super.serialize();
        let view = new DataView(buffer);
        view.setInt32(26, this.latency.sec, true);
        view.setInt32(30, this.latency.usec, true);
        return buffer;
    }

    getSize() {
        return 8;
    }

    latency: TV = new TV(0, 0);
}

export default TimeMessage