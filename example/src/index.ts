import Vue from 'vue';
import App from './components/App.vue'
import { inject } from '../../src';
import { store } from './store';
import { currency } from './currency'

Vue.filter('currency', currency)

new Vue({
  el: '#app',
  render: h => h(inject(App, store))
})
