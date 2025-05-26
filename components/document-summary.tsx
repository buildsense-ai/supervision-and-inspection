"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { File, ExternalLink } from "lucide-react"

interface DocumentSummaryProps {
  documentUrls: string | null
  maxDisplay?: number
}

export function DocumentSummary({ documentUrls, maxDisplay = 3 }: DocumentSummaryProps) {
  // 解析文档URL
  const parseDocumentUrls = (urls: string | null): string[] => {
    if (!urls) return []

    try {
      // 尝试解析为JSON数组
      const parsed = JSON.parse(urls)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // 如果不是JSON，按逗号分割
      return urls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    }

    return []
  }

  // 从URL中提取文件名
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split("/").pop() || ""
      return decodeURIComponent(fileName)
    } catch {
      return url.split("/").pop() || "文档"
    }
  }

  const documents = parseDocumentUrls(documentUrls)

  if (documents.length === 0) {
    return null
  }

  const displayDocuments = documents.slice(0, maxDisplay)
  const remainingCount = documents.length - maxDisplay

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <File className="h-4 w-4 text-gray-400" />
      <span className="text-xs text-gray-500">关联文档:</span>

      {displayDocuments.map((url, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(url, "_blank")
                }}
              >
                {getFileNameFromUrl(url)}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-all">{url}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {remainingCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{remainingCount} 更多
        </Badge>
      )}
    </div>
  )
}
