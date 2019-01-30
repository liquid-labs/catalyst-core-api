#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

isRunning() {
  test -f "${PID_FILE}" && pgrep -qF "${PID_FILE}"
}

start() {
  local PORT_OPT=''
  local PORT_KEY="$( echo ${SERV_NAME} | tr '-' '_' | tr 'a-z' 'A-Z')_PORT"
  echo "PORT_KEY: $PORT_KEY"
  if [[ -n "${!PORT_KEY:-}" ]]; then
    PORT_OPT="--port=${!PORT_KEY}"
  fi

  # Boo! dev_appserver uses stderr for logs.
  cd ${BASE_DIR}/go && ( dev_appserver.py ${PORT_OPT} --env_var FIRBASE_DB_URL="${FIREBASE_DB_URL}" app.yaml & echo $! > "${PID_FILE}" ) > "${SERV_LOG}" 2>&1
}

stop() {
  bash -c "( kill `cat ${PID_FILE}` && rm ${PID_FILE} ) \
    || echo 'There may have been a problem shutting down the go dev server. Check manually.'"
}

ACTION="${1-}"

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
    start;;
  stop)
    stop;;
  restart)
    stop
    start;;
  *)
    # TODO: library-ize and use 'echoerrandexit'
    echo "Unknown action '${ACTION}'." >&2
    exit 1;;
esac
