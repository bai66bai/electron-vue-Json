<template>
<!-- 数组渲染多个输入框 -->
<div v-for="(value, key) in fileContent" :key="key" class="data-item">
        <label><strong>{{ keyMap.value[key] || key}}:</strong></label>
        <!-- 数组渲染多个输入框 -->
        <div v-if="Array.isArray(value)" class="input-group">
          <el-button @click="addInput(key)" type="primary" style="width: 40px;" :icon="Plus"></el-button>
          <draggable ghost-class="ghost" :list="value" class="list-group" handle=".handle">
            <template #item="{ index }">
              <div class="list-group-item array-input">
                <el-input v-model="fileContent[key][index]" style="width: 80%" placeholder="请输入资源名称" />
                <el-button @click="removeInput(key, index)" type="primary" :icon="Delete" style="margin-left: 5px;" />
                <el-icon style="margin-left: 30px; " class="handle">
                  <Expand />
                </el-icon>
              </div>
            </template>
          </draggable>
        </div>
        <!-- 普通输入框 -->
        <el-input v-else v-model="fileContent[key]" style="width: 80%" />
      </div>
</template>


<script setup lang="ts">
import { defineProps,reactive, watch} from 'vue';
import draggable from "vuedraggable";
import { Delete, Plus, Expand} from '@element-plus/icons-vue'
interface Props{
    fileContent: Record<string, any>
    keyMap:Record<string, Object>
}

// 接收 props
const props = defineProps<Props>();


// 定义更新事件
const emit = defineEmits(['update:fileContent']);

// 创建本地响应式副本
const localFileContent = reactive({ ...props.fileContent });

// 监听本地数据变化并同步更新父组件
watch(
  () => localFileContent,
  (newValue) => {
    emit('update:fileContent', newValue);
  },
  { deep: true }
);

// 删除数组元素
const removeInput = (key: string, index: number) => {
  if (Array.isArray(localFileContent[key])) {
    localFileContent[key].splice(index, 1);
  }
};

// 添加数组元素
const addInput = (key: string) => {
  if (Array.isArray(localFileContent[key])) {
    localFileContent[key].push("");
  }
};
</script>


<style scoped>

</style>