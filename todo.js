// ================================
// Global State
// ================================
let state = {
    tasks: [],
    currentFilter: "all"
};

// ================================
// DOM Elements
// ================================
const todoForm = document.getElementById("todo-form");
const taskInput = document.getElementById("task-input");
const taskCategory = document.getElementById("task-category");
const taskPriority = document.getElementById("task-priority");
const taskDate = document.getElementById("task-date");

const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

const itemsLeftCounter = document.getElementById("items-left");

const filterButtons = document.querySelectorAll(".filter-btn");

// ================================
// Load Tasks
// ================================
document.addEventListener("DOMContentLoaded", () => {

    const localTasks = localStorage.getItem("taskspace_tasks");

    if (localTasks) {
        state.tasks = JSON.parse(localTasks);
    }

    const today = new Date().toISOString().split("T")[0];
    taskDate.min = today;

    render();
});

// ================================
// Save Local Storage
// ================================
function saveToLocalStorage() {
    localStorage.setItem(
        "taskspace_tasks",
        JSON.stringify(state.tasks)
    );
}

// ================================
// Format Date
// ================================
function formatDate(dateString) {

    if (!dateString) return "No Date";

    const options = {
        month: "short",
        day: "numeric"
    };

    return new Date(dateString).toLocaleDateString(undefined, options);
}

// ================================
// Add Task
// ================================
todoForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const text = taskInput.value.trim();

    if (
        text === "" ||
        taskCategory.value === "" ||
        taskPriority.value === "" ||
        taskDate.value === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    const task = {

        id: Date.now().toString(),

        text: text,

        category: taskCategory.value,

        priority: taskPriority.value,

        dueDate: formatDate(taskDate.value),

        completed: false
    };

    state.tasks.push(task);

    saveToLocalStorage();

    render();

    todoForm.reset();

    taskDate.min = new Date().toISOString().split("T")[0];
});

// ================================
// Event Delegation
// ================================
taskList.addEventListener("click", (e) => {

    const taskItem = e.target.closest(".task-item");

    if (!taskItem) return;

    const taskId = taskItem.dataset.id;

    // Checkbox
    if (
        e.target.matches('input[type="checkbox"]') ||
        e.target.closest(".checkbox-wrapper")
    ) {

        state.tasks = state.tasks.map(task => {

            if (task.id === taskId) {

                return {
                    ...task,
                    completed: !task.completed
                };
            }

            return task;

        });

        saveToLocalStorage();

        render();

        return;
    }

    // Delete Button
    if (e.target.closest(".btn-delete")) {

        state.tasks = state.tasks.filter(task => task.id !== taskId);

        saveToLocalStorage();

        render();
    }

});

// ================================
// Filter Buttons
// ================================
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        state.currentFilter = button.dataset.filter;

        render();

    });

});

// ================================
// Render Tasks
// ================================
function render() {

    let filteredTasks = [...state.tasks];

    if (state.currentFilter === "active") {

        filteredTasks = filteredTasks.filter(task => !task.completed);

    }

    else if (state.currentFilter === "completed") {

        filteredTasks = filteredTasks.filter(task => task.completed);

    }

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    }

    else {

        emptyState.style.display = "none";

        filteredTasks.forEach(task => {

            const li = document.createElement("li");

            li.className = `
                task-item
                priority-${task.priority}
                ${task.completed ? "completed" : ""}
            `;

            li.dataset.id = task.id;

            li.innerHTML = `

                <div class="task-left-side">

                    <label class="checkbox-wrapper">

                        <input
                            type="checkbox"
                            ${task.completed ? "checked" : ""}
                        >

                    </label>

                    <div class="task-details">

                        <span class="task-text">

                            ${escapeHTML(task.text)}

                        </span>

                        <div class="task-tags">

                            <span class="tag-cat">

                                ${task.category}

                            </span>

                            <span class="tag-date">

                                ⏱ ${task.dueDate}

                            </span>

                        </div>

                    </div>

                </div>

                <button
                    class="btn-delete"
                    title="Delete Task">

                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">

                        <polyline points="3 6 5 6 21 6"></polyline>

                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>

                        <line x1="10" y1="11" x2="10" y2="17"></line>

                        <line x1="14" y1="11" x2="14" y2="17"></line>

                    </svg>

                </button>

            `;

            taskList.appendChild(li);

        });

    }

    const activeCount = state.tasks.filter(task => !task.completed).length;

    itemsLeftCounter.textContent =
        `${activeCount} item${activeCount !== 1 ? "s" : ""} left`;

}

// ================================
// XSS Protection
// ================================
function escapeHTML(str) {

    return str.replace(/[&<>'"]/g, tag => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"

    })[tag]);

}