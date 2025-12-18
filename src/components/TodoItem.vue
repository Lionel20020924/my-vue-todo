<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  todo: { type: Object, required: true },
});

const emit = defineEmits(["toggle", "delete", "update", "drag-start", "drop-on"]);

// ===== Edit =====
const isEditing = ref(false);
const editText = ref(props.todo.text);
const editPriority = ref(props.todo.priority || "medium");
const editDueDate = ref(props.todo.dueDate || "");

watch(
  () => props.todo,
  (t) => {
    editText.value = t.text;
    editPriority.value = t.priority || "medium";
    editDueDate.value = t.dueDate || "";
  },
  { deep: true }
);

function startEdit() {
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  editText.value = props.todo.text;
  editPriority.value = props.todo.priority || "medium";
  editDueDate.value = props.todo.dueDate || "";
}

function saveEdit() {
  const text = editText.value.trim();
  if (!text) return;

  emit("update", {
    id: props.todo.id,
    text,
    priority: editPriority.value,
    dueDate: editDueDate.value,
  });
  isEditing.value = false;
}

// ===== Drag & Drop =====
const isDragging = ref(false);

// Mouse drag
function onDragStart() {
  isDragging.value = true;
  emit("drag-start", props.todo.id);
}
function onDragEnd() {
  isDragging.value = false;
}
function onDrop() {
  emit("drop-on", props.todo.id);
}

// Touch drag
let touchStartY = 0;
let touchStartTime = 0;
const LONG_PRESS_DELAY = 300; // ms

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();

  setTimeout(() => {
    if (touchStartTime && Date.now() - touchStartTime >= LONG_PRESS_DELAY) {
      isDragging.value = true;
      emit("drag-start", props.todo.id);
    }
  }, LONG_PRESS_DELAY);
}

function onTouchMove(e) {
  if (!isDragging.value) {
    // Cancel long press if moved too much before drag started
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
    if (deltaY > 10) {
      touchStartTime = 0;
    }
    return;
  }

  e.preventDefault();

  // Find element under touch point
  const touch = e.touches[0];
  const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
  const targetItem = elements.find(el => el.classList.contains('item'));

  if (targetItem && targetItem !== e.currentTarget) {
    // Trigger drop on the target
    const targetId = targetItem.dataset.todoId;
    if (targetId) {
      emit("drop-on", parseInt(targetId));
    }
  }
}

function onTouchEnd() {
  isDragging.value = false;
  touchStartTime = 0;
}
</script>

<template>
  <li
    class="item"
    :class="{ dragging: isDragging }"
    :data-todo-id="todo.id"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover.prevent
    @drop.prevent="onDrop"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="left">
      <input type="checkbox" :checked="todo.done" @change="emit('toggle', todo)" />

      <div class="content">
        <div v-if="!isEditing" class="textRow">
          <span class="text" :class="{ done: todo.done }" @dblclick="startEdit">
            {{ todo.text }}
          </span>

          <span class="meta">
            <span class="pill" :class="todo.priority">{{ todo.priority }}</span>
            <span v-if="todo.dueDate" class="due">due {{ todo.dueDate }}</span>
          </span>
        </div>

        <div v-else class="editRow">
          <input
            v-model="editText"
            class="editInput"
            @keydown.enter="saveEdit"
            @keydown.esc="cancelEdit"
          />

          <select v-model="editPriority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input v-model="editDueDate" type="date" />

          <button @click="saveEdit">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="emit('delete', todo.id)">Delete</button>
    </div>
  </li>
</template>

<style scoped>
.item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 16px 20px;
  background: #fff;
  cursor: grab;
  transition: all 0.2s ease;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.item:hover {
  border-color: #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.item:active {
  cursor: grabbing;
}

.item.dragging {
  opacity: 0.65;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  cursor: grabbing;
  transform: scale(1.02) rotate(1deg);
}

.left {
  display: flex;
  gap: 14px;
  flex: 1;
  align-items: flex-start;
}

.left input[type="checkbox"] {
  margin-top: 2px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #333;
}

.content {
  flex: 1;
}

.textRow {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text {
  font-size: 16px;
  line-height: 1.5;
  cursor: text;
  color: #1a1a1a;
  font-weight: 500;
}

.text:hover {
  color: #333;
}

.done {
  text-decoration: line-through;
  opacity: 0.5;
  color: #999;
}

.meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  flex-wrap: wrap;
}

.pill {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.pill.low {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.pill.medium {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffe0b2;
}

.pill.high {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.due {
  opacity: 0.8;
  color: #666;
  font-weight: 500;
}

.editRow {
  display: grid;
  grid-template-columns: 1fr 120px 160px auto auto;
  gap: 10px;
  align-items: center;
}

.editInput {
  padding: 10px 12px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.editInput:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.editRow select,
.editRow input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.editRow button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.editRow button:first-of-type {
  background: #333;
  color: white;
}

.editRow button:first-of-type:hover {
  background: #1a1a1a;
}

.editRow button:last-of-type {
  background: #f0f0f0;
  color: #333;
}

.editRow button:last-of-type:hover {
  background: #e0e0e0;
}

.actions button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  background: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.actions button:hover {
  background: #dc3545;
  color: white;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

@media (max-width: 860px) {
  .editRow {
    grid-template-columns: 1fr 1fr;
  }

  .editInput {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .item {
    padding: 14px 16px;
    gap: 12px;
  }

  .left {
    gap: 12px;
  }

  .text {
    font-size: 15px;
  }

  .editRow {
    grid-template-columns: 1fr;
  }

  .actions button {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
