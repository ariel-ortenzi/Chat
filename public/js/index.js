const socket = io();

let user;
let chatBox = document.getElementById("chatBox");
let sendMessageBtn = document.getElementById("sendMessageBtn");
let emojiBtn = document.getElementById("emojiBtn");
let emojiPicker = document.getElementById("emojiPicker");

Swal.fire({
    title: "Nickname",
    input: "text",
    text: "Ingrese un nickname para comenzar",
    inputValidator: (value) => {
        return !value && "Por favor ingrese nickname para continuar";
    },
    allowOutsideClick: false,
}).then((result) => {
    user = result.value;
    socket.emit("newUser", user);
});

// Emojis hide/show
emojiBtn.addEventListener("click", () => {
    emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
});

// Emoji funtion
function insertEmoji(emoji) {
    chatBox.value += emoji;
    chatBox.focus();
    emojiPicker.style.display = "none";
}

// Listener "Enter" key
chatBox.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Listener event "Click"
sendMessageBtn.addEventListener("click", () => {
    sendMessage();
});

// Function send message
function sendMessage() {
    if (chatBox.value.trim().length > 0) {
        socket.emit("message", { user: user, message: chatBox.value });
        chatBox.value = ""; // Limpiar el campo de texto
    }
}

// Render messages
socket.on("messageLogs", (data) => {
    let messagesLogs = document.getElementById("messageLogs");
    messagesLogs.innerHTML = "";

    data.forEach((messageLog) => {
        const div = document.createElement("div");

        //Messages styles
        if (messageLog.user === user) {
            div.classList.add("message", "user"); // User
        } else {
            div.classList.add("message", "other"); // Others
        }

        // Rempleace text secuence for emoji
        div.innerHTML = `<strong>${messageLog.user}:</strong> ${messageLog.message.replace(/:\)/g, '😊').replace(/:D/g, '😂').replace(/<3/g, '❤️')}`;

        messagesLogs.appendChild(div);
    });

    // Auto-scroll
    messagesLogs.scrollTop = messagesLogs.scrollHeight;
});

// Notification new user
socket.on("newUser", (data) => {
    Swal.fire({
        text: `${data} se ha conectado`,
        toast: true,
        position: "bottom-right",
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
    });
});
