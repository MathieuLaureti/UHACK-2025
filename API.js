// my-api.js
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json()); // To handle JSON body

app.get('/', (req, res) => {
    res.send('Hello from my API!');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
