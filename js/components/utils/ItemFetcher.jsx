import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import * as routes from '../../core/routes'
import * as resources from '../../core/resources/resources'
import * as resourcesCache from '../../core/resources/cache'

import { Waiter, waiterStatus } from '@liquid-labs/react-waiter'

import upperFirst from 'lodash.upperfirst'

const waiterChecks = [ ({item, errorMessage, url}) =>
  errorMessage
    ? {
      status       : waiterStatus.BLOCKED,
      summary      : `Error encountered retrieving '${url}': '${errorMessage}'`,
      errorMessage : errorMessage
    }
    : item
      ? { status : waiterStatus.RESOLVED }
      : {
        status  : waiterStatus.WAITING,
        summary : `Waiting on response from '${url}'...`
      }
]

const resolveItem = async(resName, resId, itemUrl, setCheckProps) => {
  const { data, errorMessage } = await resources.fetchItem(resName, resId)
  setCheckProps({ item : data, errorMessage : errorMessage, url : itemUrl })
}

const ItemFetcher = ({itemUrl, itemKey='item', children, ...props}) => {
  const waiterName = `${upperFirst(itemKey)} fetch`
  const { resName, resId } = routes.extractItemIdentifiers(itemUrl)
  // We check the cache synchronously to avoid blinking.
  const initialCheckProps = {item : null, errorMessage : null, url : itemUrl}
  const { permanentError } = resourcesCache.getFreshSourceData(itemUrl)
  if (permanentError) initialCheckProps.errorMessage = permanentError.message
  else initialCheckProps.item = resourcesCache.getFreshCompleteItem(resId)

  const [ checkProps, setCheckProps ] = useState(initialCheckProps)

  useEffect(() => {
    if (!checkProps.item) resolveItem(resName, resId, itemUrl, setCheckProps)
  }, [ itemUrl, itemKey ])

  // this isn't always used, but no need to memo-ize
  const childProps = {
    [itemKey] : checkProps.item
  }

  return (
    <Waiter checks={waiterChecks} checkProps={checkProps} name={waiterName} {...props}>
      { () => typeof children === 'function' ? children(childProps) : children }
    </Waiter>
  )
}

if (process.env.NODE_ENV !== 'production') {
  ItemFetcher.propTypes = {
    itemUrl     : PropTypes.string.isRequired,
    itemKey     : PropTypes.string,
    waiterProps : PropTypes.object,
    children    : PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  }
}

export { ItemFetcher }
