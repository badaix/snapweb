#!/bin/bash

# https://superuser.com/questions/491180/how-do-i-embed-multiple-sizes-in-an-ico-file

for size in 16 24 32 64; do
    inkscape -z -o $size.png -w $size -h $size Snapcast.svg >/dev/null 2>/dev/null
done
convert 16.png 24.png 32.png 64.png -colors 256 favicon.ico
