import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, "dist")));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

let users = [
  {
    id: 1,
    name: "Cleber",
    profilePicture: "cleber",
  },
  {
    id: 2,
    name: "Will",
    profilePicture: "will",
  },
  {
    id: 3,
    name: "Denini",
    profilePicture: "denini",
  },
  {
    id: 4,
    name: "Dayvid",
    profilePicture: "dayvid",
  },
  {
    id: 5,
    name: "Wedson",
    profilePicture: "wedson",
  },
  {
    id: 6,
    name: "Cássio",
    profilePicture: "cassio",
  },
  {
    id: 7,
    name: "Thami",
    profilePicture: "thami",
  },
  {
    id: 8,
    name: "Zé",
    profilePicture: "ze",
  },
  {
    id: 9,
    name: "Edu",
    profilePicture: "edu",
  },
  {
    id: 10,
    name: "Geo",
    profilePicture: "geo",
  },
  {
    id: 11,
    name: "Jorge",
    profilePicture: "jorge",
  },
  {
    id: 12,
    name: "Nara",
    profilePicture: "nara",
  },
  {
    id: 13,
    name: "Elivelton",
    profilePicture: "elivelton",
  },
  {
    id: 14,
    name: "Abel",
    profilePicture: "abel",
  },
];

let globalTimer = {
  active: false,
  timeRemaining: 0,
  userId: null,
};

let timerIntervalId = null;

function getSortedUsers() {
  const handRaisedUsers = users.filter((u) => u.handRaised);
  const otherUsers = users.filter((u) => !u.handRaised);

  handRaisedUsers.sort((a, b) => {
    return (
      new Date(a.handRaisedTime).getTime() -
      new Date(b.handRaisedTime).getTime()
    );
  });

  return [...handRaisedUsers, ...otherUsers];
}

function moveUserToEnd(userId) {
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    const user = users[userIndex];
    users.splice(userIndex, 1);
    const handRaisedUsers = users.filter((u) => u.handRaised);
    const indexToInsert = handRaisedUsers.length;
    users.splice(indexToInsert, 0, user);
  }
}

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.emit("initialData", { users: getSortedUsers(), globalTimer });

  socket.on("toggleHandRaised", (userId) => {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      const user = users[userIndex];
      user.handRaised = !user.handRaised;
      user.handRaisedTime = user.handRaised ? new Date().toISOString() : null;

      if (user.handRaised) {
        moveUserToEnd(userId);
      } else {
        moveUserToEnd(userId);
      }

      io.emit("updateUsers", getSortedUsers());
    }
  });

  socket.on("startGlobalTimer", ({ userId, timerSeconds }) => {
    if (globalTimer.active) {
      globalTimer.userId = userId;
      globalTimer.timeRemaining = timerSeconds;
    } else {
      globalTimer.active = true;
      globalTimer.userId = userId;
      globalTimer.timeRemaining = timerSeconds;

      timerIntervalId = setInterval(() => {
        if (globalTimer.timeRemaining > 0) {
          globalTimer.timeRemaining--;
          io.emit("updateGlobalTimer", globalTimer);
        } else {
          clearInterval(timerIntervalId);
          globalTimer.active = false;
          const currentUser = users.find((u) => u.id === globalTimer.userId);
          if (currentUser) {
            currentUser.handRaised = false;
            currentUser.handRaisedTime = null;
            moveUserToEnd(globalTimer.userId);
          }
          globalTimer.userId = null;
          io.emit("updateUsers", getSortedUsers());
          io.emit("updateGlobalTimer", globalTimer);
          io.emit("playBellSound");
        }
      }, 1000);
    }
    io.emit("updateGlobalTimer", globalTimer);
  });

  socket.on("stopGlobalTimer", () => {
    if (globalTimer.active) {
      globalTimer.active = false;
      globalTimer.timeRemaining = 0;
      globalTimer.userId = null;
      clearInterval(timerIntervalId);
      io.emit("updateGlobalTimer", globalTimer);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
