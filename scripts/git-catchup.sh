#/bin/bash
echo "$0: Catching up with the een-login sources"
set -e

DELAY=5
printf "$0: starting in ${DELAY} seconds"
while [ ${DELAY} -gt 0 ];
do
  printf "."
  DELAY=$(( ${DELAY} - 1 ))
  sleep 1
done
echo

echo
echo "$0: CHECKOUT DEVELOP"
git checkout develop
echo
echo "$0: PULL DEVELOP"
git pull origin develop
echo
echo "$0: SHOW REMOTEs"
git remote -v
echo
echo "$0: FETCH ORIGINAL"
git fetch upstream-original
echo
echo "$0: MERGE"
git merge upstream-original/develop
echo
echo "$0: WE EXPECT AT LEAST A MERGE CONFLICT IN package.json"
