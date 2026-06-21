import { Routes, Route } from "react-router-dom"
import { CommandCenter } from "@/pages/CommandCenter"
import { LiveStations } from "@/pages/LiveStations"
import { LiveDetections } from "@/pages/LiveDetections"
import { KeywordIntelligence } from "@/pages/KeywordIntelligence"
import { Advertisers } from "@/pages/Advertisers"
import { HarvestControl } from "@/pages/HarvestControl"
import { PipelineHealth } from "@/pages/PipelineHealth"
import { ReportsExports } from "@/pages/ReportsExports"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CommandCenter />} />
      <Route path="/stations" element={<LiveStations />} />
      <Route path="/detections" element={<LiveDetections />} />
      <Route path="/keywords" element={<KeywordIntelligence />} />
      <Route path="/advertisers" element={<Advertisers />} />
      <Route path="/harvest" element={<HarvestControl />} />
      <Route path="/health" element={<PipelineHealth />} />
      <Route path="/reports" element={<ReportsExports />} />
    </Routes>
  )
}
