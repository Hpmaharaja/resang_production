#!/bin/bash
#####################################
# NEED ABOUT 500 MB FOR THIS SCRIPT #
#####################################
sudo apt-get install -y python-dev python-setuptools curl libimage-exiftool-perl python-scipy
curl -O https://bootstrap.pypa.io/get-pip.py
sudo python get-pip.py 'pip==8.1.0'
sudo pip install virtualenv numpy six protobuf werkzeug pyexifinfo geopy scikit-learn scipy pymongo
sudo pip install tensorflow==0.12.1
PYTHON_PATH=$(python -c "import site; print(site.getsitepackages()[0])")
CLASSIFY_IMAGE_PATH=$PYTHON_PATH"/tensorflow/models/image/imagenet/classify_image.py"
python $CLASSIFY_IMAGE_PATH
