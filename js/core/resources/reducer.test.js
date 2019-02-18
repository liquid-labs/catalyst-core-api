/* global describe expect test */
import { resourceReducer, INITIAL_STATE } from './reducer'
import * as actions from './actions'
import * as resourcesSettings from './settings'
import { CommonResourceConf } from './CommonResourceConf'
import { verifyCatalystSetup } from '../coreSetup'
import { User } from '../../users/model'

const callAllowance = 500

describe('resource reducer', () => {
  beforeAll(() => {
    const resourceList = [
      new CommonResourceConf('user', { model : User })
    ]

    resourcesSettings.setResources(CommonResourceConf.listToMap(resourceList))

    verifyCatalystSetup()
  })

  test('should return the initial state', () => {
    expect(resourceReducer(undefined, {})).toEqual(INITIAL_STATE)
  })

  test('should cache fetch item results', () => {
    const resId = '8BBF68AB-96D6-43EB-BDAE-36F55BC6EFD6'
    const resUrl = `/users/${resId}`
    const ts = Date.now()
    const userData = { pubId: resId, lastUpdated: ts -1000, active: true }

    const newState = resourceReducer(INITIAL_STATE,
      actions.fetchItemSuccess(
        {
          data: userData,
          message: `Retrieved user '${resId}'.`
        },
        resUrl,
        ts
      ))
    expect(newState.sources[resUrl].lastChecked.valueOf()).toBeGreaterThanOrEqual(ts)
    expect(newState.sources[resUrl].lastChecked.valueOf()).toBeLessThan(ts + callAllowance)
    delete newState.sources[resUrl].lastChecked
    expect(newState).toEqual({
        ...INITIAL_STATE,
        items: {
          [resId]: new User(userData)
        },
        refreshItemListsBefore: 1,
        sources: {
          [resUrl]: {
            refList: [ resId ],
            searchParams: undefined,
            source: resUrl
          }
        }
      })
  })
})
