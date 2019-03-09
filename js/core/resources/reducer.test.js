/* global beforeAll describe expect test */
import { resourceReducer, INITIAL_STATE } from './reducer'
import * as actions from './actions'
import { User } from '../../users/model'
import { userData, userId, userUrl, setupResources, ts } from '../../testlib'

const callAllowance = 500

describe('resource reducer', () => {
  beforeAll(() => {
    setupResources()
  })

  test('should return the initial state', () => {
    expect(resourceReducer(undefined, {})).toEqual(INITIAL_STATE)
  })

  test('should cache fetch item results', () => {
    const newState = resourceReducer(INITIAL_STATE,
      actions.fetchItemSuccess(
        {
          data    : userData,
          message : `Retrieved user '${userId}'.`
        },
        userUrl,
        ts
      ))
    expect(newState.sources[userUrl].lastChecked.valueOf()).toBeGreaterThanOrEqual(ts)
    expect(newState.sources[userUrl].lastChecked.valueOf()).toBeLessThan(ts + callAllowance)
    delete newState.sources[userUrl].lastChecked
    expect(newState).toEqual({
      ...INITIAL_STATE,
      items : {
        [userId] : new User(userData)
      },
      refreshItemListsBefore : 1,
      sources                : {
        [userUrl] : {
          refList      : [ userId ],
          searchParams : undefined,
          source       : userUrl
        }
      }
    })
  })
})
