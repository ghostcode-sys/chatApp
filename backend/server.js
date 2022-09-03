const express = require("express");

const {userRoute} = require("./Routes")

const app = express();

const http = require("http").Server(app);

require("./connection")
const {findValue, insertInMap, removeKey} = require("./Socket")


const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});



io.on("connection", (socket) => {
  console.log("connected")
  socket.on("disconnect", () => {
    let val = findValue(socket.id)
    removeKey(val)
    removeKey(socket.id)
    console.log("disconnected")
  })
  socket.on("userInfo", ({id}, callback) => {
    insertInMap(id, socket.id)
    callback("Welcome to Chatty-Chat")
  })

  socket.on("send-msg", ({id, msg}, callback) => {
    const socketId = findValue(id)
    socket.to(socketId).emit("recieve-msg", {id, msg}, (isRecieved) => {
      if(isRecieved == true) callback(true)
      else callback(false)
    })
  })

});


app.use(express.json())
app.use(express.urlencoded({extended: false }))

app.use("/user", userRoute)



http.listen(3001, () => {
  console.log("server started");
});
