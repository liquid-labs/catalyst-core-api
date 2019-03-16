import * as store from './store'
import * as resourcesSettings from './resources/settings'
import * as contextSettings from './contextSettings'

import * as regex from '@liquid-labs/regex-repo'

const authIdRegex = /^auth-id-.{1,}/
const ALLOW_ALT_IDS = true

/**
 * Given a resource name, returns the UI path to the global list.
 */
export const getGlobalListRoute = (resource) => {
  if (!resourcesSettings.getResourcesMap()[resource]) {
    throw new Error(`Unknown resource '${resource}'. (Check that resource name is plural.)`)
  }
  return `/${resource}/`
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
    return `/${mappedContext}/${mappedId || ':contextId' }/${resource}/`
  }
  else if (contextSettings.getContexts().info[contextResource]) {
    const contextId = generic
      ? ':contextId'
      : store.getStore().getState()['contextState'][contextSettings.getContexts().info[contextResource].itemName].pubId
    return `/${contextResource}/${contextId}/${resource}/`
  }
  else throw new Error(`Unmapple context list context '${contextResource}' and resource '${resource}'.`)
}

export const getContextListRouteGeneric = (contextResource, resource) =>
  getContextListRoute(contextResource, resource, true)

export const getContextListRouteForState = (contextResource, resource) =>
  getContextListRoute(contextResource, resource, false)

export const getContextListRouteFor = (context, resourceName) => {
  if (!Array.isArray(context)) {
    return `/${context.type}/${context.id}/${resourceName}/`
  }
  else {
    return `${context.reduce((path, bit) => `/${context.type}/${context.id}`)}/${resourceName}/`
  }
}

export const getItemCreateRoute = (resource) =>
  `/${resource}/create/`

export const getItemViewRoute = (resource, itemId) =>
  `/${resource}/${itemId || ':id'}/`

export const getItemEditRoute = (resource, itemId) =>
  `/${resource}/${itemId || ':id'}/edit/`

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
  // We are stringent with our path and expect a leading and trailing '/'
  if (bits.shift() !== '' || bits.pop() !== '') {
    throw new Error(`Cannot extract information from a non-absolute/canonical path: '${path}'. Ensure to include a leading and trailing '/'.`)
  }

  return { bits, query }
}

// TODO: hardcoding 'self' isn't great... Either decide it's pracitcally OK and
// clearly document or support some per-resource 'special ID' definition.
const bitsHaveValidId = (bits, allowAltIds=false) =>
  // the ID slot is either regex
  regex.uuid.test(bits[1])
    // or 'self' with a context resource of either 'persons' or 'users'
    || ((bits[0] === 'persons' || bits[0] === 'users') && bits[1] === 'self')
    // or alt 'auth-id' variant with 'persons'
    || (allowAltIds && bits[0] === 'persons' && authIdRegex.test(bits[1]))

export const isListView = (path) => {
  const { bits } = splitPath(path)
  return Boolean((bits.length === 1 && resourcesSettings.getResourcesMap()[bits[0]])
    || (bits.length === 3
        && resourcesSettings.getResourcesMap()[bits[0]]
        && regex.uuid.test(bits[1])
        && resourcesSettings.getResourcesMap()[bits[2]]))
}

export const isItemRoute = (path) => {
  const { bits } = splitPath(path)
  return isItemRouteFromBits(bits)
}

const isItemRouteFromBits = (bits) => {
  return bitsHaveValidId(bits)
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
          && (bits[1] === 'create' || bitsHaveValidId(bits, ALLOW_ALT_IDS))) // create  or veiw item
      || (bits.length === 3 && bits[2] === 'edit')) { // edit item
    return bits[0]
  }
  else if (bits.length === 3 // context access
    // valid entity IDs
    && bitsHaveValidId(bits)) {
    return bits[2]
  }
  else return null
}


export const extractItemIdentifiers = (path) => {
  const { bits } = splitPath(path)
  return isItemRouteFromBits(bits)
    ? { resourceName : bits[0], pubId : bits[1] }
    : {}
}

export const extractListContext = (path) => {
  const { bits } = splitPath(path)

  if (bits.length === 1 // global list
      || (bits.length === 2
          && (bits[1] === 'create' || bitsHaveValidId(bits))) // create  or veiew item
      || (bits.length === 3 && bits[2] === 'edit')) { // edit item
    return null
  }
  else if (bits.length === 3 && bitsHaveValidId(bits)) { // context list
    return bits[0]
  }
  else return null
}

/**
 * Determines a resource item "view mode" by examining the URL and sets 'mode'
 * on the properties. If the pathname ends with '/edit', or '/create', then the
 * mode is set to 'edit' and 'create' respectively. Otherwise, mode defaults to
 * 'view'.
 */
export const getRenderMode = (pathname = window.location.pathname) =>
  pathname.endsWith("/edit/")
    ? "edit"
    : pathname.endsWith("/create/")
      ? "create"
      : "view" // default
