import { Model } from '../Model'

const locationInvalidators = ['address1', 'address2', 'city', 'state', 'zip']
const locationPropsModel = [
    'address1',
    'address2',
    'city',
    'state',
    'zip',
    'lat',
    'lng',]
  .map((propName) => ({ propName: propName, writable: true}))
locationPropsModel.push(...([
    'locationId']
  .map((propName) => ({
    propName: propName,
    fragile: locationInvalidators,
    unsetForNew: true,
    writable: false}))))
locationPropsModel.push(
    // this is used to track new items in a list when re-ordering, etc.
    { propName: 'tempId',
      writable: false,
      optionalForComplete: true },
    { propName: 'changeDesc',
      unsetForNew: true,
      writable: true,
      optionalForComplete: true}
  )

const Location = class extends Model {
  get resourceName() { return 'location' }
}
Model.finalizeConstructor(Location, locationPropsModel, (props) => !props || !props.locationId)

export default Location

export {
  locationInvalidators,
  locationPropsModel
}

const addressPropsModel = [
    'idx',
    'label']
  .map((propName) => ({ propName: propName, writable: true}))
addressPropsModel.push(...locationPropsModel)

const Address = class extends Model {
  // An address is not a resource, but an association between a location and
  // another resource
  get resourceName() { return null }
}
Model.finalizeConstructor(Address, addressPropsModel, (props) => !props || !props.locationId || props.locationId < 0)

export { Address }
