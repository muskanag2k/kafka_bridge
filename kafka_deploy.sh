#!/bin/bash

APP_DIR="/home/deploy/apps/kafka_bridge"
NODE_APP_REPO="https://github.com/muskanag2k/kafka_bridge.git"

echo "Cloning Node.js application..."
rm -rf $APP_DIR
git clone $NODE_APP_REPO $APP_DIR

cd $APP_DIR

echo "Installing Node.js dependencies..."
npm install

echo "Installing PM2..."
npm install -g pm2

echo "Starting the Node.js Kafka application..."
pm2 start app.js

echo "Application status:"
pm2 list

echo "Check logs using the following commands:"
echo "Node.js Logs: pm2 logs app"

echo "Node.js application is running successfully!"
