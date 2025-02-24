import { Client } from './client.model';
import { ItemCategory } from './item-category.model';

export interface PawnTransaction {
  _id: string;
  client: Client;
  itemCategory: ItemCategory;
  itemDescription: string;
  amount: number;
  commission: number;
  pawnDate: string;
  returnDate: string;
  priceHistory?: {
    price: number;
    date: string;
  }[];
}