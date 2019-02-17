const defaultErrorHandler = (message) => alert(message)

const settings = {
  baseUrl: null,
  resources: [],
  errorHandler: defaultErrorHandler
}

export const setBaseUrl = (baseUrl) => settings.baseUrl = baseUrl
export const getBaseUrl = () => settings.baseUrl

export const setResources = (resources) => settings.resources = resources
export const getResources = () => settings.resources

export const setErrorHandler = (errorHandler) =>
  settings.errorHandler = errorHandler
export const invokeErrorHandler = (msg) => settings.errorHandler(msg)
