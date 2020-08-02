.PHONY: all tsc dist

all: tsc dist

tsc:
	tsc --build page/tsconfig.json

dist:
	rm -rf dist
	mkdir dist
	mkdir dist/3rd-party
	cp -r page/3rd-party/libflac.js dist/3rd-party/
	cp page/favicon.ico dist
	cp page/index.html dist
	cp page/launcher-icon.png dist
	cp page/manifest.json dist
	cp page/mute_icon.png dist
	cp page/play.png dist
	cp page/snapcontrol.js dist
	cp page/snapstream.js dist
	cp page/speaker_icon.png dist
	cp page/stop.png dist
	cp page/styles.css dist
