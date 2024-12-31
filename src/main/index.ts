import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { readFileSync } from 'fs'
import path, { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'
import { processJsonString } from "../utils/jsonUtil";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

//指定空的Meta对象
    let metaContent = {};
// 指定路径，读取 `Source.Json` 文件
    const folderPath = ''
// 直接读取指定路径的 JSON 文件
    let filePath = ''
  // 读取json文件
  ipcMain.handle('read-json-file', async () => {
    try {
      const files = dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        defaultPath: folderPath,
      })

      if (!files || files.length === 0) {
        return { error: '未选择文件' }
      }

      filePath = files[0]
      const fileContent = readFileSync(filePath, 'utf-8')
      const content = JSON.parse(fileContent)
      //先读meta.json
      readMetaFile(filePath,content)
      return {filePath , content , metaContent}
    } catch (error) {
      return { error} 
    }
  })

  //读取meta.json的方法
  const readMetaFile = (filePath,content) =>{
     //先读meta.json
     const fullPath = path.resolve(path.dirname(filePath),'meta.json')
     if(fs.existsSync(fullPath)){
        metaContent = {}
        metaContent = JSON.parse(readFileSync(fullPath, 'utf-8'))
     }else{
       //遍历获取到的对象的键值并做成对象
          metaContent = {}
         Object.keys(content).forEach(key =>{
           metaContent[key] = key
         })
         //用存储好的数据创建meta.json
         fs.writeFileSync(fullPath, JSON.stringify(metaContent, null, 2), 'utf-8');
     }
  }


  //读取指定路径的json文件
  ipcMain.handle('read-json-by-path', async (_event, filebyPath) => {
    try {
      if (!filebyPath) {
        return { error: '文件路径不能为空' }
      }
      filePath = filebyPath
      const fileContent = readFileSync(filebyPath, 'utf-8')
      
      const content = processJsonString(fileContent)
      //先读meta.json
      readMetaFile(filePath,content)
      return {content , filePath , metaContent}
    } catch (error) {
      return { error}
    }
  })



  //保存json文件
  ipcMain.handle('write-json', async (_event,updatedData) => {
    try {
      // 将数据写入文件
      //console.log(JSON.stringify(updatedData, null, 2), 'utf-8');
      
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');
      console.log('JSON 文件已更新');
      return { success: true, message: 'JSON 文件更新成功' };
    } catch (error) {
      console.error('更新 JSON 文件时出错:', error);
      return { success: false, message: '更新 JSON 文件失败', error }; 
    }
  });

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
