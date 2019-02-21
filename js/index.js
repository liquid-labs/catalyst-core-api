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
import * as resourcesSettings from './core/resources/settings'
import * as store from './core/store'
export * from './core/coreSetup'
export * from './core/resources'

export * from './entities/model'
export * from './locations/model'

export { resourcesSettings, store }
