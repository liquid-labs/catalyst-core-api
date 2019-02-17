import * as store from './store'
import { RESOURCES_STATE_KEY } from './resources/constants'
import { resourceReducer } from './resources/reducer'
import thunk from 'redux-thunk'

export const coreSteup = () => {
  store.addReducer(RESOURCES_STATE_KEY, resourceReducer)
  store.addMiddleware(thunk)
}
