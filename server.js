require('dotenv').config();
const express = require('express');
const { Pool, Result } = require('pg');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json()); 


const JWT_SECRET = process.env.JWT_SECRET;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 100,                   
  message: { error: 'Too many requests, please try again later.' }
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 10,                    
  message: { error: 'Too many login attempts, please try again later.' }
});
app.use(limiter);
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

app.post('/login', loginLimiter, async(req, res) => {
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

app.post ('/insert',verifyToken, async (req, res) => {
  try{
    const { reference, initials, subject, address, clientName, year } = req.body;
    
    const result = await pool.query(
      `INSERT INTO referenceNumber(id, ref_year, partial_reference, initials, subject, receiver_address, clientname) values ((SELECT COALESCE(MAX(id), 0) + 1 FROM referenceNumber WHERE ref_year = $1),$1,$2,$3,$4,$5,$6)
      RETURNING *;`,
      [year, reference, initials, subject, address, clientName]
    );

    res.json({ success: true, message: "Data successfully inserted!", data: result.rows[0] });
  } catch(err){
    console.error("Database operation failed:", err);
    res.status(500).json({ success: false, message:"Data not inserted!", error: "Internal server error code 500" });
  }
});

app.get('/search',verifyToken,async(req,res)=>{
  try{
    const name = req.query.name;
    const result = await pool.query(
      `SELECT LPAD(id::text, 4, '0') as id, partial_reference, initials, subject, receiver_address, created_at, clientname from referenceNumber where UPPER(clientName) lIKE UPPER($1)`,
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