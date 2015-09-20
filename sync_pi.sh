#!/bin/bash
rsync -rvz --exclude '{data.js,data/*,*venv*/}' . horizon-rpi-1:/home/berocs/litearm-pi-node
