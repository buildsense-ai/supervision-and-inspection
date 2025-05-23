"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "./api-client"

/**
 * Custom hook for API requests
 * @param {Function} apiMethod - The API method to call
 * @param {Array} dependencies - Dependencies for useEffect
 * @param {boolean} immediate - Whether to call the API method immediately
 * @param {Array} initialArgs - Initial arguments for the API method
 * @returns {Object} - { data, loading, error, execute }
 */
export function useApi(apiMethod, dependencies = [], immediate = true, initialArgs = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiMethod(...args)
        setData(result)
        return result
      } catch (err) {
        setError(err.message || "An error occurred")
        return null
      } finally {
        setLoading(false)
      }
    },
    [apiMethod],
  )

  useEffect(() => {
    if (immediate) {
      execute(...initialArgs)
    }
  }, [...dependencies, execute])

  return { data, loading, error, execute }
}

/**
 * Custom hook for paginated API requests
 * @param {Function} apiMethod - The API method to call
 * @param {Object} initialParams - Initial parameters for the API method
 * @param {Array} dependencies - Dependencies for useEffect
 * @returns {Object} - { data, loading, error, page, setPage, perPage, setPerPage, totalPages, totalCount }
 */
export function usePaginatedApi(apiMethod, initialParams = {}, dependencies = []) {
  const [params, setParams] = useState({
    page: 1,
    per_page: 20,
    ...initialParams,
  })

  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const { data, loading, error, execute } = useApi(
    async (params) => {
      const response = await apiMethod(params)

      // Extract pagination information from headers
      const headers = response.headers
      if (headers) {
        setTotalCount(Number.parseInt(headers["X-Total-Count"] || "0", 10))
        setTotalPages(Number.parseInt(headers["X-Total-Pages"] || "1", 10))
      }

      return response.data
    },
    [...dependencies, JSON.stringify(params)],
    true,
    [params],
  )

  const setPage = useCallback((page) => {
    setParams((prevParams) => ({ ...prevParams, page }))
  }, [])

  const setPerPage = useCallback((perPage) => {
    setParams((prevParams) => ({ ...prevParams, per_page: perPage, page: 1 }))
  }, [])

  const updateParams = useCallback((newParams) => {
    setParams((prevParams) => ({ ...prevParams, ...newParams, page: 1 }))
  }, [])

  return {
    data,
    loading,
    error,
    page: params.page,
    setPage,
    perPage: params.per_page,
    setPerPage,
    totalPages,
    totalCount,
    params,
    updateParams,
    execute,
  }
}

// Export specific API hooks for convenience
export function useIssues(params = {}, dependencies = []) {
  return usePaginatedApi(apiClient.issues.getAll, params, dependencies)
}

export function useIssue(id, dependencies = []) {
  return useApi(apiClient.issues.getById, [id, ...dependencies], true, [id])
}

export function useSupervisionRecords(params = {}, dependencies = []) {
  return usePaginatedApi(apiClient.supervisionRecords.getAll, params, dependencies)
}

export function useSupervisionRecord(id, dependencies = []) {
  return useApi(apiClient.supervisionRecords.getById, [id, ...dependencies], true, [id])
}

export function useDailyLogs(params = {}, dependencies = []) {
  return usePaginatedApi(apiClient.dailyLogs.getAll, params, dependencies)
}

export function useDailyLog(id, dependencies = []) {
  return useApi(apiClient.dailyLogs.getById, [id, ...dependencies], true, [id])
}

export function useMeetingMinutes(params = {}, dependencies = []) {
  return usePaginatedApi(apiClient.meetingMinutes.getAll, params, dependencies)
}

export function useMeetingMinute(id, dependencies = []) {
  return useApi(apiClient.meetingMinutes.getById, [id, ...dependencies], true, [id])
}

export function useDocuments(params = {}, dependencies = []) {
  return usePaginatedApi(apiClient.documents.getAll, params, dependencies)
}

export function useDocument(id, dependencies = []) {
  return useApi(apiClient.documents.getById, [id, ...dependencies], true, [id])
}

export function useEvents(params = {}, dependencies = []) {
  return usePaginatedApi(apiClient.events.getAll, params, dependencies)
}

export function useUsers(params = {}, dependencies = []) {
  return usePaginatedApi(apiClient.users.getAll, params, dependencies)
}

export function useUser(id, dependencies = []) {
  return useApi(apiClient.users.getById, [id, ...dependencies], true, [id])
}

export function useProjects(params = {}, dependencies = []) {
  return usePaginatedApi(apiClient.projects.getAll, params, dependencies)
}

export function useProject(id, dependencies = []) {
  return useApi(apiClient.projects.getById, [id, ...dependencies], true, [id])
}

export function useProjectStatistics(id, dependencies = []) {
  return useApi(apiClient.projects.getStatistics, [id, ...dependencies], true, [id])
}
