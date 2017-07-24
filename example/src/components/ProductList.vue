<template>
  <ul>
    <li v-for="p in products">
      {{ p.title }} - {{ p.price | currency }}
      <br>
      <button
        :disabled="!p.inventory"
        @click="addToCart(p)">
        Add to cart
      </button>
    </li>
  </ul>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from '../store/getters';
import { State } from '../store';
import { actions } from '../store/actions';
import { Product } from '../types';

@Component({})
export default class ProductList extends Vue {
  @Prop({ type: Object, required: true })
  getters: Getter;

  @Prop({ type: Object, required: true })
  state: State;

  @Prop({ type: Object, required: true })
  actions: typeof actions;

  created() {
    this.actions.getAllProducts();
  }

  get products() {
    return this.getters.allProducts;
  }

  addToCart(p: Product) {
    this.actions.addToCart(p)
  }

}
</script>
