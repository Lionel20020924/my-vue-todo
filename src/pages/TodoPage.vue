<script setup>
import { ref, computed, watch } from "vue";
import TodoItem from "../components/TodoItem.vue";

const STORAGE_KEY = "my-vue-todos-v2";

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (Array.isArray(data)) return data;
  } catch {}
  return [
    {
      id: Date.now() - 2,
      text: "Double click a todo to edit",
      done: false,
      priority: "medium",
      dueDate: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: Date.now() - 1,
      text: "Drag todos to reorder",
      done: false,
      priority: "high",
      dueDate: "",
      createdAt: new Date().toISOString(),
    },
  ];
}

const todos = ref(loadTodos());

// 表单
const newText = ref("");
const newPriority = ref("medium"); // low | medium | high
const newDueDate = ref(""); // yyyy-mm-dd

// 过滤
const filter = ref("all"); // all | active | completed

const filteredTodos = computed(() => {
  if (filter.value === "active") return todos.value.filter((t) => !t.done);
  if (filter.value === "completed") return todos.value.filter((t) => t.done);
  return todos.value;
});

const remaining = computed(() => todos.value.filter((t) => !t.done).length);

// 持久化（任何变化自动保存）
watch(
  todos,
  (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
  { deep: true }
);

function addTodo() {
  const text = newText.value.trim();
  if (!text) return;

  todos.value.unshift({
    id: Date.now(),
    text,
    done: false,
    priority: newPriority.value,
    dueDate: newDueDate.value,
    createdAt: new Date().toISOString(),
  });

  newText.value = "";
  newPriority.value = "medium";
  newDueDate.value = "";
}

function toggleTodo(todo) {
  todo.done = !todo.done;
}

function deleteTodo(id) {
  todos.value = todos.value.filter((t) => t.id !== id);
}

function updateTodo(payload) {
  // payload: { id, text, priority, dueDate }
  const t = todos.value.find((x) => x.id === payload.id);
  if (!t) return;
  t.text = payload.text;
  t.priority = payload.priority;
  t.dueDate = payload.dueDate;
}

function clearCompleted() {
  todos.value = todos.value.filter((t) => !t.done);
}

// ===== Drag & Drop reorder（基于整个 todos 的顺序）=====
const draggingId = ref(null);
let lastDropTarget = null;

function onDragStart(id) {
  draggingId.value = id;
}

function onDrop(targetId) {
  const fromId = draggingId.value;
  if (fromId == null || fromId === targetId) return;

  // Prevent duplicate drops on same target (for touch events)
  if (lastDropTarget === targetId && Date.now() - (lastDropTarget?.time || 0) < 100) {
    return;
  }
  lastDropTarget = { id: targetId, time: Date.now() };

  const fromIndex = todos.value.findIndex((t) => t.id === fromId);
  const toIndex = todos.value.findIndex((t) => t.id === targetId);
  if (fromIndex < 0 || toIndex < 0) return;

  const copy = todos.value.slice();
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  todos.value = copy;

  draggingId.value = null;

  // Clear lastDropTarget after a delay
  setTimeout(() => {
    lastDropTarget = null;
  }, 200);
}
</script>

<template>
  <div class="page">
    <h1>Todo</h1>

    <div class="filters">
      <button :class="{ on: filter === 'all' }" @click="filter = 'all'">All</button>
      <button :class="{ on: filter === 'active' }" @click="filter = 'active'">Active</button>
      <button :class="{ on: filter === 'completed' }" @click="filter = 'completed'">
        Completed
      </button>
      <span class="remain">{{ remaining }} left</span>
    </div>

    <div class="form">
      <input
        v-model="newText"
        placeholder="Add a new todo..."
        @keydown.enter="addTodo"
      />

      <select v-model="newPriority" title="priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input v-model="newDueDate" type="date" title="due date" />

      <button @click="addTodo">Add</button>
      <button @click="clearCompleted" :disabled="todos.every((t) => !t.done)">
        Clear completed
      </button>
    </div>

    <p v-if="filteredTodos.length === 0" class="hint">No todos in this filter.</p>

    <ul class="list">
      <TodoItem
        v-for="todo in filteredTodos"
        :key="todo.id"
        :todo="todo"
        @toggle="toggleTodo"
        @delete="deleteTodo"
        @update="updateTodo"
        @drag-start="onDragStart"
        @drop-on="onDrop"
      />
    </ul>

    <p class="tip">
      Tip: double click text to edit. Drag items to reorder (long press on mobile).
    </p>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  margin: 0 0 24px;
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 0 0 24px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  flex-wrap: wrap;
}

.filters button {
  padding: 8px 20px;
  border: 2px solid transparent;
  background: white;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filters button:hover {
  border-color: #e0e0e0;
  transform: translateY(-1px);
}

.filters button.on {
  font-weight: 700;
  border-color: #333;
  background: #333;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.remain {
  margin-left: auto;
  opacity: 0.75;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
}

.form {
  display: grid;
  grid-template-columns: 2fr 140px 180px auto auto;
  gap: 12px;
  align-items: center;
  margin: 0 0 32px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

input,
select,
button {
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: all 0.2s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

button {
  cursor: pointer;
  background: #333;
  color: white;
  border: none;
  font-weight: 600;
}

button:hover:not(:disabled) {
  background: #1a1a1a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #999;
}

.form button:last-child {
  background: #dc3545;
}

.form button:last-child:hover:not(:disabled) {
  background: #c82333;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: grid;
  gap: 12px;
}

.hint {
  opacity: 0.7;
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
  color: #666;
}

.tip {
  margin-top: 32px;
  padding: 16px 20px;
  opacity: 0.7;
  text-align: center;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

@media (max-width: 860px) {
  .form {
    grid-template-columns: 1fr 1fr;
  }

  .form input[type="text"] {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .page {
    padding: 0 12px;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
  }

  .filters {
    padding: 12px 16px;
  }

  .filters button {
    padding: 6px 16px;
    font-size: 14px;
  }

  .remain {
    font-size: 14px;
    padding: 6px 12px;
  }

  .form {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 10px;
  }

  input,
  select,
  button {
    padding: 10px 12px;
    font-size: 15px;
  }
}
</style>
