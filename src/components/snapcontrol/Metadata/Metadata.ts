import { Metadata as Interface } from 'types/snapcontrol'

class Metadata implements Interface {
    title?: string = ""
    artist?: string[] = []
    album?: string = ""
    artUrl?: string = ""
    duration?: number = 0


    constructor(params: Interface) {
        this.update(params)
    }

    private updateMediaMetadata(): MediaMetadata {
        const artwork = this.getArtUrl() || 'snapcast-512.png'
        const hasMusic = this.duration != undefined
        const defaultAlbum = hasMusic ? 'Unknown Album' : ''
        const defaultArtist = hasMusic ? 'Unknown Artist(s)' : ''
        const defaultTitle = hasMusic ? 'Unknown title' : ''
        const newMetadata = new MediaMetadata({
            album: this.getAlbum() || defaultAlbum,
            artist: this.getArtist()?.join(', ') || defaultArtist,
            title: this.getTitle() || defaultTitle,
            artwork: [
                // { src: artwork, sizes: '250x250', type: 'image/jpeg' },
                // 'https://dummyimage.com/96x96', sizes: '96x96', type: 'image/png' },
                { src: artwork, sizes: '128x128', type: 'image/png' },
                { src: artwork, sizes: '192x192', type: 'image/png' },
                { src: artwork, sizes: '256x256', type: 'image/png' },
                { src: artwork, sizes: '384x384', type: 'image/png' },
                { src: artwork, sizes: '512x512', type: 'image/png' },
            ]
        })
        navigator.mediaSession!.metadata = newMetadata
        return newMetadata
    }

    public update(params: Interface): boolean {

        const changedBooleans = [
            this.getTitle() != this.setTitle(params.title),
            this.getDuration() != this.setDuration(params.duration),
            this.getAlbum() != this.setAlbum(params.album),
            this.getArtUrl() != this.setArtUrl(params.artUrl),
            this.getArtist() != this.setArtist(params.artist),
        ]
        
        const noUpdate = changedBooleans.every((changed: boolean) => {
            return !changed
        })
        if (!noUpdate) {
            this.updateMediaMetadata()
        }
        // Do UI Updates Here
        return !noUpdate
    }

    public getDuration(): number | undefined {
        return this.duration
    }

    public setDuration(duration?: number): number | undefined {
        this.duration = duration
        return this.getDuration()
    }

    public getTitle(): string | undefined {
        return this.title
    }

    private setTitle(title?: string): string | undefined{
        this.title = title
        return this.getTitle()
    }

    public getArtist(): string[] | undefined {
        return this.artist
    }

    private setArtist(artist?: string[]): string[] | undefined{
        this.artist = artist
        return this.getArtist()
    }

    public getAlbum(): string | undefined {
        return this.album
    }

    private setAlbum(album?: string): string | undefined{
        this.album = album
        return this.getAlbum()
    }

    public getArtUrl(): string | undefined {
        return this.artUrl
    }

    private setArtUrl(artUrl?: string): string | undefined{
        this.artUrl = artUrl
        return this.getArtUrl()
    }

}

export default Metadata