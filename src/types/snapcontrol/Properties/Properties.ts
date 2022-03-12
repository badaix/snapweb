import Metadata from "types/snapcontrol/Metadata";
import PlaybackStatus from "types/snapcontrol/PlaybackStatus";


interface Properties {
    loopStatus?: string;
    shuffle?: boolean
    volume?: number;
    rate?: number;
    playbackStatus?: PlaybackStatus;
    position?: number;
    minimumRate?: number;
    maximumRate?: number;
    canGoNext: boolean;
    canGoPrevious: boolean;
    canPlay: boolean;
    canPause: boolean;
    canSeek: boolean;
    canControl: boolean;
    metadata?: Metadata;
}

export default Properties