const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
    host: "sql12.freesqldatabase.com",
    user: "sql12763237",
    password: "VSFHTbeS67",
    database: "sql12763237"
});

db.connect(err => {
    if (err) throw err;
    console.log("✅ Connected to MySQL Database!");
});

// Fetch menu items
app.get("/api/menu", (req, res) => {
    db.query("SELECT * FROM menu_items", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Place a new order
app.post("/api/order", (req, res) => {
    const { items, total_price, payment_method } = req.body;
    
    if (!items || !total_price || !payment_method) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "INSERT INTO orders (items, total_price, payment_method, status) VALUES (?, ?, ?, 'Pending')";
    db.query(sql, [JSON.stringify(items), total_price, payment_method], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err });
        }
        res.json({ message: "✅ Order Placed!", order_id: result.insertId });
    });
});

app.put("/api/order/:id", (req, res) => {
    const { id } = req.params;
    const { items, total_price, payment_method, status } = req.body;

    const sql = "UPDATE orders SET items = ?, total_price = ?, payment_method = ?, status = ? WHERE id = ?";
    db.query(sql, [JSON.stringify(items), total_price, payment_method, status, id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err });
        }
        res.json({ message: "✅ Order Updated!" });
    });
});

// Update payment status
app.put("/api/payment/:id", (req, res) => {
    const { id } = req.params;
    const { payment_status } = req.body;

    const sql = "UPDATE orders SET payment_status = ? WHERE id = ?";
    db.query(sql, [payment_status, id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error", details: err });
        }
        res.json({ message: "✅ Payment Status Updated!" });
    });
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
