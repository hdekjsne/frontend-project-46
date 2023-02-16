gendiff:
	node bin/gendiff.js

lint:
	npx eslint bin/gendiff.js src/index.js src/additional.js __tests__/test-gendiff.js