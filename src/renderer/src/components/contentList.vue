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
import { defineProps } from 'vue';
import draggable from "vuedraggable";
import { Delete, Plus, Expand} from '@element-plus/icons-vue'
interface Props{
    fileContent: Record<string, any>
}

defineProps<Props>();

</script>


<style scoped>

</style>