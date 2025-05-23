/**
 * API Client for the Inspection Dashboard
 * This client handles all API requests to the mock server
 */

const API_BASE_URL = "http://localhost:3001/api"

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || "API request failed")
  }

  // If response is 204 No Content
  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Helper function to build query string from parameters
const buildQueryString = (params) => {
  if (!params) return ""

  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString())
    }
  })

  const queryString = queryParams.toString()
  return queryString ? `?${queryString}` : ""
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("auth_token")
}

// Set auth token in localStorage
const setAuthToken = (token) => {
  localStorage.setItem("auth_token", token)
}

// Clear auth token from localStorage
const clearAuthToken = () => {
  localStorage.removeItem("auth_token")
}

// API client
const apiClient = {
  // Auth
  auth: {
    login: async (username, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await handleResponse(response)

      if (data.token) {
        setAuthToken(data.token)
      }

      return data
    },

    refresh: async () => {
      const token = getAuthToken()

      if (!token) {
        throw new Error("No auth token found")
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await handleResponse(response)

      if (data.token) {
        setAuthToken(data.token)
      }

      return data
    },

    logout: async () => {
      const token = getAuthToken()

      if (!token) {
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      await handleResponse(response)
      clearAuthToken()
    },
  },

  // Issues
  issues: {
    getAll: async (params) => {
      const token = getAuthToken()
      const queryString = buildQueryString(params)

      const response = await fetch(`${API_BASE_URL}/issues${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    getById: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    create: async (data) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return handleResponse(response)
    },

    update: async (id, data) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return handleResponse(response)
    },

    delete: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    addComment: async (id, content) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/issues/${id}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      return handleResponse(response)
    },
  },

  // Supervision Records
  supervisionRecords: {
    getAll: async (params) => {
      const token = getAuthToken()
      const queryString = buildQueryString(params)

      const response = await fetch(`${API_BASE_URL}/supervision-records${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    getById: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/supervision-records/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    create: async (data) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/supervision-records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return handleResponse(response)
    },

    update: async (id, data) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/supervision-records/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return handleResponse(response)
    },

    delete: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/supervision-records/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    generateDocument: async (id, templateId, format = "pdf") => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/supervision-records/${id}/generate-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ template_id: templateId, format }),
      })

      return handleResponse(response)
    },
  },

  // Daily Logs
  dailyLogs: {
    getAll: async (params) => {
      const token = getAuthToken()
      const queryString = buildQueryString(params)

      const response = await fetch(`${API_BASE_URL}/daily-logs${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    getById: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/daily-logs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    create: async (data) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/daily-logs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return handleResponse(response)
    },

    update: async (id, data) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/daily-logs/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return handleResponse(response)
    },

    delete: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/daily-logs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    generateDocument: async (id, templateId, format = "pdf") => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/daily-logs/${id}/generate-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ template_id: templateId, format }),
      })

      return handleResponse(response)
    },
  },

  // Meeting Minutes
  meetingMinutes: {
    getAll: async (params) => {
      const token = getAuthToken()
      const queryString = buildQueryString(params)

      const response = await fetch(`${API_BASE_URL}/meeting-minutes${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    getById: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/meeting-minutes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    create: async (data) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/meeting-minutes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return handleResponse(response)
    },

    update: async (id, data) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/meeting-minutes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return handleResponse(response)
    },

    delete: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/meeting-minutes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    generateDocument: async (id, templateId, format = "pdf") => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/meeting-minutes/${id}/generate-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ template_id: templateId, format }),
      })

      return handleResponse(response)
    },
  },

  // Documents
  documents: {
    getAll: async (params) => {
      const token = getAuthToken()
      const queryString = buildQueryString(params)

      const response = await fetch(`${API_BASE_URL}/documents${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    getById: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    delete: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },
  },

  // Attachments
  attachments: {
    upload: async (file) => {
      const token = getAuthToken()

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/attachments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      return handleResponse(response)
    },

    getById: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/attachments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    delete: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/attachments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },
  },

  // Events
  events: {
    getAll: async (params) => {
      const token = getAuthToken()
      const queryString = buildQueryString(params)

      const response = await fetch(`${API_BASE_URL}/events${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },
  },

  // Users
  users: {
    getAll: async (params) => {
      const token = getAuthToken()
      const queryString = buildQueryString(params)

      const response = await fetch(`${API_BASE_URL}/users${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    getById: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },
  },

  // Projects
  projects: {
    getAll: async (params) => {
      const token = getAuthToken()
      const queryString = buildQueryString(params)

      const response = await fetch(`${API_BASE_URL}/projects${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    getById: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },

    getStatistics: async (id) => {
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/projects/${id}/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return handleResponse(response)
    },
  },
}

export default apiClient
