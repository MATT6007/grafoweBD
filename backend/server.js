const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 9000


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.json());

app.use('/genealogy', require('./src/routers/genealogyRouter'));

// app.use(express.static(path.join(__dirname, 'frontend/build', 'index.html')));
// if(process.env.NODE_ENV === 'production')
// { 
//     app.use(express.static(path.join(__dirname, 'frontend/build', 'index.html')));
//     app.get('*', (req, res) => {res.sendFile(path.join(__dirname = 'frontend/build/index.html'));  })
// }


app.listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`);
});

