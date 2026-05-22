const express = require('express');
const { Pool, Result } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/checkInitials', async (req, res) => {
    const initials = req.query.initials;

    const result = await pool.query(
        `SELECT COUNT(*)::int FROM ${referenceNumber} WHERE UPPER(initials) LIKE UPPER($1)`,
        [initials]
    );
    const count = result.rows[0].count;

    if (count === 0) {
      res.json({ unique: true, count: 0, message: "Initials are available" });
    } else {
      res.json({ unique: false, count: count, message: "Initials already exist" });
    }

});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});