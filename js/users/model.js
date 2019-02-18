import { Model } from '../core/resources/Model'
import { entityPropModel } from '../entities/model'

const userPropsModel = [
  ...entityPropModel,
  {propName: 'active', unsetForNew: true, writable: true}
]

const User = class extends Model {
  get resourceName() { return 'users' }
}
Model.finalizeConstructor(User, userPropsModel)

export {
  userPropsModel,
  User
}
