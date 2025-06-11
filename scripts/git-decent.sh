#/bin/bash
set -e

#
# customize the names below. A github repository will be created
APPNAME=YOUR_APP_NAME
USERNAME=klaushofrichter

#
# welcome
echo "$0: This script creates a version of een-login for other as app ${USERNAME}/${APPNAME}"

#
# check for github cli
# Check if 'gh' command is installed
if command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) is installed."
    gh --version
else
    echo "GitHub CLI (gh) is NOT installed."
    echo "You can install it using Homebrew: brew install gh"
    exit 1
fi

#
# check node version (20.19 or better)
# TODO

#
# check that customization happened
[ "${APPNAME}" == "YOUR_APP_NAME" ] && echo "$0: ERROR: need to customize the APPNAME, do not use ${APPNAME}" && exit 1
[ -z "${APPNAME}" ] && echo "$0: ERROR: APPNAME can not be empty" && exit 1

#
# wait a little while
DELAY=5
printf "$0: starting in ${DELAY} seconds"
while [ ${DELAY} -gt 0 ];
do
  printf "."
  DELAY=$(( ${DELAY} - 1 ))
  sleep 1
done
echo

#
# create the new repository
gh repo create ${APPNAME} --public --description "A decendent of een-login called ${APPNAME}" 

#
# make a bare clone of the original
git clone --bare https://github.com/klaushofrichter/een-login.git een-login-original.git

#
# mirror the bare into the new app repository
cd een-login-original.git
git push --mirror https://github.com/${USERNAME}/${APPNAME}.git
cd ..
rm -rf een-login-original.git

#
# clone the new app repo
git clone git@github.com:${USERNAME}/${APPNAME}.git

#
# add the original origin
cd ${APPNAME}
git remote add upstream-original https://github.com/klaushofrichter/een-login.git

#
# check that it worked. TODO: check the actual content, not just the number of lines
REMOTES=$( git remote -v )
echo "${REMOTES}"
LINES=$( echo "${REMOTES}" | wc -l )
[ ${LINES} -ne 4 ] && printf "$0: not enough remotes..." && exit 1

#
# change the package name
# TODO

#
# change the package version
# TODO

#
# change the constants
# TODO

#
# change the README
# TODO

#
# run npm install
npm install
