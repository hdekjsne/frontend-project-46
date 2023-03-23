gendiff:
	node bin/gendiff.js

lint:
	npx eslint bin/gendiff.js src/*

test:
	npx jest

test-coverage:
	npx jest --coverage