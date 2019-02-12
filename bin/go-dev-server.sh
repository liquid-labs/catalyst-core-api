#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

isRunning() {
  test -f "${PID_FILE}" && pgrep -qF "${PID_FILE}"
}

function packToAbsPath() {
  local PACK_PATH="${1}"

  local PACK=$(echo "${PACK_PATH}" | cut -d: -f1)
  local REL_PATH=$(echo "${PACK_PATH}" | cut -d: -f2)
  local ABS_PATH
  if [[ "$PACKAGE_NAME" == "$PACK" ]]; then
    ABS_PATH="${BASE_DIR}/${REL_PATH}"
  else
    ABS_PATH="$(cd "${BASE_DIR}" && npm root)/${PACK}/${REL_PATH}"
  fi
  if [[ ! -f "${ABS_PATH}" ]]; then
    echo "Did not find expected file '${!REQ_PARAM}' ($ABS_PATH)." >&2
    exit 4
  fi

  echo "${ABS_PATH}"
}

start() {
  local CORE_APP_PATH="${1:-}"
  local CMD="dev_appserver.py --env_var NODE_ENV='development' "

  local MY_ROOT="${BASH_SOURCE[0]}"
  if [[ -L "$MY_ROOT" ]]; then
    cd $(dirname "${MY_ROOT}")
    MY_ROOT=$(readlink "${MY_ROOT}")
  fi
  cd $(dirname "${MY_ROOT}")
  MY_ROOT=$(dirname "$PWD")
  CORE_APP_PATH="${MY_ROOT}/go/app.yaml"

  local APPS="${CORE_APP_PATH}"
  for REQ_PARAM in $REQ_PARAMS; do
    CMD="${CMD} --env_var $REQ_PARAM='${!REQ_PARAM}'"
    if [[ "${REQ_PARAM}" == "ADD_GO_APP_"* ]]; then
      APPS="${APPS} $(packToAbsPath "${!REQ_PARAM}")"
    fi
    if [[ "${REQ_PARAM}" == "GO_APP_DISPATCH" ]]; then
      CMD="${CMD} $(packToAbsPath "${!REQ_PARAM}")"
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
