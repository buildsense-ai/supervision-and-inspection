# 巡检记录助手 RESTful API 设计文档

## 基础信息

- **基础URL**: `https://api.inspection-assistant.com/v1`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON
- **日期格式**: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)

## 通用约定

### 请求头

所有请求需包含以下头信息：

\`\`\`
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
\`\`\`

### 响应状态码

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `204 No Content`: 请求成功但无返回内容
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证或认证失败
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `409 Conflict`: 资源冲突
- `422 Unprocessable Entity`: 请求格式正确但语义错误
- `500 Internal Server Error`: 服务器内部错误

### 分页

分页参数在查询字符串中提供：

- `page`: 页码，默认为1
- `per_page`: 每页记录数，默认为20，最大为100

分页响应包含以下头信息：

\`\`\`
X-Total-Count: 总记录数
X-Page: 当前页码
X-Per-Page: 每页记录数
X-Total-Pages: 总页数
Link: <https://api.inspection-assistant.com/v1/issues?page=2>; rel="next", 
      <https://api.inspection-assistant.com/v1/issues?page=10>; rel="last"
\`\`\`

### 排序

排序参数在查询字符串中提供：

- `sort`: 排序字段，默认为`created_at`
- `order`: 排序方向，`asc`或`desc`，默认为`desc`

例如：`?sort=status&order=asc`

### 过滤

过滤参数在查询字符串中提供，格式为`field=value`或`field[operator]=value`

支持的操作符：
- `eq`: 等于（默认）
- `ne`: 不等于
- `gt`: 大于
- `gte`: 大于等于
- `lt`: 小于
- `lte`: 小于等于
- `like`: 模糊匹配
- `in`: 在列表中

例如：
- `?status=pending`
- `?created_at[gte]=2023-01-01T00:00:00Z`
- `?priority[in]=high,medium`

### 字段选择

可以通过`fields`参数指定返回的字段：

- `fields`: 逗号分隔的字段列表

例如：`?fields=id,title,status,created_at`

### 错误响应格式

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field_name": ["Error detail"]
    }
  }
}
\`\`\`

## API 端点

## 1. 授权模块

### 登录

\`\`\`
POST /auth/login
\`\`\`

请求体：

\`\`\`json
{
  "username": "user@example.com",
  "password": "password"
}
\`\`\`

响应：

\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2023-06-01T00:00:00Z",
  "user": {
    "id": "user_123",
    "name": "张三",
    "email": "user@example.com",
    "role": "supervisor"
  }
}
\`\`\`

### 刷新令牌

\`\`\`
POST /auth/refresh
\`\`\`

请求头：

\`\`\`
Authorization: Bearer {refresh_token}
\`\`\`

响应：

\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2023-06-01T00:00:00Z"
}
\`\`\`

### 登出

\`\`\`
POST /auth/logout
\`\`\`

响应：

\`\`\`
204 No Content
\`\`\`

## 2. 巡检问题记录模块

### 获取问题记录列表

\`\`\`
GET /issues
\`\`\`

查询参数：
- `status`: 状态筛选（pending/closed/all）
- `project_id`: 项目ID
- `created_by`: 创建人ID
- `created_at[gte]`: 创建时间起始
- `created_at[lte]`: 创建时间结束
- `search`: 搜索关键词（标题和描述）

响应：

\`\`\`json
{
  "data": [
    {
      "id": "issue_123",
      "title": "混凝土强度不足",
      "description": "3号楼2层混凝土强度检测结果低于设计要求",
      "status": "pending",
      "priority": "high",
      "location": "3号楼2层",
      "category": "quality",
      "created_by": {
        "id": "user_123",
        "name": "张三"
      },
      "assigned_to": {
        "id": "user_456",
        "name": "李四"
      },
      "created_at": "2023-05-01T10:00:00Z",
      "updated_at": "2023-05-02T14:30:00Z",
      "due_date": "2023-05-10T00:00:00Z",
      "attachments": [
        {
          "id": "attachment_123",
          "name": "检测报告.pdf",
          "url": "https://storage.example.com/attachments/检测报告.pdf",
          "size": 1024000,
          "content_type": "application/pdf"
        }
      ],
      "tags": ["混凝土", "强度", "质量问题"]
    }
  ]
}
\`\`\`

### 获取单个问题记录

\`\`\`
GET /issues/{id}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "issue_123",
    "title": "混凝土强度不足",
    "description": "3号楼2层混凝土强度检测结果低于设计要求",
    "status": "pending",
    "priority": "high",
    "location": "3号楼2层",
    "category": "quality",
    "created_by": {
      "id": "user_123",
      "name": "张三"
    },
    "assigned_to": {
      "id": "user_456",
      "name": "李四"
    },
    "created_at": "2023-05-01T10:00:00Z",
    "updated_at": "2023-05-02T14:30:00Z",
    "due_date": "2023-05-10T00:00:00Z",
    "attachments": [
      {
        "id": "attachment_123",
        "name": "检测报告.pdf",
        "url": "https://storage.example.com/attachments/检测报告.pdf",
        "size": 1024000,
        "content_type": "application/pdf"
      }
    ],
    "tags": ["混凝土", "强度", "质量问题"],
    "comments": [
      {
        "id": "comment_123",
        "content": "已通知施工单位整改",
        "created_by": {
          "id": "user_123",
          "name": "张三"
        },
        "created_at": "2023-05-02T11:00:00Z"
      }
    ],
    "history": [
      {
        "id": "history_123",
        "action": "status_changed",
        "from": "open",
        "to": "pending",
        "created_by": {
          "id": "user_123",
          "name": "张三"
        },
        "created_at": "2023-05-02T14:30:00Z"
      }
    ]
  }
}
\`\`\`

### 创建问题记录

\`\`\`
POST /issues
\`\`\`

请求体：

\`\`\`json
{
  "title": "混凝土强度不足",
  "description": "3号楼2层混凝土强度检测结果低于设计要求",
  "status": "pending",
  "priority": "high",
  "location": "3号楼2层",
  "category": "quality",
  "assigned_to": "user_456",
  "due_date": "2023-05-10T00:00:00Z",
  "attachments": ["attachment_123"],
  "tags": ["混凝土", "强度", "质量问题"]
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "issue_123",
    "title": "混凝土强度不足",
    "description": "3号楼2层混凝土强度检测结果低于设计要求",
    "status": "pending",
    "priority": "high",
    "location": "3号楼2层",
    "category": "quality",
    "created_by": {
      "id": "user_123",
      "name": "张三"
    },
    "assigned_to": {
      "id": "user_456",
      "name": "李四"
    },
    "created_at": "2023-05-01T10:00:00Z",
    "updated_at": "2023-05-01T10:00:00Z",
    "due_date": "2023-05-10T00:00:00Z",
    "attachments": [
      {
        "id": "attachment_123",
        "name": "检测报告.pdf",
        "url": "https://storage.example.com/attachments/检测报告.pdf",
        "size": 1024000,
        "content_type": "application/pdf"
      }
    ],
    "tags": ["混凝土", "强度", "质量问题"]
  }
}
\`\`\`

### 更新问题记录

\`\`\`
PUT /issues/{id}
\`\`\`

请求体：

\`\`\`json
{
  "title": "混凝土强度不足",
  "description": "3号楼2层混凝土强度检测结果低于设计要求，需立即整改",
  "status": "in_progress",
  "priority": "high",
  "location": "3号楼2层",
  "category": "quality",
  "assigned_to": "user_789",
  "due_date": "2023-05-15T00:00:00Z",
  "attachments": ["attachment_123", "attachment_456"],
  "tags": ["混凝土", "强度", "质量问题", "整改中"]
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "issue_123",
    "title": "混凝土强度不足",
    "description": "3号楼2层混凝土强度检测结果低于设计要求，需立即整改",
    "status": "in_progress",
    "priority": "high",
    "location": "3号楼2层",
    "category": "quality",
    "created_by": {
      "id": "user_123",
      "name": "张三"
    },
    "assigned_to": {
      "id": "user_789",
      "name": "王五"
    },
    "created_at": "2023-05-01T10:00:00Z",
    "updated_at": "2023-05-03T09:00:00Z",
    "due_date": "2023-05-15T00:00:00Z",
    "attachments": [
      {
        "id": "attachment_123",
        "name": "检测报告.pdf",
        "url": "https://storage.example.com/attachments/检测报告.pdf",
        "size": 1024000,
        "content_type": "application/pdf"
      },
      {
        "id": "attachment_456",
        "name": "整改方案.pdf",
        "url": "https://storage.example.com/attachments/整改方案.pdf",
        "size": 2048000,
        "content_type": "application/pdf"
      }
    ],
    "tags": ["混凝土", "强度", "质量问题", "整改中"]
  }
}
\`\`\`

### 删除问题记录

\`\`\`
DELETE /issues/{id}
\`\`\`

响应：

\`\`\`
204 No Content
\`\`\`

### 添加评论

\`\`\`
POST /issues/{id}/comments
\`\`\`

请求体：

\`\`\`json
{
  "content": "已通知施工单位整改"
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "comment_123",
    "content": "已通知施工单位整改",
    "created_by": {
      "id": "user_123",
      "name": "张三"
    },
    "created_at": "2023-05-02T11:00:00Z"
  }
}
\`\`\`

### 上传附件

\`\`\`
POST /issues/{id}/attachments
\`\`\`

请求体（multipart/form-data）：

\`\`\`
file: [文件数据]
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "attachment_456",
    "name": "整改方案.pdf",
    "url": "https://storage.example.com/attachments/整改方案.pdf",
    "size": 2048000,
    "content_type": "application/pdf",
    "created_at": "2023-05-03T08:30:00Z"
  }
}
\`\`\`

### 合并问题记录

\`\`\`
POST /issues/merge
\`\`\`

请求体：

\`\`\`json
{
  "issue_ids": ["issue_123", "issue_456"],
  "title": "3号楼混凝土质量问题汇总",
  "description": "汇总3号楼各层混凝土质量相关问题",
  "status": "pending",
  "priority": "high",
  "category": "quality"
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "issue_789",
    "title": "3号楼混凝土质量问题汇总",
    "description": "汇总3号楼各层混凝土质量相关问题",
    "status": "pending",
    "priority": "high",
    "category": "quality",
    "merged_issues": ["issue_123", "issue_456"],
    "created_by": {
      "id": "user_123",
      "name": "张三"
    },
    "created_at": "2023-05-03T10:00:00Z",
    "updated_at": "2023-05-03T10:00:00Z"
  }
}
\`\`\`

## 3. 旁站模块

### 获取旁站记录列表

\`\`\`
GET /supervision-records
\`\`\`

查询参数：
- `status`: 状态筛选
- `project_id`: 项目ID
- `created_by`: 创建人ID
- `created_at[gte]`: 创建时间起始
- `created_at[lte]`: 创建时间结束
- `search`: 搜索关键词

响应：

\`\`\`json
{
  "data": [
    {
      "id": "supervision_123",
      "title": "3号楼基础混凝土浇筑旁站记录",
      "project": {
        "id": "project_123",
        "name": "示范小区3号楼"
      },
      "location": "3号楼基础",
      "supervision_date": "2023-05-01T08:00:00Z",
      "supervisor": {
        "id": "user_123",
        "name": "张三"
      },
      "status": "completed",
      "created_at": "2023-05-01T16:00:00Z",
      "updated_at": "2023-05-01T16:30:00Z",
      "has_documents": true
    }
  ]
}
\`\`\`

### 获取单个旁站记录

\`\`\`
GET /supervision-records/{id}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "supervision_123",
    "title": "3号楼基础混凝土浇筑旁站记录",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "location": "3号楼基础",
    "supervision_date": "2023-05-01T08:00:00Z",
    "end_time": "2023-05-01T15:00:00Z",
    "supervisor": {
      "id": "user_123",
      "name": "张三"
    },
    "construction_unit": "XX建筑公司",
    "supervision_unit": "XX监理公司",
    "weather": "晴",
    "temperature": "25℃",
    "status": "completed",
    "check_items": [
      {
        "id": "check_item_123",
        "name": "模板支撑",
        "result": "合格",
        "remarks": "模板支撑牢固"
      },
      {
        "id": "check_item_456",
        "name": "钢筋绑扎",
        "result": "合格",
        "remarks": "钢筋间距符合设计要求"
      }
    ],
    "issues": [
      {
        "id": "issue_123",
        "title": "混凝土坍落度不足",
        "description": "部分混凝土坍落度不足，已要求调整配比",
        "status": "resolved"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "name": "现场照片.jpg",
        "url": "https://storage.example.com/attachments/现场照片.jpg",
        "size": 1024000,
        "content_type": "image/jpeg"
      }
    ],
    "documents": [
      {
        "id": "document_123",
        "name": "3号楼基础混凝土浇筑旁站记录.pdf",
        "url": "https://storage.example.com/documents/3号楼基础混凝土浇筑旁站记录.pdf",
        "created_at": "2023-05-01T16:30:00Z"
      }
    ],
    "created_at": "2023-05-01T16:00:00Z",
    "updated_at": "2023-05-01T16:30:00Z"
  }
}
\`\`\`

### 创建旁站记录

\`\`\`
POST /supervision-records
\`\`\`

请求体：

\`\`\`json
{
  "title": "3号楼基础混凝土浇筑旁站记录",
  "project_id": "project_123",
  "location": "3号楼基础",
  "supervision_date": "2023-05-01T08:00:00Z",
  "end_time": "2023-05-01T15:00:00Z",
  "construction_unit": "XX建筑公司",
  "supervision_unit": "XX监理公司",
  "weather": "晴",
  "temperature": "25℃",
  "check_items": [
    {
      "name": "模板支撑",
      "result": "合格",
      "remarks": "模板支撑牢固"
    },
    {
      "name": "钢筋绑扎",
      "result": "合格",
      "remarks": "钢筋间距符合设计要求"
    }
  ],
  "issues": [
    {
      "title": "混凝土坍落度不足",
      "description": "部分混凝土坍落度不足，已要求调整配比",
      "status": "resolved"
    }
  ],
  "attachments": ["attachment_123"]
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "supervision_123",
    "title": "3号楼基础混凝土浇筑旁站记录",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "location": "3号楼基础",
    "supervision_date": "2023-05-01T08:00:00Z",
    "end_time": "2023-05-01T15:00:00Z",
    "supervisor": {
      "id": "user_123",
      "name": "张三"
    },
    "construction_unit": "XX建筑公司",
    "supervision_unit": "XX监理公司",
    "weather": "晴",
    "temperature": "25℃",
    "status": "draft",
    "check_items": [
      {
        "id": "check_item_123",
        "name": "模板支撑",
        "result": "合格",
        "remarks": "模板支撑牢固"
      },
      {
        "id": "check_item_456",
        "name": "钢筋绑扎",
        "result": "合格",
        "remarks": "钢筋间距符合设计要求"
      }
    ],
    "issues": [
      {
        "id": "issue_123",
        "title": "混凝土坍落度不足",
        "description": "部分混凝土坍落度不足，已要求调整配比",
        "status": "resolved"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "name": "现场照片.jpg",
        "url": "https://storage.example.com/attachments/现场照片.jpg",
        "size": 1024000,
        "content_type": "image/jpeg"
      }
    ],
    "created_at": "2023-05-01T16:00:00Z",
    "updated_at": "2023-05-01T16:00:00Z"
  }
}
\`\`\`

### 更新旁站记录

\`\`\`
PUT /supervision-records/{id}
\`\`\`

请求体：

\`\`\`json
{
  "title": "3号楼基础混凝土浇筑旁站记录",
  "location": "3号楼基础",
  "supervision_date": "2023-05-01T08:00:00Z",
  "end_time": "2023-05-01T15:00:00Z",
  "construction_unit": "XX建筑公司",
  "supervision_unit": "XX监理公司",
  "weather": "晴转多云",
  "temperature": "23-27℃",
  "status": "completed",
  "check_items": [
    {
      "id": "check_item_123",
      "name": "模板支撑",
      "result": "合格",
      "remarks": "模板支撑牢固"
    },
    {
      "id": "check_item_456",
      "name": "钢筋绑扎",
      "result": "合格",
      "remarks": "钢筋间距符合设计要求"
    },
    {
      "name": "混凝土浇筑",
      "result": "合格",
      "remarks": "浇筑均匀，无漏振"
    }
  ],
  "issues": [
    {
      "id": "issue_123",
      "title": "混凝土坍落度不足",
      "description": "部分混凝土坍落度不足，已要求调整配比",
      "status": "resolved"
    }
  ],
  "attachments": ["attachment_123", "attachment_456"]
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "supervision_123",
    "title": "3号楼基础混凝土浇筑旁站记录",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "location": "3号楼基础",
    "supervision_date": "2023-05-01T08:00:00Z",
    "end_time": "2023-05-01T15:00:00Z",
    "supervisor": {
      "id": "user_123",
      "name": "张三"
    },
    "construction_unit": "XX建筑公司",
    "supervision_unit": "XX监理公司",
    "weather": "晴转多云",
    "temperature": "23-27℃",
    "status": "completed",
    "check_items": [
      {
        "id": "check_item_123",
        "name": "模板支撑",
        "result": "合格",
        "remarks": "模板支撑牢固"
      },
      {
        "id": "check_item_456",
        "name": "钢筋绑扎",
        "result": "合格",
        "remarks": "钢筋间距符合设计要求"
      },
      {
        "id": "check_item_789",
        "name": "混凝土浇筑",
        "result": "合格",
        "remarks": "浇筑均匀，无漏振"
      }
    ],
    "issues": [
      {
        "id": "issue_123",
        "title": "混凝土坍落度不足",
        "description": "部分混凝土坍落度不足，已要求调整配比",
        "status": "resolved"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "name": "现场照片.jpg",
        "url": "https://storage.example.com/attachments/现场照片.jpg",
        "size": 1024000,
        "content_type": "image/jpeg"
      },
      {
        "id": "attachment_456",
        "name": "浇筑完成照片.jpg",
        "url": "https://storage.example.com/attachments/浇筑完成照片.jpg",
        "size": 1536000,
        "content_type": "image/jpeg"
      }
    ],
    "created_at": "2023-05-01T16:00:00Z",
    "updated_at": "2023-05-01T16:30:00Z"
  }
}
\`\`\`

### 删除旁站记录

\`\`\`
DELETE /supervision-records/{id}
\`\`\`

响应：

\`\`\`
204 No Content
\`\`\`

### 生成旁站记录文档

\`\`\`
POST /supervision-records/{id}/generate-document
\`\`\`

请求体：

\`\`\`json
{
  "template_id": "template_123",
  "format": "pdf"
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "document_123",
    "name": "3号楼基础混凝土浇筑旁站记录.pdf",
    "url": "https://storage.example.com/documents/3号楼基础混凝土浇筑旁站记录.pdf",
    "size": 2048000,
    "content_type": "application/pdf",
    "created_at": "2023-05-01T16:30:00Z"
  }
}
\`\`\`

## 4. 监理日志模块

### 获取监理日志列表

\`\`\`
GET /daily-logs
\`\`\`

查询参数：
- `status`: 状态筛选
- `project_id`: 项目ID
- `created_by`: 创建人ID
- `date[gte]`: 日期起始
- `date[lte]`: 日期结束
- `search`: 搜索关键词

响应：

\`\`\`json
{
  "data": [
    {
      "id": "daily_log_123",
      "date": "2023-05-01",
      "project": {
        "id": "project_123",
        "name": "示范小区3号楼"
      },
      "supervisor": {
        "id": "user_123",
        "name": "张三"
      },
      "status": "completed",
      "created_at": "2023-05-01T18:00:00Z",
      "updated_at": "2023-05-01T18:30:00Z",
      "has_documents": true
    }
  ]
}
\`\`\`

### 获取单个监理日志

\`\`\`
GET /daily-logs/{id}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "daily_log_123",
    "date": "2023-05-01",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "supervisor": {
      "id": "user_123",
      "name": "张三"
    },
    "weather": "晴",
    "temperature": "25℃",
    "status": "completed",
    "construction_activities": [
      {
        "id": "activity_123",
        "content": "3号楼基础混凝土浇筑",
        "location": "3号楼基础",
        "participants": "XX建筑公司",
        "remarks": "浇筑顺利完成"
      }
    ],
    "supervision_activities": [
      {
        "id": "activity_456",
        "content": "旁站监理",
        "location": "3号楼基础",
        "participants": "张三",
        "remarks": "全程旁站"
      }
    ],
    "quality_issues": [
      {
        "id": "issue_123",
        "content": "混凝土坍落度不足",
        "location": "3号楼基础",
        "status": "resolved",
        "remarks": "已调整配比"
      }
    ],
    "safety_issues": [],
    "progress_issues": [],
    "cost_issues": [],
    "other_matters": [
      {
        "id": "matter_123",
        "content": "明日安排钢筋验收",
        "remarks": "需提前准备验收资料"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "name": "现场照片.jpg",
        "url": "https://storage.example.com/attachments/现场照片.jpg",
        "size": 1024000,
        "content_type": "image/jpeg"
      }
    ],
    "documents": [
      {
        "id": "document_123",
        "name": "2023-05-01监理日志.pdf",
        "url": "https://storage.example.com/documents/2023-05-01监理日志.pdf",
        "created_at": "2023-05-01T18:30:00Z"
      }
    ],
    "created_at": "2023-05-01T18:00:00Z",
    "updated_at": "2023-05-01T18:30:00Z"
  }
}
\`\`\`

### 创建监理日志

\`\`\`
POST /daily-logs
\`\`\`

请求体：

\`\`\`json
{
  "date": "2023-05-01",
  "project_id": "project_123",
  "weather": "晴",
  "temperature": "25℃",
  "construction_activities": [
    {
      "content": "3号楼基础混凝土浇筑",
      "location": "3号楼基础",
      "participants": "XX建筑公司",
      "remarks": "浇筑顺利完成"
    }
  ],
  "supervision_activities": [
    {
      "content": "旁站监理",
      "location": "3号楼基础",
      "participants": "张三",
      "remarks": "全程旁站"
    }
  ],
  "quality_issues": [
    {
      "content": "混凝土坍落度不足",
      "location": "3号楼基础",
      "status": "resolved",
      "remarks": "已调整配比"
    }
  ],
  "safety_issues": [],
  "progress_issues": [],
  "cost_issues": [],
  "other_matters": [
    {
      "content": "明日安排钢筋验收",
      "remarks": "需提前准备验收资料"
    }
  ],
  "attachments": ["attachment_123"]
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "daily_log_123",
    "date": "2023-05-01",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "supervisor": {
      "id": "user_123",
      "name": "张三"
    },
    "weather": "晴",
    "temperature": "25℃",
    "status": "draft",
    "construction_activities": [
      {
        "id": "activity_123",
        "content": "3号楼基础混凝土浇筑",
        "location": "3号楼基础",
        "participants": "XX建筑公司",
        "remarks": "浇筑顺利完成"
      }
    ],
    "supervision_activities": [
      {
        "id": "activity_456",
        "content": "旁站监理",
        "location": "3号楼基础",
        "participants": "张三",
        "remarks": "全程旁站"
      }
    ],
    "quality_issues": [
      {
        "id": "issue_123",
        "content": "混凝土坍落度不足",
        "location": "3号楼基础",
        "status": "resolved",
        "remarks": "已调整配比"
      }
    ],
    "safety_issues": [],
    "progress_issues": [],
    "cost_issues": [],
    "other_matters": [
      {
        "id": "matter_123",
        "content": "明日安排钢筋验收",
        "remarks": "需提前准备验收资料"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "name": "现场照片.jpg",
        "url": "https://storage.example.com/attachments/现场照片.jpg",
        "size": 1024000,
        "content_type": "image/jpeg"
      }
    ],
    "created_at": "2023-05-01T18:00:00Z",
    "updated_at": "2023-05-01T18:00:00Z"
  }
}
\`\`\`

### 更新监理日志

\`\`\`
PUT /daily-logs/{id}
\`\`\`

请求体：

\`\`\`json
{
  "date": "2023-05-01",
  "weather": "晴转多云",
  "temperature": "23-27℃",
  "status": "completed",
  "construction_activities": [
    {
      "id": "activity_123",
      "content": "3号楼基础混凝土浇筑",
      "location": "3号楼基础",
      "participants": "XX建筑公司",
      "remarks": "浇筑顺利完成"
    }
  ],
  "supervision_activities": [
    {
      "id": "activity_456",
      "content": "旁站监理",
      "location": "3号楼基础",
      "participants": "张三",
      "remarks": "全程旁站"
    },
    {
      "content": "材料验收",
      "location": "材料堆场",
      "participants": "张三",
      "remarks": "钢筋进场验收"
    }
  ],
  "quality_issues": [
    {
      "id": "issue_123",
      "content": "混凝土坍落度不足",
      "location": "3号楼基础",
      "status": "resolved",
      "remarks": "已调整配比"
    }
  ],
  "safety_issues": [],
  "progress_issues": [],
  "cost_issues": [],
  "other_matters": [
    {
      "id": "matter_123",
      "content": "明日安排钢筋验收",
      "remarks": "需提前准备验收资料"
    }
  ],
  "attachments": ["attachment_123", "attachment_456"]
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "daily_log_123",
    "date": "2023-05-01",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "supervisor": {
      "id": "user_123",
      "name": "张三"
    },
    "weather": "晴转多云",
    "temperature": "23-27℃",
    "status": "completed",
    "construction_activities": [
      {
        "id": "activity_123",
        "content": "3号楼基础混凝土浇筑",
        "location": "3号楼基础",
        "participants": "XX建筑公司",
        "remarks": "浇筑顺利完成"
      }
    ],
    "supervision_activities": [
      {
        "id": "activity_456",
        "content": "旁站监理",
        "location": "3号楼基础",
        "participants": "张三",
        "remarks": "全程旁站"
      },
      {
        "id": "activity_789",
        "content": "材料验收",
        "location": "材料堆场",
        "participants": "张三",
        "remarks": "钢筋进场验收"
      }
    ],
    "quality_issues": [
      {
        "id": "issue_123",
        "content": "混凝土坍落度不足",
        "location": "3号楼基础",
        "status": "resolved",
        "remarks": "已调整配比"
      }
    ],
    "safety_issues": [],
    "progress_issues": [],
    "cost_issues": [],
    "other_matters": [
      {
        "id": "matter_123",
        "content": "明日安排钢筋验收",
        "remarks": "需提前准备验收资料"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "name": "现场照片.jpg",
        "url": "https://storage.example.com/attachments/现场照片.jpg",
        "size": 1024000,
        "content_type": "image/jpeg"
      },
      {
        "id": "attachment_456",
        "name": "钢筋堆放照片.jpg",
        "url": "https://storage.example.com/attachments/钢筋堆放照片.jpg",
        "size": 1536000,
        "content_type": "image/jpeg"
      }
    ],
    "created_at": "2023-05-01T18:00:00Z",
    "updated_at": "2023-05-01T18:30:00Z"
  }
}
\`\`\`

### 删除监理日志

\`\`\`
DELETE /daily-logs/{id}
\`\`\`

响应：

\`\`\`
204 No Content
\`\`\`

### 生成监理日志文档

\`\`\`
POST /daily-logs/{id}/generate-document
\`\`\`

请求体：

\`\`\`json
{
  "template_id": "template_123",
  "format": "pdf"
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "document_123",
    "name": "2023-05-01监理日志.pdf",
    "url": "https://storage.example.com/documents/2023-05-01监理日志.pdf",
    "size": 2048000,
    "content_type": "application/pdf",
    "created_at": "2023-05-01T18:30:00Z"
  }
}
\`\`\`

## 5. 会议纪要模块

### 获取会议纪要列表

\`\`\`
GET /meeting-minutes
\`\`\`

查询参数：
- `status`: 状态筛选
- `project_id`: 项目ID
- `created_by`: 创建人ID
- `date[gte]`: 会议日期起始
- `date[lte]`: 会议日期结束
- `search`: 搜索关键词

响应：

\`\`\`json
{
  "data": [
    {
      "id": "meeting_123",
      "title": "3号楼施工协调会",
      "meeting_date": "2023-05-01T10:00:00Z",  [
    {
      "id": "meeting_123",
      "title": "3号楼施工协调会",
      "meeting_date": "2023-05-01T10:00:00Z",
      "project": {
        "id": "project_123",
        "name": "示范小区3号楼"
      },
      "recorder": {
        "id": "user_123",
        "name": "张三"
      },
      "status": "completed",
      "created_at": "2023-05-01T12:00:00Z",
      "updated_at": "2023-05-01T12:30:00Z",
      "has_documents": true
    }
  ]
}
\`\`\`

### 获取单个会议纪要

\`\`\`
GET /meeting-minutes/{id}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "meeting_123",
    "title": "3号楼施工协调会",
    "meeting_date": "2023-05-01T10:00:00Z",
    "end_time": "2023-05-01T11:30:00Z",
    "location": "项目部会议室",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "recorder": {
      "id": "user_123",
      "name": "张三"
    },
    "chairman": "李四",
    "attendees": "张三、李四、王五、赵六",
    "absent": "钱七",
    "status": "completed",
    "agenda": [
      {
        "id": "agenda_123",
        "title": "上周工作总结",
        "content": "完成了基础混凝土浇筑工作"
      },
      {
        "id": "agenda_456",
        "title": "本周工作计划",
        "content": "开始钢筋绑扎工作"
      }
    ],
    "decisions": [
      {
        "id": "decision_123",
        "content": "加快钢筋进场速度",
        "responsible": "王五",
        "deadline": "2023-05-03T00:00:00Z"
      }
    ],
    "action_items": [
      {
        "id": "action_123",
        "content": "准备钢筋验收资料",
        "responsible": "赵六",
        "deadline": "2023-05-02T00:00:00Z",
        "status": "pending"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "name": "会议签到表.jpg",
        "url": "https://storage.example.com/attachments/会议签到表.jpg",
        "size": 1024000,
        "content_type": "image/jpeg"
      }
    ],
    "documents": [
      {
        "id": "document_123",
        "name": "3号楼施工协调会会议纪要.pdf",
        "url": "https://storage.example.com/documents/3号楼施工协调会会议纪要.pdf",
        "created_at": "2023-05-01T12:30:00Z"
      }
    ],
    "created_at": "2023-05-01T12:00:00Z",
    "updated_at": "2023-05-01T12:30:00Z"
  }
}
\`\`\`

### 创建会议纪要

\`\`\`
POST /meeting-minutes
\`\`\`

请求体：

\`\`\`json
{
  "title": "3号楼施工协调会",
  "meeting_date": "2023-05-01T10:00:00Z",
  "end_time": "2023-05-01T11:30:00Z",
  "location": "项目部会议室",
  "project_id": "project_123",
  "chairman": "李四",
  "attendees": "张三、李四、王五、赵六",
  "absent": "钱七",
  "agenda": [
    {
      "title": "上周工作总结",
      "content": "完成了基础混凝土浇筑工作"
    },
    {
      "title": "本周工作计划",
      "content": "开始钢筋绑扎工作"
    }
  ],
  "decisions": [
    {
      "content": "加快钢筋进场速度",
      "responsible": "王五",
      "deadline": "2023-05-03T00:00:00Z"
    }
  ],
  "action_items": [
    {
      "content": "准备钢筋验收资料",
      "responsible": "赵六",
      "deadline": "2023-05-02T00:00:00Z",
      "status": "pending"
    }
  ],
  "attachments": ["attachment_123"]
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "meeting_123",
    "title": "3号楼施工协调会",
    "meeting_date": "2023-05-01T10:00:00Z",
    "end_time": "2023-05-01T11:30:00Z",
    "location": "项目部会议室",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "recorder": {
      "id": "user_123",
      "name": "张三"
    },
    "chairman": "李四",
    "attendees": "张三、李四、王五、赵六",
    "absent": "钱七",
    "status": "draft",
    "agenda": [
      {
        "id": "agenda_123",
        "title": "上周工作总结",
        "content": "完成了基础混凝土浇筑工作"
      },
      {
        "id": "agenda_456",
        "title": "本周工作计划",
        "content": "开始钢筋绑扎工作"
      }
    ],
    "decisions": [
      {
        "id": "decision_123",
        "content": "加快钢筋进场速度",
        "responsible": "王五",
        "deadline": "2023-05-03T00:00:00Z"
      }
    ],
    "action_items": [
      {
        "id": "action_123",
        "content": "准备钢筋验收资料",
        "responsible": "赵六",
        "deadline": "2023-05-02T00:00:00Z",
        "status": "pending"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "name": "会议签到表.jpg",
        "url": "https://storage.example.com/attachments/会议签到表.jpg",
        "size": 1024000,
        "content_type": "image/jpeg"
      }
    ],
    "created_at": "2023-05-01T12:00:00Z",
    "updated_at": "2023-05-01T12:00:00Z"
  }
}
\`\`\`

### 更新会议纪要

\`\`\`
PUT /meeting-minutes/{id}
\`\`\`

请求体：

\`\`\`json
{
  "title": "3号楼施工协调会",
  "meeting_date": "2023-05-01T10:00:00Z",
  "end_time": "2023-05-01T11:30:00Z",
  "location": "项目部会议室",
  "chairman": "李四",
  "attendees": "张三、李四、王五、赵六、钱七",
  "absent": "",
  "status": "completed",
  "agenda": [
    {
      "id": "agenda_123",
      "title": "上周工作总结",
      "content": "完成了基础混凝土浇筑工作"
    },
    {
      "id": "agenda_456",
      "title": "本周工作计划",
      "content": "开始钢筋绑扎工作"
    },
    {
      "title": "质量问题讨论",
      "content": "讨论了混凝土强度不足问题的解决方案"
    }
  ],
  "decisions": [
    {
      "id": "decision_123",
      "content": "加快钢筋进场速度",
      "responsible": "王五",
      "deadline": "2023-05-03T00:00:00Z"
    },
    {
      "content": "加强混凝土养护",
      "responsible": "赵六",
      "deadline": "2023-05-05T00:00:00Z"
    }
  ],
  "action_items": [
    {
      "id": "action_123",
      "content": "准备钢筋验收资料",
      "responsible": "赵六",
      "deadline": "2023-05-02T00:00:00Z",
      "status": "completed"
    }
  ],
  "attachments": ["attachment_123", "attachment_456"]
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "meeting_123",
    "title": "3号楼施工协调会",
    "meeting_date": "2023-05-01T10:00:00Z",
    "end_time": "2023-05-01T11:30:00Z",
    "location": "项目部会议室",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "recorder": {
      "id": "user_123",
      "name": "张三"
    },
    "chairman": "李四",
    "attendees": "张三、李四、王五、赵六、钱七",
    "absent": "",
    "status": "completed",
    "agenda": [
      {
        "id": "agenda_123",
        "title": "上周工作总结",
        "content": "完成了基础混凝土浇筑工作"
      },
      {
        "id": "agenda_456",
        "title": "本周工作计划",
        "content": "开始钢筋绑扎工作"
      },
      {
        "id": "agenda_789",
        "title": "质量问题讨论",
        "content": "讨论了混凝土强度不足问题的解决方案"
      }
    ],
    "decisions": [
      {
        "id": "decision_123",
        "content": "加快钢筋进场速度",
        "responsible": "王五",
        "deadline": "2023-05-03T00:00:00Z"
      },
      {
        "id": "decision_456",
        "content": "加强混凝土养护",
        "responsible": "赵六",
        "deadline": "2023-05-05T00:00:00Z"
      }
    ],
    "action_items": [
      {
        "id": "action_123",
        "content": "准备钢筋验收资料",
        "responsible": "赵六",
        "deadline": "2023-05-02T00:00:00Z",
        "status": "completed"
      }
    ],
    "attachments": [
      {
        "id": "attachment_123",
        "name": "会议签到表.jpg",
        "url": "https://storage.example.com/attachments/会议签到表.jpg",
        "size": 1024000,
        "content_type": "image/jpeg"
      },
      {
        "id": "attachment_456",
        "name": "会议照片.jpg",
        "url": "https://storage.example.com/attachments/会议照片.jpg",
        "size": 1536000,
        "content_type": "image/jpeg"
      }
    ],
    "created_at": "2023-05-01T12:00:00Z",
    "updated_at": "2023-05-01T12:30:00Z"
  }
}
\`\`\`

### 删除会议纪要

\`\`\`
DELETE /meeting-minutes/{id}
\`\`\`

响应：

\`\`\`
204 No Content
\`\`\`

### 生成会议纪要文档

\`\`\`
POST /meeting-minutes/{id}/generate-document
\`\`\`

请求体：

\`\`\`json
{
  "template_id": "template_123",
  "format": "pdf"
}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "document_123",
    "name": "3号楼施工协调会会议纪要.pdf",
    "url": "https://storage.example.com/documents/3号楼施工协调会会议纪要.pdf",
    "size": 2048000,
    "content_type": "application/pdf",
    "created_at": "2023-05-01T12:30:00Z"
  }
}
\`\`\`

## 6. 已生成文档模块

### 获取文档列表

\`\`\`
GET /documents
\`\`\`

查询参数：
- `type`: 文档类型（inspection_record/notification/supervision_record/daily_log/meeting_minute）
- `project_id`: 项目ID
- `created_by`: 创建人ID
- `created_at[gte]`: 创建时间起始
- `created_at[lte]`: 创建时间结束
- `search`: 搜索关键词

响应：

\`\`\`json
{
  "data": [
    {
      "id": "document_123",
      "name": "3号楼基础混凝土浇筑旁站记录.pdf",
      "type": "supervision_record",
      "project": {
        "id": "project_123",
        "name": "示范小区3号楼"
      },
      "creator": {
        "id": "user_123",
        "name": "张三"
      },
      "size": 2048000,
      "content_type": "application/pdf",
      "url": "https://storage.example.com/documents/3号楼基础混凝土浇筑旁站记录.pdf",
      "source_id": "supervision_123",
      "created_at": "2023-05-01T16:30:00Z"
    }
  ]
}
\`\`\`

### 获取单个文档

\`\`\`
GET /documents/{id}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "document_123",
    "name": "3号楼基础混凝土浇筑旁站记录.pdf",
    "type": "supervision_record",
    "project": {
      "id": "project_123",
      "name": "示范小区3号楼"
    },
    "creator": {
      "id": "user_123",
      "name": "张三"
    },
    "size": 2048000,
    "content_type": "application/pdf",
    "url": "https://storage.example.com/documents/3号楼基础混凝土浇筑旁站记录.pdf",
    "source_id": "supervision_123",
    "source_url": "/supervision-records/supervision_123",
    "created_at": "2023-05-01T16:30:00Z",
    "updated_at": "2023-05-01T16:30:00Z"
  }
}
\`\`\`

### 删除文档

\`\`\`
DELETE /documents/{id}
\`\`\`

响应：

\`\`\`
204 No Content
\`\`\`

## 7. 其他功能模块

### 附件 (Attachments)

#### 上传附件

\`\`\`
POST /attachments
\`\`\`

请求体（multipart/form-data）：

\`\`\`
file: [文件数据]
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "attachment_123",
    "name": "现场照片.jpg",
    "size": 1024000,
    "content_type": "image/jpeg",
    "url": "https://storage.example.com/attachments/现场照片.jpg",
    "created_at": "2023-05-01T10:00:00Z"
  }
}
\`\`\`

#### 获取附件

\`\`\`
GET /attachments/{id}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "attachment_123",
    "name": "现场照片.jpg",
    "size": 1024000,
    "content_type": "image/jpeg",
    "url": "https://storage.example.com/attachments/现场照片.jpg",
    "created_at": "2023-05-01T10:00:00Z",
    "updated_at": "2023-05-01T10:00:00Z"
  }
}
\`\`\`

#### 删除附件

\`\`\`
DELETE /attachments/{id}
\`\`\`

响应：

\`\`\`
204 No Content
\`\`\`

### 事件 (Events)

#### 获取事件列表

\`\`\`
GET /events
\`\`\`

查询参数：
- `type`: 事件类型（issue/supervision_record/daily_log/meeting_minute）
- `project_id`: 项目ID
- `created_by`: 创建人ID
- `created_at[gte]`: 创建时间起始
- `created_at[lte]`: 创建时间结束
- `status`: 状态
- `search`: 搜索关键词
- `tags`: 标签（逗号分隔）

响应：

\`\`\`json
{
  "data": [
    {
      "id": "event_123",
      "type": "issue",
      "title": "混凝土强度不足",
      "description": "3号楼2层混凝土强度检测结果低于设计要求",
      "status": "pending",
      "priority": "high",
      "location": "3号楼2层",
      "category": "quality",
      "project": {
        "id": "project_123",
        "name": "示范小区3号楼"
      },
      "created_by": {
        "id": "user_123",
        "name": "张三"
      },
      "created_at": "2023-05-01T10:00:00Z",
      "updated_at": "2023-05-02T14:30:00Z",
      "source_id": "issue_123",
      "source_url": "/issues/issue_123",
      "tags": ["混凝土", "强度", "质量问题"]
    }
  ]
}
\`\`\`

### 用户 (Users)

#### 获取用户列表

\`\`\`
GET /users
\`\`\`

查询参数：
- `role`: 角色
- `search`: 搜索关键词

响应：

\`\`\`json
{
  "data": [
    {
      "id": "user_123",
      "name": "张三",
      "email": "zhangsan@example.com",
      "role": "supervisor",
      "avatar_url": "https://storage.example.com/avatars/zhangsan.jpg",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-05-01T00:00:00Z"
    }
  ]
}
\`\`\`

#### 获取单个用户

\`\`\`
GET /users/{id}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "user_123",
    "name": "张三",
    "email": "zhangsan@example.com",
    "role": "supervisor",
    "avatar_url": "https://storage.example.com/avatars/zhangsan.jpg",
    "phone": "13800138000",
    "department": "监理部",
    "position": "总监理工程师",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-05-01T00:00:00Z"
  }
}
\`\`\`

### 项目 (Projects)

#### 获取项目列表

\`\`\`
GET /projects
\`\`\`

查询参数：
- `status`: 状态
- `search`: 搜索关键词

响应：

\`\`\`json
{
  "data": [
    {
      "id": "project_123",
      "name": "示范小区3号楼",
      "code": "XM2023001",
      "status": "in_progress",
      "start_date": "2023-01-01",
      "end_date": "2023-12-31",
      "location": "北京市朝阳区",
      "owner": "XX房地产开发有限公司",
      "contractor": "XX建筑工程有限公司",
      "supervision_unit": "XX监理有限公司",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

#### 获取单个项目

\`\`\`
GET /projects/{id}
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "id": "project_123",
    "name": "示范小区3号楼",
    "code": "XM2023001",
    "description": "示范小区3号楼建设项目",
    "status": "in_progress",
    "start_date": "2023-01-01",
    "end_date": "2023-12-31",
    "location": "北京市朝阳区",
    "owner": "XX房地产开发有限公司",
    "contractor": "XX建筑工程有限公司",
    "supervision_unit": "XX监理有限公司",
    "project_manager": {
      "id": "user_456",
      "name": "李四"
    },
    "chief_supervisor": {
      "id": "user_123",
      "name": "张三"
    },
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
\`\`\`

### 统计 (Statistics)

#### 获取项目统计数据

\`\`\`
GET /projects/{id}/statistics
\`\`\`

响应：

\`\`\`json
{
  "data": {
    "issues": {
      "total": 100,
      "pending": 20,
      "in_progress": 30,
      "resolved": 40,
      "closed": 10
    },
    "supervision_records": {
      "total": 50,
      "draft": 5,
      "completed": 45
    },
    "daily_logs": {
      "total": 120,
      "draft": 10,
      "completed": 110
    },
    "meeting_minutes": {
      "total": 30,
      "draft": 2,
      "completed": 28
    },
    "documents": {
      "total": 200,
      "by_type": {
        "inspection_record": 40,
        "notification": 30,
        "supervision_record": 50,
        "daily_log": 50,
        "meeting_minute": 30
      }
    }
  }
}
\`\`\`

## 数据模型

### 问题记录 (Issue)

\`\`\`json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "string (pending/in_progress/resolved/closed)",
  "priority": "string (low/medium/high)",
  "location": "string",
  "category": "string (quality/safety/progress/cost/other)",
  "project_id": "string",
  "created_by": "string (user_id)",
  "assigned_to": "string (user_id)",
  "due_date": "datetime",
  "attachments": ["string (attachment_id)"],
  "tags": ["string"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
\`\`\`

### 旁站记录 (Supervision Record)

\`\`\`json
{
  "id": "string",
  "title": "string",
  "project_id": "string",
  "location": "string",
  "supervision_date": "datetime",
  "end_time": "datetime",
  "supervisor": "string (user_id)",
  "construction_unit": "string",
  "supervision_unit": "string",
  "weather": "string",
  "temperature": "string",
  "status": "string (draft/completed)",
  "check_items": [
    {
      "id": "string",
      "name": "string",
      "result": "string",
      "remarks": "string"
    }
  ],
  "issues": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "string"
    }
  ],
  "attachments": ["string (attachment_id)"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
\`\`\`

### 监理日志 (Daily Log)

\`\`\`json
{
  "id": "string",
  "date": "date",
  "project_id": "string",
  "supervisor": "string (user_id)",
  "weather": "string",
  "temperature": "string",
  "status": "string (draft/completed)",
  "construction_activities": [
    {
      "id": "string",
      "content": "string",
      "location": "string",
      "participants": "string",
      "remarks": "string"
    }
  ],
  "supervision_activities": [
    {
      "id": "string",
      "content": "string",
      "location": "string",
      "participants": "string",
      "remarks": "string"
    }
  ],
  "quality_issues": [
    {
      "id": "string",
      "content": "string",
      "location": "string",
      "status": "string",
      "remarks": "string"
    }
  ],
  "safety_issues": [
    {
      "id": "string",
      "content": "string",
      "location": "string",
      "status": "string",
      "remarks": "string"
    }
  ],
  "progress_issues": [
    {
      "id": "string",
      "content": "string",
      "location": "string",
      "status": "string",
      "remarks": "string"
    }
  ],
  "cost_issues": [
    {
      "id": "string",
      "content": "string",
      "location": "string",
      "status": "string",
      "remarks": "string"
    }
  ],
  "other_matters": [
    {
      "id": "string",
      "content": "string",
      "remarks": "string"
    }
  ],
  "attachments": ["string (attachment_id)"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
\`\`\`

### 会议纪要 (Meeting Minute)

\`\`\`json
{
  "id": "string",
  "title": "string",
  "meeting_date": "datetime",
  "end_time": "datetime",
  "location": "string",
  "project_id": "string",
  "recorder": "string (user_id)",
  "chairman": "string",
  "attendees": "string",
  "absent": "string",
  "status": "string (draft/completed)",
  "agenda": [
    {
      "id": "string",
      "title": "string",
      "content": "string"
    }
  ],
  "decisions": [
    {
      "id": "string",
      "content": "string",
      "responsible": "string",
      "deadline": "datetime"
    }
  ],
  "action_items": [
    {
      "id": "string",
      "content": "string",
      "responsible": "string",
      "deadline": "datetime",
      "status": "string (pending/in_progress/completed)"
    }
  ],
  "attachments": ["string (attachment_id)"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
\`\`\`

### 文档 (Document)

\`\`\`json
{
  "id": "string",
  "name": "string",
  "type": "string (inspection_record/notification/supervision_record/daily_log/meeting_minute)",
  "project_id": "string",
  "creator": "string (user_id)",
  "size": "number",
  "content_type": "string",
  "url": "string",
  "source_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
\`\`\`

### 附件 (Attachment)

\`\`\`json
{
  "id": "string",
  "name": "string",
  "size": "number",
  "content_type": "string",
  "url": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
\`\`\`

### 用户 (User)

\`\`\`json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "string (admin/supervisor/manager/viewer)",
  "avatar_url": "string",
  "phone": "string",
  "department": "string",
  "position": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
\`\`\`

### 项目 (Project)

\`\`\`json
{
  "id": "string",
  "name": "string",
  "code": "string",
  "description": "string",
  "status": "string (planning/in_progress/completed/suspended)",
  "start_date": "date",
  "end_date": "date",
  "location": "string",
  "owner": "string",
  "contractor": "string",
  "supervision_unit": "string",
  "project_manager": "string (user_id)",
  "chief_supervisor": "string (user_id)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
