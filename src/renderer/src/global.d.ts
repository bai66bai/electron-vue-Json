// 定义接口类型
export interface JsonFileResult {
    filePath: string
    content: Record<string, any> | undefined
    error?: string
    metaContent: Record<string, string>
    filesName: Array
  }