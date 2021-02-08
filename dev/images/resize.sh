#!/bin/bash

INK=/usr/bin/inkscape

if [[ -z "$1" ]] 
then
	echo "SVG file needed."
	exit;
fi

BASE=`basename "$1" .svg`
SVG="$1"

# Webpage icons
$INK -z -D -e "$BASE-152.png" -f 	$SVG -w 152 -h 152
$INK -z -D -e "$BASE-180.png" -f 	$SVG -w 180 -h 180
$INK -z -D -e "$BASE-167.png" -f 	$SVG -w 167 -h 167
$INK -z -D -e "$BASE-512.png" -f 	$SVG -w 512 -h 512
