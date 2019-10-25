npx lerna exec --scope @ts-std/types -- npm version patch
git commit -am "types version patch"

npx lerna exec --scope @ts-std/monads -- npm version patch
git commit -am "monads version patch"

npx lerna exec --scope @ts-std/extensions -- npm version patch
git commit -am "extensions version patch"

npx lerna exec --scope @ts-std/collections -- npm version patch
git commit -am "collections version patch"

# npx lerna exec --scope @ts-std/codec -- npm version patch
# git commit -am "codec version patch"

# npx lerna exec --scope @ts-std/enum -- npm version patch
# git commit -am "enum version patch"

# npx lerna exec --scope @ts-std/machine -- npm version patch
# git commit -am "machine version patch"

