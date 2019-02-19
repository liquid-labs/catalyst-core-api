/* global afterEach beforeAll beforeEach describe expect jest test */
import React from 'react'
import { act, render, cleanup, waitForElement } from 'react-testing-library'
import * as store from '../core/store'
import fetchMock from 'fetch-mock'
import { ItemFetcher } from './ItemFetcher'
import { userId, userReqBody, userUrl, loadUserInCache, setupStore } from '../testlib'
import { makeGate } from '@liquid-labs/lock-and-key'

// const callAllowance = 500

// eslint-disable-next-line react/prop-types
const testChild = jest.fn(
  ({item}) => <span data-testid="content">{item.pubId}</span>
)
const testWait = jest.fn(() => null)
const testBlock = jest.fn(() => null)
const testAwaitProps = { spinner : testWait, blocked : testBlock }

describe('ItemFetcher', () => {
  // jest.useFakeTimers()

  beforeAll(setupStore)
  beforeEach(store.init)
  afterEach(() => {
    fetchMock.restore()
    testWait.mockClear()
    cleanup()
  })

  test('should immediately render a cached item', async() => {
    loadUserInCache()

    const { getByTestId } = render(
      <ItemFetcher itemUrl={userUrl} awaitProps={testAwaitProps}>
        { testChild }
      </ItemFetcher>
    )
    expect(getByTestId('content').textContent).toBe(userId)
    expect(testChild.mock.calls).toHaveLength(1)
    expect(testWait.mock.calls).toHaveLength(0)
    expect(testBlock.mock.calls).toHaveLength(0)
  })

  test('should render a remotely fetched item after displaying the wait screen',
    async() => {
      const { gate, key } = makeGate()
      const resultPromise = async() => {
        await gate
        return {
          body    : userReqBody,
          headers : { 'content-type' : 'application/json' }
        }
      }
      fetchMock.getOnce(`/api${userUrl}`, resultPromise)

      const { queryByTestId, getByTestId } = render(
        <ItemFetcher itemUrl={userUrl} awaitProps={testAwaitProps}>
          { testChild }
        </ItemFetcher>
      )
      expect(testChild.mock.calls).toHaveLength(0)
      expect(testWait.mock.calls).toHaveLength(1)
      expect(testBlock.mock.calls).toHaveLength(0)

      act(() => { key.openGate() })
      await waitForElement(() => getByTestId('content'))
      expect(queryByTestId('content')).toHaveProperty('textContent', userId)
      expect(testChild.mock.calls).toHaveLength(1)
      expect(testWait.mock.calls).toHaveLength(1)
      expect(testBlock.mock.calls).toHaveLength(0)
    })
})
