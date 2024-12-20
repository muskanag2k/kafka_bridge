#!/bin/bash

KAFKA_VERSION="3.8.1"
SCALA_VERSION="2.13"
KAFKA_DIR="/opt/kafka"

# echo "Installing Java..."
# sudo apt install openjdk-8-jdk -y

# echo "Installing Node.js..."
# curl -fsSL https://deb.nodesource.com/setup_18.x |  -E bash -
# apt install -y nodejs

echo "Downloading Kafka..."
wget https://downloads.apache.org/kafka/$KAFKA_VERSION/kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz -P /tmp

echo "Installing Kafka..."
tar -xvzf /tmp/kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz -C /opt
mv /opt/kafka_$SCALA_VERSION-$KAFKA_VERSION $KAFKA_DIR

echo "Setting up environment variables..."
echo "export KAFKA_HOME=$KAFKA_DIR" |  tee -a /etc/profile
echo "export PATH=\$PATH:\$KAFKA_HOME/bin" |  tee -a /etc/profile
source /etc/profile

echo "Starting Zookeeper..."
nohup $KAFKA_DIR/bin/zookeeper-server-start.sh $KAFKA_DIR/config/zookeeper.properties > /tmp/zookeeper.log 2>&1 &
echo "Starting Kafka..."
nohup $KAFKA_DIR/bin/kafka-server-start.sh $KAFKA_DIR/config/server.properties > /tmp/kafka.log 2>&1 &

echo "Kafka and Node.js setup complete!"