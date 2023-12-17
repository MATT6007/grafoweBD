import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Genealogy.css';

const Genealogy = () => {
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({
    name: '',
    surname: '',
    birthDate: '',
    birthPlace: '',
    additionalInfo: '',
    isMarried: false,
    gender: '',
  });

  const [relationship, setRelationship] = useState({
    parentId: '',
    childId: '',
    spouse1Id: '',
    spouse2Id: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deletePersonId, setDeletePersonId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://graphweb-final.onrender.com/genealogy/getAllPeople');
      setPeople(response.data.people);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again.');
    }
  };

  const fetchMales = async () => {
    try {
      const response = await axios.get('https://graphweb-final.onrender.com/genealogy/getAllMales');
      setPeople(response.data.males);
    } catch (error) {
      console.error('Error fetching males:', error);
      setError('Error fetching males. Please try again.');
    }
  };

  const fetchFemales = async () => {
    try {
      const response = await axios.get('https://graphweb-final.onrender.com/genealogy/getAllFemales');
      setPeople(response.data.females);
    } catch (error) {
      console.error('Error fetching males:', error);
      setError('Error fetching males. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPerson({
      ...newPerson,
      [name]: value,
    });
  };

  const handleRelationshipChange = (e) => {
    const { name, value } = e.target;
    setRelationship({
      ...relationship,
      [name]: value,
    });
  };

  const handleAddPerson = async () => {
    try {
      const response = await axios.post('https://graphweb-final.onrender.com/genealogy/addPerson', newPerson);
      console.log(response.data);
      setSuccessMessage('Person added successfully.');
      fetchData();
    } catch (error) {
      console.error('Error adding person:', error);
      setError('Error adding person. Please try again.');
    }
  };

  const handleAddRelationship = async () => {
    try {
      const response = await axios.post('https://graphweb-final.onrender.com/genealogy/addParentChildRelationship', relationship);
      console.log(response.data);
      setSuccessMessage('Relationship added successfully.');
      fetchData();
    } catch (error) {
      console.error('Error adding relationship:', error);
      setError('Error adding relationship. Please try again.');
    }
  };

  const handleAddMarriage = async () => {
    try {
      const response = await axios.post('https://graphweb-final.onrender.com/genealogy/addMarriageRelationship', relationship);
      console.log(response.data);
      setSuccessMessage('Marriage relationship added successfully.');
      fetchData();
    } catch (error) {
      console.error('Error adding marriage relationship:', error);
      setError('Error adding marriage relationship. Please try again.');
    }
  };

  const handleDeletePerson = async (personId) => {
    try {
      const response = await axios.delete(`https://graphweb-final.onrender.com/genealogy/deletePerson/${personId}`);
      console.log(response.data);
      setSuccessMessage('Person deleted successfully.');
      fetchData(); 
    } catch (error) {
      console.error('Error deleting person:', error);
      setError('Error deleting person. Please try again.');
    }
  };

  const handleFetchUnmarriedPeople = async () => {
    try {
        const response = await axios.get('https://graphweb-final.onrender.com/genealogy/getUnmarriedPeople');
        console.log(response.data);
        setPeople(response.data.unmarriedPeople);
        setSuccessMessage('Unmarried people fetched successfully.');
    } catch (error) {
        console.error('Error fetching unmarried people:', error);
        setError('Error fetching unmarried people. Please try again.');
    }
  };

  const handleFetchMarriedPeople = async () => {
    try {
      const response = await axios.get('https://graphweb-final.onrender.com/genealogy/getMarriedPeople');
      console.log(response);
      setPeople(response.data.marriedPeople);
    } catch (error) {
      console.error('Error fetching married people:', error);
      setError('Error fetching married people. Please try again.');
    }
  };

  const handleDeleteMarriage = async () => {
    try {
        const response = await axios.delete(`https://graphweb-final.onrender.com/genealogy/deleteMarriage/${relationship.spouse1Id}/${relationship.spouse2Id}`);
        console.log(response.data);
        setSuccessMessage('Marriage relationship deleted successfully.');
        fetchData();
    } catch (error) {
        console.error('Error deleting marriage relationship:', error);
        setError('Error deleting marriage relationship. Please try again.');
    }
};


  return (
    <div>
      <div className='genealogy-header'>
        People in Genealogy
      </div>
      <div className="buttonContainer">
        <button onClick={fetchData} className="buttonStyle">Show All People</button>
        <button onClick={fetchMales} className="buttonStyle">Show All Males</button>
        <button onClick={fetchFemales} className="buttonStyle">Show All Females</button>
        <button onClick={handleFetchUnmarriedPeople} className="buttonStyle">Show Unmarried People</button>
        <button onClick={handleFetchMarriedPeople} className="buttonStyle">Show Married People</button>
      </div>

     <table border="1">
          <thead>
              <tr>
                  <th>Name</th>
                  <th>Surname</th>
                  <th>Additional Info</th>
                  <th>Birth Date</th>
                  <th>Birth Place</th>
                  <th>Person ID</th>
                  <th>Marriages</th>
              </tr>
          </thead>
          <tbody>
              {people.map((person) => (
                  <tr key={person.id}>
                      <td>{person.name}</td>
                      <td>{person.surname}</td>
                      <td>{person.additionalInfo}</td>
                      <td>{person.birthDate}</td>
                      <td>{person.birthPlace}</td>
                      <td>{person.id}</td>
                      <td>
                          {person.isMarried && person.marriages && person.marriages.length > 0 && (
                              <table border="1">
                                  <thead>
                                      <tr>
                                          <th>Spouse Name</th>
                                          <th>Spouse Surname</th>
                                          <th>Children</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {person.marriages.map((marriage) => (
                                          <tr key={marriage.spouse.id}>
                                              <td>{marriage.spouse.name}</td>
                                              <td>{marriage.spouse.surname}</td>
                                              <td>
                                                  {marriage.children && marriage.children.length > 0 ? (
                                                      <ul>
                                                          {marriage.children.map((child) => (
                                                              <tr key={child.id}>
                                                                  {child.name} {child.surname}
                                                              </tr>
                                                          ))}
                                                      </ul>
                                                  ) : (
                                                      <p>No children for this marriage.</p>
                                                  )}
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          )}
                      </td>
                  </tr>
              ))}
          </tbody>
      </table>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="form-container">
        <label>Name:</label>
        <input type="text" name="name" value={newPerson.name} onChange={handleInputChange} />
        <br />

        <label>Surname:</label>
        <input type="text" name="surname" value={newPerson.surname} onChange={handleInputChange} />
        <br />

        <label>Birth Date:</label>
        <input type="date" name="birthDate" value={newPerson.birthDate} onChange={handleInputChange} />
        <br />

        <label>Birth Place:</label>
        <input type="text" name="birthPlace" value={newPerson.birthPlace} onChange={handleInputChange} />
        <br />

        <label>Additional Info:</label>
        <textarea name="additionalInfo" value={newPerson.additionalInfo} onChange={handleInputChange} />
        <br />

        <label>Is Married:</label>
        <input type="checkbox" name="isMarried" checked={newPerson.isMarried} onChange={() => setNewPerson({ ...newPerson, isMarried: !newPerson.isMarried })} />
        <br />
        
        <div>
          <label>Gender:</label>
          <select name="gender" value={newPerson.gender} onChange={handleInputChange} defaultValue="male" style={{ margin: '0.5rem' }}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <button onClick={handleAddPerson}>Add Person</button>
    </div>

    <div className="relationship-form">
      <label>Mother ID:</label>
      <input type="text" name="motherId" value={relationship.motherId} onChange={handleRelationshipChange} />
      <br />

      <label>Father ID:</label>
      <input type="text" name="fatherId" value={relationship.fatherId} onChange={handleRelationshipChange} />
      <br />

      <label>Child ID:</label>
      <input type="text" name="childId" value={relationship.childId} onChange={handleRelationshipChange} />
      <br />

      <button className="relationship-button" onClick={handleAddRelationship}>Add Relationship</button>
  </div>

  <div className="marriage-form">
      <label>Spouse 1 ID:</label>
      <input type="text" name="spouse1Id" value={relationship.spouse1Id} onChange={handleRelationshipChange} />
      <br />

      <label>Spouse 2 ID:</label>
      <input type="text" name="spouse2Id" value={relationship.spouse2Id} onChange={handleRelationshipChange} />
      <br />

      <button className="relationship-button" onClick={handleAddMarriage}>Add Marriage</button>
  </div>

  <div className="delete-person-container">
        <label>Delete Person by ID:</label>
        <input
          type="text"
          name="deletePersonId"
          value={deletePersonId}
          onChange={(e) => setDeletePersonId(e.target.value)}
          className="delete-person-input"
        />
        <button onClick={handleDeletePerson} className="delete-person-button">
          Delete Person
        </button>
      </div>

      <div className="delete-marriage-container">
        <label>Spouse 1 ID:</label>
        <input
          type="text"
          name="spouse1Id"
          value={relationship.spouse1Id}
          onChange={handleRelationshipChange}
          className="delete-marriage-input"
        />
        <br />
        <label>Spouse 2 ID:</label>
        <input
          type="text"
          name="spouse2Id"
          value={relationship.spouse2Id}
          onChange={handleRelationshipChange}
          className="delete-marriage-input"
        />
        <br />
        <button onClick={handleDeleteMarriage} className="delete-marriage-button">
          Delete Marriage
        </button>
      </div>                                             

    </div>
    
  );
};

export default Genealogy;
