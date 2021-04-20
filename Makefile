.PHONY: all dist

all: dist

dist:
	yarn build --no-source-maps

clean:
	rm -rf dist

release: clean dist
