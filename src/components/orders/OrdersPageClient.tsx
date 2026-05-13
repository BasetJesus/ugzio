"use client"

import { useState, useMemo } from "react"
import type { OrderTableItem } from "@/types/order"
import OrdersFilters from "@/components/orders/OrdersFilters"
import OrdersTable from "@/components/orders/OrdersTable"
import OrderDetailsDrawer from "@/components/orders/OrderDetailsDrawer"

interface Props {
  orders: OrderTableItem[]
}

export default function OrdersPageClient({ orders }: Props) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [riskFilter, setRiskFilter] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<OrderTableItem | null>(null)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase()
      if (q) {
        const nameMatch = o.customer.name.toLowerCase().includes(q)
        const phoneMatch = o.customer.phone.includes(q)
        const idMatch = o.id.toLowerCase().includes(q)
        if (!nameMatch && !phoneMatch && !idMatch) return false
      }
      if (statusFilter && o.status !== statusFilter) return false
      if (riskFilter && o.riskLevel !== riskFilter) return false
      return true
    })
  }, [orders, search, statusFilter, riskFilter])

  return (
    <>
      <OrdersFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        riskFilter={riskFilter}
        onRiskFilterChange={setRiskFilter}
      />
      <OrdersTable orders={filtered} onSelectOrder={setSelectedOrder} />
      <OrderDetailsDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  )
}
