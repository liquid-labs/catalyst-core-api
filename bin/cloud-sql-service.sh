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

case "$ACTION" in
  name)
    echo "cloud-sql-service";;
  status)
    echo "TODO";;
  start)
    echo "TODO";;
  stop)
    echo "TODO";;
  restart)
    echo "TODO";;
  *)
    # TODO: library-ize and use 'echoerrandexit'
    echo "Unknown action '${ACTION}'." >&2
    exit 1;;
esac
