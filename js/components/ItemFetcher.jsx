import React, { useEffect, useState } from 'react'
import * as routes from '../core/routes'
import * as resources from '../core/resources/resources'
import * as resourcesCache from '../core/resources/cache'

import { Await, awaitStatus } from '@liquid-labs/react-await'

const awaitChecks = [ ({item, errorMessage, url}) =>
  errorMessage
    ? {
        status: awaitStatus.BLOCKED,
        summary: `Encountered an error while retrieving the item: '${errorMessage}'`
      }
    : item
      ? { status: awaitStatus.RESOLVED }
      : {
          status: awaitStatus.WAITING,
          summary: `Waiting on response from '${url}'...`
        }
]

const resolveItem = async (resName, resId, itemUrl, setCheckProps) => {
  const { data, errorMessage } = await resources.fetchItem(resName, resId)
  setCheckProps({ item: data, errorMessage: errorMessage, url: itemUrl })
}

const ItemFetcher = ({itemUrl, itemKey, awaitProps, children, ...props}) => {
  itemKey = itemKey || 'item'
  const { resName, resId } = routes.extractItemIdentifiers(itemUrl)
  // We get the items directly from cache synchronously to avoid the inevitable
  const item = resourcesCache.getFreshCompleteItem(resId)
  const [ checkProps, setCheckProps ] = useState({item: item, errorMessage: null, url: itemUrl})

  useEffect(() => {
    if (!item) resolveItem(resName, resId, itemUrl, setCheckProps)
  }, [ itemUrl, itemKey ])

  const childProps = {
    ...props,
    [itemKey]: checkProps.item
  }

  return (
    <Await checks={ awaitChecks } checkProps={ checkProps } { ...awaitProps }>
      { () => typeof children === 'function' ? children(childProps) : children }
    </Await>
  )
}

export { ItemFetcher }
