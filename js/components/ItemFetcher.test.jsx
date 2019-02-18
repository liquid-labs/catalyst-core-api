/* global describe expect test */
import React from 'react'
import { render, cleanup } from 'react-testing-library'
import * as store from '../core/store'
import fetchMock from 'fetch-mock'
import { ItemFetcher } from './ItemFetcher'
import { userId, userUrl, loadUserInCache, setupStore } from '../testlib'

// const callAllowance = 500

describe('ItemFetcher', () => {
  jest.useFakeTimers()

  beforeAll(setupStore)
  beforeEach(store.init)
  afterEach(fetchMock.restore)

  test('should immediately render a cached item', async () => {
    loadUserInCache()

    const { getByTestId } = render(
      <ItemFetcher itemUrl={userUrl}>
        { ({item}) => <span data-testid="content">{item.pubId}</span> }
      </ItemFetcher>
    )
    expect(getByTestId('content').textContent).toBe(userId)
  })
})
