from node:fermium-alpine

copy . .
run yarn install --frozen-lockfile
cmd yarn start