#!/bin/sh
# Rebuilds the Lambda layer at ./layer/nodejs/node_modules.
# tweeter-shared is copied in (not symlinked) so SAM can upload it.
# Can be run from any directory. Re-run whenever tweeter-shared changes.
set -e

# Always operate from tweeter-server/, regardless of where this was invoked.
cd "$(dirname "$0")/.."

SHARED=../tweeter-shared

(cd "$SHARED" && npm run compile)

rm -rf layer
mkdir -p layer/nodejs
cd layer/nodejs

npm init -y > /dev/null
npm install --omit=dev date-fns@^3.3.1 uuid@^9.0.1

mkdir -p node_modules/tweeter-shared
cp "../../$SHARED/package.json" node_modules/tweeter-shared/
cp -R "../../$SHARED/dist" node_modules/tweeter-shared/
