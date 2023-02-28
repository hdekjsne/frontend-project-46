gendiff:
	node bin/gendiff.js

lint:
	npx eslint bin/gendiff.js src/index.js src/utils.js

test:
	npx jest

test-coverage:
	npx jest --coverage