require('dotenv').config();
const express = require('express');
const { Pool, Result } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/checkInitials', async (req, res) => {
  const initials = req.query.initials;

  const result = await pool.query(
    `SELECT COUNT(*)::int FROM referenceNumber WHERE UPPER(initials) LIKE UPPER($1)`,
    [initials]
  );
  const count = result.rows[0].count;

  if (count === 0) {
    res.json({ unique: true, count: 0, message: "Initials are available" });
  } else {
    res.json({ unique: false, count: count, message: "Initials already exist" });
  }

});

app.post ('/insert',async (req, res) => {
  try{
    const { reference, initials, subject, address } = req.body;
    
    const result = await pool.query(
      `INSERT INTO referenceNumber(partial_reference, initials, subject, receiver_address) values ($1,$2,$3,$4)
      RETURNING *;`,
      [reference, initials, subject, address]
    );

    res.json({ success: true, message: "Data successfully inserted!", data: result.rows[0] });
  } catch(err){
    console.error("Database operation failed:", err);
    res.status(500).json({ success: false, message:"Data not inserted!", error: "Internal server error code 500" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});