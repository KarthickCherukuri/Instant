const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const filepath = path.join(__dirname, "database.db");
const cors = require("cors");
const jwt_decode = require("jwt-decode");

app.use(express.json());
app.use(cors());
let db = null;
const initializeDatabase = async () => {
  db = await open({
    filename: "database.db",
    driver: sqlite3.Database,
  });
};
initializeDatabase();

const userData = async (req, res, nxt) => {
  const data = req.body.jwt_token;
  const {
    email = "",
    name = "",
    picture = "",
    given_name = "",
    family_name = "",
  } = jwt_decode(data);

  try {
    const userInfo = await db.all("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (userInfo.length === 0) {
      await db.run(
        `
        INSERT INTO users(name, email, picture, first_name, last_name)
        VALUES (?, ?, ?, ?, ?)
        `,
        [name, email, picture, given_name, family_name]
      );

      console.log("User Added");
      res.send({ response: "User Added" });
    } else {
      console.log("User already exists");
      res.send({ response: "User already exists" }).status(401);
    }
  } catch (error) {
    console.error(error);
  }
};

app.get("/", async (req, res) => {
  const data = await db.all("select * from users");
  console.log(data);
  res.send(data);
});

app.post("/findwithemail", async (req, res) => {
  const { email } = req.body;

  const result = await db.all(`SELECT * FROM users WHERE email LIKE ?`, [
    `%${email}%`,
  ]);

  console.log(result);
  res.send(result);
});

app.post("/findwithname", async (req, res) => {
  const { name } = req.body;

  const result = await db.all(`SELECT * FROM users WHERE first_name LIKE ?`, [
    `%${name}%`,
  ]);

  console.log(result);
  res.send(result);
});

app.post("/testdata", userData, async (req, res) => {
  console.log("testData");
});

app.listen(3001, () => {
  console.log("server has started in port 3001");
});
