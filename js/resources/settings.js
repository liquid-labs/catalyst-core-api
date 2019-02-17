const defaultErrorHandler = (message) => alert(message)

export const settings = {
  baseUrl: null,
  resources: [],
  errorHandler: defaultErrorHandler
}

export const setBaseUrl = (baseUrl) => settings.baseUrl = baseUrl

export const setResources = (resources) => settings.resources = resources

export const setErrorHandser = (errorHandler) =>
  settings.errorHandler = errorHandler
