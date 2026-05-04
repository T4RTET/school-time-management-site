const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const revealItems = document.querySelectorAll(".reveal");
const heroClock = document.getElementById("hero-clock");

const savedTheme = localStorage.getItem("graduate_theme");
if (savedTheme) {
  root.dataset.theme = savedTheme;
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("graduate_theme", nextTheme);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));

let heroSeconds = 25 * 60;
setInterval(() => {
  heroSeconds -= 1;
  if (heroSeconds < 24 * 60 + 41) {
    heroSeconds = 25 * 60;
  }
  const minutes = Math.floor(heroSeconds / 60).toString().padStart(2, "0");
  const seconds = (heroSeconds % 60).toString().padStart(2, "0");
  if (heroClock) {
    heroClock.textContent = `${minutes}:${seconds}`;
  }
}, 1000);

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tool-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const panelId = tab.dataset.tab;
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === panelId));
  });
});

const timeLeft = document.getElementById("time-left");
const progressCircle = document.querySelector(".progress-circle");
const timerMode = document.getElementById("timer-mode");
const startTimer = document.getElementById("start-timer");
const pauseTimer = document.getElementById("pause-timer");
const resetTimer = document.getElementById("reset-timer");
const presets = document.querySelectorAll(".preset");

let timerTotal = 25 * 60;
let timerRemaining = timerTotal;
let timerId = null;
let workMode = true;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderTimer() {
  if (timeLeft) {
    timeLeft.textContent = formatTime(timerRemaining);
  }

  if (progressCircle) {
    const circumference = 590;
    const progress = timerRemaining / timerTotal;
    progressCircle.style.strokeDashoffset = `${circumference - circumference * progress}`;
  }

  if (timerMode) {
    timerMode.textContent = workMode ? "Учеба" : "Перерыв";
  }
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = null;
}

function switchMode() {
  workMode = !workMode;
  timerTotal = workMode ? 25 * 60 : 5 * 60;
  timerRemaining = timerTotal;
  presets.forEach((preset) => preset.classList.toggle("active", Number(preset.dataset.minutes) * 60 === timerTotal));
  renderTimer();
}

startTimer?.addEventListener("click", () => {
  if (timerId) return;

  timerId = window.setInterval(() => {
    timerRemaining -= 1;

    if (timerRemaining <= 0) {
      stopTimer();
      switchMode();
      document.body.animate(
        [
          { filter: "brightness(1)" },
          { filter: "brightness(1.08)" },
          { filter: "brightness(1)" },
        ],
        { duration: 600, iterations: 1 }
      );
      return;
    }

    renderTimer();
  }, 1000);
});

pauseTimer?.addEventListener("click", stopTimer);

resetTimer?.addEventListener("click", () => {
  stopTimer();
  timerRemaining = timerTotal;
  renderTimer();
});

presets.forEach((preset) => {
  preset.addEventListener("click", () => {
    stopTimer();
    workMode = Number(preset.dataset.minutes) !== 5;
    timerTotal = Number(preset.dataset.minutes) * 60;
    timerRemaining = timerTotal;
    presets.forEach((item) => item.classList.toggle("active", item === preset));
    renderTimer();
  });
});

renderTimer();

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");

const defaultTasks = [
  { text: "25 минут математики без телефона", done: false },
  { text: "Повторить 12 терминов по обществознанию", done: false },
  { text: "Собрать сумку вечером", done: false },
];

let tasks = JSON.parse(localStorage.getItem("graduate_tasks") || "null") || defaultTasks;

function saveTasks() {
  localStorage.setItem("graduate_tasks", JSON.stringify(tasks));
}

function renderTasks() {
  if (!taskList) return;

  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Отметить задачу");
    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const label = document.createElement("span");
    label.textContent = task.text;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-task";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Удалить задачу");
    remove.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, label, remove);
    taskList.append(item);
  });

  const completed = tasks.filter((task) => task.done).length;
  if (taskCount) {
    taskCount.textContent = `${completed}/${tasks.length}`;
  }
}

taskForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({ text, done: false });
  taskInput.value = "";
  saveTasks();
  renderTasks();
});

renderTasks();

const frogInput = document.getElementById("frog-input");
const saveFrog = document.getElementById("save-frog");
const frogNote = document.getElementById("frog-note");

const savedFrog = localStorage.getItem("graduate_frog");
if (savedFrog && frogInput && frogNote) {
  frogInput.value = savedFrog;
  frogNote.textContent = `Завтра первым делом: ${savedFrog}`;
}

saveFrog?.addEventListener("click", () => {
  const frog = frogInput.value.trim();
  if (!frog) {
    frogNote.textContent = "Сначала запиши конкретную сложную задачу.";
    return;
  }

  localStorage.setItem("graduate_frog", frog);
  frogNote.textContent = `Закреплено: ${frog}`;
  frogNote.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.02)" },
      { transform: "scale(1)" },
    ],
    { duration: 320, iterations: 1 }
  );
});

document.querySelectorAll(".matrix-cell").forEach((cell) => {
  cell.addEventListener("click", () => {
    const action = cell.querySelector("b")?.textContent || "Запланировать";
    const suggestion = {
      Сделать: "Срочная задача",
      Запланировать: "Подготовка к экзамену заранее",
      Ограничить: "Сообщения и чужие просьбы",
      Удалить: "Бесконечная лента",
    }[action];

    if (!suggestion) return;
    tasks.unshift({ text: `${action}: ${suggestion}`, done: false });
    saveTasks();
    renderTasks();
    document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
