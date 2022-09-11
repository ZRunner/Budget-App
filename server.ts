import express, { ErrorRequestHandler, Request } from 'express'
import { exit } from 'process'
import mysql from 'promise-mysql'
import https from 'https';
import { FlowInput, TransferInput } from "./src/types";
require('dotenv').config({ path: __dirname + '/.env' });

if (process.env.DB_HOST === undefined || process.env.DB_USER === undefined || process.env.DB_PWD === undefined || process.env.DB_NAME === undefined) {
    console.debug(`Connecting to database ${process.env.DB_HOST}:${process.env.DB_PORT || 3306} with user ${process.env.DB_USER}`);
    console.error("Missing database info: aborting");
    exit(1);
}

const app = express();

const root = require('path').join(__dirname, 'build');
app.use(express.static(root));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// error handler
const handleError: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
}
app.use(handleError)


// database connection
let db: mysql.Pool;
console.debug(`Connecting to database ${process.env.DB_HOST}:${process.env.DB_PORT || 3306} with user ${process.env.DB_USER}`);
mysql.createPool({
    host: process.env.DB_HOST,
    port: (Number(process.env.DB_PORT || 3306)),
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
})
    .then(pool => {
        console.debug("Database pool created")
        db = pool;
        db.on('connection', () =>
            console.log("Connected to database!")
        );
    }).catch(console.error);

app.get("/api/bank_accounts", async (req, res) => {
    const query = await db.query("SELECT * FROM bank_accounts;");
    res.json(query);
})

app.get("/api/categories", async (req, res) => {
    const query = await db.query("SELECT * FROM categories;")
    res.json(query);
})

app.get('/api/current_balances', async (req, res) => {
    const query = await db.query(`SELECT 
    *, 
    (
        SELECT 
        ROUND(b.initial_balance
                + COALESCE(SUM(f.cost), 0), 
            2)
        FROM flows f 
        WHERE f.bank_account = b.id
    ) - (
        SELECT 
        ROUND(
            COALESCE(SUM(amount), 0), 
            2) 
        FROM transfers t 
        WHERE t.from_account = b.id
    ) + (
        SELECT 
        ROUND(
            COALESCE(SUM(
                t.amount * t.rate
                ), 0), 
            2) 
        FROM transfers t 
        WHERE t.to_account = b.id
    ) as balance 
    FROM 
    \`bank_accounts\` b
    `)
    res.json(query);
})

app.get('/api/historic_balances/:day', async (req, res) => {
    // check for the date
    if (isNaN(new Date(req.params.day).getDay())) {
        res.status(400).send("Invalid date");
        return;
    }
    const query = await db.query(`SELECT 
    *, 
    (
        SELECT 
        ROUND(b.initial_balance
                + COALESCE(SUM(f.cost), 0), 
            2)
        FROM flows f 
        WHERE f.bank_account = b.id AND f.date <= ?
    ) - (
        SELECT 
        ROUND(
            COALESCE(SUM(amount), 0), 
            2) 
        FROM transfers t 
        WHERE t.from_account = b.id AND t.date <= ?
    ) + (
        SELECT 
        ROUND(
            COALESCE(SUM(amount), 0), 
            2) 
        FROM transfers t 
        WHERE t.to_account = b.id AND t.date <= ?
    ) as balance 
    FROM 
    \`bank_accounts\` b
    `, [req.params.day, req.params.day, req.params.day])
    res.json(query);
})

app.get('/api/earnings_per_account', async (req: Request<unknown, unknown, unknown, { date: string }>, res) => {
    let date: Date;
    try {
        date = new Date(req.query.date)
    } catch (err: any) {
        res.status(400).send(err.message);
        return;
    }
    const query = await db.query("SELECT b.id, b.name, b.color, b.currency, (SELECT ROUND(SUM(f.cost), 2) FROM flows f WHERE f.bank_account = b.id AND f.date >= ? AND f.cost < 0) as expenses, (SELECT ROUND(SUM(f.cost), 2) FROM flows f WHERE f.bank_account = b.id AND f.date >= ? AND f.cost > 0) as incomes FROM `bank_accounts` b", [date, date])
    res.json(query);
})

app.get("/api/flows", async (req, res) => {
    const query = await db.query("SELECT *, (SELECT b.currency FROM bank_accounts b WHERE b.id = bank_account) as currency FROM flows ORDER BY date DESC;");
    res.json(query);
})

app.get("/api/flows/:id", async (req, res) => {
    const query = await db.query("SELECT *, (SELECT b.currency FROM bank_accounts b WHERE b.id = bank_account) as currency FROM flows WHERE id = ?;", [req.params.id]);
    res.json(query[0]);
})

app.post("/api/flows", async (req: Request<unknown, unknown, FlowInput>, res, next) => {
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

app.delete("/api/flows/:id", async (req, res, next) => {
    let query;
    try {
        query = await db.query("DELETE FROM `flows` WHERE id = ?", [req.params.id]);
    } catch (err) {
        return next(err);
    }
    res.status(200).send(String(query.affectedRows));
})

app.put("/api/flows/:id", async (req: Request<{ id: number }, unknown, Partial<FlowInput>>, res, next) => {
    let flow = {
        name: req.body.name,
        cost: req.body.cost,
        category: req.body.category,
        bank_account: req.body.bank_account,
        date: req.body.date,
    }
    if (!flow.name && !flow.cost && !flow.category && !flow.bank_account && !flow.date) {
        res.status(400).send("Missing parameter");
        return;
    }

    const columns = Object.keys(flow);
    const values = Object.values(flow);
    let query;
    try {
        query = await db.query("UPDATE flows SET `" + columns.join("` = ?, `") + "` = ? WHERE id = ?", [...values, req.params.id]);
    } catch (err) {
        return next(err);
    }
    res.status(200).send(String(query.affectedRows));
})

app.get("/api/transfers", async (req, res) => {
    const query = await db.query("SELECT * FROM transfers ORDER BY date DESC;");
    res.json(query);
})

app.post("/api/transfers", async (req: Request<unknown, unknown, TransferInput>, res, next) => {
    if (!req.body.name || !req.body.amount || !req.body.rate || !req.body.category || !req.body.from_account || !req.body.to_account || !req.body.date) {
        res.status(400).send("Missing parameter");
        return;
    }
    let query;
    try {
        query = await db.query("INSERT INTO `transfers` (`name`, `amount`, `rate`, `category`, `from_account`, `to_account`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?)", [req.body.name, req.body.amount, req.body.rate, req.body.category, req.body.from_account, req.body.to_account, req.body.date]);
    } catch (err) {
        return next(err);
    }
    res.status(200).send(String(query.insertId));
})
app.delete("/api/transfers/:id", async (req, res, next) => {
    let query;
    try {
        query = await db.query("DELETE FROM `transfers` WHERE id = ?", [req.params.id]);
    } catch (err) {
        return next(err);
    }
    res.status(200).send(String(query.affectedRows));
})

app.get("/api/currency_rates", async (req, res, next) => {
    https.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', (resp) => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            res.status(200)
                .header("Content-Type", resp.headers["content-type"])
                .send(`${data}`)
        });


    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
})


app.get("*", (req, res) => {
    res.sendFile('index.html', { root });
})

app.listen(8080, () => console.log("Server ready"));
