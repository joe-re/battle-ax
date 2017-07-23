import Vue, { WatchOptions } from 'vue';
import Vuex, { Store, Dispatch, Plugin, ModuleTree } from 'vuex';

export interface ActionContext<S, R, A> {
  dispatch: Dispatch;
  commit: <K extends keyof A>(params: { type: K, payload: A[K] }) => void,
  state: S;
  getters: any;
  rootState: R;
  rootGetters: any;
}

type Action<S, R, A, P> = (payload: P) =>
 (injectee: ActionContext<S, R, A>) => any;
export type ActionTree<S, R, A> = {
  [key: string]: (payload: any) => (ctx: ActionContext<S, R, A>) => any
}

export type Mutation<S, P> = (state: S, payload: P) => any;
export type MutationTree<S, A> = {
  [P in keyof A]?: Mutation<S, A[P]>;
};

export type GetterResult = { [key: string]: any }
export type Getter<S, R, G, V> = (state: S, getters: G, rootState: R, rootGetters: any) => V;
export type GetterTree<S, R, G extends GetterResult> = {
  [P in keyof G]: Getter<S, R, G, G[P]>;
}

export interface StoreOptions<S, G, A, AC extends ActionTree<S, S, A>> {
  state?: S;
  getters?: GetterTree<S, S, G>;
  actions?: AC;
  mutations?: MutationTree<S, A>;
  modules?: ModuleTree<S>;
  plugins?: Plugin<S>[];
  strict?: boolean;
}

export declare class TypedStore<S, G, A, AC extends ActionTree<S, S, A>> extends Store<S> {
  constructor(options: StoreOptions<S, G, A, AC>);
  readonly getters: G;
}

export class BAStore<S, G, A, AC extends ActionTree<S, S, A>> {
  _store: TypedStore<S, G, A, AC>
  private _actions: AC;

  constructor(options: StoreOptions<S, G, A, AC>) {
    Vue.use(Vuex);
    const { actions, mutations, ...remains } = options;
    this._store = new (Vuex.Store as any)({
      actions: this.transformActions(actions),
      mutations: this.transformMutations(mutations),
      ...remains
    });
    this.setActions();
  }

  get dispatch() {
    return this._store.dispatch;
  }

  get commit() {
    return this._store.commit;
  }

  get watch(): WatchOptions {
    return this._store.watch;
  }

  get state(): S {
    return this._store.state;
  }
  get getters(): G  {
    return this._store.getters;
  }

  get actions(): AC {
    return this._actions;
  }

  private setActions() {
    this._actions = Object.keys((this._store as any)._actions).reduce((p: any, c: string) => {
      const action = (this._store as any)._actions[c];
      p[c] = (payload: any) => this._store.dispatch(c, payload);
      return p;
    }, {});
  }

  transformMutations<S, A>(params: any) {
    let obj: any = {};
    Object.keys(params).forEach(k => {
      obj[k] = (state: S, payload: any) =>
        (params[k] as any)(state, payload.payload)
    });
    return obj;
  }

  transformActions(params: any): any {
    let obj: any = {};
    Object.keys(params).forEach(k => {
      obj[k] = (actionContext: any, payload: any) => {
        (params as any)[k](payload)(actionContext)
      }
    });
    return obj;
  }
}

export function createStore<S, G, A, AC extends ActionTree<S, S, A>>(options: StoreOptions<S, G, A, AC>) {
  return new BAStore(options);
}

export function ActionCreatorHelper<S, R, A>() {
  return <T extends ActionTree<S, R, A>>(ac: T): T => ac
}

export function inject<S, G, A, AC extends ActionTree<S, S, A>>(container: any, store: BAStore<S, G, A, AC>) {
  const name = container.options.name || 'unknown-container';
  return {
    name: `injected-${name}`,
    components: {
      [name]: container
    },
    data: () => ({
      actions: store.actions,
      state: store.state,
      getters: store.getters
    }),
    template: `
      <${name}
       :actions="actions"
       :state="state"
       :getters="getters"
     />
    `
  }
}
