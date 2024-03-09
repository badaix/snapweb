all: build

build:
	npm run build

clean:
	rm -rf dist

install:
	cd dist && find . -type f -exec install -Dm 644 "{}" "$(DESTDIR)/usr/share/snapweb/{}" \;
