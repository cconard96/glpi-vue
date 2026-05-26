#!/bin/bash

# Setup git hooks
if [ -d ".git" ]; then
  echo "Setting up git hooks..."
  # check if a pre-commit hook already exists and it doesn't contain the special "GLPI Vue" comment
  if [ -f ".git/hooks/pre-commit" ] && ! grep -q "GLPI Vue" ".git/hooks/pre-commit"; then
    # create a pre-commit.d directory if it doesn't exist
    mkdir -p .git/hooks/pre-commit.d
    # move the existing pre-commit hook to the pre-commit.d directory
    mv .git/hooks/pre-commit .git/hooks/pre-commit.d/$(date +%s)-pre-commit
    echo "Existing pre-commit hook moved to .git/hooks/pre-commit.d/$(date +%s)-pre-commit"
  fi
  cp .hooks/pre-commit .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
else
  echo "No .git directory found. Skipping git hook setup."
fi