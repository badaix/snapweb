import Controller from 'classes/snapcontrol/Controller'
import { Metadata as MInterface, PlaybackStatus, Properties as Interface } from 'types/snapcontrol'
import Metadata from 'classes/snapcontrol/Metadata'

class Properties implements Interface {
    loopStatus?: string
    shuffle?: boolean
    volume?: number
    rate?: number
    playbackStatus?: PlaybackStatus
    position?: number
    minimumRate?: number
    maximumRate?: number
    canGoNext: boolean = false
    canGoPrevious: boolean = false
    canPlay: boolean = false
    canPause: boolean = false
    canSeek: boolean = false
    canControl: boolean = false
    metadata: Metadata = new Metadata({})


    constructor(params: Interface) {
        this.update(params)
    }

    public update(params: Interface): boolean {

        const changedBooleans = [
            this.getLoopStatus() != this.setLoopStatus(params.loopStatus),
            this.getShuffle() != this.setShuffle(params.shuffle),
            this.getVolume() != this.setVolume(params.volume),
            this.getRate() != this.setRate(params.rate),
            this.getPlaybackStatus() != this.setPlaybackStatus(params.playbackStatus),
            this.getPosition() != this.setPosition(params.position),
            this.getMinimumRate() != this.setMinimumRate(params.minimumRate),
            this.getMaximumRate() != this.setMaximumRate(params.maximumRate),
            this.getCanControl() != this.setCanControl(params.canControl),
            this.getCanGoNext() != this.setCanGoNext(params.canGoNext),
            this.getCanGoPrevious() != this.setCanGoPrevious(params.canGoPrevious),
            this.getCanPlay() != this.setCanPlay(params.canPlay),
            this.getCanSeek() != this.setCanSeek(params.canSeek),
            this.getCanPause() != this.setCanPause(params.canPause),
            this.updateMetadata(params.metadata),
        ]
        
        const noUpdate = changedBooleans.every((changed: boolean) => {
            return !changed
        })
        // Do UI Updates Here
        return !noUpdate
    }

    getMetadata(): Metadata {
        return this.metadata
    }

    updateMetadata(metadata: MInterface): boolean {
        let didUpdate = false
        if (this.metadata) {
            didUpdate = this.metadata.update(metadata)
        } else {
            this.metadata = new Metadata(metadata)
            didUpdate = true
        }
        if (didUpdate) {
            if (metadata.duration != undefined) {
                navigator.mediaSession!.setPositionState!({
                    duration: this.metadata.getDuration(),
                    playbackRate: this.getRate(),
                    position: this.getPosition()
                });
            } else {
                navigator.mediaSession!.setPositionState!({
                    duration: 0,
                    playbackRate: 1.0,
                    position: 0
                });
            }
        }
        return didUpdate
    }

    getLoopStatus(): string | undefined {
        return this.loopStatus
    }

    setLoopStatus(loopStatus?: string): string | undefined {
        this.loopStatus = loopStatus
        return this.getLoopStatus()
    }

    getPlaybackStatus(): PlaybackStatus | undefined {
        return this.playbackStatus
    }

    setPlaybackStatus(playbackStatus?: PlaybackStatus): PlaybackStatus | undefined {
        this.playbackStatus = playbackStatus
        let play_state: MediaSessionPlaybackState = "none";
        const audio = Controller.getInstance().audio()
        if (playbackStatus != undefined) {
            if (playbackStatus == "playing") {
                audio.play();
                play_state = "playing";
            }
            else if (playbackStatus == "paused") {
                audio.pause();
                play_state = "paused";
            }
            else if (playbackStatus == "stopped") {
                audio.pause();
                play_state = "none";
            }
        }

        let mediaSession = navigator.mediaSession!;
        mediaSession.playbackState = play_state;
        
        return this.getPlaybackStatus()
    }

    getShuffle(): boolean | undefined {
        return this.shuffle
    }

    setShuffle(shuffle?: boolean): boolean | undefined {
        this.shuffle = shuffle
        return this.getShuffle()
    }

    getVolume(): number | undefined {
        return this.volume
    }

    setVolume(volume?: number): number | undefined {
        this.volume = volume
        return this.getVolume()
    }

    getRate(): number | undefined {
        return this.rate
    }

    setRate(rate?: number): number | undefined {
        this.rate = rate
        return this.getRate()
    }

    getPosition(): number | undefined {
        return this.position
    }

    setPosition(position?: number): number | undefined {
        this.position = position
        return this.getPosition()
    }

    getMaximumRate(): number | undefined {
        return this.maximumRate
    }

    setMaximumRate(maximumRate?: number): number | undefined {
        this.maximumRate = maximumRate
        return this.getMaximumRate()
    }

    getMinimumRate(): number | undefined {
        return this.minimumRate
    }

    setMinimumRate(minimumRate?: number): number | undefined {
        this.minimumRate = minimumRate
        return this.getMinimumRate()
    }

    getCanGoNext(): boolean {
        return this.canGoNext
    }

    setCanGoNext(canGoNext: boolean): boolean {
        this.canGoNext = canGoNext
        return this.getCanGoNext()
    }

    getCanGoPrevious(): boolean {
        return this.canGoPrevious
    }

    setCanGoPrevious(canGoPrevious: boolean): boolean {
        this.canGoPrevious = canGoPrevious
        return this.getCanGoPrevious()
    }

    getCanPlay(): boolean {
        return this.canPlay
    }

    setCanPlay(canPlay: boolean): boolean {
        this.canPlay = canPlay
        return this.getCanPlay()
    }

    getCanControl(): boolean {
        return this.canControl
    }

    setCanControl(canControl: boolean): boolean {
        this.canControl = canControl
        return this.getCanControl()
    }

    getCanPause(): boolean {
        return this.canPause
    }

    setCanPause(canPause: boolean): boolean {
        this.canPause = canPause
        return this.getCanPause()
    }

    getCanSeek(): boolean {
        return this.canSeek
    }

    setCanSeek(canSeek: boolean): boolean {
        this.canSeek = canSeek
        return this.getCanSeek()
    }
    

}

export default Properties