#!/bin/bash
set -e

DITHER=0          # 1 — включить дизеринг против бандинга
DESKTOP_W=1920
DESKTOP_FPS=25
DESKTOP_CRF=20
MOBILE_W=960
MOBILE_FPS=20
MOBILE_CRF=23

mkdir -p out

if [ "$DITHER" = "1" ]; then
  DFILTER=",format=yuv444p16le,noise=alls=4:allf=t+u,format=yuv420p"
  TUNE=""
else
  DFILTER=""
  TUNE="-tune stillimage"
fi

for n in 1 2; do
  echo "→ ${n}-scrub.mp4"
  ffmpeg -y -loglevel warning -stats -i ${n}.mp4 \
    -c:v libx264 -preset veryslow -crf $DESKTOP_CRF \
    -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 -refs 1 $TUNE \
    -vf "fps=${DESKTOP_FPS},scale=${DESKTOP_W}:-2:flags=lanczos${DFILTER}" \
    -pix_fmt yuv420p \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -an -movflags +faststart \
    out/${n}-scrub.mp4

  echo "→ ${n}-scrub-mobile.mp4"
  ffmpeg -y -loglevel warning -stats -i ${n}.mp4 \
    -c:v libx264 -preset veryslow -crf $MOBILE_CRF \
    -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 -refs 1 \
    -profile:v main -level 4.0 \
    -vf "fps=${MOBILE_FPS},scale=${MOBILE_W}:-2:flags=lanczos${DFILTER}" \
    -pix_fmt yuv420p \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -an -movflags +faststart \
    out/${n}-scrub-mobile.mp4

  echo "→ ${n}-poster.jpg"
  ffmpeg -y -loglevel error -i ${n}.mp4 -vframes 1 \
    -vf "scale=${DESKTOP_W}:-2" -q:v 3 out/${n}-poster.jpg
done

echo
echo "Готово:"
ls -lh out/
echo
echo "Проверка ключевых кадров:"
for f in out/*-scrub*.mp4; do
  echo -n "  $(basename $f): "
  ffprobe -v error -select_streams v:0 -show_entries frame=key_frame \
    -of csv=p=0 "$f" | sort | uniq -c | tr '\n' ' '
  echo
done