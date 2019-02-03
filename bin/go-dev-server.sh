#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

isRunning() {
  test -f "${PID_FILE}" && pgrep -qF "${PID_FILE}"
}

start() {
  local CORE_APP_PATH="${1:-}"
  local CMD="dev_appserver.py "

  if [[ -z "$CORE_APP_PATH" ]]; then
    local MY_ROOT="${BASH_SOURCE[0]}"
    if [[ -L "$MY_ROOT" ]]; then
      cd $(dirname "${MY_ROOT}")
      MY_ROOT=$(readlink "${MY_ROOT}")
    fi
    cd $(dirname "${MY_ROOT}")
    MY_ROOT=$(dirname "$PWD")
    CORE_APP_PATH="${MY_ROOT}/go/app.yaml"
  fi

  local APPS="${CORE_APP_PATH}"
  for REQ_PARAM in $REQ_PARAMS; do
    CMD="${CMD} --env_var $REQ_PARAM='${!REQ_PARAM}'"
    if [[ "${REQ_PARAM}" == "ADD_GO_APP_"* ]]; then
      local APP_PACK=$(echo "${!REQ_PARAM}" | cut -d: -f1)
      local APP_PATH=$(echo "${!REQ_PARAM}" | cut -d: -f2)
      local APP_ABS_PATH
      if [[ "$PACKAGE_NAME" == "$APP_PACK" ]]; then
        APP_ABS_PATH="${BASE_DIR}/${APP_PATH}"
      else
        APP_ABS_PATH="${MY_ROOT}/node_modules/${APP_PACK}/${APP_PATH}"
      fi
      if [[ ! -f "$APP_ABS_PATH" ]]; then
        echo "Did not find expected app file '${!REQ_PARAM}' ($APP_ABS_PATH)." >&2
        exit 4
      fi
      APPS="${APPS} ${APP_ABS_PATH}"
    fi
  done

  # Boo! dev_appserver uses stderr for logs.
  CMD="${CMD} ${APPS} "$@" > '${SERV_LOG}' 2>&1 & echo \$! > '${PID_FILE}'"
  eval "$CMD"
}

stop() {
  bash -c "( kill `cat ${PID_FILE}` && rm ${PID_FILE} ) \
    || echo 'There may have been a problem shutting down the go dev server. Check manually.'"
}

ACTION="${1-}"; shift

case "$ACTION" in
  name)
    echo "go-dev-server";;
  myorder)
    echo 0;;
  status)
    if isRunning; then
      echo "running"
    else
      echo "stopped"
    fi;;
  start)
    start "$@";;
  stop)
    stop;;
  restart)
    stop
    start;;
  param-default)
    echo '';;
  *)
    # TODO: library-ize and use 'echoerrandexit'
    echo "Unknown action '${ACTION}'." >&2
    exit 1;;
esac
