import React from 'react';
import logo from './logo.svg';
import './App.css';
import UsersList from './components/UserList';

function App() {
  return (
    <>
     <UsersList results={100} />
    </>
  );
}

export default App;
