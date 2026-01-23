const socketConnectionEl = document.getElementById("socketConnection");
const arduinoConnection = document.getElementById("arduinoConnection");
const piTempEl = document.getElementById("piTemp");
const socket = io.connect("/");

socket.on("connect", () => {
  socketConnectionEl.innerText = "Socket Connected";
});
socket.on("disconnect", () => {
  socketConnectionEl.innerText = "Socket Disconnected";
});

socket.on("arduino_status", (data) => {
  if (data.connected) {
    arduinoConnection.innerText = "Arduino Connected";
  } else {
    arduinoConnection.innerText = "Arduino Disconnected";
  }
});
socket.on("pi_temp", (data) => {
  if (data.temperature) {
    piTempEl.innerText = data.temperature + " °C";
  }
});
