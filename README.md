# BattleAX

vuex wrapper for type-safe

> Note: This library is Highly Experimental stage.

## Examples

see [example](./example)

### Store

- actions.ts

```ts
import { ActionCreatorHelper } from 'battle-ax';
import { Product } from '../types';
import { State } from './index';
import shop from '../api/shop';

// define action types. This Object's key is type and value is payload.
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
```

- mutation.ts

```ts
import { MutationTree } from 'battle-ax';
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
    state.added = [];
    state.checkoutStatus = null;
  },

  ['CHECKOUT_SUCCESS'] (state) {
    state.checkoutStatus = 'successful';
  },

  ['CHECKOUT_FAILURE'] (state, { savedCartItems }) {
    state.added = savedCartItems;
    state.checkoutStatus = 'failed';
  },

  ['RECEIVE_PRODUCTS'] (state, { products }) {
    state.all = products;
  },
}
```

- getters.ts

```ts
import { GetterTree } from 'battle-ax';
import { Product } from '../types';
import { State } from './index';

// define getter types
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
```

- store.ts

```ts
import { createStore } from 'battle-ax';
import { Product } from '../types';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

// define state
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
};

// create battle-ax store
export const store = createStore({
  state,
  actions,
  getters,
  mutations,
  strict: true,
});
```

### Components

Example use [vue-property-decorator](https://github.com/kaorun343/vue-property-decorator).

- index.ts(Application's entry file)

```ts
import Vue from 'vue';
import { inject } from 'battle-ax';
import App from './components/App.vue'
import { store } from './store';

new Vue({
  el: '#app',
  render: h => h(inject(App, store)) // inject store into container component
});
```

- App.vue(container component)

```ts
<template>
  <div id="app">
    <h1>Shopping Cart Example</h1>
    <hr>
    <h2>Products</h2>
    <product-list :actions="actions" :state="state" :getters="getters"> </product-list>
    <hr>
    <cart :actions="actions" :state="state" :getters="getters"></cart>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Cart from './Cart.vue'
import ProductList from './ProductList.vue'
import { Product } from '../types';
import { State } from '../store';
import { Getter } from '../store/getters';
import { actions } from '../store/actions';

@Component({ components: { Cart, ProductList } })
export default class App extends Vue {
  // you can access injected store's actions and actions and getters into container.
  // and you can type to their props
  @Prop({ type: Object, required: true })
  actions: State;
  @Prop({ type: Object, required: true })
  state: typeof actions;
  @Prop({ type: Object, required: true })
  getters: Getter;
}
</script>
```

- Cart.vue(presentational component)

```ts
<template>
  <div class="cart">
    <h2>Your Cart</h2>
    <p v-show="!products.length"><i>Please add some products to cart.</i></p>
    <ul>
      <li v-for="p in products">
        {{ p.title }} - {{ p.price | currency }} x {{ p.quantity }}
      </li>
    </ul>
    <p>Total: {{ total | currency }}</p>
    <p><button :disabled="!products.length" @click="checkout(products)">Checkout</button></p>
    <p v-show="checkoutStatus">Checkout {{ checkoutStatus }}.</p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from '../store/getters';
import { State } from '../store';
import { actions } from '../store/actions';
import { Product } from '../types';

@Component({})
export default class Cart extends Vue{
  @Prop({ type: Object, required: true })
  getters: Getter;

  @Prop({ type: Object, required: true })
  state: State;

  @Prop({ type: Object, required: true })
  actions: typeof actions;

  get products() {
    return this.getters.cartProducts;
  }

  get checkStatus() {
    return this.getters.checkoutStatus;
  }

  get total() {
    return this.products.reduce((total, p) => {
      return total + (p.price || 0) * (p.quantity || 0)
    }, 0)
  }

  get checkoutStatus() {
    return this.getters.checkoutStatus;
  }

  checkout(products: Product[]) {
    this.actions.checkout({ products });
  }
}
</script>
```

## License

MIT © [joe-re](https://github.com/joe-re)
