#!/bin/bash

=APP_DIR="/opt/nodejs-kafka-app"
NODE_APP_REPO="<YOUR_GIT_REPO_URL>"

echo "Cloning Node.js application..."
sudo rm -rf $APP_DIR
sudo git clone $NODE_APP_REPO $APP_DIR

cd $APP_DIR

echo "Installing Node.js dependencies..."
npm install

echo "Installing PM2..."
npm install -g pm2

echo "Starting the Node.js Kafka application..."
pm2 start index.js --name nodejs-kafka-app

echo "Application status:"
pm2 list

echo "Check logs using the following commands:"
echo "Node.js Logs: pm2 logs nodejs-kafka-app"

echo "Node.js application is running successfully!"
