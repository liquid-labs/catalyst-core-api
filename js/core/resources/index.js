/**
 * The 'resources' package exports two public APIs and two support classes:
 * - `resourcesSettings` API to configure application resources,
 * - `resources` API to manage resources,
 * - `Model` class used to describe a resource-item data model, and
 * - `CommonResourceConf` class used to configure handling of API calls.
 *
 * The `resources` API is the central public used to create, retrieve, update,
 * and delete REST-ful resources. It uses a local cache for performance.
 *
 * Developers and maintainers should refer to the `actions` API for a
 * description of the internal flow and handling of calls and data.
 */
import * as resources from './resources'
import * as resourcesSettings from './settings'

export * from './Model'
export * from './CommonResourceConf'
export { resources, resourcesSettings }
