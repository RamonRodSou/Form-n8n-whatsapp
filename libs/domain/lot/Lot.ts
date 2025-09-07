import { v4 as uuidv4 } from 'uuid';

export class Lot {
    constructor(
        public readonly id: string = uuidv4(),
        public name: string = '',
        public price: number = 0,
        public quantity: number = 1,
        public isActive: boolean = true,
        public createdAt: string = new Date().toISOString(),

    ) { }

    static fromJson(json: any): Lot {
        return new Lot(
            json.id,
            json.name,
            json.price,
            json.quantity,
            json.isActive,
            json.createdAt
        );
    }

    toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            phone: this.quantity,
            isActive: this.isActive,
            createdAt: this.createdAt
        };
    }
} 