#!/bin/bash

KAFKA_DIR="/Users/muskanagarwal/Downloads/kafka-3.8.1-src"
TOPICS=("amplitude_events" "backend_events")

if [ ! -d "$KAFKA_DIR" ]; then
  echo "Error: Kafka directory $KAFKA_DIR does not exist. Ensure Kafka is installed correctly."
  exit 1
fi

echo "Creating Kafka topics..."
for topic in "${TOPICS[@]}"; do
  if $KAFKA_DIR/bin/kafka-topics.sh --list --bootstrap-server localhost:9092 | grep -q "^$topic$"; then
    echo "Topic $topic already exists. Skipping creation."
  else
    $KAFKA_DIR/bin/kafka-topics.sh --create \
    --topic $topic \
    --bootstrap-server localhost:9092 \
    --partitions 2 --replication-factor 1
  fi
done

echo "Kafka topics created successfully!"