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

@Component({ components: { Cart, ProductList } })
export default class App extends Vue {
  @Prop({ type: Object, required: true })
  actions: any;
  @Prop({ type: Object, required: true })
  state: any;
  @Prop({ type: Object, required: true })
  getters: any;
}
</script>
