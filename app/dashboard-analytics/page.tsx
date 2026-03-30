"use client"

import { useState, useMemo } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  Trash2,
  Edit,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react"

interface DataPoint {
  id: string
  date: string
  revenue: number
  orders: number
  visitors: number
  conversions: number
  category: string
}

interface KPI {
  id: string
  name: string
  value: number
  previousValue: number
  unit: string
  category: string
}

const generateDefaultData = (): DataPoint[] => {
  const data: DataPoint[] = []
  const categories = ["Eletrônicos", "Roupas", "Alimentos", "Serviços"]
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    categories.forEach((category) => {
      data.push({
        id: `${date.toISOString()}-${category}`,
        date: date.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 10000) + 1000,
        orders: Math.floor(Math.random() * 100) + 10,
        visitors: Math.floor(Math.random() * 1000) + 100,
        conversions: Math.floor(Math.random() * 50) + 5,
        category,
      })
    })
  }
  return data
}

const defaultKPIs: KPI[] = [
  { id: "1", name: "Receita Total", value: 125000, previousValue: 110000, unit: "R$", category: "Financeiro" },
  { id: "2", name: "Pedidos", value: 1250, previousValue: 1100, unit: "", category: "Vendas" },
  { id: "3", name: "Visitantes", value: 45000, previousValue: 42000, unit: "", category: "Tráfego" },
  { id: "4", name: "Taxa de Conversão", value: 3.2, previousValue: 2.8, unit: "%", category: "Performance" },
  { id: "5", name: "Ticket Médio", value: 100, previousValue: 95, unit: "R$", category: "Financeiro" },
  { id: "6", name: "Clientes Ativos", value: 8500, previousValue: 8000, unit: "", category: "Clientes" },
]

export default function DashboardAnalyticsPage() {
  const [dataPoints, setDataPoints, isLoaded] = useLocalStorage<DataPoint[]>(
    "dashboard-data",
    generateDefaultData()
  )
  const [kpis, setKpis] = useLocalStorage<KPI[]>("dashboard-kpis", defaultKPIs)

  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isKPIDialogOpen, setIsKPIDialogOpen] = useState(false)
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null)
  const [deleteKPIId, setDeleteKPIId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    value: "",
    previousValue: "",
    unit: "",
    category: "",
  })

  const categories = useMemo(() => {
    return [...new Set(dataPoints.map((d) => d.category))]
  }, [dataPoints])

  const filteredData = useMemo(() => {
    const now = new Date()
    const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    return dataPoints.filter((d) => {
      const date = new Date(d.date)
      const matchesDate = date >= startDate
      const matchesCategory = selectedCategory === "all" || d.category === selectedCategory
      return matchesDate && matchesCategory
    })
  }, [dataPoints, dateRange, selectedCategory])

  const aggregatedStats = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0)
    const totalOrders = filteredData.reduce((sum, d) => sum + d.orders, 0)
    const totalVisitors = filteredData.reduce((sum, d) => sum + d.visitors, 0)
    const totalConversions = filteredData.reduce((sum, d) => sum + d.conversions, 0)

    return {
      totalRevenue,
      totalOrders,
      totalVisitors,
      totalConversions,
      avgTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      conversionRate: totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0,
    }
  }, [filteredData])

  const chartData = useMemo(() => {
    const grouped: Record<string, { revenue: number; orders: number; visitors: number }> = {}

    filteredData.forEach((d) => {
      if (!grouped[d.date]) {
        grouped[d.date] = { revenue: 0, orders: 0, visitors: 0 }
      }
      grouped[d.date].revenue += d.revenue
      grouped[d.date].orders += d.orders
      grouped[d.date].visitors += d.visitors
    })

    return Object.entries(grouped)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredData])

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}
    filteredData.forEach((d) => {
      breakdown[d.category] = (breakdown[d.category] || 0) + d.revenue
    })
    const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0)
    return Object.entries(breakdown).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: total > 0 ? (revenue / total) * 100 : 0,
    }))
  }, [filteredData])

  const maxRevenue = useMemo(() => {
    return Math.max(...chartData.map((d) => d.revenue), 1)
  }, [chartData])

  const resetForm = () => {
    setFormData({ name: "", value: "", previousValue: "", unit: "", category: "" })
    setEditingKPI(null)
  }

  const handleOpenKPIDialog = (kpi?: KPI) => {
    if (kpi) {
      setEditingKPI(kpi)
      setFormData({
        name: kpi.name,
        value: kpi.value.toString(),
        previousValue: kpi.previousValue.toString(),
        unit: kpi.unit,
        category: kpi.category,
      })
    } else {
      resetForm()
    }
    setIsKPIDialogOpen(true)
  }

  const handleSaveKPI = () => {
    if (!formData.name || !formData.value) return

    if (editingKPI) {
      setKpis(
        kpis.map((k) =>
          k.id === editingKPI.id
            ? {
                ...k,
                name: formData.name,
                value: parseFloat(formData.value),
                previousValue: parseFloat(formData.previousValue) || 0,
                unit: formData.unit,
                category: formData.category,
              }
            : k
        )
      )
    } else {
      const newKPI: KPI = {
        id: Date.now().toString(),
        name: formData.name,
        value: parseFloat(formData.value),
        previousValue: parseFloat(formData.previousValue) || 0,
        unit: formData.unit,
        category: formData.category,
      }
      setKpis([...kpis, newKPI])
    }

    setIsKPIDialogOpen(false)
    resetForm()
  }

  const handleDeleteKPI = () => {
    if (deleteKPIId) {
      setKpis(kpis.filter((k) => k.id !== deleteKPIId))
      setDeleteKPIId(null)
    }
  }

  const regenerateData = () => {
    setDataPoints(generateDefaultData())
  }

  const exportData = () => {
    const csvContent = [
      ["Data", "Categoria", "Receita", "Pedidos", "Visitantes", "Conversões"].join(","),
      ...filteredData.map((d) =>
        [d.date, d.category, d.revenue, d.orders, d.visitors, d.conversions].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${dateRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value)
  }

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/#projects">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Dashboard Analytics</h1>
                <p className="text-xs text-muted-foreground">Análise de Dados em Tempo Real</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={regenerateData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex border border-border rounded-lg overflow-hidden">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  dateRange === range
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {range === "7d" ? "7 dias" : range === "30d" ? "30 dias" : "90 dias"}
              </button>
            ))}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-input text-foreground"
          >
            <option value="all">Todas Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(aggregatedStats.totalRevenue)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Pedidos</p>
            <p className="text-2xl font-bold text-foreground">
              {formatNumber(aggregatedStats.totalOrders)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Visitantes</p>
            <p className="text-2xl font-bold text-foreground">
              {formatNumber(aggregatedStats.totalVisitors)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-foreground">
              {aggregatedStats.conversionRate.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Receita por Período</h3>
              </div>
            </div>
            <div className="h-64 flex items-end gap-1">
              {chartData.slice(-14).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: "4px" }}
                    title={`${d.date}: ${formatCurrency(d.revenue)}`}
                  />
                  <span className="text-[10px] text-muted-foreground -rotate-45 origin-top-left whitespace-nowrap">
                    {new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Por Categoria</h3>
            </div>
            <div className="space-y-4">
              {categoryBreakdown.map((item, i) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{item.category}</span>
                    <span className="text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${item.percentage}%`,
                        opacity: 1 - i * 0.15,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">KPIs Personalizados</h3>
            </div>
            <Dialog open={isKPIDialogOpen} onOpenChange={setIsKPIDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => handleOpenKPIDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo KPI
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingKPI ? "Editar KPI" : "Novo KPI"}</DialogTitle>
                  <DialogDescription>Configure os dados do indicador</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Field>
                    <FieldLabel>Nome</FieldLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Taxa de Retenção"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Valor Atual</FieldLabel>
                      <Input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="0"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Valor Anterior</FieldLabel>
                      <Input
                        type="number"
                        value={formData.previousValue}
                        onChange={(e) => setFormData({ ...formData, previousValue: e.target.value })}
                        placeholder="0"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Unidade</FieldLabel>
                      <Input
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="Ex: R$, %, un"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Categoria</FieldLabel>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Ex: Financeiro"
                      />
                    </Field>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsKPIDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveKPI}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi) => {
              const change = getChangePercent(kpi.value, kpi.previousValue)
              const isPositive = change >= 0

              return (
                <div
                  key={kpi.id}
                  className="p-4 bg-secondary/30 rounded-lg group relative"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleOpenKPIDialog(kpi)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setDeleteKPIId(kpi.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {kpi.category}
                    </Badge>
                    <div
                      className={`flex items-center text-xs ${
                        isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(change).toFixed(1)}%
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{kpi.name}</p>
                  <p className="text-xl font-bold text-foreground">
                    {kpi.unit === "R$"
                      ? formatCurrency(kpi.value)
                      : `${formatNumber(kpi.value)}${kpi.unit}`}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Data Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Dados Recentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    Receita
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    Pedidos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    Visitantes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    Conversões
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.slice(0, 20).map((d) => (
                  <tr key={d.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                      {new Date(d.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{d.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-foreground">
                      {formatCurrency(d.revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-muted-foreground">
                      {formatNumber(d.orders)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-muted-foreground">
                      {formatNumber(d.visitors)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-muted-foreground">
                      {formatNumber(d.conversions)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteKPIId} onOpenChange={() => setDeleteKPIId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este KPI? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKPI}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
