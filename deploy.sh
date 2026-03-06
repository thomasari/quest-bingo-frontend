#!/bin/bash
set -e

USER="xngjettltaf0ano"
SERVER="linweb22.hmg9.webhuset.no"
DEST="./www"

FORCE=0
if [[ "$1" == "--force" ]]; then
  FORCE=1
fi

echo "Building frontend..."
npm run build -- --mode production

echo "Deploying with rsync..."

if [[ $FORCE -eq 1 ]]; then
  # Force re-upload everything
  rsync -rvz --delete \
  --exclude 'statistikk/' \
  ./dist/ "$USER@$SERVER:$DEST/"
else
  # Upload only changed files
  rsync -rvz --checksum --delete \
  --exclude 'statistikk/' \
  ./dist/ "$USER@$SERVER:$DEST/"
fi

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