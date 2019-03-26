/* global describe expect test */
import { Model } from './Model'

const fooPropsModel = [
  {propName : 'name', unsetForNew : false, writable : true}
]

const Foo = class extends Model {
  get resourceName() { return 'foos' }
}
Model.finalizeConstructor(Foo, fooPropsModel)

describe('Model', () => {
  test("'forApi()' should set empty, plain (non-model) values to null", () => {
    const foo = new Foo({name : ""})
    expect(foo.forApi().name).toBeNull()
  })
})
