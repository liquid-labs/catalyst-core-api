/**
 * Catalyst Core API client side libraries provide core client support and
 * foundational models. Refer to:
 *
 * - core/store.js for setting up and configuring the required redux store, as
 *   well as how to integrate with additional reducers and redux middleware.
 * - core/resources for APIs and classes and to configure and access REST-ful
 *   resources.
 * - entities and locations for foundational data models which can be included
 *   in custom data models.
 */
import * as contextSettings from './core/contextSettings'
import * as routes from './core/routes'
import * as store from './core/store'
export * from './core/coreSetup'
export * from './core/resources'

export * from './entities/model'
export * from './locations/model'

export * from './components'

export { contextSettings, routes, store }
