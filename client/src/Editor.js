import React, { useState, useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import './styles.css';

const SAVE_INTERVAL_MS = 2000;

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['bold', 'italic', 'underlined'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ align: [] }],
    ['image', 'blockquote', 'code-block'],
    ['clean']
];

const initialText = {
    "ops": [{ "insert": "Hola, Bienvenido a Google-docs Clone" }, { "attributes": { "align": "center", "code-block": true }, "insert": "\n\n" }, { "insert": "Este proyecto permite la interacción de dos o mas usuarios simultanemente" }, { "attributes": { "align": "center", "code-block": true }, "insert": "\n" }, { "insert": "en el mismo documento utilizando Socket.IO." }, { "attributes": { "align": "center", "code-block": true }, "insert": "\n" }, { "insert": "Cuenta con un guardado automatico cada dos segundos en una" }, { "attributes": { "align": "center", "code-block": true }, "insert": "\n" }, { "insert": "base de datos de MongoDB." }, { "attributes": { "align": "center", "code-block": true }, "insert": "\n\n" }, { "insert": "¡SIMPLEMENTE COMPARTE EL LINK!" }, { "attributes": { "align": "center", "code-block": true }, "insert": "\n\n" }, { "insert": "Hecho por: Fermín Larrañaga" }, { "attributes": { "align": "center", "code-block": true }, "insert": "\n" }]
}

const Editor = () => {
    const [socket, setSocket] = useState();
    const oldTextValue = useRef('');
    const [quill, setQuill] = useState();
    const { id } = useParams();
    const serverURL = 'https://google-docs--clone.herokuapp.com';

    useEffect(() => {
        const s = io(serverURL);
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null) return

        socket.emit('get-document', id);

        socket.once('load-document', data => {
            if (!data) {
                quill.setContents(initialText);
                quill.enable();
                return
            }
            quill.setContents(data);
            quill.enable();
        });
    }, [socket, quill, id]);

    useEffect(() => {
        if (socket == null || quill == null) return

        const saving_interval = setInterval(() => {
            const currentTxt = quill.getContents();
            if (oldTextValue.current !== JSON.stringify(currentTxt)) {
                oldTextValue.current = JSON.stringify(currentTxt);
                socket.emit('save-changes', currentTxt);
            }
        }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(saving_interval);
        }
    }, [socket, quill]);

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta) => {
            console.log('RECIEVED CHANGES');
            quill.updateContents(delta);
        }

        socket.on('recieve-changes', handler);

        return () => {
            socket.off('recieve-changes', handler);
        }
    }, [socket, quill]);

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return
            console.log('SENDED CHANGES');
            socket.emit('send-changes', delta);
        }

        quill.on('text-change', handler);

        return () => {
            quill.off('text-change', handler);
        }
    }, [socket, quill]);

    // Adaptando Quill a React
    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return
        wrapper.innerHTML = '';
        const editor = document.createElement('div');
        wrapper.append(editor);

        const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } });
        q.disable();
        q.setText('Cargando...');
        setQuill(q);
    }, []);


    return (
        // <Fragment>
        // {/* <h1>Page ID: <br />{id}</h1> */}
        <div className='container' ref={wrapperRef} />
        // </Fragment>
    )
}

export default Editor;