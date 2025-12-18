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
  gap: 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
  cursor: grab;
  transition: opacity 0.2s, box-shadow 0.2s;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.item:active {
  cursor: grabbing;
}
.item.dragging {
  opacity: 0.6;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  cursor: grabbing;
}
.left {
  display: flex;
  gap: 10px;
  flex: 1;
}
.content {
  flex: 1;
}
.textRow {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.text {
  font-size: 16px;
  line-height: 1.25;
  cursor: text;
}
.done {
  text-decoration: line-through;
  opacity: 0.6;
}
.meta {
  display: flex;
  gap: 10px;
  align-items: center;
  opacity: 0.8;
  font-size: 13px;
}
.pill {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #ccc;
}
.pill.low {
  opacity: 0.75;
}
.pill.medium {
  font-weight: 600;
}
.pill.high {
  font-weight: 800;
  border-width: 2px;
}
.due {
  opacity: 0.85;
}
.editRow {
  display: grid;
  grid-template-columns: 1fr 120px 160px auto auto;
  gap: 8px;
  align-items: center;
}
.editInput {
  padding: 8px 10px;
  font-size: 16px;
}
.actions button,
.editRow button {
  padding: 8px 10px;
  cursor: pointer;
}
@media (max-width: 720px) {
  .editRow {
    grid-template-columns: 1fr;
  }
}
</style>
