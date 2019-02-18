/* global describe expect test */
import { CommonResourceConf } from './CommonResourceConf'
import { coreSetup, verifyCatalystSetup } from '../coreSetup'
import * as resourcesSettings from './settings'
import * as store from '../store'
import * as actions from './actions'
import { User } from '../../users/model'
import * as resources from './resources'
import fetchMock from 'fetch-mock'

// const callAllowance = 500

const resId = '8BBF68AB-96D6-43EB-BDAE-36F55BC6EFD6'
const resUrl = `/users/${resId}`
const ts = Date.now()
const userData = { pubId: resId, lastUpdated: ts -1000, active: true }
const resBody = {
  data: userData,
  message: `Retrieved user '${resId}'.`
}

const loadUserInCache = () => {
  store.getStore().dispatch(
    actions.fetchItemSuccess(resBody, resUrl, ts)
  )
}

describe('resources', () => {
  beforeAll(() => {
    resourcesSettings.setBaseUrl('/api')
    const resourceList = [
      new CommonResourceConf('user', { model : User })
    ]
    resourcesSettings.setResources(CommonResourceConf.listToMap(resourceList))
    verifyCatalystSetup()

    coreSetup()
  })

  beforeEach(() => {
    store.init()
  })

  afterEach(() => {
    fetchMock.restore()
  })

  test('fetchItem() should return recently cached item', async () => {
    loadUserInCache()
    const { data, errorMessage } = await resources.fetchItem('users', resId)
    expect(fetchMock.called()).toBe(false)
    expect(errorMessage).toBeNull()
    expect(data).toEqual(userData)
  })

  test('fetchItem() should return fetched when no cache available', async () => {
    const callTs = Date.now()
    fetchMock.getOnce(`/api${resUrl}`, {
      body: resBody,
      headers: { 'content-type': 'application/json' }
    })

    const { data, errorMessage } = await resources.fetchItem('users', resId)
    expect(fetchMock.done()).toBe(true)
    expect(errorMessage).toBeUndefined()
    expect(data).toEqual(userData)
  })
})
