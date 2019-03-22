/**
 * Model encapsulates an item property model. This defines the possible
 * properties and their (partial) types, which properties are requried for
 * 'completeness', along with a few useful utilities.
 *
 * 'Completeness' is used to distinguish summary from non-summary items and is
 * not intended for general validation. In particular, it is not applied to
 * new items, generally created clientside, which have not yet been created and
 * stored through the API. Rather, when the API returns items, it may generally
 * return incomplete items. In particular, when returning many items in a list
 * particular fields may be left undefined to avoid 'JOIN's or other
 * calculations on a multiplicity of items.
 *
 * Property 'typing' is either simple-value or model-value. This is not
 * currently used for validation, but rather to transform raw property-value
 * object input parameters into `Model`ed items. Future versions will likely
 * incorporate validation.
 */
// TODO: Superficially, I don't see any reason why 'lastChecked' can't be milis
// since the epoch, which would allow us to drop this dependency.
import moment from 'moment-timezone'

// TODO: should export each model individually.

const isEmpty = (val) => val === null || val === undefined || val === ''

const simpleType = 'simple'
const arrayType = 'array'

const emptyOrUndefined = (propVal, valueType) =>
  propVal === undefined
    || propVal === null
    || (valueType === simpleType && propVal === "")
    || (valueType === arrayType && Array.isArray(propVal) && propVal.length === 0)

const nonCheck = (x) => x === null || x === undefined

class Model {
  static finalizeConstructor(SubClass, propsModel, newTest) {
    deepFreeze(propsModel)
    Object.defineProperty(SubClass, 'propsModel', {
      value        : propsModel,
      writable     : false,
      enumerable   : true,
      configurable : false
    })
    const propsMap = propsModel.reduce((acc, propModel) => {
      acc[propModel.propName] = propModel
      return acc
    }, {})
    deepFreeze(propsMap)
    Object.defineProperty(SubClass, 'propsMap', {
      value        : propsMap,
      writable     : false,
      enumerable   : true,
      configurable : false
    })
    if (!newTest) {
      newTest = (props) => !props || !props.pubId
    }
    SubClass.isNew = newTest
  }

  constructor(props = {}, opts = {}) {
    if (Model === this.constructor) {
      throw new Error("Cannot create a Model directly, must first define a concrete sub-class.")
    }

    const arrayCheck = (propName, propVal) => {
      if ((propVal || propVal !== false) && !Array.isArray(propVal)) {
        throw new Error(`Expected array type value for '${propName}' property of '${this.resourceName}' model.`)
      }
    }

    const { propsModel, isNew, newDefaults } = this.constructor

    const defaultValues = !this.constructor.isNew(props)
      ? {}
      : newDefaults || {}

    Object.defineProperty(this, '_missing', {
      value        : [],
      writable     : false,
      enumerable   : false,
      configurable : false
    })
    Object.defineProperty(this, '_opts', {
      value        : opts,
      writable     : false,
      enumerable   : false,
      configurable : false
    })
    // List of resource items referenced by this resource item. Any existing
    // references will be
    Object.defineProperty(this, '_references', {
      value        : [],
      writable     : false,
      enumerable   : false,
      configurable : false
    })

    // The empty value must be an empty string for the UI, but null for the API.
    // By default, we are setup for UI, since that's where most of the action
    // happens.
    const emptyVal = opts.hasOwnProperty('emptyVal')
      ? opts.emptyVal
      : ""
    propsModel.forEach((propConfig) => {
      // Note 'optionalForComplete' means the presence is not necessary to
      // 'complete' a modeled item. This is usually a calculated or
      // informational bit of data. A non-optionalForComplete value may be
      // empty ("", null, []), but it must be defined for the item to be 'complete'
      const { propName, model, unsetForNew, optionalForComplete } = propConfig
      const valueType = propConfig.valueType || simpleType
      // note if writable undefined, effectively false.
      let value = undefined

      const propVal = props[propName]
      // Let's process the value of property acconding to it's config. We start
      // with the special cases:
      // 1) Is it an undefined new value with a default?
      if (propVal === undefined
          && isNew(props)
          && (!optionalForComplete || defaultValues[propName] !== undefined)) {
        value = defaultValues[propName] !== undefined
          ? defaultValues[propName]
          : (valueType === arrayType && [])
            || emptyVal
      }
      // 2) Is a non-optionalForComplete value missing?
      else if (propVal === undefined && !optionalForComplete && !isNew(props)) {
        this._missing.push(propName)
      }
      // 2) is it a new value that should be 'unset'?
      else if (isNew(props) && unsetForNew) {
        value = valueType === arrayType ? [] : emptyVal
        if (process.env.NODE_ENV !== 'production') {
          if (!emptyOrUndefined(propVal, valueType)) {
            // eslint-disable-next-line no-console
            console.warn(`Unset property '${propName}' for new '${this.resourceName}'.`)
          }
        }
      }
      else if (propVal !== undefined) {
        if (model) {
          if (valueType === arrayType) {
            // Note, no need to convert 'emtpyVal' within an array; absence is
            // emptiness.
            arrayCheck(propName, propVal)
            value = []
            if (propVal && propVal.length > 0) {
              props[propName].forEach((val) => value.push(new model(val, Object.assign({ skipFreeze : true }, opts))))
              value.forEach((val) => this._references.push(val.pubId))
            }
          }
          else if (propVal === null || propVal === "") {
            value = emptyVal
          }
          else { // not an array, and not empty; i.e., a single property set
            value = new model(props[propName], Object.assign({ skipFreeze : true }, opts))
            this._references.push(value.pubId)
          }
        }
        else { // plain, un-modeled value(s)
          if (valueType === arrayType) arrayCheck(propName, propVal)

          if (propVal === "" || propVal === null) value = emptyVal
          else value = propVal
        }
      }
      else if (propVal === undefined && isNew(props)) {
        value = emptyVal
      }
      else if (!optionalForComplete) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(`Unexpected state encountered while creatieng ${this.resourceName}.`, propName, propVal, isNew(props))
        }
        throw new Error("Unexpected value Model creation state.")
      }
      // else, value stays empty

      // notice only the props derived properties are enumerable
      // Do we have a value? Note, when 'props['nonExistent'] is 'undefined',
      // this will cause the property to fail to be defined if 'writable' is
      // 'true'.
      if (value !== undefined) {
        Object.defineProperty(this, propName, {
          value        : value,
          writable     : false, // 'writable' props can be updated, but the property itself is unumerable
          enumerable   : true,
          configurable : false
        })
      }
    })
    Object.defineProperty(this, 'lastChecked', {
      value        : props.lastChecked || opts.lastChecked || moment(),
      writable     : false,
      enumerable   : false,
      configurable : false
    })

    if (!opts.skipFreeze) {
      deepFreeze(this)
    }
  }

  forApi() {
    return new this.constructor(this, { emptyVal : null })
  }

  forUi() {
    return new this.constructor(this, { emptyVal : "" })
  }

  getPropsModel() {
    return this.constructor.propsModel
  }

  update(updates) {
    if (!updates) return this // to force a copy, use 'forUi()/forApi()'
    const updateKeys = Object.keys(updates)
    if (updateKeys.length === 0) return this
    // vaidate updates
    const updatesType = typeof updates
    if (updatesType !== 'object') {
      throw new Error(`Unexpected updates type: '${updatesType}'.`)
    }
    /* TODO: let's check the keys too and issue a warning, but to do efficiently,
       let's re-introduce key-hash build from the props def
    Object.keys(updates).some((key) => {
    })*/
    this.getPropsModel().forEach((propModel) => {
      if (propModel.fragile && (propModel.fragile === true
          || propModel.fragile.some((bProp) => updates[bProp]))) {updates[propModel.propName] = null}
    })
    // validate the updates
    const model = this.constructor
    updateKeys.forEach((updateKey) => {
      const propModel = model.propsMap[updateKey]
      if (!propModel) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(`Found and removing unknown key in item update map: '${updateKey}'.`)
        }
        delete updates[updateKey]
      }
      // For new items, everything can be updated. If not new, then we check
      // whether the props being sent in are allowed.
      // TODO https://github.com/Liquid-Labs/catalyst-core-api/issues/17
      else if (!model.isNew(this) && !propModel.writable) {
        const message = `Attempt to update non-updatable property '${updateKey} of resource '${this.resourceName}'.`
        throw new Error(message)
      }
    })

    return new model(Object.assign({}, this, updates), this._opts)
  }

  exportData() {
    return this.getPropsModel().reduce((data, { propName } ) => {
      data[propName] = this[propName]
      return data
    }, {})
  }

  // TODO: when written, the diff stuff was used to see when an item or list of
  // of items had "deep equals" changed to see when to update components. With
  // the rewrite of the way forms work, where data is exported back out only
  // when done and managed internally otherwise, there may not be a pressing
  // need for this. Unless a new use case comes up, we may want to delete (and
  // perhaps note ref to implementation in so we can resurrect in future if
  // needed).
  isDiff(other) {
    return this.diff(other, true).isDiff
  }

  diff(other, bailout=false) {
    if (!(other instanceof Model)) {
      return {
        diffs  : [`Compared item does not appear to be a Model.`],
        isDiff : true
      }
    }

    const model = this.constructor
    // '.constructor' and '.constructor.name' aren't generally relaibale, but
    // as we've confirmed we're dealing with Models, we expect them to work.
    if (other.constructor.name !== model.name) {
      return {
        diffs  : [`Items are of different type: '${model.name}' -> ${other.constructor.name}'.`],
        isDiff : true
      }
    }

    const isEmptyVal = (val) =>
      val === null || val === undefined || val === ""
    const diffs = []
    model.propsModel.some((propModel) => {
      const propName = propModel.propName
      const addDiff = (diffData) => diffs.push({ propName : propName, diff : diffData })
      const myVal = this[propName]
      const otherVal = other[propName]
      if (!(isEmptyVal(myVal) && isEmptyVal(otherVal))) {
        if (isEmptyVal(myVal)) {
          addDiff(`<empty value> -> '${otherVal}'`)
        }
        else if (isEmptyVal(otherVal)) {
          addDiff(`'${myVal} -> '<empty value>`)
        }
        else if (Array.isArray(myVal) && Array.isArray(otherVal)) {
          if (myVal.length !== otherVal.length) {
            addDiff(`Arrays of different lengths; ${myVal.length} -> ${otherVal.length}`)
          }
          else if (propModel.model) {
            myVal.some((myModel, i) => {
              const elDiff = myModel.diff(otherVal[i], bailout)
              if (elDiff.isDiff) {
                addDiff(elDiff.diffs)
                return bailout
              }
              return false
            })
          }
          else {
            myVal.some((myEl, i) => {
              const otherEl = otherVal[i]
              if (myEl !== otherEl) {
                addDiff(`At least one difference at ${i}; ${myEl} -> ${otherEl}`)
                return true
              }
              else return false
            })
          }
        }
        else if (Array.isArray(myVal) || Array.isArray(otherVal)) {
          addDiff(`Type mismatch; my value is ${!Array.isArray(myVal) ? 'not an ' : ''} array, other value is ${!Array.isArray(otherVal) ? 'not an ' : ''} array.`)
        }
        else if (propModel.model) { // handles array and single cases
          const propDiff = myVal.diff(otherVal)
          if (propDiff.isDiff) {
            addDiff(propDiff.diffs)
          }
        }
        else if (myVal !== otherVal) { // both items are plain
          addDiff(`'${myVal}' -> '${otherVal}'`)
        }

        return bailout && diffs.length > 0
      } // otherwise both values are some kind of 'empty' and considered the same
      return false
    })

    if (diffs.length > 0) {
      return {
        diffs  : diffs,
        isDiff : true
      }
    }
    else {
      return { isDiff : false }
    }
  }

  static diffCheck(a, b) {
    // TODO: verify that we're called on null, undef, or a modeled item.
    if (nonCheck(a) && nonCheck(b)) return false
    else if (nonCheck(a) || nonCheck(b)) return true
    else if (Array.isArray(a) && Array.isArray(b)) return Model.isDiffAll(a, b)
    else if (!Array.isArray(a) && !Array.isArray(b)) return a.isDiff(b)
    else {
      throw new Error('Cannot diff-check fundamentally different types.')
    }
  }

  static isDiffAll(a, b) {
    if (!a && !b) {
      return false
    }
    else if (!a || !b) {
      return true
    }
    else if (a.length !== b.length) {
      return true
    }
    else {
      return a.some((valA, i) => valA.isDiff(b[i]))
    }
  }


  /* When constructing a Model object, an 'undefined' value will mark the object
   * as incomplete. This is used by the ResourceManager to check whether then
   * object on file is a summary object (such as may be retrieved in a list) or
   * a (complete) detail object.
   */
  isComplete() {
    return this._missing.length === 0
  }

  getMissing() {
    return this._missing
  }
}

const deepFreeze = (obj) => {
  if (obj !== null && typeof obj === 'object') {
    Object.getOwnPropertyNames(obj).forEach((propName) => {
      const val = obj[propName]
      if (Array.isArray(val)) {
        val.forEach((i) => deepFreeze(i))
      }
      deepFreeze(val)
    })
    Object.freeze(obj)
  }
}

export { Model, arrayType, deepFreeze, isEmpty, simpleType }
