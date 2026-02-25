const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all analytics data
router.get('/', (req, res) => {
    db.all('SELECT * FROM analytics ORDER BY date ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST new analytics entry
router.post('/', (req, res) => {
    const { date, followers, likes, comments } = req.body;
    
    console.log("Received:", { date, followers, likes, comments }); // Debug log
    
    db.run(
        'INSERT INTO analytics (date, followers, likes, comments) VALUES (?, ?, ?, ?)',
        [date, followers, likes, comments],
        function(err) {
            if (err) {
                console.error("Insert error:", err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log("Inserted with ID:", this.lastID);
            res.json({ id: this.lastID, message: "Data added successfully" });
        }
    );
});

module.exports = router;