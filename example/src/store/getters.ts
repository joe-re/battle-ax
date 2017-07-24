import { GetterTree } from '../../../src';
import { Product } from '../types';
import { State } from './index';

export type Getter = {
  checkoutStatus: string | null,
  allProducts: Product[],
  cartProducts: Product[]
};

export const getters: GetterTree<State, State, Getter> = {
  checkoutStatus: state => state.checkoutStatus,
  allProducts: state => state.all,
  cartProducts: state => {
    const cartItems: Product[] = state.added.map(({ id, quantity }) => {
      const product = state.all.find(p => p.id === id)
      return {
        id: 0,
        title: product && product.title || '',
        price: product && product.price || 0,
        quantity
      }
    });
    return cartItems;
  }
};
