export default class PlaylistEntity{
    readonly id: string
    readonly name: string
    readonly isPublic: boolean
    readonly listens: number
    readonly tracks: string[]
    readonly owner: string
    readonly willExpire?: number
}