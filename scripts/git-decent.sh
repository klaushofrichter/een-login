#/bin/bash
set -e

#
# customize the names below. A github repository will be created
APPNAME=your-app-name                 # one word, lower case, e.g. "een-login"
APPTITLE="Your App Title"              # used for the browser title, e.g. "EEN Login"
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
[ "${APPNAME}" == "your-app-name" ] && echo "$0: ERROR: need to customize the APPNAME, do not use '${APPNAME}'" && exit 1
[ -z "${APPNAME}" ] && echo "$0: ERROR: APPNAME can not be empty" && exit 1
[ "${APPTITLE}" == "Your App Name" ] && echo "$0: ERROR: need to customize the APPTITLE, do not use '${APPTITLE}'" && exit 1
[ -z "${APPTITLE}" ] && echo "$0: ERROR: APPTITLE can not be empty" && exit 1

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
sed -i '' "s/\"name\": \".*\"/\"name\": \"${APPNAME}\"/" ./package.json

#
# change the package base
sed -i '' "s/\"base\": \".*\"/\"name\": \"/${APPNAME}/\"/" ./package.json

#
# change the package version
sed -i '' "s/\"version\": \".*\"/\"version\": \"0.0.1\"/" ./package.json

#
# change the constants file
sed -i '' "s/EEN Login/\${APPTITLE}/g" ./src/constants.js

#
# change the 404 file
sed -i '' "s/een-login/${APPNAME}/" ./public/404.html

#
# change the README
echo "## ${APPTITLE}" > README.md
echo 'A modern VUE3 application for EEN based on [EEN Login](https://github.com/klaushofrichter/een-login)" >> README.md

#
# configure the repository 
# TODO
#   Rules (protect production)
#   Settings like mandatory tests
#
# run npm install
npm install
