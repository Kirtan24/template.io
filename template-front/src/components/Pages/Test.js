import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../Spinner/Spinner';
import '../Spinner/Spinner.css';
import config from '../../utils/helpers/helper';

const { API_URL } = config;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Fetch');

  const handleFetchData = () => {
    setLoading(true);
    setButtonText('Fetching...');

    axios
      .get(`${API_URL}/load`)
      .then((response) => {
        console.log(response.data);
        setLoading(false);
        setButtonText('Done Loaded!');
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
        setButtonText('Failed to Load');
      });
  };

  return (
    <>

      <div className='loader-overlay'>
        <Spinner className="dark" />
      </div>


      {/* <button
        className={`btn btn-primary`}
        onClick={handleFetchData}
        disabled={loading}
      >
        <div className={`btn-load`}>
          {loading && <Spinner />}
          {buttonText}
          </div>
      </button>

      <button className="btn btn-primary ms-2">
        Hello World
      </button> */}
    </>
  );
};

export default App;
