import { createStore } from '../../../src';
import { Product } from '../types';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

export type State = {
  lastCheckout: string | null,
  added: Product[],
  checkoutStatus: string | null,
  all: Product[],
};

const state: State = {
  lastCheckout: null,
  added: [],
  checkoutStatus: null,
  all: []
}

export const store = createStore({
  state,
  actions,
  getters,
  mutations,
  strict: true,
});
