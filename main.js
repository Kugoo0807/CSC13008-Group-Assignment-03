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

function hardDelete(taskId) {
  const idx = trashTasks.findIndex(t => t.id === taskId);
  if (idx !== -1) return;
  trashTasks.splice(idx, 1);
  saveArray(STORAGE_TRASH, trashTasks);
  render();
}
function restoreTask(taskId) {
  const idx = trashTasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  const [task] = trashTasks.splice(idx, 1);
  activeTasks.push(task);
  saveArray(STORAGE_TRASH, trashTasks);
  saveArray(STORAGE_ACTIVE, activeTasks);
  render();
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
      <div 
        class="
          flex items-center justify-between
          p-3 mb-5 
          rounded-xl shadow-md border-2 
          transition-colors duration-300 md:hover:shadow-xl
          ${task.done
            ? "bg-gradient-to-br from-emerald-50/70 to-emerald-100/50 text-slate-500 ring-emerald-200 border-emerald-300"
            : isOverdue
              ? "bg-gradient-to-br from-rose-500/90 to-rose-600/80 text-white ring-rose-300/60 border-rose-400"
              : "bg-gradient-to-br from-white/80 to-slate-50/70 text-slate-900 ring-slate-200 border-slate-200"}"
      >
        
        <div class="flex flex-col ${task.done ? 'line-through' : ''}">
          <span class="task-title block">${task.title}</span>
          <span class="task-deadline text-sm">${formatDeadline(task.deadline)}</span>
        </div>
        
        <div class="flex gap-4 md:gap-5 items-center">
          <button 
            class="
              btn-toggle text-sm md:text-base px-2 py-1 rounded
              shadow md:hover:shadow-md
              ring-1 ring-inset transition-all duration-200
              ${isOverdue
                ? "bg-rose-700 text-white font-semibold ring-rose-300 md:hover:bg-rose-600"
                : task.done
                  ? "bg-emerald-500 text-white ring-emerald-300 md:hover:bg-emerald-600"
                  : "bg-slate-200 text-slate-900 ring-slate-300 md:hover:bg-slate-300"}
            "
          >
            ${isOverdue ? "Overdue" : task.done ? "Checked" : "Pending"}
          </button>
          
          <button 
            class="
              btn-delete text-sm md:text-base
              px-2 py-1 rounded
              bg-white/10 backdrop-blur-md md:hover:bg-white/50
              ring-1 ring-inset ring-slate-300/70
              shadow md:hover:shadow-md
            "
          >
            🗑️
          </button>
        
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
function buildTrashItem(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;

  const now = Date.now();
  const isOverdue = task.deadline && !task.done && new Date(task.deadline).getTime() < now;

  li.innerHTML = `
    <div
      class="
        flex items-center justify-between
        p-3 mb-5 rounded-xl shadow-md border-2
        bg-gradient-to-br from-slate-50/80 to-white/80
        ${task.done ? 'text-slate-500' : 'text-slate-900'}
        ring-slate-200 border-slate-200
      "
    >
      <div class="flex flex-col ${task.done ? 'line-through' : ''}">
        <span class="task-title block">🗑️ ${task.title}</span>
        <span class="task-deadline text-sm">${formatDeadline(task.deadline)}</span>
      </div>

      <div class="flex gap-3 items-center">
        <button
          class="
            btn-restore text-sm md:text-base px-2 py-1 rounded
            bg-emerald-500 text-white ring-1 ring-inset ring-emerald-300
            shadow md:hover:bg-emerald-600 md:hover:shadow-md transition-all duration-200
          "
          title="Restore this task to Active"
        >
          Restore
        </button>

        <button
          class="
            btn-harddelete text-sm md:text-base px-2 py-1 rounded
            ${isOverdue ? 'bg-rose-700' : 'bg-rose-600'}
            text-white ring-1 ring-inset ring-rose-300
            shadow md:hover:bg-rose-700 md:hover:shadow-md transition-all duration-200
          "
          title="Delete this task permanently"
        >
          Delete forever
        </button>
      </div>
    </div>
  `;

  // events
  li.querySelector(".btn-restore").addEventListener("click", () => {
    restoreTask(task.id);
  });
  li.querySelector(".btn-harddelete").addEventListener("click", () => {
    if (confirm("Delete permanently? This cannot be undone.")) {
      hardDelete(task.id);
    }
  });

  return li;
}
function renderTrash() {
  listTitleEl.textContent = "Trash";
  addFormSection.style.display = "none";   // không thêm task ở Trash
  taskListEl.innerHTML = "";

  if (!trashTasks.length) {
    emptyStateEl.style.display = "block";
    emptyStateEl.textContent = "Trash is empty.";
    return;
  }
  emptyStateEl.style.display = "none";

  // newest first
  [...trashTasks]
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach(task => taskListEl.appendChild(buildTrashItem(task)));
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