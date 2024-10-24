import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json())

app.listen(5001, () => console.log(' API listening on port 5001'))

app.get('/', (req, res) => res.json('Hey, from my API'))
