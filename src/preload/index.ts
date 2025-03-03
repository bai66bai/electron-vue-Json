import { contextBridge , ipcRenderer} from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  readJson: () => ipcRenderer.invoke('read-json-file'),
  writeJson:(updatedData) => ipcRenderer.invoke('write-json',updatedData),
  readJsonByPath:(filebyPath:string) => ipcRenderer.invoke('read-json-by-path',filebyPath),
  selectFiles:() => ipcRenderer.invoke('select-files')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
