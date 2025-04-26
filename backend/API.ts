import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON

// Open SQLite database
const dbPromise = open({
    filename: 'data/data.db',
    driver: sqlite3.Database
});


// API ROUTE #1
// Get all rows from a table
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

// API ROUTE #2
// Get a specific row from a table
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

// API ROUTE #3
// Get a specific attribute of a row from a table
app.get('/api/:table/:id/:attribute', async (req: Request, res: Response) => {
    const tableName = req.params.table;
    const id = req.params.id;
    const attribute = req.params.attribute;

    try {
        const db = await dbPromise;
        const row = await db.get(`SELECT ${attribute} FROM ${tableName} WHERE CODEID = ?`, [id]);
        if (row && row[attribute] !== undefined) {
            res.json({ [attribute]: row[attribute] });
        } else {
            res.status(404).json({ error: 'Attribute or row not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data from the database.' });
    }
});

// API ROUTE #4
// Get a specific attribute of a row from a table (based on Name)
app.get('/api/name/:table/:attribute/:value', async (req: Request, res: Response) => {
    const tableName = req.params.table;
    const attribute = req.params.attribute;
    const value = req.params.value;

    try {
        const db = await dbPromise;

        // Check if the table contains any rows with the specified attribute
        const rowsExist = await db.get(`SELECT * FROM ${tableName} WHERE ${attribute} IS NOT NULL`);
        if (!rowsExist) {
            res.status(404).json({ error: `No rows found in table '${tableName}' with column '${attribute}'.` });
            return; // Explicitly return to avoid further execution
        }

        // Retrieve all rows where the value matches in the specified column
        const rows = await db.all(`SELECT * FROM ${tableName} WHERE ${attribute} = ?`, [value]);
        if (rows.length > 0) {
            res.json(rows); // Return all matching rows
        } else {
            res.status(404).json({ error: `No rows found in table '${tableName}' where '${attribute}' equals '${value}'.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to fetch data from the table '${tableName}'.` });
    }
});

// Example route
app.get('/', (req: Request, res: Response) => {
    res.send('Bird is the word ddd');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});