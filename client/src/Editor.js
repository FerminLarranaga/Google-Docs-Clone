import React, { useState, useEffect, Fragment, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SAVE_INTERVAL_MS = 2000;

const Editor = () => {
    const [socket, setSocket] = useState();
    const [text, setText] = useState('');
    // const [userInput, setUserInput] = useState('');
    const oldTextValue = useRef('');
    const { id } = useParams();

    useEffect(() => {
      const s = io('https://google-docs--clone.herokuapp.com');
      setSocket(s);
  
      return () => {
        s.disconnect();
      }
    }, [])

    useEffect(() => {
        if (socket == null) return

        socket.emit('get-document', id);

        socket.once('load-document', data => {
            setText(data.text);
        });
    }, [socket, id]);

    useEffect(() => {
        if (socket == null) return

        const saving_interval = setInterval(() => {
            if (oldTextValue.current !== text){
                oldTextValue.current = text;
                console.log('SAVED!: ' + text);
                socket.emit('save-changes', text);
            }
        }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(saving_interval);
        }
    }, [socket, text]);

    useEffect(() => {
        if (socket == null) return

        socket.on('recieve-changes', docData => {
            console.log('RECIEVED CHANGES');
            setText(docData.text);
        });

        return () => {
            socket.off('recieve-changes');
        }
    }, [socket, text]);

    const sendChanges = (newText) => {
        socket.emit('send-changes', function(){console.log('SENDED CHANGES'); return newText}());
        setText(newText)
    }


    return (
        <Fragment>
            <h1>Page ID: <br/>{id}</h1>
            <textarea style={{width: 500, height: 500}} onChange={(e) => sendChanges(e.target.value)} value={text}/>
        </Fragment>
    )
}

export default Editor;