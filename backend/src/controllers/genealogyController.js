// controllers/genealogyController.js

const neo4j = require('../neo4j/db');

const addPerson = async (req, res) => {
    const { name, surname, birthDate, birthPlace, additionalInfo, gender } = req.body;

    const session = neo4j.getSession(req);

    try {
        const result = await session.writeTransaction((transaction) => {
            const query = `
                CREATE (person:Person {
                    name: $name,
                    surname: $surname,
                    birthDate: $birthDate,
                    birthPlace: $birthPlace,
                    additionalInfo: $additionalInfo,
                    gender: $gender
                })
                RETURN person
            `;

            return transaction.run(query, {
                name,
                surname,
                birthDate,
                birthPlace,
                additionalInfo, 
                gender,
            });
        });

        const createdPerson = result.records[0].get('person').properties;
        const createdPersonId = result.records[0].get('person').identity.low;

        res.json({
            status: 'success',
            person: {
                ...createdPerson,
                id: createdPersonId,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding person to the genealogy tree.',
        });
    } finally {
        await session.close();
    }
};


const addParentChildRelationship = async (req, res) => {
    const { motherId, fatherId, childId } = req.body;

    const session = neo4j.getSession(req);

    try {
        const result = await session.writeTransaction((transaction) => {
            const query = `
                MATCH (mother:Person), (father:Person), (child:Person)
                WHERE ID(mother) = $motherId AND ID(father) = $fatherId AND ID(child) = $childId
                CREATE (mother)-[:MOTHER_OF]->(child), (father)-[:FATHER_OF]->(child)
            `;

            return transaction.run(query, {
                motherId: parseInt(motherId),
                fatherId: parseInt(fatherId),
                childId: parseInt(childId),
            });
        });

        res.json({
            status: 'success',
            message: 'Parent-child relationship added.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding parent-child relationship.',
        });
    } finally {
        await session.close();
    }
};


const getAllPeople = async (req, res) => {
    const session = neo4j.getSession(req);

    try {
        const result = await session.readTransaction((transaction) => {
            const query = `
            MATCH (person:Person)
            OPTIONAL MATCH (person)-[:SPOUSE_OF]-(spouse)
            OPTIONAL MATCH (child:Person)<-[:FATHER_OF|:MOTHER_OF]-(person)
            OPTIONAL MATCH (father:Person)-[:FATHER_OF]->(person)
            OPTIONAL MATCH (mother:Person)-[:MOTHER_OF]->(person)
            RETURN ID(person) AS id, person, COLLECT(DISTINCT spouse) AS spouses, COLLECT(DISTINCT child) AS children, COLLECT(DISTINCT father) AS fathers, COLLECT(DISTINCT mother) AS mothers
            `;

            return transaction.run(query);
        });

        const people = result.records.map((record) => {
            const id = record.get('id').toString();
            const person = record.get('person').properties;
            const spouses = record.get('spouses').map((spouse) => spouse ? spouse.properties : null);
            const fathers = record.get('fathers').map((father) => father ? father.properties : null);
            const mothers = record.get('mothers').map((mother) => mother ? mother.properties : null);
            const children = record.get('children').map((child) => child ? child.properties : null);
            
            return {
                id,
                ...person,
                isMarried: spouses.length > 0,
                marriages: spouses.map((spouse) => ({
                    spouse,
                    fathers,
                    mothers,
                    children,
                })),
            };
        });


        res.json({
            status: 'success',
            people: people,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving people from the genealogy tree.',
        });
    } finally {
        await session.close();
    }
};



const addMarriageRelationship = async (req, res) => {
    const { spouse1Id, spouse2Id } = req.body;

    const session = neo4j.getSession(req);

    try {
        const result = await session.writeTransaction((transaction) => {
            const query = `
                MATCH (spouse1:Person), (spouse2:Person)
                WHERE ID(spouse1) = $spouse1Id AND ID(spouse2) = $spouse2Id
                CREATE (spouse1)-[:SPOUSE_OF]->(spouse2)
                CREATE (spouse2)-[:SPOUSE_OF]->(spouse1)
                RETURN spouse1, spouse2
            `;

            return transaction.run(query, {
                spouse1Id: parseInt(spouse1Id),
                spouse2Id: parseInt(spouse2Id),
            });
        });

        const spouses = result.records.map((record) => ({
            spouse1: record.get('spouse1').properties,
            spouse2: record.get('spouse2').properties,
        }));

        res.json({
            status: 'success',
            spouses,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding marriage relationship.',
        });
    } finally {
        await session.close();
    }
};

const getAllMales = async (req, res) => {
    const session = neo4j.getSession(req);

    try {
        const result = await session.readTransaction((transaction) => {
            const query = `
                MATCH (person:Person { gender: 'male' })
                OPTIONAL MATCH (person)-[:SPOUSE_OF]-(spouse)
                OPTIONAL MATCH (child:Person)<-[:FATHER_OF|:MOTHER_OF]-(person)
                RETURN ID(person) AS id, person, COLLECT(DISTINCT spouse) AS spouses, COLLECT(DISTINCT child) AS children
            `;

            return transaction.run(query);
        });

        const males = result.records.map((record) => {
            const id = record.get('id').toString();
            const person = record.get('person').properties;
            const spouses = record.get('spouses').map((spouse) => spouse.properties);
            const children = record.get('children').map((child) => child.properties);

            return {
                id, 
                ...person,
                isMarried: spouses.length > 0,
                marriages: spouses.map((spouse) => ({
                    spouse,
                    children,
                })),
            };
        });

        res.json({
            status: 'success',
            males: males,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving males from the genealogy tree.',
        });
    } finally {
        await session.close();
    }
};

const getAllFemales = async (req, res) => {
    const session = neo4j.getSession(req);

    try {
        const result = await session.readTransaction((transaction) => {
            const query = `
                MATCH (person:Person { gender: 'female' })
                OPTIONAL MATCH (person)-[:SPOUSE_OF]-(spouse)
                OPTIONAL MATCH (child:Person)<-[:FATHER_OF|:MOTHER_OF]-(person)
                RETURN ID(person) AS id, person, COLLECT(DISTINCT spouse) AS spouses, COLLECT(DISTINCT child) AS children
            `;

            return transaction.run(query);
        });

        const females = result.records.map((record) => {
            const id = record.get('id').toString();
            const person = record.get('person').properties;
            const spouses = record.get('spouses').map((spouse) => spouse.properties);
            const children = record.get('children').map((child) => child.properties);

            return {
                id,
                ...person,
                isMarried: spouses.length > 0,
                marriages: spouses.map((spouse) => ({
                    spouse,
                    children,
                })),
            };
        });

        res.json({
            status: 'success',
            females: females,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving males from the genealogy tree.',
        });
    } finally {
        await session.close();
    }
};

const deletePerson = async (req, res) => {
    const { personId } = req.params;

    const session = neo4j.getSession(req);

    try {
        const result = await session.writeTransaction((transaction) => {
            const query = `
                MATCH (person:Person)
                WHERE ID(person) = $personId
                DETACH DELETE person
            `;

            return transaction.run(query, {
                personId: parseInt(personId),
            });
        });

        res.json({
            status: 'success',
            message: 'Person deleted successfully.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting person from the genealogy tree.',
        });
    } finally {
        await session.close();
    }
};

const getUnmarriedPeople = async (req, res) => {
    const session = neo4j.getSession(req);

    try {
        const result = await session.readTransaction((transaction) => {
            const query = `
                MATCH (person:Person)
                WHERE NOT EXISTS((person)-[:SPOUSE_OF]-())
                RETURN ID(person) AS id, person
            `;

            return transaction.run(query);
        });


    const unmarriedPeople = result.records.map((record) => {
        const id = record.get('id').toString();
        const person = record.get('person').properties;
        return {
          id,
          ...person,
        };
      });

        res.json({
            status: 'success',
            unmarriedPeople: unmarriedPeople,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving unmarried people from the genealogy tree.',
        });
    } finally {
        await session.close();
    }
};

const getMarriedPeople = async (req, res) => {
    const session = neo4j.getSession(req);
  
    try {
      const result = await session.readTransaction((transaction) => {
        const query = `
          MATCH (person:Person)-[:SPOUSE_OF]-(spouse:Person)
          OPTIONAL MATCH (child:Person)<-[:FATHER_OF|:MOTHER_OF]-(person)
          RETURN ID(person) AS id, person, COLLECT(DISTINCT spouse) AS spouses, COLLECT(DISTINCT child) AS children
        `;
  
        return transaction.run(query);
      });
  
      const marriedPeople = result.records.map((record) => {
        const id = record.get('id').toString();
        const person = record.get('person').properties;
        const spouses = record.get('spouses').map((spouse) => spouse.properties);
        const children = record.get('children').map((child) => child.properties);
  
        return {
          id,
          ...person,
          isMarried: spouses.length > 0,
          marriages: spouses.map((spouse) => ({
            spouse,
            children,
          })),
        };
      });
  
      res.json({
        status: 'success',
        marriedPeople: marriedPeople,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Error retrieving married people from the genealogy tree.',
      });
    } finally {
      await session.close();
    }
  };
  
  const deleteMarriageRelationship = async (req, res) => {
    const { spouse1Id, spouse2Id } = req.params;
    const session = neo4j.getSession(req);

    try {
        const result = await session.writeTransaction(async (transaction) => {
            const query = `
                MATCH (spouse1:Person)-[marriage:SPOUSE_OF]-(spouse2:Person)
                WHERE ID(spouse1) = $spouse1Id AND ID(spouse2) = $spouse2Id
                DELETE marriage
                RETURN ID(spouse1) AS spouse1Id, ID(spouse2) AS spouse2Id
            `;

            const deleteResult = await transaction.run(query, { spouse1Id: parseInt(spouse1Id), spouse2Id: parseInt(spouse2Id) });
            console.log("deleteResult: ", deleteResult);

            return deleteResult.records;
        });

        if (result.length > 0) {
            const deletedMarriage = result[0];
            res.json({
                status: 'success',
                message: 'Marriage relationship deleted successfully.',
                deletedMarriage: {
                    spouse1Id: deletedMarriage.get('spouse1Id'),
                    spouse2Id: deletedMarriage.get('spouse2Id'),
                },
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Marriage relationship not found.',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting marriage relationship.',
        });
    } finally {
        await session.close();
    }
};


  

module.exports = {
    addPerson,
    addParentChildRelationship,
    addMarriageRelationship,
    getAllPeople,
    getAllMales,
    getAllFemales,
    deletePerson,
    getUnmarriedPeople,
    getMarriedPeople,
    deleteMarriageRelationship,
};