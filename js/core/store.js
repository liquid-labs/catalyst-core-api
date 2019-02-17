/**
 * store provides an API for configuring and initializing the redux store for
 * an apllication. It pre-configures support for the resources state used by
 * the 'resources' API to cache local item and meta-call data. Applications
 * should cofigure and initialize the store through this API
 *
 * Usage:
 *
 *     import { store } from '@liquid-labs/catalyst-core-api'
 *    ...
 *    store.addReducer('appState', appReducer)
 *    store.addMiddleware(middlewareA, middlewareB) // optional
 *    store.init()
 */
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import { RESOURCES_STATE_KEY } from './resources/constants'
import { resourceReducer } from './resources/reducer'

const settings = {
  reducers: { RESOURCES_STATE_KEY: resourceReducer },
  middlewares: [thunk],
  store: null
}

/**
 * Adds a single reducer to the store settings. These reducers will be combined
 * into a single "root" reducer when `init` creates the redux store.
 */
export const addReducer = (stateKey, stateReducer) => {
  if (settings.reducers[stateKey]) {
    throw new Error(`State key '${stateKey}' already in use.`)
  }
  settings.reducers[stateKey] = stateReducer

/**
 * addReducers accepts an object of the form:
 * `{ stateKeyA: stateReducerA, ...}`
 * and adds everything to the application reducers. This is equivalent to
 * calling `addReducer('stateKeyA', stateReducerA)` for each reducer separately.
 */
export const addReducers = (reducerMap) =>
  Object.assign(settings.reducers, reducerMap)

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
    window.devToolsExtension ? window.devToolsExtension() : f => f // add support for Redux dev tools
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
}

/**
 * Used to access the store directly.
 */
export const getStore = () => settings.store
