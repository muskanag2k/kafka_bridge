const { SchemaRegistry, SchemaType } = require('@kafkajs/confluent-schema-registry');

const registry = new SchemaRegistry({
  host: 'http://localhost:8081', 
});
