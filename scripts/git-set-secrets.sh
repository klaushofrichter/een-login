#!/bin/bash
set -e

REPONAME=$( cat ../package.json|grep '"name":' | cut -d '"' -f4 )
REPOOWNER=$( git remote get-url origin | sed -E 's/.*github.com[:/]([^/]+)\/.*/\1/' )
echo "setting secrets from .env to repository ${REPOOWNER}/${REPONAME}"
[ ! -f ../.env ] && echo "$0: ../.env does not exist" && exit 1

DELAY=10
echo -n "$0: starting in ${DELAY} seconds"
while [ ${DELAY} -gt 0 ];
do
  echo -n "."
  DELAY=$(( ${DELAY} - 1 ))
  sleep 1
done
echo
gh secret set --env-file ../.env --repo ${REPOOWNER}/${REPONAME}
