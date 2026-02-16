// API endpoints
const API_BASE = '/api/todos';

// DOM elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');

// State
let todos = [];

// Fetch all todos
async function fetchTodos() {
    try {
        const response = await fetch(API_BASE);
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
        alert('Failed to load todos');
    }
}

// Add a new todo
async function addTodo() {
    const text = todoInput.value.trim();

    if (!text) {
        alert('Please enter a todo');
        return;
    }

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (response.ok) {
            const newTodo = await response.json();
            todos.push(newTodo);
            todoInput.value = '';
            renderTodos();
        } else {
            alert('Failed to add todo');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Failed to add todo');
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
        });

        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
                renderTodos();
            }
        } else {
            alert('Failed to update todo');
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
        alert('Failed to update todo');
    }
}

// Delete a todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        } else {
            alert('Failed to delete todo');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo');
    }
}

// Enable edit mode
function enableEditMode(id) {
    const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (!todoItem) return;

    const textSpan = todoItem.querySelector('.todo-text');
    const editBtn = todoItem.querySelector('.edit-btn');
    const deleteBtn = todoItem.querySelector('.delete-btn');
    const checkbox = todoItem.querySelector('.todo-checkbox');

    const currentText = textSpan.innerText;

    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';

    // Create save button
    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save';
    saveBtn.className = 'save-btn';
    saveBtn.onclick = () => saveEdit(id);

    // Replace elements
    textSpan.replaceWith(input);
    editBtn.replaceWith(saveBtn);

    // Hide other controls
    deleteBtn.style.display = 'none';
    checkbox.disabled = true;

    // Focus input
    input.focus();

    // Allow saving on Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit(id);
        }
    });
}

// Save edited todo
async function saveEdit(id) {
    const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (!todoItem) return;

    const input = todoItem.querySelector('.edit-input');
    const newText = input.value.trim();

    if (!newText) {
        alert('Todo text cannot be empty');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: newText }),
        });

        if (response.ok) {
            const updatedTodo = await response.json();

            // Update local state
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
                renderTodos();
            }
        } else {
            alert('Failed to update todo');
            renderTodos(); // Reset UI
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo');
        renderTodos(); // Reset UI
    }
}

// Render todos to the DOM
function renderTodos() {
    if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No todos yet. Add one above!</div>';
    } else {
        todoList.innerHTML = todos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    onchange="toggleTodo(${todo.id})"
                />
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="edit-btn" onclick="enableEditMode(${todo.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `).join('');
    }

    updateStats();
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    totalCount.textContent = `Total: ${total}`;
    completedCount.textContent = `Completed: ${completed}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initialize
fetchTodos();
