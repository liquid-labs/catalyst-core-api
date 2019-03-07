/* global describe expect test */
import { CommonResourceConf } from './resources/CommonResourceConf'
import * as routes from './routes'
import * as resourcesSettings from './resources/settings'

const resourceList = [
  new CommonResourceConf('user')
]

resourcesSettings.setResources(resourceList)
const testUUID = 'C6B4E077-91F1-4BC3-A857-42EFC7B9D247'

describe('routes', () => {
  test('getGlobalListRoute results in valid path with valid resource', () => {
    expect(routes.getGlobalListRoute('users')).toEqual('/users/')
  })

  test('getGlobalListRoute results in error path with invalid resource', () => {
    expect(() => {routes.getGlobalListRoute('foos')}).toThrow(Error)
  })

  test('extractResource recognizes standard "get-by-ID" construction', () => {
    expect(routes.extractResource(`/persons/${testUUID}/`)).toBe('persons')
  })

  test('extractResource recognizes "self-ID" for users and persons resources', () => {
    expect(routes.extractResource(`/persons/self/`)).toBe('persons')
    expect(routes.extractResource(`/users/self/`)).toBe('users')
  })

  test('extractResource does not recognize "self" as valid ID for other resources', () => {
    expect(routes.extractResource(`/foo/self/`)).toBeNull()
  })
})
