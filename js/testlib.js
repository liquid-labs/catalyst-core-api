import * as settings from './core/resources/settings'
import * as actions from './core/resources/actions'
import * as store from './core/store'
import { coreSetup, verifyCatalystSetup } from './core/coreSetup'
import { CommonResourceConf } from './core/resources/CommonResourceConf'
import { User } from './users/model'

export const userId = '8BBF68AB-96D6-43EB-BDAE-36F55BC6EFD6'
export const userUrl = `/users/${userId}`
export const ts = Date.now()
export const userData = { pubId: userId, lastUpdated: ts -1000, active: true }
export const userReqBody = {
  data: userData,
  message: `Retrieved user '${userId}'.`
}

export const loadUserInCache = () => {
  store.getStore().dispatch(
    actions.fetchItemSuccess(userReqBody, userUrl, ts)
  )
}

export const setupResources = () => {
  settings.setBaseUrl('/api')
  const resourceList = [
    new CommonResourceConf('user', { model : User })
  ]
  settings.setResources(CommonResourceConf.listToMap(resourceList))
  verifyCatalystSetup()
}

export const setupStore = () => {
  setupResources()
  coreSetup()
}
