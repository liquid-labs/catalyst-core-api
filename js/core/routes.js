import * as store from './store'
import * as resourceSettings from './resources/settings'
import * as contextSettings from './contexts/settings'

import * as regex from '@liquid-labs/regex-repo'

/**
 * Given a resource name, returns the UI path to the global list.
 */
export const getGlobalListRoute = (resource) => {
  if (!resourceSettings.getResources()[resource]) {
    throw new Error(`Unknown resource '${resource}'. (Check that resource name is plural.)`)
  }
  return `/${resource}`
}
/**
 * Given a context resource, final (displayed) resource, and optional context ID
 * returns UI path to the context-specific list. If the context ID is not
 * provided, then outputs path suitable for binding to a 'Route'.
 */
const getContextListRoute = (contextResource, resource, generic=true) => {
  const resourceMapper = contextSettings.getContexts().contextMaps[resource]
    && contextSettings.getContexts().contextMaps[resource][contextResource]
  if (resourceMapper) {
    const { mappedContext, mappedId } = resourceMapper(generic)
    return `/${mappedContext}/${mappedId || ':contextId' }/${resource}`
  }
  else if (contextSettings.getContexts().info[contextResource]) {
    const contextId = generic
      ? ':contextId'
      : store.getState()['contextState'][contextSettings.getContexts().info[contextResource].itemName].pubId
    return `/${contextResource}/${contextId}/${resource}`
  }
  else throw new Error(`Unmapple context list context '${contextResource}' and resource '${resource}'.`)
}

export const getContextListRouteGeneric = (contextResource, resource) =>
  getContextListRoute(contextResource, resource, true)

export const getContextListRouteForState = (contextResource, resource) =>
  getContextListRoute(contextResource, resource, false)

export const getContextListRouteFor = (context, resourceName) => {
  if (!Array.isArray(context)) {
    return `/${context.type}/${context.id}/${resourceName}`
  }
  else {
    return `${context.reduce((path, bit) => `/${context.type}/${context.id}`)}/${resourceName}`
  }
}

export const getItemCreateRoute = (resource) =>
  `/${resource}/create`

export const getItemViewRoute = (resource, itemId) =>
  `/${resource}/${itemId || ':id'}`

export const getItemEditRoute = (resource, itemId) =>
  `/${resource}/${itemId || ':id'}/edit`

export const getDefaultListRoute = (resource, context) => {
  if (context.contextResolved && !context.contextError) {
    let contextItem = null
    const contextInfo =
      contextSettings.getContexts().ordering.find(contextInfo => {
        contextItem = context[contextSettings.getContexts().info[contextInfo[0]].itemName]
        return Boolean(contextItem)
      })
    if (contextInfo) {
      // TODO: if this returns null, try the next available context until all contextSettings.getContexts() have been checked, then throw error.
      return getContextListRoute(contextInfo[0], resource, false)
    }
  }
  else {
    // eslint-disable-next-line no-console
    console.warn("Generating default list route without setting context or in the presence of a context error will fallback to the globar resource list. This may not be the intent.")
  }
  // if we get to this point, just fallback to global
  return getGlobalListRoute(resource)
}

const splitPath = (path) => {
  const [pathName, query] = path.split('?')
  const bits = pathName.split('/')
  // Canonical path names work start with '/'
  if (bits[0] === '') {
    bits.splice(0, 1)
  }
  else {
    throw new Error(`Cannot extract resource from a non-canonical path: '${path}''.`)
  }

  return { bits, query }
}

export const isListView = (path) => {
  const { bits } = splitPath(path)
  return Boolean((bits.length === 1 && resources[bits[0]])
    || (bits.length === 3
        && resourceSettings.getResources()[bits[0]]
        && regex.uuid.test(bits[1])
        && resourceSettings.getResources()[bits[2]]))
}

export const isItemRoute = (path) => {
  const { bits } = splitPath(path)
  return regex.uuid.test(bits[1])
    && (bits.length === 2 || (bits.length === 3 && bits[2] === 'edit'))
}

/**
 * Extracts the final (displayed) resource from a UI path based on soley on
 * structure. In particular, does not check whether the resource is valid for
 * the app.
 */
export const extractResource = (path) => {
  const { bits } = splitPath(path)

  if (bits.length === 1 // global list
      || (bits.length === 2
          && (bits[1] === 'create' || regex.uuid.test(bits[1]))) // create  or veiew item
      || (bits.length === 3 && bits[2] === 'edit')) { // edit item
    return bits[0]
  }
  else if (bits.length === 3 // context access
    // valid entity IDs
    && (regex.uuid.test(bits[1]) || (bits[0] === 'users' && bits[1] === 'self'))) {
    return bits[2]
  }
  else return null
}

export const extractListContext = (path) => {
  const { bits } = splitPath(path)

  if (bits.length === 1 // global list
      || (bits.length === 2
          && (bits[1] === 'create' || regex.uuid.test(bits[1]))) // create  or veiew item
      || (bits.length === 3 && bits[2] === 'edit')) { // edit item
    return null
  }
  else if (bits.length === 3 && regex.uuid.test(bits[1])) { // context list
    return bits[0]
  }
  else return null
}
