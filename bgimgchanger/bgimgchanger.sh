#!/bin/bash

# install cronjob #
#write out current crontab


if grep "bash $scriptpathfilename" /etc/crontab; then
    echo "crontab already installed"
else

    if [ "$EUID" -ne 0 ]
    then echo "Please run as root"
    exit
    fi
fi

echo "install crontab if not exists"

scriptpathfilename=$(pwd)/bgimgchanger.sh

grep "bash $scriptpathfilename" /etc/crontab || echo "0  *  *  *  * bash $scriptpathfilename" >> /etc/crontab


echo "downloading img from hubbleharvest.ch:8080"
imgname=$(date +%s).jpg
downloadedimgsfolder=downloadedimgs
wget --output-document=./$downloadedimgsfolder/$(date +%s).jpg hubbleharvest.ch:8080
echo "setting downloaded img as background"
gsettings set org.gnome.desktop.background picture-options 'scaled'
gsettings set org.gnome.desktop.background picture-uri "file:///$(pwd)/$downloadedimgsfolder/$imgname" 
