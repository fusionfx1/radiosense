// All data in this file is SAMPLE / API PENDING.
// None of these rows represent live detections or confirmed advertiser relationships.
// Real data will replace these once backend API endpoints are available.

import type { Station, Detection } from "./api"

export const MOCK_LABEL = "Sample data — API pending"

// Real station set from the Radio Ad Pipeline project
export const mockStations: Station[] = [
  { id: 1, name: "KTRH", display_name: "KTRH News Radio 740 AM (Houston)", enabled: true, stream_url: "https://stream.iheart.com/v3/station/2756", format: "News/Talk", status: "live", last_checked: new Date(Date.now() - 12000).toISOString(), chunk_age_seconds: 12, last_error: null },
  { id: 2, name: "KLIF", display_name: "KLIF 570 AM (Dallas)", enabled: true, stream_url: "https://stream.iheart.com/v3/station/1234", format: "Talk", status: "live", last_checked: new Date(Date.now() - 8000).toISOString(), chunk_age_seconds: 8, last_error: null },
  { id: 3, name: "WSB", display_name: "WSB 750 AM (Atlanta)", enabled: true, stream_url: "https://stream.iheart.com/v3/station/5019", format: "News/Talk", status: "live", last_checked: new Date(Date.now() - 15000).toISOString(), chunk_age_seconds: 15, last_error: null },
  { id: 4, name: "WBAP", display_name: "WBAP 820 AM (Dallas–Fort Worth)", enabled: true, stream_url: "https://stream.iheart.com/v3/station/1243", format: "News/Talk", status: "live", last_checked: new Date(Date.now() - 6000).toISOString(), chunk_age_seconds: 6, last_error: null },
  { id: 5, name: "WOAI", display_name: "WOAI 1200 AM (San Antonio)", enabled: true, stream_url: "https://stream.iheart.com/v3/station/2189", format: "News/Talk", status: "live", last_checked: new Date(Date.now() - 14000).toISOString(), chunk_age_seconds: 14, last_error: null },
  { id: 6, name: "WHBO", display_name: "WHBO 1040 AM (Tampa)", enabled: true, stream_url: "https://stream.iheart.com/v3/station/3341", format: "Talk", status: "stale", last_checked: new Date(Date.now() - 95000).toISOString(), chunk_age_seconds: 95, last_error: null },
  { id: 7, name: "WTAM", display_name: "WTAM 1100 AM (Cleveland)", enabled: true, stream_url: "https://stream.iheart.com/v3/station/1001", format: "News/Talk", status: "live", last_checked: new Date(Date.now() - 11000).toISOString(), chunk_age_seconds: 11, last_error: null },
  { id: 8, name: "WIBC", display_name: "WIBC 93.1 FM (Indianapolis)", enabled: true, stream_url: "https://stream.iheart.com/v3/station/2901", format: "News/Talk", status: "live", last_checked: new Date(Date.now() - 9000).toISOString(), chunk_age_seconds: 9, last_error: null },
  { id: 9, name: "WWTN", display_name: "WWTN 99.7 FM (Nashville)", enabled: true, stream_url: "https://stream.iheart.com/v3/station/4012", format: "Talk", status: "live", last_checked: new Date(Date.now() - 7000).toISOString(), chunk_age_seconds: 7, last_error: null },
]

// Sample detections — NOT real captured radio ads.
// Shown only to demonstrate table layout. All values are fabricated.
const stationNames = ["KTRH", "KLIF", "WSB", "WBAP", "WOAI"]
const keywords = ["installment loan", "credit solution", "financial funding", "debt relief", "cash advance"]
const reviewStatuses = ["new", "reviewed", "approved", "rejected"] as const

export const mockDetections: Detection[] = Array.from({ length: 50 }, (_, i) => ({
  id: 1000 + i,
  station: stationNames[i % stationNames.length],
  station_id: (i % stationNames.length) + 1,
  company_name: "Billshappen.com",
  keyword: keywords[i % keywords.length],
  confidence: 0.55 + Math.random() * 0.44,
  is_ad: i % 5 !== 0,
  offer_summary: "Sample offer — not a real detection",
  transcript_snippet: `[SAMPLE] ...if you need ${keywords[i % keywords.length]} fast, Billshappen.com may have options for qualified borrowers...`,
  review_status: reviewStatuses[i % reviewStatuses.length],
  detected_at: new Date(Date.now() - i * 120000).toISOString(),
  created_at: new Date(Date.now() - i * 120000).toISOString(),
}))

// Sample keyword candidates — NOT sourced from live DB yet.
export const mockKeywordCandidates = [
  { id: 1, keyword: "installment loan", source: "live", score: 0.95, entity: "Billshappen.com", trademark_risk: "low", review_status: "new", first_seen: "2026-06-15T08:00:00Z", last_seen: new Date().toISOString() },
  { id: 2, keyword: "debt consolidation", source: "trademark", score: 0.88, entity: "(sample entity)", trademark_risk: "medium", review_status: "reviewed", first_seen: "2026-06-10T10:00:00Z", last_seen: new Date().toISOString() },
  { id: 3, keyword: "credit solution", source: "harvest", score: 0.82, entity: "(sample entity)", trademark_risk: "low", review_status: "approved", first_seen: "2026-06-12T14:00:00Z", last_seen: new Date().toISOString() },
  { id: 4, keyword: "emergency funds", source: "cfpb", score: 0.79, entity: "(sample entity)", trademark_risk: "high", review_status: "new", first_seen: "2026-06-18T09:00:00Z", last_seen: new Date().toISOString() },
  { id: 5, keyword: "cash advance now", source: "export", score: 0.91, entity: "(sample entity)", trademark_risk: "medium", review_status: "new", first_seen: "2026-06-20T11:00:00Z", last_seen: new Date().toISOString() },
  { id: 6, keyword: "financial funding", source: "live", score: 0.86, entity: "Billshappen.com", trademark_risk: "low", review_status: "new", first_seen: "2026-06-19T07:00:00Z", last_seen: new Date().toISOString() },
  { id: 7, keyword: "mortgage refinance", source: "harvest", score: 0.77, entity: "(sample entity)", trademark_risk: "low", review_status: "reviewed", first_seen: "2026-06-08T15:00:00Z", last_seen: new Date().toISOString() },
  { id: 8, keyword: "no credit check", source: "cfpb", score: 0.93, entity: "(sample entity)", trademark_risk: "high", review_status: "new", first_seen: "2026-06-21T02:00:00Z", last_seen: new Date().toISOString() },
]

// Sample advertisers — only Billshappen.com is confirmed.
// Others are fabricated for layout demonstration only.
export const mockAdvertisers = [
  { id: 1, name: "Billshappen.com", domain: "billshappen.com", vertical: "Installment Loans", stations: ["KTRH", "KLIF", "WSB"], detection_count: 0, first_seen: "2026-06-01T00:00:00Z", last_seen: new Date().toISOString(), confidence: "high", status: "approved" },
  { id: 2, name: "(Sample Advertiser A)", domain: "example-a.com", vertical: "Credit Solutions", stations: ["WBAP", "WOAI"], detection_count: 0, first_seen: "2026-06-10T00:00:00Z", last_seen: new Date().toISOString(), confidence: "low", status: "new" },
  { id: 3, name: "(Sample Advertiser B)", domain: "example-b.com", vertical: "Debt Relief", stations: ["WTAM", "WIBC"], detection_count: 0, first_seen: "2026-06-15T00:00:00Z", last_seen: new Date().toISOString(), confidence: "low", status: "new" },
  { id: 4, name: "(Sample Advertiser C)", domain: "example-c.com", vertical: "Cash Advance", stations: ["WWTN"], detection_count: 0, first_seen: "2026-06-18T00:00:00Z", last_seen: new Date().toISOString(), confidence: "low", status: "new" },
]

// Sample export files — filenames match the real project output naming convention.
export const mockReportFiles = [
  { filename: "keyword_candidates_fresh.csv", type: "CSV", rows: undefined, size: "—", last_modified: "2026-06-21T04:00:00Z", purpose: "Fresh keyword candidates for review and scoring" },
  { filename: "keyword_candidates_current.csv", type: "CSV", rows: undefined, size: "—", last_modified: "2026-06-20T22:00:00Z", purpose: "Current full keyword candidate dataset" },
  { filename: "keyword_candidates_current.jsonl", type: "JSONL", rows: undefined, size: "—", last_modified: "2026-06-20T22:00:00Z", purpose: "JSONL export of current keyword candidates" },
  { filename: "overnight_keyword_candidates.csv", type: "CSV", rows: undefined, size: "—", last_modified: "2026-06-21T06:00:00Z", purpose: "Keyword candidates captured overnight run" },
  { filename: "overnight_keyword_candidates.jsonl", type: "JSONL", rows: undefined, size: "—", last_modified: "2026-06-21T06:00:00Z", purpose: "JSONL of overnight keyword candidates" },
  { filename: "keyword_triage_report.md", type: "MD", rows: undefined, size: "—", last_modified: "2026-06-21T07:30:00Z", purpose: "Human-readable triage report for analyst review" },
  { filename: "radio_financial_opportunities_report.md", type: "MD", rows: undefined, size: "—", last_modified: "2026-06-20T18:00:00Z", purpose: "Comprehensive financial opportunity analysis" },
  { filename: "radio_financial_p0_p1_scoring.csv", type: "CSV", rows: undefined, size: "—", last_modified: "2026-06-20T20:00:00Z", purpose: "P0/P1 priority scoring for financial advertisers" },
  { filename: "radio_financial_ads_research_queue.csv", type: "CSV", rows: undefined, size: "—", last_modified: "2026-06-21T03:00:00Z", purpose: "Research queue for financial ad advertisers" },
  { filename: "station_stream_retest_results.md", type: "MD", rows: undefined, size: "—", last_modified: "2026-06-19T14:00:00Z", purpose: "Results from station stream connectivity retest" },
]
