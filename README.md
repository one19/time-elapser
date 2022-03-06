# TIME-ELAPSER

meant to be the most minimal project possible for creating and uploading images for timelapses

more work must be done to ensure the output looks good, and you must query for the image assets yourself from cloudinary.

### TBD:
there may be iso adjustment parameters that are necessary to make a good video with no flickering, and nighttime photos aren't too dark.

### useful commands:
`v4l2-ctl --list-devices`
`ffmpeg -i ./photos/%d.jpg -c:v libx264 -vf fps=60 -pix_fmt yuv420p out.mp4`
