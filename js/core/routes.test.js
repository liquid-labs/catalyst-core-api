/* global test expect */
import { CommonResourceConf } from './CommonResourceConf'
import * as uiRoutes from './uiRoutes'
import * as config from './config'

const resourceList = [
  new CommonResourceConf('user')
]

config.setResources(CommonResourceConf.listToMap(resourceList))

test('getGlobalListRoute results in valid path with valid resource', () => {
  expect(uiRoutes.getGlobalListRoute('users')).toEqual('/users')
})

test('getGlobalListRoute results in error path with invalid resource', () => {
  expect(() => {uiRoutes.getGlobalListRoute('foos')}).toThrow(Error)
})
