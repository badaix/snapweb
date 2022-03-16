import SnapServer from "types/snapcontrol/SnapServer";
import SnapStream from "classes/snapcontrol/SnapStream";

// let snapcontrol!: SnapControl;
// let snapstream: SnapStream | null = null;
// let hide_offline: boolean = true;
// let autoplay_done: boolean = false;
// let audio: HTMLAudioElement = document.createElement('audio');

// This class acts as a Controller for the web page, and the controllers and stream

function getDefaultBaseUrl(): string {
    return (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host
}


// Todo:DARE - For when you return
// 1. Keep writing message methods from Snapcontrol into controller
// 2. Think about this "getMyStreamId" concept

class Controller {
    private static instance: Controller;
    public serverInstance: SnapServer = new SnapServer();
    public streamInstance: SnapStream = new SnapStream();
    private _audio?: HTMLAudioElement

    private constructor() {
        this.buildAudio()
    }

    public static getInstance(): Controller {
        if (!Controller.instance) {
            Controller.instance = new Controller();
        }
        
        return Controller.instance
    }

    private buildAudio() {
        const existingAudio = document.getElementsByTagName('audio')
        if (existingAudio) {
            for (let index = existingAudio.length - 1; index >= 0; index--) {
                existingAudio[index].parentNode?.removeChild(existingAudio[index]);
            }
        }
        return document.createElement('audio')
    }

    audio() {
        if (!this._audio) {
            this._audio = this.buildAudio()
        }
        return this._audio
    }

    public getPlayState(): MediaSessionPlaybackState {
        return navigator.mediaSession!.playbackState
    }
}

export default Controller