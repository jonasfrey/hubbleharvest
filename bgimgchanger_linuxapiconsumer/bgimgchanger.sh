#!/bin/bash

# install cronjob #
#write out current crontab
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"


#echo "script executed" >> $SCRIPT_DIR/$(date +%s)_log_.txt

scriptpathfilename=$SCRIPT_DIR/bgimgchanger.sh
nonrootuser=$SUDO_USER
cronline="0  *  *  *  * $nonrootuser $scriptpathfilename"
# echo "$cronline"
# exit
cronpathfilename=/etc/cron.d/bgimgchanger
if grep $cronline $cronpathfilename; then
    echo "crontab already installed"
else

    # if [ "$EUID" -ne 0 ]
    # then echo "Please run as root"
    # exit
    # fi
 
    echo "install crontab if not exists"

    echo "$cronline" >> $cronpathfilename
    
    echo "installed cronjob"
fi



echo "downloading img from hubbleharvest.ch:8080"
imgfilename=$(date +%s).jpg
downloadedimgsfolder=downloadedimgs
wget --output-document=$SCRIPT_DIR/$downloadedimgsfolder/$imgfilename hubbleharvest.ch:8080
chmod 777 $SCRIPT_DIR/$downloadedimgsfolder/$imgfilename
echo "setting downloaded img as background"
gsettings set org.gnome.desktop.background picture-options 'scaled'
gsettings set org.gnome.desktop.background picture-uri "file://$SCRIPT_DIR/$downloadedimgsfolder/$imgfilename" 
