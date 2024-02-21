all: build

build:
	npm run build

clean:
	rm -rf build

install:
	cd build && find . -type f -exec install -Dm 644 "{}" "$(DESTDIR)/usr/share/snapweb/{}" \;
