import typescript from 'rollup-plugin-typescript2';

export default {
  entry: 'src/index.ts',
  format: 'es',
  dest: 'dist/index.js',
  plugins: [
    typescript(require('typescript'))
  ],
  external: ['vue', 'vuex']
};
