#!/usr/bin/env bash
set -x
source .env

SOURCE_DIR="$(dirname $0)"
TARGET_HOST=$DEPLOY_TARGET_HOST
TARGET_DIR=$DEPLOY_TARGET_DIR

rsync -avzW --exclude-from=$SOURCE_DIR/.rsyncignore "${SOURCE_DIR}/" root@$TARGET_HOST:$TARGET_DIR | grep -v '/$'
ssh root@$TARGET_HOST "chown root:root ${TARGET_DIR} -R";

if [ "$1" == "restart" ]
then
  echo "restarting";
  ssh root@$TARGET_HOST "cd ${TARGET_DIR}; docker compose restart";
elif [ "$1" == "rebuild" ]
then
  echo "rebuilding"
  ssh root@$TARGET_HOST "cd ${TARGET_DIR}; docker compose build; docker compose down; docker compose up -d"
else
  echo "No post-upload command specified"
fi

curl --request POST \
  --url "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE}/purge_cache" \
  --header "Content-Type: application/json" \
  --header "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -d '{"purge_everything": true}'