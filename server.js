require('dotenv').config();
const express = require('express');
const { Pool, Result } = require('pg');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json()); 

const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

app.post('/login', async(req, res) => {
  const { username, passkey } = req.body;
  
  const result = await pool.query(
    `SELECT profile_id, username, hash_pin
    FROM profile WHERE username = $1`,
      [username.trim()]
  );


  if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid username or password' });
  }

  const user = result.rows[0];
  const hashedPassword = crypto
    .createHash('sha256')
    .update(passkey)
    .digest('hex');

  if (hashedPassword !== user.hash_pin) {
    return res.status(401).json({
      error: 'Invalid username or password'
    });
  }
  const token = jwt.sign(
    { id: user.profile_id, username: user.username },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token });
  
});

app.get('/checkInitials',verifyToken, async (req, res) => {
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

app.post ('/insert',verifyToken, async (req, res) => {
  try{
    const { reference, initials, subject, address, clientName } = req.body;
    
    const result = await pool.query(
      `INSERT INTO referenceNumber(partial_reference, initials, subject, receiver_address, clientname) values ($1,$2,$3,$4,$5)
      RETURNING *;`,
      [reference, initials, subject, address, clientName ]
    );

    res.json({ success: true, message: "Data successfully inserted!", data: result.rows[0] });
  } catch(err){
    console.error("Database operation failed:", err);
    res.status(500).json({ success: false, message:"Data not inserted!", error: "Internal server error code 500" });
  }
});

app.get ('/getId',verifyToken, async(req, res) => {
  try{
    const initials = req.query.initials;
    const result = await pool.query(
    `SELECT id FROM referenceNumber WHERE UPPER(initials) LIKE UPPER($1)`,
    [initials]
    );
    res.json(result.rows)
  }catch(err){
    console.error("Database operation failed:", err);
    res.status(500).json({error: "Internal server error code 500" });
  }
})
app.get('/search',verifyToken,async(req,res)=>{
  try{
    const name = req.query.name;
    const result = await pool.query(
      `SELECT * from referenceNumber where UPPER(clientName) lIKE UPPER($1)`,
      [`%${name}%`]
    );
    
    res.json (result.rows);
  }catch(err){
    console.error("Database operation failed:", err);
    res.status(500).json({error: "Internal server error code 500" });
  }
})
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});