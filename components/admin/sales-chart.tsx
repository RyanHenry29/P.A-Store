"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface ChartDataPoint {
  day: string
  vendas: number
  lucro: number
}

interface SalesChartProps {
  data: ChartDataPoint[]
}

export function SalesChart({ data }: SalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          VENDAS - ÚLTIMOS 7 DIAS
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#00d4ff] rounded-full" />
            <span className="text-sm text-muted-foreground">Vendas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#00ff88] rounded-full" />
            <span className="text-sm text-muted-foreground">Lucro</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2a2a2a"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="#6b6b6b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b6b6b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111111",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#f5f5f5",
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === "vendas" ? "Vendas" : "Lucro",
              ]}
              labelStyle={{ color: "#6b6b6b" }}
            />
            <Line
              type="monotone"
              dataKey="vendas"
              stroke="#00d4ff"
              strokeWidth={2}
              dot={{ fill: "#00d4ff", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "#00d4ff" }}
            />
            <Line
              type="monotone"
              dataKey="lucro"
              stroke="#00ff88"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#00ff88", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "#00ff88" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
