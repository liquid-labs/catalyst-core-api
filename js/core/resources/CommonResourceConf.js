/**
 * CommonResourceConf is used to configure application resources so the generic
 * resource processing knows how to handle them. This includes setting the item
 * `Model`, list sort options, etc. as well as defining custom creation and
 * update logic to annotate the pure item data with additional data necessary to
 * complete API calls.
 */
import camelCase from 'lodash.camelcase'
import { schema } from 'normalizr'

const defineConst = (obj, name, value) =>
  Object.defineProperty(obj, name, {
    value        : value,
    writable     : false,
    enumerable   : true,
    configurable : false
  })

export class CommonResourceConf {
  /**
   * A number of common constants used for UI and internal processing are
   * generated from the item name. The `apiConfig` parameter is necessary for
   * resources directly manipulated by an application through API calls and will
   * thus typically be provided. `apiConfig` may be left undefined for a
   * resource type which is included in a context call and may be referenced or
   * included in results, but is not itself directly accessed.
   */
  constructor(itemName, apiConfig=undefined, options) {
    // Common data items that all resources have.
    defineConst(this, 'resourceName', options?.resourceName || itemName + 's')
    defineConst(this, 'itemName', itemName)

    defineConst(this, 'resourceCamelName', camelCase(this.resourceName))
    defineConst(this, 'itemCamelName', camelCase(itemName))

    defineConst(this, 'resourceConstantName',
      this.resourceName.replace('-', '_').toUpperCase());
    defineConst(this, 'itemConstantName',
      itemName.replace('-', '_').toUpperCase());

    defineConst(this, 'itemSchema',
      new schema.Entity('items', {}, { idAttribute : 'pubId' }))
    defineConst(this, 'listSchema', new schema.Array(this.itemSchema))

    // Resources that can be created define the following
    if (apiConfig) {
      // always define a model; in the simple case, that's all that's needed
      // TODO https://github.com/Liquid-Labs/catalyst-core-api/issues/13
      defineConst(this, 'model', apiConfig.model)
      defineConst(this, 'sortOptions', apiConfig.sortOptions)
      if (apiConfig.sortOptions) {
        defineConst(this, 'sortMap', apiConfig.sortOptions.reduce((map, opt) => {
          map[opt.value] = opt.func
          return map
        }, {}))
      }
      else defineConst(this, 'sortMap', {})
      defineConst(this, 'sortDefault', apiConfig.sortDefault)
      // Creating a new UI-item runs through:
      // - createExport
      // - createDependencies
      // - createItem
      // This generates a emtpy-ish item to be completed by the user. Then
      // before being sent the API, the UI-item is run through 'createExport'

      // takes the redux 'state' and returns properties that the
      // 'createItem' or 'prepareCreate' methods care about (if any).
      this.createExport = apiConfig.createExport
      this.createDependencies = apiConfig.createDependencies || []
      // If no explicit 'createItem' is defined, then we just make a new
      // version of the model. If you need to do more to create the item, e.g.
      // set some associated relation based on the current context, then
      // this is where you'd do it.
      this.createItem = apiConfig.createItem || (() => new this.model())
      // 'prepare create' is for when the API create call (PUT /resourceX) needs
      // data other than just the item itself. This is used to wrap the item
      // data with additional data.
      this.prepareCreate = apiConfig.prepareCreate
    }
  }
}
