#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

current_name="$(git config --local --get user.name || true)"
current_email="$(git config --local --get user.email || true)"

if [[ -n "$current_name" && -n "$current_email" ]]; then
  echo "Local git identity already configured: $current_name <$current_email>"
else
  fallback_name="${GIT_AUTHOR_NAME:-${USER:-developer}}"
  global_name="$(git config --global --get user.name || true)"
  name="${global_name:-$fallback_name}"

  host="$(hostname 2>/dev/null || true)"
  host="${host//\(none\)/}" 
  host="${host// /}"
  if [[ -z "$host" ]]; then
    host="localhost.localdomain"
  fi

  fallback_email="${GIT_AUTHOR_EMAIL:-${USER:-developer}@${host}}"
  global_email="$(git config --global --get user.email || true)"
  email="${global_email:-$fallback_email}"

  git config --local user.name "$name"
  git config --local user.email "$email"
  echo "Configured local git identity: $name <$email>"
fi

# Avoid merge-commit pulls that require a committer identity in fresh environments.
git config --local pull.rebase true

echo "Configured local pull strategy: rebase"
