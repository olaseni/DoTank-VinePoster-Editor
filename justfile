
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
