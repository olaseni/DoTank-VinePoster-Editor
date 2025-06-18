
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

blueprint-local:
    open index.html

blueprint-remote:
    open https://olaseni.github.io/dotank-resources/DoTank-VinePoster-Editor/

git-push:
    git push
    @# Needed because we are using a submodule in Github Pages enabled repo, and that repo needs to be updated
    ./update-parent-repo.sh
 