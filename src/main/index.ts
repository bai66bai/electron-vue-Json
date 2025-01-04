import { app, shell, BrowserWindow, ipcMain, dialog  } from 'electron'
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
      const content = processJsonString(fileContent)
      //先读meta.json
      readMetaFile(filePath, content)
      return { filePath, content, metaContent }
    } catch (error) {
      return { error }
    }
  })

  //读取meta.json的方法
  const readMetaFile = (filePath, content) => {
    //先读meta.json
    const fullPath = path.resolve(path.dirname(filePath), 'meta.json')
    if (fs.existsSync(fullPath)) {
      metaContent = {}
      metaContent = JSON.parse(readFileSync(fullPath, 'utf-8'), (key, value) => {
        if (key === "_type") {          
          return undefined;
        }
        return value; // 其他键正常返回值
      })
    } else {
      //遍历获取到的对象的键值并做成对象
      metaContent = makeMeta(content)
      //用存储好的数据创建meta.json
      fs.writeFileSync(fullPath, JSON.stringify(metaContent, null, 2), 'utf-8');
    }
  }

  //解析json对象数组的方法
  const makeMeta = (content: Record<string, any>) => {
    let currentMetaContent: Record<string, any> = {}
    for (const key in content) {
      if (content.hasOwnProperty(key)) {
        const value = content[key];

        // 判断类型并分别处理
        if (Array.isArray(value)) {
          let arrContent: Record<string, string> = {
            meta: key,
            _type: "array"
          }
          if (value.every(item => typeof item == 'object' || item === null)) {
            //如果是对象数组，创建一个新的对象
            value.forEach(item => {
              if (typeof item === 'object' && item !== null) {
                Object.keys(item).forEach(nestedKey => {
                  arrContent[nestedKey] = nestedKey
                })
              }
            })
          }
          currentMetaContent[key] = arrContent
        } else if (typeof value === 'object' && value !== null) {
          //递归处理对象
          const recursiveObjContent = makeMeta(value)
          let objContent: Record<string, string> = {
            meta: key,
            _type: "object",
            ...recursiveObjContent
          }
          currentMetaContent[key] = objContent 
        } else {
          currentMetaContent[key] = key; //普通值，键名直接存储
        }
      }
    }
    return currentMetaContent;
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
      readMetaFile(filePath, content)
      return { content, filePath, metaContent }
    } catch (error) {
      return { error }
    }
  })

  //保存json文件
  ipcMain.handle('write-json', async (_event, updatedData) => {
    try {
      // 将数据写入文件

      fs.writeFileSync(filePath, JSON.stringify(updatedData, (key, value) => {
        // 如果是指定的键，返回 undefined（表示忽略此键）
        if (key === "$$key") {
          return undefined;
        }
        return value; // 其他键正常返回值
      }, 2), 'utf-8');
      console.log('JSON 文件已更新');
      return { success: true, message: 'JSON 文件更新成功' };
    } catch (error) {
      console.error('更新 JSON 文件时出错:', error);
      return { success: false, message: '更新 JSON 文件失败', error };
    }
  });

  //选择文件夹并读取文件夹下的内容
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory','openFile'],
      filters: [
        { name: '所有文件', extensions: ['*'] }, // 显示所有文件类型
      ],
    });
    
    if (result.canceled) {
      return []; // 用户取消选择
    }

    const folderPath = result.filePaths[0];
    const filesName = fs.readdirSync(folderPath).filter((file) => {
      const fullPath = path.join(folderPath, file);
      return fs.statSync(fullPath).isFile(); // 仅返回文件
    });

    return {filesName}; // 返回文件名数组（包含扩展名）
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
