import express from "express"
import cors from "cors"
import { v4 as uuidv4 } from "uuid"
import {
  mockIssues,
  mockSupervisionRecords,
  mockDailyLogs,
  mockMeetingMinutes,
  mockUsers,
  mockProjects,
  mockAttachments,
  mockDocuments,
} from "./mock-data.js"

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// In-memory database
const db = {
  issues: [...mockIssues],
  supervisionRecords: [...mockSupervisionRecords],
  dailyLogs: [...mockDailyLogs],
  meetingMinutes: [...mockMeetingMinutes],
  users: [...mockUsers],
  projects: [...mockProjects],
  attachments: [...mockAttachments],
  documents: [...mockDocuments],
  comments: [],
  checkItems: [],
  agendas: [],
  decisions: [],
  actionItems: [],
}

// Helper functions
const paginate = (array, page = 1, perPage = 20) => {
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  return array.slice(startIndex, endIndex)
}

const filterByQuery = (array, query) => {
  if (!query) return array

  return array.filter((item) => {
    // Simple search across all string fields
    return Object.values(item).some((value) => {
      if (typeof value === "string") {
        return value.toLowerCase().includes(query.toLowerCase())
      }
      return false
    })
  })
}

const filterByStatus = (array, status) => {
  if (!status || status === "all") return array
  return array.filter((item) => item.status === status)
}

const filterByDateRange = (array, startDate, endDate, dateField = "created_at") => {
  let filtered = [...array]

  if (startDate) {
    filtered = filtered.filter((item) => new Date(item[dateField]) >= new Date(startDate))
  }

  if (endDate) {
    filtered = filtered.filter((item) => new Date(item[dateField]) <= new Date(endDate))
  }

  return filtered
}

const sortArray = (array, sortField = "created_at", order = "desc") => {
  return [...array].sort((a, b) => {
    if (order === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1
    } else {
      return a[sortField] < b[sortField] ? 1 : -1
    }
  })
}

// Authentication routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body

  // Simple mock authentication
  if (username && password) {
    const user = db.users.find((u) => u.email === username)

    if (user) {
      res.json({
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } else {
      res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid username or password",
        },
      })
    }
  } else {
    res.status(400).json({
      error: {
        code: "MISSING_CREDENTIALS",
        message: "Username and password are required",
      },
    })
  }
})

app.post("/api/auth/refresh", (req, res) => {
  res.json({
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })
})

app.post("/api/auth/logout", (req, res) => {
  res.status(204).send()
})

// Issues routes
app.get("/api/issues", (req, res) => {
  const {
    page = 1,
    per_page = 20,
    status,
    search,
    sort = "created_at",
    order = "desc",
    created_at_gte,
    created_at_lte,
  } = req.query

  let filteredIssues = [...db.issues]

  // Apply filters
  if (status) filteredIssues = filterByStatus(filteredIssues, status)
  if (search) filteredIssues = filterByQuery(filteredIssues, search)
  if (created_at_gte || created_at_lte) {
    filteredIssues = filterByDateRange(filteredIssues, created_at_gte, created_at_lte)
  }

  // Apply sorting
  filteredIssues = sortArray(filteredIssues, sort, order)

  // Apply pagination
  const paginatedIssues = paginate(filteredIssues, Number.parseInt(page), Number.parseInt(per_page))

  // Enhance the data with user information
  const enhancedIssues = paginatedIssues.map((issue) => {
    const createdBy = db.users.find((user) => user.id === issue.created_by) || {
      id: issue.created_by,
      name: "Unknown User",
    }
    const assignedTo = issue.assigned_to ? db.users.find((user) => user.id === issue.assigned_to) : null

    return {
      ...issue,
      created_by: {
        id: createdBy.id,
        name: createdBy.name,
      },
      assigned_to: assignedTo
        ? {
            id: assignedTo.id,
            name: assignedTo.name,
          }
        : null,
      attachments: issue.attachments
        ? issue.attachments.map((attachmentId) => {
            const attachment = db.attachments.find((a) => a.id === attachmentId)
            return attachment || { id: attachmentId, name: "Unknown Attachment" }
          })
        : [],
    }
  })

  // Set pagination headers
  res.set({
    "X-Total-Count": filteredIssues.length,
    "X-Page": page,
    "X-Per-Page": per_page,
    "X-Total-Pages": Math.ceil(filteredIssues.length / per_page),
  })

  res.json({ data: enhancedIssues })
})

app.get("/api/issues/:id", (req, res) => {
  const issue = db.issues.find((i) => i.id === req.params.id)

  if (!issue) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Issue not found",
      },
    })
  }

  const createdBy = db.users.find((user) => user.id === issue.created_by) || {
    id: issue.created_by,
    name: "Unknown User",
  }
  const assignedTo = issue.assigned_to ? db.users.find((user) => user.id === issue.assigned_to) : null

  const comments = db.comments
    .filter((c) => c.issue_id === issue.id)
    .map((comment) => {
      const commentUser = db.users.find((user) => user.id === comment.created_by) || {
        id: comment.created_by,
        name: "Unknown User",
      }
      return {
        ...comment,
        created_by: {
          id: commentUser.id,
          name: commentUser.name,
        },
      }
    })

  const enhancedIssue = {
    ...issue,
    created_by: {
      id: createdBy.id,
      name: createdBy.name,
    },
    assigned_to: assignedTo
      ? {
          id: assignedTo.id,
          name: assignedTo.name,
        }
      : null,
    attachments: issue.attachments
      ? issue.attachments.map((attachmentId) => {
          const attachment = db.attachments.find((a) => a.id === attachmentId)
          return attachment || { id: attachmentId, name: "Unknown Attachment" }
        })
      : [],
    comments,
    history: [], // Mock history data could be added here
  }

  res.json({ data: enhancedIssue })
})

app.post("/api/issues", (req, res) => {
  const newIssue = {
    id: `issue_${uuidv4()}`,
    ...req.body,
    created_by: "user_123", // Assuming the authenticated user
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  db.issues.push(newIssue)

  const createdBy = db.users.find((user) => user.id === newIssue.created_by) || {
    id: newIssue.created_by,
    name: "Unknown User",
  }
  const assignedTo = newIssue.assigned_to ? db.users.find((user) => user.id === newIssue.assigned_to) : null

  const enhancedIssue = {
    ...newIssue,
    created_by: {
      id: createdBy.id,
      name: createdBy.name,
    },
    assigned_to: assignedTo
      ? {
          id: assignedTo.id,
          name: assignedTo.name,
        }
      : null,
    attachments: newIssue.attachments
      ? newIssue.attachments.map((attachmentId) => {
          const attachment = db.attachments.find((a) => a.id === attachmentId)
          return attachment || { id: attachmentId, name: "Unknown Attachment" }
        })
      : [],
  }

  res.status(201).json({ data: enhancedIssue })
})

app.put("/api/issues/:id", (req, res) => {
  const issueIndex = db.issues.findIndex((i) => i.id === req.params.id)

  if (issueIndex === -1) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Issue not found",
      },
    })
  }

  const updatedIssue = {
    ...db.issues[issueIndex],
    ...req.body,
    updated_at: new Date().toISOString(),
  }

  db.issues[issueIndex] = updatedIssue

  const createdBy = db.users.find((user) => user.id === updatedIssue.created_by) || {
    id: updatedIssue.created_by,
    name: "Unknown User",
  }
  const assignedTo = updatedIssue.assigned_to ? db.users.find((user) => user.id === updatedIssue.assigned_to) : null

  const enhancedIssue = {
    ...updatedIssue,
    created_by: {
      id: createdBy.id,
      name: createdBy.name,
    },
    assigned_to: assignedTo
      ? {
          id: assignedTo.id,
          name: assignedTo.name,
        }
      : null,
    attachments: updatedIssue.attachments
      ? updatedIssue.attachments.map((attachmentId) => {
          const attachment = db.attachments.find((a) => a.id === attachmentId)
          return attachment || { id: attachmentId, name: "Unknown Attachment" }
        })
      : [],
  }

  res.json({ data: enhancedIssue })
})

app.delete("/api/issues/:id", (req, res) => {
  const issueIndex = db.issues.findIndex((i) => i.id === req.params.id)

  if (issueIndex === -1) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Issue not found",
      },
    })
  }

  db.issues.splice(issueIndex, 1)

  res.status(204).send()
})

app.post("/api/issues/:id/comments", (req, res) => {
  const issue = db.issues.find((i) => i.id === req.params.id)

  if (!issue) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Issue not found",
      },
    })
  }

  const newComment = {
    id: `comment_${uuidv4()}`,
    issue_id: req.params.id,
    content: req.body.content,
    created_by: "user_123", // Assuming the authenticated user
    created_at: new Date().toISOString(),
  }

  db.comments.push(newComment)

  const createdBy = db.users.find((user) => user.id === newComment.created_by) || {
    id: newComment.created_by,
    name: "Unknown User",
  }

  const enhancedComment = {
    ...newComment,
    created_by: {
      id: createdBy.id,
      name: createdBy.name,
    },
  }

  res.status(201).json({ data: enhancedComment })
})

// Supervision Records routes
app.get("/api/supervision-records", (req, res) => {
  const {
    page = 1,
    per_page = 20,
    status,
    search,
    sort = "created_at",
    order = "desc",
    created_at_gte,
    created_at_lte,
  } = req.query

  let filteredRecords = [...db.supervisionRecords]

  // Apply filters
  if (status) filteredRecords = filterByStatus(filteredRecords, status)
  if (search) filteredRecords = filterByQuery(filteredRecords, search)
  if (created_at_gte || created_at_lte) {
    filteredRecords = filterByDateRange(filteredRecords, created_at_gte, created_at_lte)
  }

  // Apply sorting
  filteredRecords = sortArray(filteredRecords, sort, order)

  // Apply pagination
  const paginatedRecords = paginate(filteredRecords, Number.parseInt(page), Number.parseInt(per_page))

  // Enhance the data with project and user information
  const enhancedRecords = paginatedRecords.map((record) => {
    const project = db.projects.find((p) => p.id === record.project_id) || {
      id: record.project_id,
      name: "Unknown Project",
    }
    const supervisor = db.users.find((user) => user.id === record.supervisor) || {
      id: record.supervisor,
      name: "Unknown Supervisor",
    }

    return {
      ...record,
      project: {
        id: project.id,
        name: project.name,
      },
      supervisor: {
        id: supervisor.id,
        name: supervisor.name,
      },
      has_documents: db.documents.some((doc) => doc.source_id === record.id && doc.type === "supervision_record"),
    }
  })

  // Set pagination headers
  res.set({
    "X-Total-Count": filteredRecords.length,
    "X-Page": page,
    "X-Per-Page": per_page,
    "X-Total-Pages": Math.ceil(filteredRecords.length / per_page),
  })

  res.json({ data: enhancedRecords })
})

app.get("/api/supervision-records/:id", (req, res) => {
  const record = db.supervisionRecords.find((r) => r.id === req.params.id)

  if (!record) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Supervision record not found",
      },
    })
  }

  const project = db.projects.find((p) => p.id === record.project_id) || {
    id: record.project_id,
    name: "Unknown Project",
  }
  const supervisor = db.users.find((user) => user.id === record.supervisor) || {
    id: record.supervisor,
    name: "Unknown Supervisor",
  }

  const checkItems = db.checkItems.filter((item) => item.supervision_record_id === record.id)
  const issues = db.issues.filter((issue) => issue.supervision_record_id === record.id)
  const documents = db.documents.filter((doc) => doc.source_id === record.id && doc.type === "supervision_record")

  const enhancedRecord = {
    ...record,
    project: {
      id: project.id,
      name: project.name,
    },
    supervisor: {
      id: supervisor.id,
      name: supervisor.name,
    },
    check_items: checkItems,
    issues,
    attachments: record.attachments
      ? record.attachments.map((attachmentId) => {
          const attachment = db.attachments.find((a) => a.id === attachmentId)
          return attachment || { id: attachmentId, name: "Unknown Attachment" }
        })
      : [],
    documents,
  }

  res.json({ data: enhancedRecord })
})

app.post("/api/supervision-records", (req, res) => {
  const newRecord = {
    id: `supervision_${uuidv4()}`,
    ...req.body,
    supervisor: "user_123", // Assuming the authenticated user
    status: req.body.status || "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  db.supervisionRecords.push(newRecord)

  // Add check items if provided
  if (req.body.check_items && Array.isArray(req.body.check_items)) {
    req.body.check_items.forEach((item) => {
      const newItem = {
        id: `check_item_${uuidv4()}`,
        supervision_record_id: newRecord.id,
        name: item.name,
        result: item.result,
        remarks: item.remarks,
      }
      db.checkItems.push(newItem)
    })
  }

  // Add issues if provided
  if (req.body.issues && Array.isArray(req.body.issues)) {
    req.body.issues.forEach((issue) => {
      const newIssue = {
        id: `issue_${uuidv4()}`,
        supervision_record_id: newRecord.id,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        created_by: "user_123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      db.issues.push(newIssue)
    })
  }

  const project = db.projects.find((p) => p.id === newRecord.project_id) || {
    id: newRecord.project_id,
    name: "Unknown Project",
  }
  const supervisor = db.users.find((user) => user.id === newRecord.supervisor) || {
    id: newRecord.supervisor,
    name: "Unknown Supervisor",
  }

  const enhancedRecord = {
    ...newRecord,
    project: {
      id: project.id,
      name: project.name,
    },
    supervisor: {
      id: supervisor.id,
      name: supervisor.name,
    },
    check_items: db.checkItems.filter((item) => item.supervision_record_id === newRecord.id),
    issues: db.issues.filter((issue) => issue.supervision_record_id === newRecord.id),
    attachments: newRecord.attachments
      ? newRecord.attachments.map((attachmentId) => {
          const attachment = db.attachments.find((a) => a.id === attachmentId)
          return attachment || { id: attachmentId, name: "Unknown Attachment" }
        })
      : [],
  }

  res.status(201).json({ data: enhancedRecord })
})

app.put("/api/supervision-records/:id", (req, res) => {
  const recordIndex = db.supervisionRecords.findIndex((r) => r.id === req.params.id)

  if (recordIndex === -1) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Supervision record not found",
      },
    })
  }

  const updatedRecord = {
    ...db.supervisionRecords[recordIndex],
    ...req.body,
    updated_at: new Date().toISOString(),
  }

  db.supervisionRecords[recordIndex] = updatedRecord

  // Update check items if provided
  if (req.body.check_items && Array.isArray(req.body.check_items)) {
    // Remove existing check items for this record
    db.checkItems = db.checkItems.filter((item) => item.supervision_record_id !== updatedRecord.id)

    // Add new check items
    req.body.check_items.forEach((item) => {
      const newItem = {
        id: item.id || `check_item_${uuidv4()}`,
        supervision_record_id: updatedRecord.id,
        name: item.name,
        result: item.result,
        remarks: item.remarks,
      }
      db.checkItems.push(newItem)
    })
  }

  // Update issues if provided
  if (req.body.issues && Array.isArray(req.body.issues)) {
    // Remove existing issues for this record
    db.issues = db.issues.filter((issue) => issue.supervision_record_id !== updatedRecord.id)

    // Add new issues
    req.body.issues.forEach((issue) => {
      const newIssue = {
        id: issue.id || `issue_${uuidv4()}`,
        supervision_record_id: updatedRecord.id,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        created_by: "user_123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      db.issues.push(newIssue)
    })
  }

  const project = db.projects.find((p) => p.id === updatedRecord.project_id) || {
    id: updatedRecord.project_id,
    name: "Unknown Project",
  }
  const supervisor = db.users.find((user) => user.id === updatedRecord.supervisor) || {
    id: updatedRecord.supervisor,
    name: "Unknown Supervisor",
  }

  const enhancedRecord = {
    ...updatedRecord,
    project: {
      id: project.id,
      name: project.name,
    },
    supervisor: {
      id: supervisor.id,
      name: supervisor.name,
    },
    check_items: db.checkItems.filter((item) => item.supervision_record_id === updatedRecord.id),
    issues: db.issues.filter((issue) => issue.supervision_record_id === updatedRecord.id),
    attachments: updatedRecord.attachments
      ? updatedRecord.attachments.map((attachmentId) => {
          const attachment = db.attachments.find((a) => a.id === attachmentId)
          return attachment || { id: attachmentId, name: "Unknown Attachment" }
        })
      : [],
  }

  res.json({ data: enhancedRecord })
})

app.delete("/api/supervision-records/:id", (req, res) => {
  const recordIndex = db.supervisionRecords.findIndex((r) => r.id === req.params.id)

  if (recordIndex === -1) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Supervision record not found",
      },
    })
  }

  // Remove the record
  db.supervisionRecords.splice(recordIndex, 1)

  // Remove associated check items
  db.checkItems = db.checkItems.filter((item) => item.supervision_record_id !== req.params.id)

  // Remove associated issues
  db.issues = db.issues.filter((issue) => issue.supervision_record_id !== req.params.id)

  res.status(204).send()
})

app.post("/api/supervision-records/:id/generate-document", (req, res) => {
  const record = db.supervisionRecords.find((r) => r.id === req.params.id)

  if (!record) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Supervision record not found",
      },
    })
  }

  const newDocument = {
    id: `document_${uuidv4()}`,
    name: `${record.title}.${req.body.format || "pdf"}`,
    type: "supervision_record",
    project_id: record.project_id,
    creator: "user_123", // Assuming the authenticated user
    size: Math.floor(Math.random() * 5000000) + 1000000, // Random size between 1MB and 6MB
    content_type:
      req.body.format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf",
    url: `https://storage.example.com/documents/${record.title.replace(/\s+/g, "_")}.${req.body.format || "pdf"}`,
    source_id: record.id,
    created_at: new Date().toISOString(),
  }

  db.documents.push(newDocument)

  res.status(201).json({ data: newDocument })
})

// Daily Logs routes
app.get("/api/daily-logs", (req, res) => {
  const { page = 1, per_page = 20, status, search, sort = "date", order = "desc", date_gte, date_lte } = req.query

  let filteredLogs = [...db.dailyLogs]

  // Apply filters
  if (status) filteredLogs = filterByStatus(filteredLogs, status)
  if (search) filteredLogs = filterByQuery(filteredLogs, search)
  if (date_gte || date_lte) {
    filteredLogs = filterByDateRange(filteredLogs, date_gte, date_lte, "date")
  }

  // Apply sorting
  filteredLogs = sortArray(filteredLogs, sort, order)

  // Apply pagination
  const paginatedLogs = paginate(filteredLogs, Number.parseInt(page), Number.parseInt(per_page))

  // Enhance the data with project and user information
  const enhancedLogs = paginatedLogs.map((log) => {
    const project = db.projects.find((p) => p.id === log.project_id) || { id: log.project_id, name: "Unknown Project" }
    const supervisor = db.users.find((user) => user.id === log.supervisor) || {
      id: log.supervisor,
      name: "Unknown Supervisor",
    }

    return {
      ...log,
      project: {
        id: project.id,
        name: project.name,
      },
      supervisor: {
        id: supervisor.id,
        name: supervisor.name,
      },
      has_documents: db.documents.some((doc) => doc.source_id === log.id && doc.type === "daily_log"),
    }
  })

  // Set pagination headers
  res.set({
    "X-Total-Count": filteredLogs.length,
    "X-Page": page,
    "X-Per-Page": per_page,
    "X-Total-Pages": Math.ceil(filteredLogs.length / per_page),
  })

  res.json({ data: enhancedLogs })
})

app.get("/api/daily-logs/:id", (req, res) => {
  const log = db.dailyLogs.find((l) => l.id === req.params.id)

  if (!log) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Daily log not found",
      },
    })
  }

  const project = db.projects.find((p) => p.id === log.project_id) || { id: log.project_id, name: "Unknown Project" }
  const supervisor = db.users.find((user) => user.id === log.supervisor) || {
    id: log.supervisor,
    name: "Unknown Supervisor",
  }

  const documents = db.documents.filter((doc) => doc.source_id === log.id && doc.type === "daily_log")

  const enhancedLog = {
    ...log,
    project: {
      id: project.id,
      name: project.name,
    },
    supervisor: {
      id: supervisor.id,
      name: supervisor.name,
    },
    attachments: log.attachments
      ? log.attachments.map((attachmentId) => {
          const attachment = db.attachments.find((a) => a.id === attachmentId)
          return attachment || { id: attachmentId, name: "Unknown Attachment" }
        })
      : [],
    documents,
  }

  res.json({ data: enhancedLog })
})

// Similar implementations for POST, PUT, DELETE for daily logs...

// Meeting Minutes routes
app.get("/api/meeting-minutes", (req, res) => {
  const {
    page = 1,
    per_page = 20,
    status,
    search,
    sort = "meeting_date",
    order = "desc",
    date_gte,
    date_lte,
  } = req.query

  let filteredMinutes = [...db.meetingMinutes]

  // Apply filters
  if (status) filteredMinutes = filterByStatus(filteredMinutes, status)
  if (search) filteredMinutes = filterByQuery(filteredMinutes, search)
  if (date_gte || date_lte) {
    filteredMinutes = filterByDateRange(filteredMinutes, date_gte, date_lte, "meeting_date")
  }

  // Apply sorting
  filteredMinutes = sortArray(filteredMinutes, sort, order)

  // Apply pagination
  const paginatedMinutes = paginate(filteredMinutes, Number.parseInt(page), Number.parseInt(per_page))

  // Enhance the data with project and user information
  const enhancedMinutes = paginatedMinutes.map((minute) => {
    const project = db.projects.find((p) => p.id === minute.project_id) || {
      id: minute.project_id,
      name: "Unknown Project",
    }
    const recorder = db.users.find((user) => user.id === minute.recorder) || {
      id: minute.recorder,
      name: "Unknown Recorder",
    }

    return {
      ...minute,
      project: {
        id: project.id,
        name: project.name,
      },
      recorder: {
        id: recorder.id,
        name: recorder.name,
      },
      has_documents: db.documents.some((doc) => doc.source_id === minute.id && doc.type === "meeting_minute"),
    }
  })

  // Set pagination headers
  res.set({
    "X-Total-Count": filteredMinutes.length,
    "X-Page": page,
    "X-Per-Page": per_page,
    "X-Total-Pages": Math.ceil(filteredMinutes.length / per_page),
  })

  res.json({ data: enhancedMinutes })
})

// Similar implementations for GET /:id, POST, PUT, DELETE for meeting minutes...

// Documents routes
app.get("/api/documents", (req, res) => {
  const {
    page = 1,
    per_page = 20,
    type,
    search,
    sort = "created_at",
    order = "desc",
    created_at_gte,
    created_at_lte,
  } = req.query

  let filteredDocuments = [...db.documents]

  // Apply filters
  if (type) filteredDocuments = filteredDocuments.filter((doc) => doc.type === type)
  if (search) filteredDocuments = filterByQuery(filteredDocuments, search)
  if (created_at_gte || created_at_lte) {
    filteredDocuments = filterByDateRange(filteredDocuments, created_at_gte, created_at_lte)
  }

  // Apply sorting
  filteredDocuments = sortArray(filteredDocuments, sort, order)

  // Apply pagination
  const paginatedDocuments = paginate(filteredDocuments, Number.parseInt(page), Number.parseInt(per_page))

  // Enhance the data with project and user information
  const enhancedDocuments = paginatedDocuments.map((doc) => {
    const project = db.projects.find((p) => p.id === doc.project_id) || { id: doc.project_id, name: "Unknown Project" }
    const creator = db.users.find((user) => user.id === doc.creator) || { id: doc.creator, name: "Unknown Creator" }

    return {
      ...doc,
      project: {
        id: project.id,
        name: project.name,
      },
      creator: {
        id: creator.id,
        name: creator.name,
      },
    }
  })

  // Set pagination headers
  res.set({
    "X-Total-Count": filteredDocuments.length,
    "X-Page": page,
    "X-Per-Page": per_page,
    "X-Total-Pages": Math.ceil(filteredDocuments.length / per_page),
  })

  res.json({ data: enhancedDocuments })
})

// Similar implementations for GET /:id, DELETE for documents...

// Attachments routes
app.post("/api/attachments", (req, res) => {
  // In a real implementation, this would handle file uploads
  // For the mock, we'll just create a fake attachment

  const fileName = req.body.name || "attachment.jpg"
  const contentType = req.body.content_type || "image/jpeg"
  const size = req.body.size || Math.floor(Math.random() * 5000000) + 100000 // Random size between 100KB and 5MB

  const newAttachment = {
    id: `attachment_${uuidv4()}`,
    name: fileName,
    size,
    content_type: contentType,
    url: `https://storage.example.com/attachments/${fileName.replace(/\s+/g, "_")}`,
    created_at: new Date().toISOString(),
  }

  db.attachments.push(newAttachment)

  res.status(201).json({ data: newAttachment })
})

// Similar implementations for GET /:id, DELETE for attachments...

// Events routes
app.get("/api/events", (req, res) => {
  const {
    page = 1,
    per_page = 20,
    type,
    status,
    search,
    sort = "created_at",
    order = "desc",
    created_at_gte,
    created_at_lte,
    tags,
  } = req.query

  // Combine all event types into one array
  let allEvents = [
    ...db.issues.map((issue) => ({
      ...issue,
      type: "issue",
      source_id: issue.id,
      source_url: `/issues/${issue.id}`,
    })),
    ...db.supervisionRecords.map((record) => ({
      ...record,
      type: "supervision_record",
      source_id: record.id,
      source_url: `/supervision-records/${record.id}`,
    })),
    ...db.dailyLogs.map((log) => ({
      ...log,
      type: "daily_log",
      source_id: log.id,
      source_url: `/daily-logs/${log.id}`,
    })),
    ...db.meetingMinutes.map((minute) => ({
      ...minute,
      type: "meeting_minute",
      source_id: minute.id,
      source_url: `/meeting-minutes/${minute.id}`,
    })),
  ]

  // Apply filters
  if (type) allEvents = allEvents.filter((event) => event.type === type)
  if (status) allEvents = filterByStatus(allEvents, status)
  if (search) allEvents = filterByQuery(allEvents, search)
  if (created_at_gte || created_at_lte) {
    allEvents = filterByDateRange(allEvents, created_at_gte, created_at_lte)
  }
  if (tags) {
    const tagList = tags.split(",")
    allEvents = allEvents.filter((event) => {
      if (!event.tags) return false
      return tagList.some((tag) => event.tags.includes(tag))
    })
  }

  // Apply sorting
  allEvents = sortArray(allEvents, sort, order)

  // Apply pagination
  const paginatedEvents = paginate(allEvents, Number.parseInt(page), Number.parseInt(per_page))

  // Enhance the data with project and user information
  const enhancedEvents = paginatedEvents.map((event) => {
    const project = event.project_id ? db.projects.find((p) => p.id === event.project_id) : null
    const createdBy = event.created_by ? db.users.find((user) => user.id === event.created_by) : null

    return {
      ...event,
      project: project
        ? {
            id: project.id,
            name: project.name,
          }
        : undefined,
      created_by: createdBy
        ? {
            id: createdBy.id,
            name: createdBy.name,
          }
        : undefined,
    }
  })

  // Set pagination headers
  res.set({
    "X-Total-Count": allEvents.length,
    "X-Page": page,
    "X-Per-Page": per_page,
    "X-Total-Pages": Math.ceil(allEvents.length / per_page),
  })

  res.json({ data: enhancedEvents })
})

// Users routes
app.get("/api/users", (req, res) => {
  const { page = 1, per_page = 20, role, search } = req.query

  let filteredUsers = [...db.users]

  // Apply filters
  if (role) filteredUsers = filteredUsers.filter((user) => user.role === role)
  if (search) filteredUsers = filterByQuery(filteredUsers, search)

  // Apply pagination
  const paginatedUsers = paginate(filteredUsers, Number.parseInt(page), Number.parseInt(per_page))

  // Set pagination headers
  res.set({
    "X-Total-Count": filteredUsers.length,
    "X-Page": page,
    "X-Per-Page": per_page,
    "X-Total-Pages": Math.ceil(filteredUsers.length / per_page),
  })

  res.json({ data: paginatedUsers })
})

app.get("/api/users/:id", (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id)

  if (!user) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "User not found",
      },
    })
  }

  res.json({ data: user })
})

// Projects routes
app.get("/api/projects", (req, res) => {
  const { page = 1, per_page = 20, status, search } = req.query

  let filteredProjects = [...db.projects]

  // Apply filters
  if (status) filteredProjects = filterByStatus(filteredProjects, status)
  if (search) filteredProjects = filterByQuery(filteredProjects, search)

  // Apply pagination
  const paginatedProjects = paginate(filteredProjects, Number.parseInt(page), Number.parseInt(per_page))

  // Set pagination headers
  res.set({
    "X-Total-Count": filteredProjects.length,
    "X-Page": page,
    "X-Per-Page": per_page,
    "X-Total-Pages": Math.ceil(filteredProjects.length / per_page),
  })

  res.json({ data: paginatedProjects })
})

app.get("/api/projects/:id", (req, res) => {
  const project = db.projects.find((p) => p.id === req.params.id)

  if (!project) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Project not found",
      },
    })
  }

  const projectManager = db.users.find((user) => user.id === project.project_manager) || null
  const chiefSupervisor = db.users.find((user) => user.id === project.chief_supervisor) || null

  const enhancedProject = {
    ...project,
    project_manager: projectManager
      ? {
          id: projectManager.id,
          name: projectManager.name,
        }
      : null,
    chief_supervisor: chiefSupervisor
      ? {
          id: chiefSupervisor.id,
          name: chiefSupervisor.name,
        }
      : null,
  }

  res.json({ data: enhancedProject })
})

// Statistics routes
app.get("/api/projects/:id/statistics", (req, res) => {
  const project = db.projects.find((p) => p.id === req.params.id)

  if (!project) {
    return res.status(404).json({
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "Project not found",
      },
    })
  }

  // Filter resources by project
  const projectIssues = db.issues.filter((issue) => issue.project_id === project.id)
  const projectSupervisionRecords = db.supervisionRecords.filter((record) => record.project_id === project.id)
  const projectDailyLogs = db.dailyLogs.filter((log) => log.project_id === project.id)
  const projectMeetingMinutes = db.meetingMinutes.filter((minute) => minute.project_id === project.id)
  const projectDocuments = db.documents.filter((doc) => doc.project_id === project.id)

  // Count by status
  const issuesByStatus = {
    total: projectIssues.length,
    pending: projectIssues.filter((issue) => issue.status === "pending").length,
    in_progress: projectIssues.filter((issue) => issue.status === "in_progress").length,
    resolved: projectIssues.filter((issue) => issue.status === "resolved").length,
    closed: projectIssues.filter((issue) => issue.status === "closed").length,
  }

  const supervisionRecordsByStatus = {
    total: projectSupervisionRecords.length,
    draft: projectSupervisionRecords.filter((record) => record.status === "draft").length,
    completed: projectSupervisionRecords.filter((record) => record.status === "completed").length,
  }

  const dailyLogsByStatus = {
    total: projectDailyLogs.length,
    draft: projectDailyLogs.filter((log) => log.status === "draft").length,
    completed: projectDailyLogs.filter((log) => log.status === "completed").length,
  }

  const meetingMinutesByStatus = {
    total: projectMeetingMinutes.length,
    draft: projectMeetingMinutes.filter((minute) => minute.status === "draft").length,
    completed: projectMeetingMinutes.filter((minute) => minute.status === "completed").length,
  }

  // Count documents by type
  const documentsByType = {
    total: projectDocuments.length,
    by_type: {
      inspection_record: projectDocuments.filter((doc) => doc.type === "inspection_record").length,
      notification: projectDocuments.filter((doc) => doc.type === "notification").length,
      supervision_record: projectDocuments.filter((doc) => doc.type === "supervision_record").length,
      daily_log: projectDocuments.filter((doc) => doc.type === "daily_log").length,
      meeting_minute: projectDocuments.filter((doc) => doc.type === "meeting_minute").length,
    },
  }

  res.json({
    data: {
      issues: issuesByStatus,
      supervision_records: supervisionRecordsByStatus,
      daily_logs: dailyLogsByStatus,
      meeting_minutes: meetingMinutesByStatus,
      documents: documentsByType,
    },
  })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`)
})
