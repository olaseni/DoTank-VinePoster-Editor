default:
    @echo  "Usage: just <target>"
    @just --list

clean-build:
    unlink src/style-blocks-combined.scss &> /dev/null
    npm cache clean --force &> /dev/null
    rm -rf build

clean: clean-build
    rm -rf node_modules package-lock.json
    rm -fr ~/.wp-now

install: clean
    npm install

build: combine-block-css
    npm run build

build-dev: combine-block-css
    npm run start

start: stop
    npx @wp-now/wp-now start --skip-browser --port 8881 --blueprint=./blueprint.json

build-start: build start
clean-start: install build-start

start-and-watch:
    @# Attempt to stop existing services
    just stop || true
    @# build
    just build
    @# Make a log dir if none exists
    mkdir -p ./logs
    @# Start the processes in the background
    { just start > ./logs/start.log 2>&1 & ; }
    { just build-dev > ./logs/build-dev.log 2>&1 & ; }
    @echo "Services started. View logs with 'just logs'. Use 'just stop' to terminate."

logs:
    #!/usr/bin/env bash
    set -euo pipefail
    test -d logs || { echo "No logs directory found"; exit 1; }
    if ! find logs -maxdepth 1 -type f | grep -q .; then
        { echo "No logs found"; exit 1; }
    fi    
    echo "Viewing logs (Ctrl+C to exit)"
    if command -v multitail > /dev/null; then
        multitail -c -ts logs/*
    else
        tail -f logs/*
    fi

clear-logs:
    @rm -f ./logs/* > /dev/null 2>&1

stop:
    @pkill -f "@wp-now/wp-now" || true

blueprint-local:
    open index.php

blueprint-remote:
    open https://333608b5aa.nxcli.io/vine-poster-editor/

git-push:
    git push

# Combine Gutenberg block styles
combine-block-css:
    php -r 'require "includes/Utilities.php"; Utilities::combineBlockStyles("src-wordpress/wp-includes/blocks", "src/style-blocks-combined.scss");'
