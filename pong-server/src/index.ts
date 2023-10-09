import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors)

app.get('/ping', (req, res) => {
  res.send('Hello World!');
});

app.listen(parseInt(process.env.BACKEND_PORT || '7777'), '0.0.0.0', () => {
  console.log(`Server is running on port ${process.env.BACKEND_PORT}`);
});
