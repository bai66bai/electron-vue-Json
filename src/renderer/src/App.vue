<template>
  <el-card shadow="hover" class="card">
    <div class="card-header">
      <h2>配置面板</h2>
    </div>
    <el-divider style="margin: 15px 0;" />
    <el-button @click="readJsonFile" type="primary" plain style="margin-bottom: 2px;margin-left: 10px;"><el-icon><FolderOpened /></el-icon>选择文件</el-button>
    <el-scrollbar class="scrollable-content">
      
      <contentList v-if="fileContent != undefined" :fileContent="fileContent" :keyMap="keyMap"/>
    </el-scrollbar>
    <el-button @click="saveJsonFile" style="margin-top: 14px; float: right; margin-right: 60px;" type="primary"
      plain>保存</el-button>
  </el-card>
</template>

<script lang="ts" setup>
import { FolderOpened} from '@element-plus/icons-vue'
import { ref, onMounted, Ref, nextTick } from 'vue'
import { JsonFileResult } from './global'
import { ElMessage } from 'element-plus'
import contentList from "./components/contentList.vue";
//映射名字
const keyMap:Ref<Record<string, Object>>= ref({})

onMounted(() => {
  if (window.localStorage.getItem("filePath")) {
    readJsonByPa(window.localStorage.getItem("filePath") as string)
  }
})

// 定义响应式数据
const fileContent: Ref<Record<string,any>|undefined> = ref()

// 选择文件进行读取
const readJsonFile = async () => {
  try {
    const result: JsonFileResult = await window.api.readJson()
    if (result.error == "未选择文件") {
      ElMessage.error("取消文件选择")
      return;
    }
    fileContent.value = undefined;
    await nextTick();

    //映射文件
    keyMap.value = result.metaContent
    
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
    console.log(result.content);
    
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
  width: calc(100% -10px);
  margin: 10px;
  max-height: calc(100vh - 210px);
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