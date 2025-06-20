#/bin/bash
set -e

#
# this replaces src/services with the production version from een-login

#
# const
REPO="een-login"
OWNER="klaushofrichter"
BRANCH="production"
SOURCE="een-login"
DIR="src/services"

#
# check that SOURCE exists
[ ! -d ../${SOURCE} ] && echo "$0: Source ../${SOURCE} does not exist" && exit 1

# 
# check that we are not in SOURCE 
[[ "$(basename "$PWD")" == *${SOURCE}* ]] && echo "$0: we can not run in the ${SOURCE}" && exit 1

#
# get services
FILES=$( cd ../${SOURCE}/${DIR}; ls -p | grep -v '/$' | tr '\n' ' ')

echo "$0: getting common sources from ${BASE} for ${FILES}"

DELAY=1
printf "$0: starting in ${DELAY} seconds"
while [ ${DELAY} -gt 0 ];
do
  printf "."
  DELAY=$(( ${DELAY} - 1 ))
  sleep 1
done
echo
echo

#
# make a backup
TARFILE=$(mktemp services.XXXXXX)
echo "$0: backup at ${TARFILE}.tar"
tar cf /tmp/${TARFILE}.tar ./src/services

#
# process all files
for FILE in ${FILES}
do
  URL="https://raw.githubusercontent.com/${OWNER}/${REPO}/refs/heads/${BRANCH}/${DIR}/${FILE}"
  echo "$0: getting ${FILE}"
  curl ${URL} > src/services/${FILE}
done

#
# done
echo "$0: done. "
exit 0
