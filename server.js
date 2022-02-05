const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const getConnectedClient = require('./config/db.js');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.SOCKET_ORIGIN,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
})

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '/client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '/client/build/index.html'));
    })
} else {
    app.get('/', (req, res) => {
        res.send('WORKING!');
    })
}

const getDocument = async (id) => {
    try {
        // await dbClient.connect();
        const dbClient = await getConnectedClient();
        const docData = await dbClient.findOne({_id: id});
        console.log(docData);

        if (!docData){
            await dbClient.insertOne({_id: id, content: {}});
            return ''
        }
        
        // await dbClient.close();
        return docData.content
    } catch (error) {
        console.log(error);
    } /*finally {
        await dbClient.close();
    }*/
}

const saveChanges = async (id, document) => {
    try {
        console.log('UPDATED');
        // await dbClient.connect();
        const dbClient = await getConnectedClient();
        await dbClient.updateOne({_id: id}, {$set: {content: document}});
        console.log(document);
        // await dbClient.close();
    } catch (error) {
        console.log(error);
    } /*finally {
        await dbClient.close();
    }*/
}

io.on('connection', (socket) => {
    socket.on('get-document', async (id) => {
        const docData = await getDocument(id);
        socket.emit('load-document', docData);

        socket.join(id);

        socket.on('send-changes', delta => {
            socket.broadcast.to(id).emit('recieve-changes', delta);
        })

        socket.on('save-changes', document => {
            saveChanges(id, document);
        })
    })
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})