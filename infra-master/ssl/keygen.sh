#!/bin/sh

# Check if the SSL keys already exist
if [ -f /ssl/nginx-selfsigned.key ] && [ -f /ssl/nginx-selfsigned.crt ] && [ -f /ssl/dhparam.pem ]; then
    echo 'Keys already exist... Exiting'
    exit
fi
# If they don't, generate new keys

apk add --no-cache openssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /ssl/nginx-selfsigned.key -out /ssl/nginx-selfsigned.crt -subj '/C=CA/ST=Ontario/L=Waterloo/O=ByteBreakers/OU=ByteBreakers/CN=localhost'
openssl dhparam -out /ssl/dhparam.pem 4096
echo 'Generated keys.. Exiting.'
exit
