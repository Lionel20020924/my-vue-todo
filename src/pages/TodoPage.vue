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
  max-width: 760px;
  margin: 0 auto;
}
h1 {
  margin: 0 0 12px;
}
.filters {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 10px 0 14px;
}
.filters button.on {
  font-weight: 700;
  border: 2px solid #333;
}
.remain {
  margin-left: auto;
  opacity: 0.75;
}
.form {
  display: grid;
  grid-template-columns: 1fr 120px 160px auto auto;
  gap: 10px;
  align-items: center;
  margin: 10px 0 16px;
}
input,
select,
button {
  padding: 10px 12px;
  font-size: 16px;
}
button {
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.hint {
  opacity: 0.7;
}
.tip {
  margin-top: 12px;
  opacity: 0.7;
}
@media (max-width: 720px) {
  .form {
    grid-template-columns: 1fr;
  }
}
</style>
