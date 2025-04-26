import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware to parse JSON

// Example route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello from my TypeScript API!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
