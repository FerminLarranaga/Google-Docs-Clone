import React from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Editor from './Editor';
import { v4 as uuidV4} from 'uuid';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/document/:id' element={<Editor />}/>
          <Route path='*' element={<Navigate to={{pathname: `/document/${uuidV4()}`}}/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
