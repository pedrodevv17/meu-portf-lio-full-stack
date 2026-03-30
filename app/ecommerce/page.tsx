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
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Trash2,
  Edit,
  Search,
  Minus,
  X,
  ShoppingBag,
} from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image: string
  createdAt: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "pendente" | "processando" | "enviado" | "entregue"
  customerName: string
  customerEmail: string
  createdAt: string
}

const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Notebook Dell Inspiron",
    description: "Notebook Intel Core i7, 16GB RAM, SSD 512GB",
    price: 4599.99,
    stock: 15,
    category: "Eletrônicos",
    image: "/placeholder.svg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Mouse Gamer Logitech",
    description: "Mouse sem fio com sensor de alta precisão",
    price: 299.99,
    stock: 50,
    category: "Periféricos",
    image: "/placeholder.svg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Teclado Mecânico RGB",
    description: "Teclado mecânico com switches blue e iluminação RGB",
    price: 459.99,
    stock: 30,
    category: "Periféricos",
    image: "/placeholder.svg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Monitor 27\" 4K",
    description: "Monitor IPS 4K UHD com HDR",
    price: 2199.99,
    stock: 10,
    category: "Eletrônicos",
    image: "/placeholder.svg",
    createdAt: new Date().toISOString(),
  },
]

export default function EcommercePage() {
  const [products, setProducts, isLoaded] = useLocalStorage<Product[]>("ecommerce-products", defaultProducts)
  const [cart, setCart] = useLocalStorage<CartItem[]>("ecommerce-cart", [])
  const [orders, setOrders] = useLocalStorage<Order[]>("ecommerce-orders", [])
  
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"loja" | "admin" | "pedidos">("loja")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  })

  const [checkoutData, setCheckoutData] = useState({
    customerName: "",
    customerEmail: "",
  })

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))]
    return cats
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }, [cart])

  const cartItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0),
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    }
  }, [products, orders])

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", stock: "", category: "" })
    setEditingProduct(null)
  }

  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
      })
    } else {
      resetForm()
    }
    setIsProductDialogOpen(true)
  }

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.category) return

    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category: formData.category,
              }
            : p
        )
      )
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        image: "/placeholder.svg",
        createdAt: new Date().toISOString(),
      }
      setProducts([...products, newProduct])
    }

    setIsProductDialogOpen(false)
    resetForm()
  }

  const handleDeleteProduct = () => {
    if (deleteProductId) {
      setProducts(products.filter((p) => p.id !== deleteProductId))
      setDeleteProductId(null)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const handleCheckout = () => {
    if (!checkoutData.customerName || !checkoutData.customerEmail || cart.length === 0) return

    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cart],
      total: cartTotal,
      status: "pendente",
      customerName: checkoutData.customerName,
      customerEmail: checkoutData.customerEmail,
      createdAt: new Date().toISOString(),
    }

    setOrders([...orders, newOrder])
    
    // Update stock
    setProducts(
      products.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id)
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) }
        }
        return p
      })
    )

    setCart([])
    setCheckoutData({ customerName: "", customerEmail: "" })
    setIsCheckoutOpen(false)
    setIsCartOpen(false)
    setActiveTab("pedidos")
  }

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)))
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
                <h1 className="text-xl font-bold text-foreground">E-Commerce API</h1>
                <p className="text-xs text-muted-foreground">Demo com LocalStorage</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                {(["loja", "admin", "pedidos"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              
              {activeTab === "loja" && (
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile tabs */}
          <div className="sm:hidden flex gap-2 mt-4 border border-border rounded-lg overflow-hidden">
            {(["loja", "admin", "pedidos"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Store View */}
        {activeTab === "loja" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-input text-foreground"
              >
                <option value="all">Todas Categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all group"
                >
                  <div className="aspect-square bg-secondary/50 flex items-center justify-center">
                    <Package className="h-16 w-16 text-primary/30" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <Badge variant="secondary" className="text-xs mb-2">
                        {product.category}
                      </Badge>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.stock} em estoque
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.stock === 0 ? "Sem Estoque" : "Adicionar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        )}

        {/* Admin View */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Produtos</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estoque Total</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalStock}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pedidos</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Receita</p>
                    <p className="text-2xl font-bold text-foreground">
                      R$ {stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Management */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Gerenciar Produtos</h2>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenProductDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Editar Produto" : "Novo Produto"}
                      </DialogTitle>
                      <DialogDescription>
                        Preencha os dados do produto
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Field>
                        <FieldLabel>Nome</FieldLabel>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Nome do produto"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Descrição</FieldLabel>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Descrição do produto"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Preço (R$)</FieldLabel>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0.00"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Estoque</FieldLabel>
                          <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="0"
                          />
                        </Field>
                      </div>
                      <Field>
                        <FieldLabel>Categoria</FieldLabel>
                        <Input
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="Ex: Eletrônicos"
                        />
                      </Field>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveProduct}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary/50" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {product.price.toFixed(2)} • {product.stock} un
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenProductDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteProductId(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders View */}
        {activeTab === "pedidos" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Pedidos</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum pedido realizado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">
                          Pedido #{order.id}
                        </p>
                        <p className="font-semibold text-foreground">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as Order["status"])
                          }
                          className="px-3 py-1.5 rounded-lg border border-border bg-input text-foreground text-sm"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="processando">Processando</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregue">Entregue</option>
                        </select>
                        <Badge
                          variant={
                            order.status === "entregue"
                              ? "default"
                              : order.status === "enviado"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-border pt-4">
                      {order.items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="text-foreground">
                            R$ {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-2 border-t border-border">
                        <span>Total</span>
                        <span className="text-primary">R$ {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Carrinho</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Carrinho vazio</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 p-4 bg-secondary/30 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                        <Package className="h-8 w-8 text-primary/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-primary">
                          R$ {item.product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-foreground">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-auto"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" onClick={() => setIsCheckoutOpen(true)}>
                    Finalizar Compra
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Compra</DialogTitle>
            <DialogDescription>
              Preencha seus dados para concluir o pedido
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>Nome Completo</FieldLabel>
              <Input
                value={checkoutData.customerName}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, customerName: e.target.value })
                }
                placeholder="Seu nome"
              />
            </Field>
            <Field>
              <FieldLabel>E-mail</FieldLabel>
              <Input
                type="email"
                value={checkoutData.customerEmail}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, customerEmail: e.target.value })
                }
                placeholder="seu@email.com"
              />
            </Field>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Resumo do Pedido</p>
              <p className="text-lg font-bold text-foreground">
                {cartItemsCount} itens • R$ {cartTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCheckout}>Confirmar Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
