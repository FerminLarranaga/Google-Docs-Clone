import React from 'react';
import { Navigate } from 'react-router-dom';
import { v4 as uuidV4} from 'uuid';

const GenerateUUID = () =>
    <Navigate to={{pathname: `/document/${uuidV4()}`}}/>

export default GenerateUUID;