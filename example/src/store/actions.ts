import { ActionCreatorHelper } from '../../../src';
import { Product } from '../types';
import { State } from './index';
import shop from '../api/shop';

export type ActionTypes = {
  ADD_TO_CART: { id: number },
  CHECKOUT_REQUEST: null,
  CHECKOUT_SUCCESS: null,
  CHECKOUT_FAILURE: { savedCartItems: Product[] },
  RECEIVE_PRODUCTS: { products: Product[] }
};

export const actions = ActionCreatorHelper<State, State, ActionTypes>()({
  addToCart (payload: { id: number }) {
    return ({ commit }) => {
      commit({ type: 'ADD_TO_CART', payload: { id: payload.id } });
    }
  },
  checkout (payload: { products: Product[] }) {
    return ({ commit, state }) => {
      const savedCartItems = [...state.added]
      commit({ type: 'CHECKOUT_REQUEST' });
      shop.buyProducts(
        payload.products,
        () => commit({ type: 'CHECKOUT_SUCCESS' }),
        () => commit({ type: 'CHECKOUT_FAILURE', payload: { savedCartItems } })
      )
    }
  },
  getAllProducts () {
    return ({ commit }) => {
      shop.getProducts(products => {
         commit({ type: 'RECEIVE_PRODUCTS', payload: { products } })
      })
    }
  }
});
