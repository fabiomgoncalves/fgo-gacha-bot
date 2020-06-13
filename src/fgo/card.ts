export interface ICard {
    id: number,
    type: CardType,
    name: string,
    rarity: number,
    url: string,
}

export enum CardType {
    Servant,
    Essence
}

export interface IServant extends ICard{
    class: string
}
