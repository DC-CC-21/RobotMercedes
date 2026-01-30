const socketConnectionEl = document.getElementById("socketConnection");
const arduinoConnection = document.getElementById("arduinoConnection");
const portsEl = document.getElementById("ports");
const piTempEl = document.getElementById("piTemp");

// Sensor Data
const accelerometerEl = document.getElementById("accelerometer");
const gyroEl = document.getElementById("gyro");
const socket = io.connect("/");

// Buttons
const lightsBtn = document.getElementById("lights")
const lightbarBtn = document.getElementById("lightbar")

socket.on("connect", () => {
  socketConnectionEl.innerText = "Socket Connected";
});
socket.on("disconnect", () => {
  socketConnectionEl.innerText = "Socket Disconnected";
  arduinoConnection.innerText = "Arduino Disconnected";
});

socket.on("arduino_status", (data) => {
  if (data.connected) {
    arduinoConnection.innerText = "Arduino Connected";
  } else {
    arduinoConnection.innerText = "Arduino Disconnected";
  }
});
socket.on("ports", (data) => {
  console.log(data);
  for (let i of data.ports) {
    const option = document.createElement("option");
    option.value = i;
    option.innerHTML = i;
    portsEl.append(option);
  }
  portsEl.firstChild.selected = true;
});
socket.on("pi_temp", (data) => {
  if (data.temperature) {
    piTempEl.innerText = data.temperature + " °C";
  }
});
socket.on("sensor_data", (data) => {
  if (data.accelerometer) {
    accelerometerEl.innerText = `X: ${data.accelerometer.x}, Y: ${data.accelerometer.y}, Z: ${data.accelerometer.z}`;
  }
  if (data.gyro) {
    gyroEl.innerText = `X: ${data.gyro.x}, Y: ${data.gyro.y}, Z: ${data.gyro.z}`;
  }
});

let lightsOn = false;
lightsBtn.addEventListener("click", (e) => {
  e.target.classList.toggle("on")
  lightsOn = !lightsOn;
  socket.emit("lights", {
    lights_on:lightsOn
  })
})

let lightbarOn = false;
lightbarBtn.addEventListener("click", (e) => {
  e.target.classList.toggle("on")
  lightbarOn = !lightbarOn;
  socket.emit("lightbar", {
    lightbar_on:lightbarOn
  })
})