#!/bin/bash

KAFKA_VERSION="3.8.1"
SCALA_VERSION="2.13"
KAFKA_DIR="/opt/kafka"
APP_DIR="/opt/nodejs-kafka-app"
NODE_APP_REPO="<YOUR_GIT_REPO_URL>"

echo "Updating the system..."
sudo apt update -y && sudo apt upgrade -y

echo "Installing Java..."
sudo apt install -y openjdk-11-jdk

echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo "Downloading Kafka..."
wget https://downloads.apache.org/kafka/$KAFKA_VERSION/kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz -P /tmp

echo "Installing Kafka..."
sudo tar -xvzf /tmp/kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz -C /opt
sudo mv /opt/kafka_$SCALA_VERSION-$KAFKA_VERSION $KAFKA_DIR

echo "Setting up environment variables..."
echo "export KAFKA_HOME=$KAFKA_DIR" | sudo tee -a /etc/profile
echo "export PATH=\$PATH:\$KAFKA_HOME/bin" | sudo tee -a /etc/profile
source /etc/profile

echo "Starting Zookeeper..."
nohup $KAFKA_DIR/bin/zookeeper-server-start.sh $KAFKA_DIR/config/zookeeper.properties > /tmp/zookeeper.log 2>&1 &
echo "Starting Kafka..."
nohup $KAFKA_DIR/bin/kafka-server-start.sh $KAFKA_DIR/config/server.properties > /tmp/kafka.log 2>&1 &

echo "Kafka and Node.js setup complete!"