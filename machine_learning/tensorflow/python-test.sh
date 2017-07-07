#!/bin/bash
PYTHON_PATH=$(python -c "import site; print(site.getsitepackages()[0])")
CLASSIFY_IMAGE_PATH=$PYTHON_PATH"/tensorflow/models/image/imagenet/classify_image.py"
################################################
# 88931400 bytes (89 MB) needed for tensorflow #
################################################
MY_PATH=$(cd $(dirname $0) && pwd)
IMAGES_PATH=$MY_PATH"/images/"
wget -P $IMAGES_PATH http://haileyidaho.com/wp-content/uploads/2015/01/Stanley-lake-camping-Credit-Carol-Waller-2011.jpg
TEST_IMAGE="Stanley-lake-camping-Credit-Carol-Waller-2011.jpg"
python $CLASSIFY_IMAGE_PATH --image_file=$IMAGES_PATH$TEST_IMAGE
