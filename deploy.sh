#!/bin/bash
set -e

USER="xngjettltaf0ano"
SERVER="linweb22.hmg9.webhuset.no"
DEST="./www"

echo "Building frontend..."
npm run build

echo "Transferring build to server..."
scp -r ./dist/* "$USER@$SERVER:$DEST/"

echo "Fixing permissions..."
ssh "$USER@$SERVER" "
  find $DEST \
    -path $DEST/statistikk -prune -o \
    -type d -exec chmod 755 {} \; &&
  find $DEST \
    -path $DEST/statistikk -prune -o \
    -type f -exec chmod 644 {} \;
"
echo "Frontend deployed successfully."