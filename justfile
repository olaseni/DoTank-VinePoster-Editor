default:
    @echo  "Usage: just <target>"
    @just --list

clean:
    npm cache clean --force &> /dev/null
    rm -rf node_modules package-lock.json build
    rm -fr ~/.wp-now

install: clean
    npm install

build:
    npm run build

build-dev:
    npm run start

start:
    npx @wp-now/wp-now start --blueprint=./blueprint.json

clean-start: clean start

start-with-build:
    @# Attempt to stop existing services
    just stop || true
    @# Make a pid dir if none exists
    mkdir -p ./pid ./logs
    @# Start the processes in the background and save their PIDs
    { just start > ./logs/start.log 2>&1 & echo $$! > ./pid/start; }
    { just build-dev > ./logs/build-dev.log 2>&1 & echo $$! > ./pid/build-dev; }
    @echo "Services started. View logs with 'just logs'. Use 'just stop' to terminate."

logs:
    @if [ ! -d "./logs" ]; then exit 0; fi
    @echo "Viewing logs (Ctrl+C to exit)"
    @if command -v multitail > /dev/null; then \
        multitail -c -ts "./logs/start.log" -c -ts "./logs/build-dev.log"; \
    else \
        tail -f ./logs/start.log ./logs/build-dev.log; \
    fi

clear-logs:
    @rm -f ./logs/* > /dev/null 2>&1

stop:
    @if [ ! -d "./pid" ]; then exit 0; fi
    @find ./pid -type f -exec sh -c 'pid=$(cat "{}") && \
        if ps -p $$pid > /dev/null 2>&1; then \
                    kill $$pid > /dev/null 2>&1 || echo "Error: Failed to kill process $$pid"; \
        fi' \;
    @rm -f ./pid/* > /dev/null 2>&1

blueprint-local:
    open index.html

blueprint-remote:
    open https://olaseni.github.io/dotank-resources/DoTank-VinePoster-Editor/

git-push:
    git push
    @# Needed because we are using a submodule in Github Pages enabled repo, and that repo needs to be updated
    ./update-parent-repo.sh
