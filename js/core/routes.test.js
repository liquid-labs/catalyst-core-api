/* global test expect */
import { CommonResourceConf } from './resources/CommonResourceConf'
import * as routes from './routes'
import * as resourcesSettings from './resources/settings'

const resourceList = [
  new CommonResourceConf('user')
]

resourcesSettings.setResources(CommonResourceConf.listToMap(resourceList))

test('getGlobalListRoute results in valid path with valid resource', () => {
  expect(routes.getGlobalListRoute('users')).toEqual('/users')
})

test('getGlobalListRoute results in error path with invalid resource', () => {
  expect(() => {routes.getGlobalListRoute('foos')}).toThrow(Error)
})
