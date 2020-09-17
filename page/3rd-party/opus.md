# Opus how-to

## Setup emsdk

```bash
git clone git clone https://github.com/emscripten-core/emsdk.git
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

## Build opus

```bash
emconfigure ./configure --disable-extra-programs --disable-doc --disable-intrinsics --disable-hardening --disable-rtcd --disable-stack-protector
emmake make
emcc -s INITIAL_MEMORY=10MB -s MAXIMUM_MEMORY=10MB -O2 --emit-symbol-map -s WASM=1 -o opus.js -s SINGLE_FILE=1 -s EXPORT_NAME="Opus" -s FILESYSTEM=0 -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','getValue','setValue']" -s EXPORTED_FUNCTIONS="['_malloc', '_free', '_opus_decoder_create','_opus_decode','_opus_decode_float','_opus_decoder_destroy','_opus_encoder_create','_opus_encoder_destroy','_opus_encode','_opus_encode_float','_opus_strerror']" -s ENVIRONMENT=node,web .libs/libopus.a
```

