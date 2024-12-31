import { ElectronAPI } from '@electron-toolkit/preload'
import { JsonFileResult } from '@renderer/global'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      readJson: () => Promise<JsonFileResult>,
      writeJson:(updatedData) => Promise<JsonFileResult>,
      readJsonByPath:(filebyPath:string) => Promise<JsonFileResult>
    }
  }
}
