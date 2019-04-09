import * as settings from './core/resources/settings'
import * as actions from './core/resources/actions'
import * as store from './core/store'
import { coreSetup, verifyCatalystSetup } from './core/coreSetup'
import { CommonResourceConf } from './core/resources/CommonResourceConf'
import { User } from './users/model'

export const userId = '8BBF68AB-96D6-43EB-BDAE-36F55BC6EFD6'
export const userUrl = `/users/${userId}/`
export const ts = Date.now()
export const userData = {
  pubId : userId,
  lastUpdated : ts -1000,
  active : true,
  authId : 'my-auth-id',
  legalID : '555-55-5555',
  legalIDType : 'SSN'
}
export const userReqBody = {
  data    : userData,
  message : `Retrieved user '${userId}'.`
}

export const userErrorMessage = 'Server error.'

export const setupResources = () => {
  const usersResourceConf = new CommonResourceConf('user', { model : User })
  usersResourceConf.baseURL = '/api'
  settings.setResources([usersResourceConf])
  verifyCatalystSetup()
}

export const setupStore = () => {
  setupResources()
  coreSetup()
}

export const loadUserInCache = () => {
  store.getStore().dispatch(
    actions.fetchItemSuccess(userReqBody, userUrl, ts)
  )
}

export const loadUserErrorInCache = () => {
  store.getStore().dispatch(
    actions.fetchItemFailed(userErrorMessage, 500, userUrl)
  )
}
