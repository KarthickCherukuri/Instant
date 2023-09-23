const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const filepath = path.join(__dirname, "database.db");
const cors = require("cors");
const jwt_decode = require("jwt-decode");
const fs = require("fs");
const https = require("https");
const io = require("socket.io")(3002, {
  cors: {
    origin: "*",
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const user = jwt_decode(token);
    const userData = {
      email: user.email,
      name: user.name,
      first_name: user.given_name,
      last_name: user.family_name,
    };

    socket.user = userData;

    next();
  } catch (err) {
    return next(new Error("Authentication failed"));
  }
});

io.on("connection", async (socket) => {
  const sqlq = `update users set socket_id=? where email=?`;

  await db.run(sqlq, [socket.id, socket.user.email]);

  // const sqlq1 = `select * from users inner join  userfriends on users.email =userfriends.user where userfriends.user=?;`;
  // const data = await db.all(sqlq1, [socket.user.email]);

  socket.broadcast.emit("get-friends", {
    type: 1,
    email: socket.user.email,
    socket_id: socket.id,
  });

  socket.on("send-message-to-friend", async (payload, callBack) => {
    const { message, reciever } = payload;

    try {
      const sqlq = "select socket_id from users where email=?";
      const receiverSocket = await db.get(sqlq, [reciever]);

      const sqlq2 =
        "insert into chatdata(sender,receiver,message_content,time) values(?,?,?,?)";
      const now = new Date();
      const lastId = await db.run(sqlq2, [
        socket.user.email,
        reciever,
        message,
        now.toString(),
      ]);

      const dataThing = {
        id: lastId.lastID,
        sender: socket.user.email,
        reciever,
        message_content: message,
        time: now.toString(),
      };
      if (receiverSocket !== null) {
        socket
          .to(receiverSocket.socket_id)
          .emit("send-message-to-friend", dataThing);
      }
      callBack(lastId.lastID);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("disconnect", async () => {
    const sqlq = `update users set socket_id=NULL where email=?`;
    await db.run(sqlq, [socket.user.email]);

    // const sqlq1 = `select * from users inner join  userfriends on users.email =userfriends.user where userfriends.user=?;`;
    // const data = await db.all(sqlq1, [socket.user.email]);
    socket.broadcast.emit("get-friends", { type: 0, email: socket.user.email });
  });
});

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  req.io = io;
  return next();
});

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

      res.send({ response: "User Added" });
    } else {
      res.send({ response: "User already exists" }).status(401);
    }
  } catch (error) {
    console.error(error);
  }
};

const auth = async (req, res, nxt) => {
  let jwtToken = req.headers["authorization"];

  const userDetails = jwt_decode(jwtToken);
  req.userDetails = userDetails;
  nxt();
};

app.get("/", async (req, res) => {
  const data = await db.all("select * from users");

  res.send(data);
});

app.post("/findwithemail", auth, async (req, res) => {
  const { email } = req.body;
  const userEmail = req.userDetails.email;
  const result = await db.all(
    `SELECT * FROM users WHERE email LIKE ? and  email <> '${userEmail}'`,
    [`%${email}%`]
  );

  res.send(result);
});

app.post("/findwithname", auth, async (req, res) => {
  const { name } = req.body;
  const { email } = req.userDetails;
  const result = await db.all(
    `SELECT * FROM users WHERE (name LIKE ? OR email LIKE ?) AND email <> ?`,
    [`%${name}%`, `%${name}%`, email]
  );

  res.send(result);
});

app.post("/testdata", userData, async (req, res) => {});

app.get("/userFriends", auth, async (req, res) => {
  const { email } = req.userDetails;
  const sqlq = `select * from users inner join  userfriends on users.email =userfriends.friend where userfriends.user=?;`;
  try {
    const data = await db.all(sqlq, [email]);

    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error).status(401);
  }
});

app.post("/addfriend", async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  const sqlq = `
      INSERT INTO userfriends (user, friend)
      VALUES (?, ?),(?,?);
  `;
  await db.run(sqlq, [userEmail, friendEmail, friendEmail, userEmail]);

  res.json({ message: "success" });
});

//only to test and will not be used in the final version
app.get("/chat/:sender/:receiver/", async (req, res) => {
  const { sender, receiver } = req.params;

  const sqlq = `select * from chatdata where (sender=? and receiver=?) or (sender=? and receiver=?) order by time desc`;
  try {
    const data = await db.all(sqlq, [sender, receiver, receiver, sender]);
    const sortedMessages = data.sort((a, b) => {
      const timeA = new Date(a.time);
      const timeB = new Date(b.time);

      // Compare the Date objects
      return timeA - timeB;
    });

    res.send(sortedMessages);
  } catch (error) {
    res.send(error).status(400);
  }
});

app.post("/chat/:sender/:receiver", async (req, res) => {
  const { sender, receiver } = req.params;
  const { message } = req.body;

  const sqlq = `insert into chatdata(sender,receiver,message_content,time)
                values(?,?,?,?)`;
  const date = new Date();

  try {
    const resp = await db.run(sqlq, [
      sender,
      receiver,
      message,
      date.toString(),
    ]);

    res.send(resp);
    console.log(resp);
  } catch (error) {
    console.log(error);
    res.send(error).status(400);
  }
});

app.get("/getuserdata/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const sqlq = `select * from users where email=?`;
    const data = await db.get(sqlq, [email.toLocaleLowerCase()]);

    res.send(data);
  } catch (e) {
    console.error(e);
  }
});

process.on("SIGINT", async () => {
  try {
    console.log("Received SIGINT. Cleaning up before exit...");
    const sqlq = `update users set socket_id=NULL`;
    await db.run(sqlq);
    console.log("rm usr");
    process.exit(0);
  } catch (e) {
    console.log(e);
  }
});

app.listen(3001, () => {
  console.log("server running on 3001");
});
