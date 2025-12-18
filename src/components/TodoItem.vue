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
function onDragStart() {
  emit("drag-start", props.todo.id);
}
function onDrop() {
  emit("drop-on", props.todo.id);
}
</script>

<template>
  <li
    class="item"
    :class="{ dragging: false }"
    draggable="true"
    @dragstart="onDragStart"
    @dragover.prevent
    @drop.prevent="onDrop"
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
