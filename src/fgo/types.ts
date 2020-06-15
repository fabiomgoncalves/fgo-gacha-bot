export interface ICard {
    id: number,
    type: CardType,
    name: string,
    rarity: number,
    url: string,
    image?: string,
}

export enum CardType {
    Servant = 'servant',
    Essence = 'essence'
}

export interface IServant extends ICard{
    class: string
}
