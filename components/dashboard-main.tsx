import { routes } from "@/lib/routes"

// This is a placeholder for the actual DashboardMain component.
// Replace this with your actual component implementation.

const DashboardMain = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <ul>
        <li>
          <a href={routes.dashboard}>Dashboard</a>
        </li>
        <li>
          <a href={routes.dailyLogs}>Daily Logs</a>
        </li>
        <li>
          <a href={routes.documents}>Documents</a>
        </li>
        <li>
          <a href={routes.events}>Events</a>
        </li>
      </ul>
    </div>
  )
}

export default DashboardMain
