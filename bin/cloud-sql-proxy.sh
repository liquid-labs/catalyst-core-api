#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

red=`tput setaf 1`
green=`tput setaf 2`
yellow=`tput setaf 3`
reset=`tput sgr0`

ACTION="${1-}"

# 'cloud_sql_proxy' is essentially a wrapper that spawns a second process; but killing the parent does not kill the child, so we have to fallback to process grepping
isRunning() {
  set +e # grep exits with error if no match
  local PROC_COUNT=$(ps aux | grep cloud_sql_proxy | grep -v grep | wc -l)
  set -e
  # if [[ -f "$PID_FILE" ]] && kill -0 $(cat $PID_FILE) > /dev/null 2> /dev/null; then
  if (( $PROC_COUNT == 0 )); then
    return 1
  else
    return 0
  fi
}

startProxy() {
  # We were using the following to capture the pid, but see note on 'isRunning'
  # bash -c "cd '${BASE_DIR}'; ( npx --no-install cloud_sql_proxy -instances='${CAT_SCRIPT_CORE_API_CLOUDSQL_CONNECTION_NAME}'=tcp:3306 -credential_file='${CAT_SCRIPT_CORE_API_CLOUDSQL_CREDS}' & echo \$! >&3 ) 3> '${PID_FILE}' 2> '${SERV_LOG}' &"
  # Annoyingly, cloud_sql_proxy (at time of note) emits all logs to stderr.
  bash -c "cd '${BASE_DIR}'; npx --no-install cloud_sql_proxy -instances='${CAT_SCRIPT_CORE_API_CLOUDSQL_CONNECTION_NAME}'=tcp:3306 -credential_file='${CAT_SCRIPT_CORE_API_CLOUDSQL_CREDS}' 2> '${SERV_LOG}' &"
}

stopProxy() {
  # See note in 'start'
  # kill $(cat "${PID_FILE}") && rm "${PID_FILE}"
  kill $(ps aux | grep cloud_sql_proxy | grep -v grep | awk '{print $2}')
}

case "$ACTION" in
  name)
    echo "cloud-sql-proxy";;
    myorder)
      echo 1;;
  status)
    if isRunning; then
      echo "${green}running${reset}"
    else
      echo "${yellow}not running${reset}"
    fi;;
  start)
    if ! isRunning; then
      startProxy
    else
      echo "${PROCESS_NAME} appears to already be running." >&2
    fi;;
  stop)
    if isRunning; then
      stopProxy
    else
      # TODO: use echoerr
      echo "${PROCESS_NAME} does not appear to be running." >&2
    fi;;
  restart)
    stopProxy
    sleep 1
    startProxy;;
  *)
    # TODO: library-ize and use 'echoerrandexit'
    echo "Unknown action '${ACTION}'." >&2
    exit 1;;
esac
