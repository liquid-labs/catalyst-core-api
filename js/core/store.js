/**
 * store provides an API for configuring and initializing the redux store for
 * a Catalyst apllication. It should be combined with 'coreInit' to configures
 * core resources.
 *
 * Usage:
 *
 *      import { store, coreInit } from '@liquid-labs/catalyst-core-api'
 *     ...
 *     coreInit()
 *     store.addReducer('appState', appReducer) // optional
 *     store.addMiddleware(middlewareA, middlewareB) // optional
 *     store.init()
 *
 * And then:
 *
 *     <StoreProvider value={store.getStore()}>
 *       ...
 *     </StoreProvider>
 */
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'

const settings = {
  reducers    : {},
  middlewares : [],
  store       : null
}

/**
 * addReducer adds a single reducer to the store settings. These reducers will
 * be combined into a single "root" reducer when `init` creates the redux store.
 * This must be called prior to `init`.
 */
export const addReducer = (stateKey, stateReducer) => {
  if (settings.reducers[stateKey]) {
    throw new Error(`State key '${stateKey}' already in use.`)
  }
  settings.reducers[stateKey] = stateReducer
}

/**
 * addReducers accepts an object of the form:
 * `{ stateKeyA: stateReducerA, ...}`
 * and adds everything to the application reducers. This is equivalent to
 * calling `addReducer('stateKeyA', stateReducerA)` for each reducer separately.
 */
export const addReducers = (reducerMap) =>
  Object.assign(settings.reducers, reducerMap)

/**
 * addMiddleware adds a redux-middleware to the redux store configuration. This
 * must be called prior to `init`.
 */
export const addMiddleware = (middleware) =>
  settings.middlewares.unshift(middleware)

export const init = () => {
  const { reducers, middlewares } = settings
  const rootReducer = combineReducers(reducers)
  // TODO: Parameterize this...
  /*if (process.env.NODE_ENV !== 'production') {
    const { logger } = require('redux-logger')
    middlewares = [ ...middlewares, logger ]
  }*/
  const store = createStore(rootReducer, {}, compose(
    applyMiddleware(...middlewares),
    // add support for Redux dev tools
    typeof window !== 'undefined' && window.devToolsExtension
      ? window.devToolsExtension()
      : f => f
  ))
  /* TODO: Now that we've library-ized this, can we still support this? It
  worked fine when we distributed babel-compiled files, but using rollup, this
  breaks.
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default // eslint-disable-line global-require
      store.replaceReducer(nextReducer)
    })
  }*/
  settings.store = store
  return store
}

/**
 * Used to access the store directly.
 */
export const getStore = () => settings.store

/**
 * setStore sets the store in settings. This is intended primarily to be used
 * in testing and should generally not be called in application code.
 */
export const setStore = (store) => settings.store = store
