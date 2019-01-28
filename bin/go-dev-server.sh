#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

isRunning() {
  test -f "${PID_FILE}" && pgrep -qF "${PID_FILE}"
}

start() {
  GOPATH=${CAT_SCRIPT_CORE_API_GOPATH} bash -c "cd ${CAT_SCRIPT_CORE_API_GOPATH}/src/${CAT_SCRIPT_CORE_API_REL_GOAPP_PATH}; ( dev_appserver.py --enable_watching_go_path=true app.yaml & echo \$! >&3 ) 3> '${PID_FILE}' > '${SERV_LOG}' 2> '${ERR_LOG}' &";;
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
