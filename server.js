const express = require('express');
const mysql = require('promise-mysql');
require('dotenv').config();

const app = express();

const root = require('path').join(__dirname, 'build')
app.use(express.static(root));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// error handler
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
  

let db;
mysql.createPool({host: process.env.DB_HOST, port: (process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PWD, database: process.env.DB_NAME})
.then(pool => {
    console.debug("Database pool created")
    db = pool;
    db.on('connection', (cnx) => {
        console.log("Connected to database!");
    });
}).catch(console.error);

app.get("/api/bank_accounts", async (req, res) => {
    const query = await db.query("SELECT * FROM bank_accounts;");
    res.json(query);
})

app.get("/api/categories", async (req, res) => {
    const query = await db.query("SELECT * FROM categories;")
    res.json(query);
})

app.get("/api/total-balance-by-day", async (req, res) => {
    const query = await db.query("SELECT f.date, (SELECT ROUND(SUM(f2.cost), 2) FROM `flows` f2 WHERE f2.date <= f.date) as costs FROM `flows` f GROUP BY `date` ORDER BY `date` ASC;");
    res.json(query);
})

app.get("/api/flows-by-day", async (req, res) => {
    const query = await db.query("SELECT f.date, ROUND(SUM(f.cost), 2) as costs FROM `flows` f GROUP BY `date` ORDER BY `date` ASC;");
    res.json(query);
})

app.get("/api/flows-by-day/:day", async (req, res) => {
    // check for the date
    if (!new Date(req.params.day).getDay()) {
        res.status(400).send("Invalid date");
        return;
    }
    const query = await db.query("SELECT f.date, ROUND(SUM(f.cost), 2) as costs FROM `flows` f WHERE f.date = ?;", [req.params.day]);
    res.json(query[0].date ? query[0] : {date: req.params.day, costs: 0.0});
})

app.get("/api/flows", async (req, res) => {
    const query = await db.query("SELECT * FROM flows ORDER BY date DESC;");
    res.json(query);
})

app.get("/api/flows/:id", async (req, res) => {
    const query = await db.query("SELECT * FROM flows WHERE id = ?;", [req.params.id]);
    res.json(query[0]);
})

app.post("/api/flows", async (req, res) => {
    if (!req.body.name || !req.body.cost || !req.body.category || !req.body.bank_account || !req.body.date) {
        res.status(400).send("Missing parameter");
        return;
    }
    let query;
    try {
        query = await db.query("INSERT INTO `flows` (`id`, `name`, `cost`, `category`, `bank_account`, `date`) VALUES (NULL, ?, ?, ?, ?, ?)", [req.body.name, req.body.cost, req.body.category, req.body.bank_account, req.body.date])
    } catch (err) {
        return next(err);
    }
    res.status(200).send(String(query.insertId));
})

app.delete("/api/flows/:id", async (req, res) => {
    let query;
    try {
        query = await db.query("DELETE FROM `flows` WHERE id = ?", [req.params.id]);
    } catch (err) {
        return next(err);
    }
    res.status(200).send(String(query.affectedRows));
})

app.put("/api/flows/:id", async (req, res, next) => {
    let flow = {
        name: req.body.name,
        cost: req.body.cost,
        category: req.body.category,
        bank_account: req.body.bank_account,
        date: req.body.date,
    }
    if (!flow.name || !flow.cost || !flow.category || !flow.bank_account || !flow.date) {
        res.status(400).send("Missing parameter");
        return;
    }

    const columns = Object.keys(flow);
    const values = Object.values(flow);
    let query;
    try {
        query = await db.query("UPDATE flows SET `" + columns.join("` = ?, `") +"` = ? WHERE id = ?", [...values, req.params.id]);
    } catch (err) {
        return next(err);
    }
    res.status(200).send(String(query.affectedRows));
})

app.get("*", (req, res) => {
    res.sendFile('index.html', { root });
})

app.listen(8080);
