
const STORAGE_KEY = "chirag-todos";

let todos = loadTodos();
let filter = "all";
let editingTodoId = null;

// 1. Load todos from localStorage.
function loadTodos() {
    try {
        const savedTodos = localStorage.getItem(STORAGE_KEY);

        if (savedTodos === null) {
            return [];
        }

        const parsedTodos = JSON.parse(savedTodos);

        return Array.isArray(parsedTodos) ? parsedTodos : [];
    } catch (error) {
        console.error("Could not load todos:", error);
        return [];
    }
}

// 2. Save todos to localStorage.
function saveTodos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        console.error("Could not save todos:", error);
    }
}

// 3. Add a new todo.
function addTodo(text) {
    const cleanText = text.trim();

    if (cleanText === "") {
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: cleanText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos = [...todos, newTodo];

    saveTodos();
    render();
}

// 4. Toggle completed status.
function toggleTodo(id) {
    todos = todos.map((todo) =>
        todo.id === id
            ? { ...todo, completed: !todo.completed }
            : todo
    );

    saveTodos();
    render();
}

// 5. Delete one todo.
function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);

    saveTodos();
    render();
}

// 6. Edit a todo.
function editTodo(id, newText) {
    const cleanText = newText.trim();

    if (cleanText === "") {
        return;
    }

    todos = todos.map((todo) =>
        todo.id === id
            ? { ...todo, text: cleanText }
            : todo
    );

    saveTodos();
    render();
}

// 7. Return todos matching the selected filter.
function getVisibleTodos() {
    if (filter === "active") {
        return todos.filter((todo) => !todo.completed);
    }

    if (filter === "completed") {
        return todos.filter((todo) => todo.completed);
    }

    return todos;
}

// 8. Render the list from the todos array.
function render() {
    const todoList = document.querySelector("#todo-list");
    const counter = document.querySelector("#todo-counter");
    const visibleTodos = getVisibleTodos();

    todoList.replaceChildren();

    visibleTodos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = "todo-item";
        li.dataset.id = String(todo.id);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.completed;
        checkbox.setAttribute("aria-label", `Complete ${todo.text}`);
        checkbox.dataset.action = "toggle";

        li.appendChild(checkbox);

        if (editingTodoId === todo.id) {
            const editInput = document.createElement("input");
            editInput.className = "edit-input";
            editInput.value = todo.text;
            editInput.dataset.action = "edit";
            editInput.setAttribute("aria-label", "Edit todo");

            li.appendChild(editInput);
        } else {
            const span = document.createElement("span");
            span.className = "todo-text";
            span.textContent = todo.text;
            span.dataset.action = "edit-text";

            if (todo.completed) {
                span.classList.add("completed");
            }

            li.appendChild(span);
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "✕";
        deleteButton.dataset.action = "delete";
        deleteButton.setAttribute("aria-label", `Delete ${todo.text}`);

        li.appendChild(deleteButton);
        todoList.appendChild(li);
    });

    const activeCount = todos.filter((todo) => !todo.completed).length;

    counter.textContent =
        `${activeCount} ${activeCount === 1 ? "item" : "items"} left`;

    document.querySelectorAll("[data-filter]").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );
    });

    document.querySelector("#clear-completed").disabled =
        !todos.some((todo) => todo.completed);
}

// 9. Add a todo using the form.
document.querySelector("#todo-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const input = document.querySelector("#todo-input");

    addTodo(input.value);
    input.value = "";
    input.focus();
});

// 10. One delegated click listener for the entire todo list.
document.querySelector("#todo-list").addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    const todoItem = event.target.closest("[data-id]");

    if (!actionElement || !todoItem) {
        return;
    }

    const id = Number(todoItem.dataset.id);
    const action = actionElement.dataset.action;

    if (action === "toggle") {
        toggleTodo(id);
    }

    if (action === "delete") {
        deleteTodo(id);
    }
});

// 11. Double-click a todo's text to edit it.
document.querySelector("#todo-list").addEventListener("dblclick", (event) => {
    const textElement = event.target.closest('[data-action="edit-text"]');

    if (!textElement) {
        return;
    }

    const todoItem = textElement.closest("[data-id]");

    editingTodoId = Number(todoItem.dataset.id);
    render();

    const editInput = document.querySelector(".edit-input");

    if (editInput) {
        editInput.focus();
        editInput.select();
    }
});

// 12. Enter saves; Escape cancels editing.
document.querySelector("#todo-list").addEventListener("keydown", (event) => {
    const editInput = event.target.closest('[data-action="edit"]');

    if (!editInput) {
        return;
    }

    const todoItem = editInput.closest("[data-id]");
    const id = Number(todoItem.dataset.id);

    if (event.key === "Enter") {
        event.preventDefault();

        const newText = editInput.value.trim();

        if (newText === "") {
            editInput.focus();
            return;
        }

        editTodo(id, newText);
        editingTodoId = null;
    }

    if (event.key === "Escape") {
        editingTodoId = null;
        render();
    }
});

// 13. Filter buttons.
document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
        filter = button.dataset.filter;
        render();
    });
});

// 14. Clear all completed todos.
document.querySelector("#clear-completed").addEventListener("click", () => {
    todos = todos.filter((todo) => !todo.completed);

    saveTodos();
    render();
});

// Initial render when the page starts.
render();
