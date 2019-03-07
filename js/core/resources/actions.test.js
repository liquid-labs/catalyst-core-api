/* global afterEach describe expect test */
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import * as actions from './actions'
import * as store from '../store'
import * as settings from './settings'
import { INITIAL_STATE } from './reducer'
import { RESOURCES_STATE_KEY } from './constants'
import { userData, userId, userReqBody, userUrl, setupResources, ts } from '../../testlib'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
setupResources()

const callAllowance = 500 // miliseconds

describe('async actions', () => {
  afterEach(() => {
    fetchMock.restore()
  })

  test('creates FETCH_ITEM_SUCCESS when fetching item done', async() => {
    fetchMock.getOnce(`/api${userUrl}`, {
      body    : userReqBody,
      headers : { 'content-type' : 'application/json' }
    })

    const expectedActions = [
      { type : actions.FETCH_ITEM_REQUEST, source : userUrl },
      { type : actions.FETCH_ITEM_SUCCESS, source : userUrl, searchParams : undefined, ...userReqBody }
    ]
    store.setStore(mockStore({ [RESOURCES_STATE_KEY] : INITIAL_STATE }))

    await store.getStore().dispatch(actions.fetchItem('users', userId))
    // first, we have to test and then remove the 'receivedAt' info
    expect(store.getStore().getActions().length).toBe(2)
    expect(store.getStore().getActions()[1].receivedAt).toBeGreaterThanOrEqual(ts)
    expect(store.getStore().getActions()[1].receivedAt).toBeLessThan(ts + callAllowance)
    delete store.getStore().getActions()[1].receivedAt
    expect(store.getStore().getActions()).toEqual(expectedActions)
  })
})
