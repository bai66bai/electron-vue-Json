<template>
  <el-card shadow="hover" class="card">
    <div class="card-header">
      <h1>配置面板</h1>
    </div>
    <el-divider style="margin: 15px 0;" />
    <el-scrollbar class="scrollable-content">
      <el-button @click="readJsonFile" type="primary" plain style="margin-bottom: 5px;"><el-icon><FolderOpened /></el-icon>选择文件</el-button>
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
    </el-scrollbar>
    <el-button @click="saveJsonFile" style="margin-top: 14px; float: right; margin-right: 60px;" type="primary"
      plain>保存</el-button>
    <!-- <el-button @click="clearlocalStorage" style="margin-top: 14px; float: right; margin-right: 60px;" type="primary"
      plain>清除本地缓存</el-button> -->
  </el-card>
</template>

<script lang="ts" setup>
import draggable from "vuedraggable";
import { Delete, Plus, Expand ,FolderOpened} from '@element-plus/icons-vue'
import { ref, onMounted, reactive } from 'vue'
import { JsonFileResult } from './global'
import { ElMessage } from 'element-plus'
//映射名字
const keyMap:Record<string, Object>= reactive({})

onMounted(() => {
  if (window.localStorage.getItem("filePath")) {
    readJsonByPa(window.localStorage.getItem("filePath") as string)
  }
})


// 定义响应式数据
const fileContent: Record<string, any> = ref({})

// 选择文件进行读取
const readJsonFile = async () => {
  try {
    const result: JsonFileResult = await window.api.readJson()
    if (result.error == "未选择文件") {
      ElMessage.error("取消文件选择")
      return;
    }
    //映射文件
    keyMap.value = result.metaContent

    console.log(keyMap.value);
    
    // 显示读取结果
    fileContent.value = result.content
    //将当前文件路径保存到本地
    window.localStorage.setItem("filePath", result.filePath)
    ElMessage.success("文件加载成功")
  } catch (error) {
    ElMessage.error(`读取文件失败: ${error}`)
  }
}

//根据路径进行读取
const readJsonByPa = async (path: string) => {
  try {
    const result: JsonFileResult = await window.api.readJsonByPath(path)
    //映射文件
    keyMap.value = result.metaContent
    // 显示读取结果
    fileContent.value = result.content
  } catch (error) {
    ElMessage.error(`读取文件失败: ${error}`)
  }
}

// 保存到 JSON 文件
const saveJsonFile = async () => {
  try {
    const dataToSave = JSON.parse(JSON.stringify(fileContent.value));
    await window.api.writeJson(dataToSave);
    ElMessage.success("文件保存成功")
  } catch (error) {
    ElMessage.error("保存失败")
    console.error('保存失败:', error);
  }
}

//删除数组元素
const removeInput = (key: string, index: number) => {
  fileContent.value[key].splice(index, 1)
}


//添加数组元素
const addInput = (key: string) => {
  fileContent.value[key].push("")
}


// const clearlocalStorage = () => {
//   window.localStorage.clear();
// }

</script>

<style scoped>
.card {
  width: 100vw;
  height: 100vh;
  font-family: Arial, sans-serif;
}

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