require('dotenv').config(); 

const neo4jConfig = {
    'uri': process.env.NEO4J_URI,
    'user': process.env.NEO4J_USERNAME,
    'password': process.env.NEO4J_PASSWORD,
}
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(neo4jConfig.uri, neo4j.auth.basic(neo4jConfig.user, neo4jConfig.password));

exports.getSession = function (context) {
    if (context.neo4jSession) {
      return context.neo4jSession;
    } else {
      context.neo4jSession = driver.session();
      return context.neo4jSession;
    }
};


