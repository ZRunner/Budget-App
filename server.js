const express = require('express');
const mysql = require('promise-mysql');
require('dotenv').config();

const app = express();

const root = require('path').join(__dirname, 'build')
app.use(express.static(root));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let db;
mysql.createPool({host: process.env.DB_HOST, port: (process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PWD, database: process.env.DB_NAME})
.then(pool => {
    console.debug("Database pool created")
    db = pool;
    db.on('connection', (cnx) => {
        console.log("Connected to database!");
    });
}).catch(console.error);


app.get("/api/flows", async (req, res) => {
    const query = await db.query("SELECT * FROM flows;");
    res.json(query);
})

app.get("/api/bank_accounts", async (req, res) => {
    const query = await db.query("SELECT * FROM bank_accounts;");
    res.json(query);
})

app.get("/api/categories", async (req, res) => {
    const query = await db.query("SELECT * FROM categories;")
    res.json(query);
})

app.post("/api/flow", async (req, res) => {
    if (!req.body.name || !req.body.cost || !req.body.category || !req.body.bank_account || !req.body.date) {
        res.status(400).send("Missing parameter");
        return;
    }
    const query = await db.query("INSERT INTO `flows` (`id`, `name`, `cost`, `category`, `bank_account`, `date`) VALUES (NULL, ?, ?, ?, ?, ?)", [req.body.name, req.body.cost, req.body.category, req.body.bank_account, req.body.date])
    console.debug(query);
    res.status(200).send(String(query.insertId));
})

app.delete("/api/flow/:id", async (req, res) => {
    const query = await db.query("DELETE FROM `flows` WHERE id = ?", [req.params.id]);
    res.status(200).send(String(query.affectedRows));
})

app.get("*", (req, res) => {
    res.sendFile('index.html', { root });
})

app.listen(8080);
