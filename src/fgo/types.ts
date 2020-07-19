export interface Card {
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

export interface Servant extends Card {
    class: string
}

export interface Pity {
    servant: boolean,
    golden: boolean,
}

export interface Result {
    description: string,
    image: Buffer,
}
