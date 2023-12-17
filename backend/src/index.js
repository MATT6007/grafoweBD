const dbConfig = require('./config/dbConfig');
const driver = neo4j.driver(
  dbConfig.neo4j.uri,
  neo4j.auth.basic(dbConfig.neo4j.user, dbConfig.neo4j.password)
);
