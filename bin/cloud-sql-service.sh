#!/usr/bin/env bash

# bash strict settings
set -o errexit # exit on errors
set -o nounset # exit on use of uninitialized variable
set -o pipefail

red=`tput setaf 1`
green=`tput setaf 2`
yellow=`tput setaf 3`
reset=`tput sgr0`

isRunning() {
  local STATE=`gcloud sql instances list --filter="NAME:${CAT_SCRIPT_CORE_API_CLOUDSQL_INSTANCE_NAME}" --format='get(state)' --quiet --project="${CAT_SCRIPT_CORE_API_GCP_PROJECT_ID}"`
  if [[ ${STATE} == 'RUNNABLE' ]]; then
    return 0
  else
    return 1
  fi
}

ACTION="${1-}"

case "$ACTION" in
  name)
    echo "cloud-sql-service";;
  status)
    if isRunning; then
      echo "${green}running${reset}"
    else
      echo "${yellow}not running${reset}"
    fi;;
  start)
    if ! isRunning; then
      gcloud sql instances patch "${CAT_SCRIPT_CORE_API_CLOUDSQL_INSTANCE_NAME}" --activation-policy ALWAYS --project="${CAT_SCRIPT_CORE_API_GCP_PROJECT_ID}" --quiet
    else
      # use echoerr
      echo "${PROCESS_NAME} appears to already be running." >&2
    fi;;
  stop)
    if isRunning; then
      gcloud sql instances patch "${CAT_SCRIPT_CORE_API_CLOUDSQL_INSTANCE_NAME}" --activation-policy NEVER --project="${CAT_SCRIPT_CORE_API_GCP_PROJECT_ID}" --quiet
    else
      # use echoerr
      echo "${PROCESS_NAME} does not appear to be running." >&2
    fi;;
  restart)
    gcloud sql instances restart "${CAT_SCRIPT_CORE_API_CLOUDSQL_INSTANCE_NAME}" --project="${CAT_SCRIPT_CORE_API_GCP_PROJECT_ID}" --quiet;;
  *)
    # TODO: library-ize and use 'echoerrandexit'
    echo "Unknown action '${ACTION}'." >&2
    exit 1;;
esac
