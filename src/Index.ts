import { Client } from "discord.js";
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";
import 'dotenv/config';
import express, { Express, Request, Response } from "express";

// Express Server
const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/users', (req, res) => {
    return res.send('Received a GET HTTP method');
});
  
app.post('/users', (req, res) => {
    return res.send('Received a POST HTTP method');
});
  
app.put('/users/:userId', (req, res) => {
    return res.send(
        `PUT HTTP method on user/${req.params.userId} resource`,
    );
});
  
app.delete('/users/:userId', (req, res) => {
    return res.send(
        `DELETE HTTP method on user/${req.params.userId} resource`,
    );
});

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});

// Discord Bot
console.log("Bot is starting...");

const client = new Client({
    intents: []
});

// Event Handlers
ready(client);
interactionCreate(client);

// Login
client.login(process.env.TOKEN);
