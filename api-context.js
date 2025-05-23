"use client"

import { createContext, useContext, useState, useEffect } from "react"
import apiClient from "./api-client"

// Create context
const ApiContext = createContext(null)

// Provider component
export function ApiProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")

        if (token) {
          // For the mock API, we'll just set the user directly
          // In a real app, you would validate the token with the server
          setUser({
            id: "user_123",
            name: "张三",
            email: "zhangsan@example.com",
            role: "supervisor",
          })
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("auth_token")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (username, password) => {
    setIsLoading(true)

    try {
      const result = await apiClient.auth.login(username, password)
      setUser(result.user)
      setIsAuthenticated(true)
      return result
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)

    try {
      await apiClient.auth.logout()
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    api: apiClient,
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

// Hook to use the API context
export function useApiContext() {
  const context = useContext(ApiContext)

  if (!context) {
    throw new Error("useApiContext must be used within an ApiProvider")
  }

  return context
}
