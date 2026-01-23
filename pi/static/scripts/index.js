const consoleEl = document.getElementById("console");
console.Log = function (message) {
  console.log(message);
  const span = document.createElement("span");

  span.innerText = message;
  consoleEl.appendChild(span);
  consoleEl.scrollTop = consoleEl.scrollHeight;
};

const consoleButton = document.querySelector(".consoleContainer > span");
consoleButton.addEventListener("click", (e) => {
  e.target.parentElement.classList.toggle("open");
});

// === JOYSTICKS === //
// Joystick values
let joyValues = {
  j1: 0,
  j2: 0,
};
let prevJoyValues = { ...joyValues };

// Joystick 1
const j1Div = document.getElementById("joyDiv");
const j1Span = j1Div.querySelector("span");
const j1 = new Joystick(
  j1Div,
  {
    strokeThickness: 10,
    orientation: "x",
    joyColor: "#a00",
    stickColor: "#f00",
  },
  function (_, angle, normalMagnitude) {
    joyValues.j1 = normalMagnitude * (angle > 90 && angle < 270 ? -1 : 1);
  },
);

// Joystick 2
const j2Div = document.getElementById("joy2Div");
const j2Span = j2Div.querySelector("span");
const j2 = new Joystick(
  j2Div,
  {
    strokeThickness: 10,
    orientation: "y",
    joyColor: "#020",
    stickColor: "#070",
  },
  function (_, angle, normalMagnitude) {
    joyValues.j2 = normalMagnitude * (angle > 0 && angle < 180 ? -1 : 1);
  },
);

// Send joystick data at regular intervals if changed
setInterval(() => {
  if (JSON.stringify(joyValues) !== JSON.stringify(prevJoyValues)) {
    prevJoyValues = { ...joyValues };
    socket.emit("joystick_data", joyValues);
  }
}, 200);
