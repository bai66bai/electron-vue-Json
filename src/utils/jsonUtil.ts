export function processJsonString(
    jsonString: string
): Record<string, unknown> | null {
    try {
        // 将 JSON 字符串解析为对象
        const jsonObject = JSON.parse(jsonString);

        // 递归处理 JSON 对象
        function processJson(
            json: unknown,
            currentPath: string = ''
        ): void {
            if (typeof json === 'object' && json !== null) {
                for (const key in json) {
                    if (Object.prototype.hasOwnProperty.call(json, key)) {
                        const value = (json as Record<string, unknown>)[key];
                        const path = currentPath ? `${currentPath}.${key}` : key;

                        // 如果值是对象或数组，递归处理
                        if (typeof value === 'object' && value !== null) {
                            processJson(value, path);
                        }
                    }
                }
            }
        }

        // 处理 JSON 对象
        processJson(jsonObject);

        // 返回反序列化的对象
        return jsonObject;
    } catch (error) {
        console.error('Invalid JSON string:', error);
        return null;
    }
}

