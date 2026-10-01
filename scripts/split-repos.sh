#!/usr/bin/env bash
# Pushes each package in this monorepo to its own GitHub repository, keeping that folder's history.
#
#   scripts/split-repos.sh            push every package
#   scripts/split-repos.sh sdk        push just one
#
# Each package folder is self-contained (its own tsconfig, workflows, README and LICENSE), so the split
# repositories build and test on their own once @getjolt/protocol and @getjolt/sdk are on npm.

set -euo pipefail

declare -A REPOS=(
  [protocol]="packages/protocol git@github.com:GetJolt/protocol.git"
  [sdk]="packages/sdk git@github.com:GetJolt/sdk.git"
  [server]="packages/server git@github.com:GetJolt/server.git"
)

cd "$(git rev-parse --show-toplevel)"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Commit or stash your changes first; only committed history is split." >&2
  exit 1
fi

names=("$@")
[[ ${#names[@]} -eq 0 ]] && names=(protocol sdk server)

for name in "${names[@]}"; do
  read -r prefix remote <<<"${REPOS[$name]:?Unknown package: $name}"
  branch="split/$name"
  echo "Splitting $prefix into $branch"
  git subtree split --prefix="$prefix" --branch="$branch" >/dev/null
  echo "Pushing $branch to $remote"
  git push "$remote" "$branch:main"
done
