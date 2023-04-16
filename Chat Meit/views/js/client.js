
const socket = io();

let fileURL;

//  Formularios
const formLogin = document.querySelector("#formLogin");
const formContentChat = document.querySelector(".body-chat");
const formShowUsers = document.querySelector("#formShowUsers");
const formChatGrupal = document.querySelector("#formChatGrupal");

//  Textbox's
const txtUserNickName = document.querySelector("#userNickName");
const txtUserMessage = document.querySelector("#userMessage");

const emojiBtn = document.querySelector("#emojiBtn");
const emojiWrapper = document.querySelector("#emojiWrapper");

const emojis = document.querySelectorAll(".emoji");
const emojiImg = document.getElementById("emojiImg");

//  File - Image
const userFile = document.querySelector("#userFile");

//  Button's
const btnrRegisterUser = document.querySelector("#registerUser");
const btnSendMessage = document.querySelector("#sendMessage");
const btnSendFile = document.querySelector("#sendFile");

//  Print
const printUsersActive = document.querySelector("#usersActive");
const printMessages = document.querySelector("#messages");

formContentChat.style.display = "none";
formShowUsers.style.display = "none";
formChatGrupal.style.display = "none";

socket.on("login", () => {
  alert(
    "¡Bienvenido " +
      txtUserNickName.value.trim() +
      "!\nRecuerda, respetar a los demás usuarios."
  );
  formLogin.style.display = "none";
  formContentChat.style.display = "flex";
  formShowUsers.style.display = "block";
  formChatGrupal.style.display = "block";
});

socket.on("userExists", () => {
  alert(
    "El nickname: " +
      txtUserNickName.value.trim() +
      " ya está en uso, intenta con otro."
  );
  txtUserNickName.value = "";
});

socket.on("activeSessions", (users) => {
  printUsersActive.innerHTML = "";
  for (const user in users) {
    printUsersActive.insertAdjacentHTML("beforeend", `<li>${user}</li>`);
  }
});

socket.on("sendMessage", ({ message, user, image, file }) => {
  printMessages.insertAdjacentHTML(
    "beforeend",
    `<div class="message frnd_message"><p>${message}<br /><span>${user}</span></p></div>`
  );
  if (image !== undefined) {
    const imagen = document.createElement("img");
    imagen.src = image;
    const link = document.createElement("a");
    link.href = image;
    link.target = "_blank";
    link.appendChild(imagen);
    printMessages.appendChild(link);
  }
  if (file !== undefined) {
    const extension = file.name.split(".").pop();
    if (["jpg", "png", "pdf", "word"].includes(extension)) {
      const image = document.createElement("img");
      image.src = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.target = "_blank";
      link.appendChild(image);
      printMessages.appendChild(link);
    } else if (extension === "pdf") {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.target = "_blank";
      link.download = file.name;
      link.innerText = file.name;
      printMessages.appendChild(link);
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.innerText = file.name;
      printMessages.appendChild(link);
    }
  }
  printMessages.scrollTop = printMessages.scrollHeight;
});




txtUserNickName.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    btnrRegisterUser.click();
  }
});

btnrRegisterUser.addEventListener("click", () => {
  if (txtUserNickName.value.trim() != "") {
    let username = txtUserNickName.value.trim();
    socket.emit("register", username);
  }
});

btnSendMessage.addEventListener("click", () => {
  if (fileURL != undefined) {
    if (txtUserMessage.value.startsWith("-private:")) {
      const selectUser = txtUserMessage.value.split(" ")[1];
      const message = txtUserMessage.value.substr(selectUser.length + 10);
      socket.emit("sendMessagesPrivate", {
        message,
        image: fileURL,
        selectUser,
      });
    } else {
      socket.emit("sendMessage", {
        message: txtUserMessage.value.trim(),
        image: fileURL,
      });
    }
  } else {
    if (txtUserMessage.value.trim() != "") {
      if (txtUserMessage.value.startsWith("-private:")) {
        const selectUser = txtUserMessage.value.split(" ")[1];
        const message = txtUserMessage.value.substr(selectUser.length + 10);
        socket.emit("sendMessagesPrivate", {
          message,
          image: fileURL,
          selectUser,
        });
      } else {
        socket.emit("sendMessage", {
          message: txtUserMessage.value.trim(),
          image: fileURL,
        });
      }
    }
  }

  txtUserMessage.value = "";
  fileURL = undefined;
  printMessages.scrollTop = printMessages.scrollHeight;
});

txtUserMessage.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    if (fileURL != undefined) {
      if (txtUserMessage.value.startsWith("-private:")) {
        const selectUser = txtUserMessage.value.split(" ")[1];
        const message = txtUserMessage.value.substr(selectUser.length + 10);
        socket.emit("sendMessagesPrivate", {
          message,
          image: fileURL,
          selectUser,
        });
      } else {
        socket.emit("sendMessage", {
          message: txtUserMessage.value.trim(),
          image: fileURL,
        });
      }
    } else {
      if (txtUserMessage.value.trim() != "") {
        if (txtUserMessage.value.startsWith("-private:")) {
          const selectUser = txtUserMessage.value.split(" ")[1];
          const message = txtUserMessage.value.substr(selectUser.length + 10);
          socket.emit("sendMessagesPrivate", {
            message,
            image: fileURL,
            selectUser,
          });
        } else {
          socket.emit("sendMessage", {
            message: txtUserMessage.value.trim(),
            image: fileURL,
          });
        }
      }
    }
    txtUserMessage.value = "";
    fileURL = undefined;
  }

  printMessages.scrollTop = printMessages.scrollHeight;
});

btnSendFile.addEventListener("click", () => {
  userFile.click();
});

userFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    fileURL = reader.result;
  };
  reader.readAsDataURL(file);
  fileURL
    ? alert("Error al adjuntar, seleccione nuevamente.")
    : alert("Foto adjunta, lista para enviar.");
});

emojiBtn.addEventListener("click", () => {
  emojiWrapper.style.display = "block";
});

emojis.forEach((emoji) => {
  emoji.addEventListener("click", () => {
    const selectedEmoji = emoji.getAttribute("data-emoji");
    txtUserMessage.value += selectedEmoji;
    emojiWrapper.style.display = "none";
  }); 
});