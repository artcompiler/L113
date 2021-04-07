default: run

build:
	npm run build

run: build
	npm start

test: build
	npm test
