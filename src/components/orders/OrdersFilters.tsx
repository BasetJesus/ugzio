"use client"

import SearchBar from "@/components/shared/SearchBar"
import FilterDropdown from "@/components/shared/FilterDropdown"
import { RISK_OPTIONS as RISK_FILTER_OPTIONS } from "@/lib/risk/config"

const STATUS_OPTIONS = [
  { value: "CREATED", label: "Created" },
  { value: "PRE_SHIPPING_CONFIRM_SENT", label: "Confirm Sent" },
  { value: "BUYER_CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REFUSED", label: "Refused" },
  { value: "INTELLIGENT_CANCEL", label: "Cancelled" },
  { value: "PENDING_RESCHEDULE", label: "Reschedule" },
]

interface Props {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: string
  onStatusFilterChange: (v: string) => void
  riskFilter: string
  onRiskFilterChange: (v: string) => void
}

export default function OrdersFilters({
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  riskFilter, onRiskFilterChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <SearchBar value={search} onChange={onSearchChange} placeholder="Search by name, phone, or ID..." />
      </div>
      <div className="flex gap-2">
        <FilterDropdown label="All Statuses" options={STATUS_OPTIONS} value={statusFilter} onChange={onStatusFilterChange} />
        <FilterDropdown label="All Risk" options={RISK_FILTER_OPTIONS} value={riskFilter} onChange={onRiskFilterChange} />
      </div>
    </div>
  )
}
