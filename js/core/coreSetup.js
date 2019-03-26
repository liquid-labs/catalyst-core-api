// TODO: this file should be named simply 'setup' and use the path as context like the others
import * as store from './store'
import { RESOURCES_STATE_KEY } from './resources/constants'
import { resourceReducer } from './resources/reducer'
import * as resourcesSettings from './resources/settings'
import thunk from 'redux-thunk'

const tryResource = `Try something like:
import { CommonResourceConf, resourcesSettings } from '@liquid-labs/catalyst-core-api'

const yourSetup = () => {
  const resourceList = [
    new CommonResourceConf('user')
  ]

  resourcesSettings.setResources(resourceList)
}`

export const coreSetup = () => {
  store.addReducer(RESOURCES_STATE_KEY, resourceReducer)
  store.addMiddleware(thunk)
}

export const verifyCatalystSetup = () => {
  if (process.env.NODE_ENV !=='production') {
    const resources = resourcesSettings.getResources()
    if (!resources) {
      throw new Error(`Resource settings are null. ${tryResource}`)
    }
    if (!Array.isArray(resources)) {
      throw new Error(`'getResources()' returned unexpected type.` )
    }
  }
}

export const coreInit = () => {
  verifyCatalystSetup()
  return {
    reduxStore : store.init()
  }
}
