#/usr/bin/bash

ls | grep -v 'update.sh\|_site' | xargs rm -r
cp -r _site/* .
rm -r _site
