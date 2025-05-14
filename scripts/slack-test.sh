#!/bin/bash
source ../.env
curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, een-login!"}' ${SLACK_WEBHOOK_URL}
echo

