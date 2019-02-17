/* global describe expect test */
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import * as actions from './actions'
import * as store from '../store'
import * as settings from './settings'
import { INITIAL_STATE } from './reducer'
import { RESOURCES_STATE_KEY } from './constants'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
settings.setBaseUrl('/api')
const callAllowance = 500 // miliseconds

describe('async actions', () => {
  afterEach(() => {
    fetchMock.restore()
  })

  test('creates FETCH_ITEM_SUCCESS when fetching item done', async () => {
    const personUuid = '67269E64-1635-49B6-9ACC-A708E7FF1A3D'
    const message = `Retrieved person '${personUuid}'.`
    const personJson = { displayName: "John Doe" }
    const responseJson = {
      message: message,
      data: personJson
    }
    const personUrl = `/persons/${personUuid}`
    const callTs = Date.now()
    fetchMock.getOnce(`/api${personUrl}`, {
      body: responseJson,
      headers: { 'content-type': 'application/json' }
    })

    const expectedActions = [
      { type: actions.FETCH_ITEM_REQUEST, source: personUrl  },
      { type: actions.FETCH_ITEM_SUCCESS, source: personUrl, searchParams: undefined, ...responseJson }
    ]
    store.setStore(mockStore({ [RESOURCES_STATE_KEY]: INITIAL_STATE }))

    await store.getStore().dispatch(actions.fetchItem('persons', personUuid))
    // first, we have to test and then remove the 'receivedAt' info
    expect(store.getStore().getActions().length).toBe(2)
    expect(store.getStore().getActions()[1].receivedAt).toBeGreaterThanOrEqual(callTs)
    expect(store.getStore().getActions()[1].receivedAt).toBeLessThan(callTs + callAllowance)
    delete store.getStore().getActions()[1].receivedAt
    expect(store.getStore().getActions()).toEqual(expectedActions)
  })
})
