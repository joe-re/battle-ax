import { MutationTree } from '../../../src';
import { ActionTypes } from './actions';
import { State } from '../store';

export const mutations: MutationTree<State, ActionTypes> = {
  ['ADD_TO_CART'] (state, payload) {
    state.lastCheckout = null;
    const record = state.added.find(p => p.id === payload.id);
    if (!record) {
      state.added.push({ id: payload.id, quantity: 1 });
    } else {
      if (record.quantity) record.quantity++;
    }
    const target = state.all.find(p => p.id === payload.id);
    if (target && target.inventory) target.inventory--;
  },

  ['CHECKOUT_REQUEST'] (state) {
    // clear cart
    state.added = [];
    state.checkoutStatus = null;
  },

  ['CHECKOUT_SUCCESS'] (state) {
    state.checkoutStatus = 'successful';
  },

  ['CHECKOUT_FAILURE'] (state, { savedCartItems }) {
    // rollback to the cart saved before sending the request
    state.added = savedCartItems;
    state.checkoutStatus = 'failed';
  },

  ['RECEIVE_PRODUCTS'] (state, { products }) {
    state.all = products;
  },
}
