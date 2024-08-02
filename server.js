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
    active: true,
  },
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const originalList = [
  {
    id: 1,
    name: "Cleber",
    profilePicture: "cleber",
    active: true,
  },
  {
    id: 2,
    name: "Will",
    profilePicture: "will",
    active: true,
  },
  {
    id: 3,
    name: "Denini",
    profilePicture: "denini",
    active: true,
  },
  {
    id: 4,
    name: "Dayvid",
    profilePicture: "dayvid",
    active: true,
  },
  {
    id: 5,
    name: "Wedson",
    profilePicture: "wedson",
    active: true,
  },
  {
    id: 6,
    name: "Cássio",
    profilePicture: "cassio",
    active: true,
  },
  {
    id: 7,
    name: "Thami",
    profilePicture: "thami",
    active: true,
  },
  {
    id: 8,
    name: "Zé",
    profilePicture: "ze",
    active: true,
  },
  {
    id: 9,
    name: "Edu",
    profilePicture: "edu",
    active: true,
  },
  {
    id: 10,
    name: "Geo",
    profilePicture: "geo",
    active: true,
  },
  {
    id: 11,
    name: "Jorge",
    profilePicture: "jorge",
    active: true,
  },
  {
    id: 12,
    name: "Nara",
    profilePicture: "nara",
    active: true,
  },
  {
    id: 13,
    name: "Elivelton",
    profilePicture: "elivelton",
    active: true,
  },
  {
    id: 14,
    name: "Abel",
    profilePicture: "abel",
    active: true,
  },
];

let users = [...originalList];

let globalTimer = {
  active: false,
  timeRemaining: 0,
  userId: null,
};

let timerIntervalId = null;

function getSortedUsers() {
  const handRaisedUsers = users.filter((u) => u.handRaised && u.active);
  const otherUsers = users.filter((u) => !u.handRaised && u.active);

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

  socket.emit("initialData", {
    users: getSortedUsers(),
    globalTimer,
    globalUsers: originalList,
  });

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

  socket.on("setActiveState", ({ userId, active }) => {
    const userIndex = originalList.findIndex((u) => u.id === userId);

    if (userIndex !== -1) {
      const originalUser = originalList[userIndex];
      const user = users[userIndex];

      originalUser.active = active;
      user.active = active;

      io.emit("updateGlobalUserList", originalList);

      const otherUsers = users.filter((u) => u.active);

      io.emit("updateUsers", otherUsers);
    }
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
