# eprv-rcn.github.io
Website for the Extreme Precision RV Research Coordination Network

## Figures and Animations

To create a new figure/animation:

1. Add an image file (png, jpg, gif, webP, AVIF, SVG) or a *small* video file (.mp4) to the figure-uploads directory. Video files should be less than 5 MB.
(Small .mp4 files will be played without sound and run in a loop, so it is a good choice for small animations, demos, etc. Videos larger than 5 MB, should be uploaded to Youtube for hosting. The youtube video will then be embedded on the page).

2. Upload a .toml config file to the metadata directory.


### Example toml file

```
title = "My Title"
author = "Jane Smith"
tags = ["tag1", "tag2", "tag3"]
description = "This is a description."

# One of the following should be included depending on whether the associated file is an image, mp4, or a youtube video.

image_file = "my_image.jpg"

# or

video_file = "sample.mp4"

# or

video_url = "https://www.youtube.com/embed/B0ADKQmh-1Y"
```


