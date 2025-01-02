<template>
  <!-- 数组渲染多个输入框 -->
  <div v-for="(value, key) in fileContentRef" :key="key" class="data-item">

    <!-- 数组渲染多个输入框 -->
    <div v-if="Array.isArray(value)" class="input-group">
      <label><strong>{{ keyMapRef[key] || key }}:</strong></label>
      <el-button @click="addInput(key)" type="primary" style="width: 40px;" :icon="Plus"></el-button>
      <draggable ghost-class="ghost" :list="value" class="list-group" handle=".handle">
        <template #item="{ index }">
          <div class="list-group-item array-input">
            <el-input v-model="fileContentRef[key][index]" style="width: 80%" placeholder="请输入资源名称" />
            <el-button @click="removeInput(key, index)" type="primary" :icon="Delete" style="margin-left: 5px;" />
            <el-icon style="margin-left: 30px; " class="handle">
              <Expand />
            </el-icon>
          </div>
        </template>
      </draggable>
    </div>
    <!-- 普通输入框 -->
    <div v-else-if="typeof value === 'string'">
      <label><strong>{{ keyMapRef[key] || key }}:</strong></label>
      <el-input v-model="fileContentRef[key]" style="width: 80%" />
    </div>

    <!-- 对象嵌套 -->
     <div v-else="typeof value === 'object'">
      {{ keyMapRef[key]['meta'] }}: 
      <div style="margin-left: 30px;">
        <contentList :fileContent="toRef(value)" :keyMap="toRef(keyMapRef[key])"/>
      </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRef } from 'vue';
import draggable from "vuedraggable";
import { Delete, Plus, Expand } from '@element-plus/icons-vue'
interface Props {
  fileContent: Record<string, any>
  keyMap: any
}

// 接收 props
const props = defineProps<Props>();

// 定义更新事件
const emit = defineEmits(['update:fileContent']);

// 创建本地响应式副本
const fileContentRef = toRef(props, 'fileContent')

const keyMapRef = toRef(props, 'keyMap')

// 删除数组元素
const removeInput = (key: string, index: number) => {
  if (Array.isArray(fileContentRef[key])) {
    fileContentRef.value[key].splice(index, 1);
  }
};

// 添加数组元素
const addInput = (key: string) => {
  if (Array.isArray(fileContentRef[key])) {
    fileContentRef.value[key].push("");
  }
};
</script>

<style scoped>
.scrollable-content {
  width: 90%;
  margin: 0 auto;
  max-height: 470px;
  /* 设置最大高度 */
  overflow: auto;
  /* 当内容超过高度时出现滚动条 */
  padding-right: 10px;
  /* 给滚动条留出空间 */
}


label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}


input[type="text"] {
  padding: 5px;
  width: 80%;
  margin-right: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.array-input {
  padding-top: 8px;
  padding-bottom: 8px;
}

.handle {
  padding-top: 8px;
  padding-bottom: 8px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>