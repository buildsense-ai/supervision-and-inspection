"use client"

import type React from "react"
import { useState } from "react"
import { Tabs, Tab } from "@mui/material"
import SupervisionView from "./supervision-view"

interface EventsViewProps {
  highlightedRecordId?: string
}

const EventsView: React.FC<EventsViewProps> = ({ highlightedRecordId }) => {
  const [activeTab, setActiveTab] = useState<string>("all")

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  return (
    <div>
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="event tabs">
        <Tab label="All Events" value="all" />
        <Tab label="Supervision Records" value="supervision" />
      </Tabs>

      {activeTab === "all" && (
        <div>
          {/* Placeholder for all events view */}
          <p>Displaying all events...</p>
        </div>
      )}

      {activeTab === "supervision" && <SupervisionView highlightedRecordId={highlightedRecordId} />}
    </div>
  )
}

export default EventsView
