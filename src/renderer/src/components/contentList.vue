<template>
  <!-- 数组渲染多个输入框 -->
   <div class="data-item">
    <div v-for="(value, key) in fileContentRef" :key="key">

<!-- 数组渲染多个输入框 -->
<div v-if="Array.isArray(value)" class="input-group">
  <label>
    <strong style="font-weight: bold;">{{ keyMapRef[key]['meta'] || key }}:</strong>
  </label>
  <div>
    <el-button @click="addInput(key)" type="primary" plain  style="width: 40px;" :icon="Plus"></el-button>
    <el-button @click="selectFolder(key)" type="primary" plain  style="width: 40px;" :icon="FolderOpened"></el-button>
  </div>
  <draggable item-key="$$key" ghost-class="ghost" :list="value" class="list-group" handle=".handle">
    <template #item="{ index }">
      <div class="list-group-item array-input">
        <el-input
          v-if="typeof fileContentRef[key][index] === 'string' || typeof fileContentRef[key][index] === 'number'"
          v-model="fileContentRef[key][index]" style="width: 80%" placeholder="请输入资源名称" />
        <contentList v-else-if="typeof fileContentRef[key][index] === 'object'"
          :fileContent="toRef(fileContentRef[key][index])" :keyMap="toRef(keyMapRef[key])" />
        <el-button @click="removeInput(key, index)" type="primary" plain  :icon="Delete" style="margin-left: 5px;" />
        <el-icon style="margin-left: 30px; " class="handle">
          <Expand />
        </el-icon>
      </div>
    </template>
  </draggable>
</div>

<!-- 普通输入框 -->
<div v-else-if="(typeof value === 'string' || typeof value === 'number')">

  <div v-if="key !== '$$key'">
    <label><strong style="font-weight: bold;">{{ keyMapRef[key] || key }}:</strong></label>
    <el-input v-if="typeof value === 'string'" v-model="fileContentRef[key]" style="width: 80%" />
    <el-input v-else v-model.number="fileContentRef[key]" style="width: 80%" />
  </div>
</div>

<!-- 对象嵌套 -->
<div v-else="typeof value === 'object'">
  <strong style="font-weight: bold;">{{ keyMapRef[key]['meta'] }}:</strong>

  <div style="margin-left: 20px;">
    <contentList :fileContent="toRef(value)" :keyMap="toRef(keyMapRef[key])" />
  </div>
</div>
</div>
   </div>
  
</template>

<script setup lang="ts">
import { toRef ,nextTick} from 'vue';
import draggable from "vuedraggable";
import { Delete, Plus, Expand ,FolderOpened} from '@element-plus/icons-vue'
import { JsonFileResult } from '@renderer/global';
interface Props {
  fileContent: Record<string, any>
  keyMap: any
}

// 接收 props
const props = defineProps<Props>();


// 创建本地响应式副本
const fileContentRef = toRef(props, 'fileContent')

const keyMapRef = toRef(props, 'keyMap')

// 删除数组元素
const removeInput = (key: string, index: number) => {
  if (Array.isArray(fileContentRef.value[key])) {
    fileContentRef.value[key].splice(index, 1);
  }
};

// 添加数组元素
const addInput = (key: string) => {
  if (fileContentRef.value[key].length === 0
    || (typeof fileContentRef.value[key][0] === 'string')) {
    fileContentRef.value[key].push("");
  } else if (typeof fileContentRef.value[key][0] === 'object') {
    fileContentRef.value[key].push(newObj(fileContentRef.value[key][0]))
  }

};

function newObj(original: object) {
  return Object.keys(original).reduce((acc, key) => {
    const value = original[key];

    // 根据值的类型赋予新的空值
    if (typeof value === 'string') {
      acc[key] = ''; // 空字符串
    } else if (typeof value === 'number') {
      acc[key] = 0; // 0
    } else if (typeof value === 'boolean') {
      acc[key] = true; // true
    } else {
      acc[key] = null; // 默认处理其他类型
    }

    return acc;
  }, {});
}



//选择指定文件夹内的内容
const selectFolder = async (key: string) => {
      try {
        const result:JsonFileResult = await window.api.selectFolder();       
        if(result.filesName.length != 0){
          fileContentRef.value[key] = [...result.filesName];
          await nextTick(); // 确保更新 DOM
        }
      } catch (error) {
        console.error('Error selecting folder:', error);
      }
    };
</script>

<style scoped>
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.data-item {
  border: solid 1px rgb(185, 185, 185);
  border-radius: 3px;
  padding: 10px;
  margin-bottom: 10px;
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
  margin: 10px 0px;
  padding: 10px;
  border-radius: 3px;
  background-color: lightgray;
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