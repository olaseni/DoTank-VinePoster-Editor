
default:
    @echo  "Usage: just <target>"
    @just --list

clean:
    npm cache clean --force &> /dev/null
    rm -rf node_modules package-lock.json

install: clean
    npm install

start:
    npx @wp-now/wp-now start --blueprint=./blueprint.json

test-remote-blueprint:
    open index.html

git-push:
    git push
    @# Needed because we are using a submodule in Github Pages enabled repo, and that repo needs to be updated
    ./update-parent-repo.sh
    