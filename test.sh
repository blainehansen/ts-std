set -e

# npx lerna bootstrap --ignore-prepublish

npx lerna exec --scope @ts-std/types -- npm test
npx lerna exec --scope @ts-std/types -- npm run build
npx lerna link

npx lerna exec --scope @ts-std/monads -- npm test
npx lerna exec --scope @ts-std/monads -- npm run build
npx lerna link

npx lerna exec --scope @ts-std/extensions -- npm test
npx lerna exec --scope @ts-std/extensions -- npm run build
npx lerna link

npx lerna exec --scope @ts-std/collections -- npm test
npx lerna exec --scope @ts-std/collections -- npm run build
npx lerna link

npx lerna exec --scope @ts-std/codec -- npm test
npx lerna exec --scope @ts-std/codec -- npm run build
npx lerna link

# npx lerna exec --scope @ts-std/enum -- npm test
# npx lerna exec --scope @ts-std/enum -- npm run build
# npx lerna link

# npx lerna exec --scope @ts-std/machine -- npm test
# npx lerna exec --scope @ts-std/machine -- npm run build
# npx lerna link
