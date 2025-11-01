// ====== MODEL ======

// localStorage keys
const STORAGE_ACTIVE = "todo_active";
const STORAGE_TRASH  = "todo_trash";

function loadArray(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    }
    catch {
        return [];
    }
}

function saveArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
}

let activeTasks = loadArray(STORAGE_ACTIVE);
let trashTasks  = loadArray(STORAGE_TRASH);

// helper: unique id
function uuid() {
  return Date.now().toString(36) + Math.random().toString(16).slice(2);
}

// ====== CONTROLLER LOGIC ======

function addTask(title, deadline) {
  const newTask = {
    id: uuid(),
    title,
    deadline,
    done: false,
    createdAt: Date.now(),
  };
  activeTasks.push(newTask);
  saveArray(STORAGE_ACTIVE, activeTasks);
  render();
}

// ====== ACTION ======

function toggleDone(taskId) {
  const task = activeTasks.find(t => t.id === taskId);
  if (task) {
    task.done = !task.done;
    saveArray(STORAGE_ACTIVE, activeTasks); 
    render();
  }
}
function softDelete(taskId) {
  const taskIndex = activeTasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    const [task] = activeTasks.splice(taskIndex, 1);
    trashTasks.push(task);
    saveArray(STORAGE_ACTIVE, activeTasks);
    saveArray(STORAGE_TRASH, trashTasks);
    render();
  }
}

// ====== VIEW / RENDER ======

const listTitleEl = document.getElementById("list-title");
const taskListEl = document.getElementById("task-list");
const emptyStateEl = document.getElementById("empty-state");
const addFormSection = document.getElementById("add-form-section");
const formEl = document.getElementById("task-form");
const inputTitle = document.getElementById("task-title");
const inputDeadline = document.getElementById("task-deadline");

// nav links highlight
function updateNavActive(route) {
  document.querySelectorAll(".nav-link").forEach(link => {
    const isActive = link.getAttribute("href") === route;
    link.setAttribute("data-active", isActive ? "true" : "false");
  });
}

// format deadline to nice text
function formatDeadline(dlStr) {
  if (!dlStr) return "No deadline";
  const d = new Date(dlStr);
  // dd/mm/yyyy hh:mm
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth()+1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

// ====== RENDER ACTIVE ======

function renderActive() {
  listTitleEl.textContent = "Active Tasks";
  addFormSection.style.display = "block";
  taskListEl.innerHTML = "";
  if (activeTasks.length === 0) {
    emptyStateEl.style.display = "block";
    return;
  } else {
    emptyStateEl.style.display = "none";
  }

  activeTasks.forEach(task => {
    const li = document.createElement("li");
    li.dataset.id = task.id;

    const now = Date.now();
    const isOverdue = task.deadline && !task.done && new Date(task.deadline).getTime() < now;

    li.innerHTML = `
      <div class="flex justify-between items-center p-3 rounded-xl shadow-md border-2 transition-colors duration-300 hover:shadow-lg
        ${task.done ? "text-gray-400 bg-green-100" : isOverdue ? "bg-red-400 text-white" : "bg-white text-black"}">
        <div class="flex flex-col ${task.done ? 'line-through' : ''}">
          <span class="task-title block">${task.title}</span>
          <span class="task-deadline text-sm">${formatDeadline(task.deadline)}</span>
        </div>
        <div class="flex gap-2 items-center">
          <button class="btn-toggle text-xl px-2 py-1 rounded ${isOverdue ? "bg-red-600 text-white font-semibold" : task.done ? "bg-green-500 text-white" : "bg-gray-400 text-black"}">
            ${isOverdue ? "Overdue" : task.done ? "Checked" : "Pending"}</button>
          <button class="btn-delete text-xl">🗑️</button>
        </div>
      </div>
    `;
    taskListEl.appendChild(li);
  });

  // attach event listeners to buttons
  taskListEl.querySelectorAll(".btn-toggle").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.closest("li").dataset.id;
      toggleDone(id);
    });
  });
  taskListEl.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.closest("li").dataset.id;
      softDelete(id);
    });
  });
}

// ====== RENDER TRASH ======

function renderTrash() {

}

// ====== RENDER (ROUTER & FORM SUBMIT) ======

function render() {
  const route = location.hash || "#/active";
  if (route === "#/trash") renderTrash();
  else renderActive();
}

formEl.addEventListener("submit", e => {
  e.preventDefault(); // chặn reload form
  const title = inputTitle.value.trim();
  const deadline = inputDeadline.value;
  if (!title) {
    alert("Please enter task title!");
    return;
  }
  addTask(title, deadline);
  inputTitle.value = "";
  inputDeadline.value = "";
});

// ====== INITIAL RENDER ======

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  if (!location.hash) location.hash = "#/active";
  render();
});