const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./analytics.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to database");
});

db.serialize(() => {
  // Create table if not exists
  db.run(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      followers INTEGER NOT NULL,
      likes INTEGER NOT NULL,
      comments INTEGER NOT NULL
    )
  `);

  // Check if data exists
  db.get("SELECT COUNT(*) as count FROM analytics", (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }
    
    // Only insert if table is empty
    if (row.count === 0) {
      const today = new Date();
      
      // Generate 60 days of sample data
      for (let i = 59; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Simulate growth
        const growth = (60 - i) * 15;
        const followers = 1000 + growth + Math.floor(Math.random() * 50);
        const likes = Math.floor(followers * 0.4) + Math.floor(Math.random() * 30);
        const comments = Math.floor(likes * 0.2) + Math.floor(Math.random() * 10);
        
        db.run(
          'INSERT INTO analytics (date, followers, likes, comments) VALUES (?, ?, ?, ?)',
          [dateStr, followers, likes, comments],
          (err) => {
            if (err) console.error("Insert error:", err.message);
          }
        );
      }
      
      console.log("60 days of sample data inserted");
    } else {
      console.log("Data already exists, skipping insert");
    }
  });
});

module.exports = db;