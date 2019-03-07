/* global describe expect test */
import { Model } from './Model'
import { CommonResourceConf } from './CommonResourceConf'

const fooPropsModel = [
  {propName : 'name', unsetForNew : false, writable : true}
]

const Foo = class extends Model {
  get resourceName() { return 'foos' }
}
Model.finalizeConstructor(Foo, fooPropsModel)

const fooResourceConf = new CommonResourceConf('foo', {
  model       : Foo,
  sortOptions : [
    {
      value : 'name-asc',
      label : 'Value (asc)',
      func  : (a, b) => a.name.localeCompare(b.name) },
    {
      value : 'name-desc',
      label : 'Name (desc)',
      func  : (a, b) => -a.name.localeCompare(b.name) }
  ]
})

describe('CommonResourceConf', () => {
  test("should produce a 'sortMap' based on the 'sortOptions'", () => {
    expect(typeof fooResourceConf.sortMap).toBe('object')
    expect(Object.keys(fooResourceConf.sortMap)).toHaveLength(2)
    expect(typeof fooResourceConf.sortMap['name-asc']).toBe('function')
  })
})
