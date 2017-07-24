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
