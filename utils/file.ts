/**
 * 从URL中提取文件名
 */
export function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const fileName = pathname.split("/").pop() || ""
    return decodeURIComponent(fileName)
  } catch {
    return url.split("/").pop() || "未知文件"
  }
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(url: string): string {
  return url.split(".").pop()?.toLowerCase() || ""
}

/**
 * 根据扩展名获取文件类型
 */
export function getFileTypeFromExtension(extension: string): string {
  switch (extension) {
    case "pdf":
      return "PDF"
    case "doc":
    case "docx":
      return "Word"
    case "xls":
    case "xlsx":
      return "Excel"
    case "ppt":
    case "pptx":
      return "PowerPoint"
    case "txt":
      return "文本"
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "webp":
      return "图片"
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return "视频"
    case "mp3":
    case "wav":
    case "flac":
      return "音频"
    case "zip":
    case "rar":
    case "7z":
      return "压缩包"
    default:
      return "文档"
  }
}

/**
 * 获取文件大小的可读格式
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"

  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * 检查文件类型是否被支持
 */
export function isSupportedFileType(extension: string): boolean {
  const supportedTypes = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "mp4",
    "avi",
    "mov",
    "wmv",
    "mp3",
    "wav",
    "flac",
    "zip",
    "rar",
    "7z",
  ]

  return supportedTypes.includes(extension.toLowerCase())
}

/**
 * 从文件名中提取不带扩展名的名称
 */
export function getFileNameWithoutExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".")
  if (lastDotIndex === -1) return fileName
  return fileName.substring(0, lastDotIndex)
}

/**
 * 验证URL是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 解析文档URL字符串（支持JSON数组和逗号分隔）
 */
export function parseDocumentUrls(urls: string | null): string[] {
  if (!urls) return []

  try {
    // 尝试解析为JSON数组
    const parsed = JSON.parse(urls)
    if (Array.isArray(parsed)) {
      return parsed.filter((url) => typeof url === "string" && isValidUrl(url))
    }
  } catch {
    // 如果不是JSON，按逗号分割
    return urls
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url && isValidUrl(url))
  }

  return []
}
