import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware to parse JSON

// Open SQLite database
const dbPromise = open({
    filename: 'backend/data/data.db',
    driver: sqlite3.Database
});

// Route to fetch all rows from a specific table
app.get('/api/:table', async (req: Request, res: Response) => {
    const tableName = req.params.table;

    try {
        const db = await dbPromise;
        const rows = await db.all(`SELECT * FROM ${tableName}`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data from the database.' });
    }
});

// Route to fetch a specific row by ID (if the table has an ID column)
app.get('/api/:table/:id', async (req: Request, res: Response) => {
    const tableName = req.params.table;
    const id = req.params.id;

    try {
        const db = await dbPromise;
        const row = await db.get(`SELECT * FROM ${tableName} WHERE CODEID = ?`, [id]);
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Row not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data from the database.' });
    }
});

// Example route
app.get('/', (req: Request, res: Response) => {
    res.send('Bird is the word');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});