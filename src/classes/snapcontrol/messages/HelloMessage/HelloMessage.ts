import JsonMessage from 'classes/snapcontrol/messages/JsonMessage'

class HelloMessage extends JsonMessage {
    constructor(buffer?: ArrayBuffer) {
        super(buffer);
        if (buffer) {
            this.deserialize(buffer);
        }
        this.type = 5;
    }

    deserialize(buffer: ArrayBuffer) {
        super.deserialize(buffer);
        this.mac = this.json["MAC"];
        this.hostname = this.json["HostName"];
        this.version = this.json["Version"];
        this.clientName = this.json["ClientName"];
        this.os = this.json["OS"];
        this.arch = this.json["Arch"];
        this.instance = this.json["Instance"];
        this.uniqueId = this.json["ID"];
        this.snapStreamProtocolVersion = this.json["SnapStreamProtocolVersion"];
    }

    serialize(): ArrayBuffer {
        this.json = { "MAC": this.mac, "HostName": this.hostname, "Version": this.version, "ClientName": this.clientName, "OS": this.os, "Arch": this.arch, "Instance": this.instance, "ID": this.uniqueId, "SnapStreamProtocolVersion": this.snapStreamProtocolVersion };
        return super.serialize();
    }

    mac: string = "";
    hostname: string = "";
    version: string = "0.0.0";
    clientName = "Snapweb";
    os: string = "";
    arch: string = "web";
    instance: number = 1;
    uniqueId: string = "";
    snapStreamProtocolVersion: number = 2;
}

export default HelloMessage