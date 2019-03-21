/* global afterEach beforeAll beforeEach describe expect test */
import * as store from '../store'
import * as resources from './resources'
import fetchMock from 'fetch-mock'
import { userId, userData, userReqBody, userUrl, loadUserInCache, setupStore } from '../../testlib'

// const callAllowance = 500

describe('resources', () => {
  beforeAll(setupStore)
  beforeEach(store.init)
  afterEach(fetchMock.restore)

  test('fetchItem() should return recently cached item', async() => {
    loadUserInCache()
    const { data, errorMessage } = await resources.fetchItem('users', userId)
    expect(fetchMock.called()).toBe(false)
    expect(errorMessage).toBeNull()
    expect(data).toEqual(userData)
  })

  test('fetchItem() should return remotely fetched when no cache available', async() => {
    fetchMock.getOnce(`/api${userUrl}`, {
      body    : userReqBody,
      headers : { 'content-type' : 'application/json' }
    })

    const { data, errorMessage } = await resources.fetchItem('users', userId)
    expect(fetchMock.done()).toBe(true)
    expect(errorMessage).toBeNull()
    expect(data).toEqual(userData)
  })
})
