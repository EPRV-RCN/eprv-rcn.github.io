# eprv-rcn.github.io
Website for the Extreme Precision RV Research Coordination Network

## Figures and Animations

To create a new figure/animation:

1. Add an image file (png, jpg, gif, webP, AVIF, SVG) or a *small* video file (.mp4) to the figures directory. Video files should be less than 5 MB.
(Small .mp4 files will be played without sound and run in a loop, so it is a good choice for small animations, demos, etc. Videos larger than 5 MB, should be uploaded to Youtube for hosting. The youtube video will then be embedded on the page).

2. Upload a .toml config file to the metadata directory.


#### Example toml file

```
title = "My Title"
author = "Jane Smith"
description = """
A long description can be broken up into multiple lines and paragraphs by quoting with triple quotes.
This is a new line. New lines and paragraphs will be preserved.

This is a new paragraph.
"""

# Optional tags can be included for keyword searches. It is not necessary to include words that are already present in the title or description. 
tags = ["tag1", "tag2", "tag3"]

# One of the following should be included:
image_file = "my_image.jpg"

video_file = "sample.mp4"

video_url = "https://www.youtube.com/embed/B0ADKQmh-1Y"
```

