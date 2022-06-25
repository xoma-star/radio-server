export default class PlaylistEntity{
    readonly id: string
    name: string
    isPublic: boolean
    readonly listens: number
    readonly tracks: string[]
    readonly owner: string
    willExpire?: number
}