import { Model } from '../core/resources/Model'
import { entityPropsModel } from '../entities/model'

const userPropsModel = [
  ...entityPropsModel,
  {propName : 'authId', writable : false},
  {propName : 'legalID', writable : true},
  {propName : 'legalIDType', writable : true},
  {propName : 'active', writable : true}
]

const User = class extends Model {
  get resourceName() { return 'users' }
}
Model.finalizeConstructor(User, userPropsModel)

export {
  userPropsModel,
  User
}
