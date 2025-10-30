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
/* 
****
- Xây dựng 4 hàm:
Active:
+ toggleDone: Nhấn để Mark/Unmark - tác động vô biến done ở trên.
+ softDelete: Đưa task từ active vào trash.
Trash:
+ hardDelete: Xóa vĩnh viễn task.
+ restoreTask: Đưa task từ trash vào active.
****
*/

// ====== VIEW / RENDER ======

const listTitleEl = document.getElementById("list-title");
const taskListEl = document.getElementById("task-list");
const emptyStateEl = document.getElementById("empty-state");
const addFormSection = document.getElementById("add-form-section");

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

// **** Build single <li> cho 2 route trash và active ****

// **** Xây dựng hàm Render, các hàm liên quan đến ROUTER - Xử lí EVENT ****

// ====== INITIAL RENDER ======
render();