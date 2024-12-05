import express, { urlencoded } from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import fs from "fs";

const PORT = 8080;
const app = express();

//middlewares
app.use(express.json());
app.use(urlencoded( {extended:true} ));
app.use(express.static("public"));

app.engine("handlebars", handlebars.engine());
app.set("views", "./src/views");
app.set("view engine", "handlebars");

app.get("/", async (req, res) => {
    try{
        res.status(200).render("index");
    } catch (error){
        res.status(404).send(error.message);
    }

})

const httpServer = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});


//Config Socket.io
const io = new Server(httpServer);

//Config message file
let messages = [];
const messagesPath = "./src/data/messages.json"

messages = JSON.parse(fs.readFileSync(messagesPath, "utf-8"));

io.on("connection", (socket) => {
    console.log(`Nuevo cliente conectado con el ID: ${socket.id}`);
    socket.on("newUser", (data) => {
        socket.broadcast.emit("newUser", data);
        socket.emit("messageLogs", messages);
    });

    socket.on("message", async (data) => {
        messages.push(data);
        io.emit("messageLogs", messages);
        try {
            await fs.promises.writeFile(messagesPath, JSON.stringify(messages, null, 2));
        } catch (error) {
            console.error("No se pudieron guardar los mensajes: ", error.message);
        }
    });
});
