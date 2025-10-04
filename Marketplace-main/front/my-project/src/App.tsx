"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LogOut, Upload, Heart, Users, MessageCircle, Sprout, Tractor, Send } from "lucide-react"

const API_URL = "http://localhost:3000"

interface UserData {
  id: string
  name: string
  email: string
  image: string
}

interface Message {
  id: number
  userId: string
  userName: string
  text: string
  createdAt: string
  reply?: string
  repliedAt?: string
}

interface Product {
  id: string
  title: string
  description: string
  price: number
  type: string
  image: string
  owner?: UserData
  messages?: Message[]
}

interface Backing {
  amount: number
  user: UserData
}

interface Investment {
  id: string
  title: string
  description: string
  goalAmount: number
  image: string
  creator?: UserData
  backings?: Backing[]
}

interface Job {
  id: string
  title: string
  description: string
  type: string
  image: string
  poster?: UserData
}

const MentalHealthSupport = ({ onClose }: { onClose: () => void }) => {
  const messages = [
    "Your work feeds communities. Your wellbeing matters just as much.",
    "Strength isn't carrying it all alone. It's knowing when to reach out.",
    "Every harvest begins with a single seed. Every change begins with one step.",
    "The soil needs rest to grow. So do you.",
    "You are the backbone of agriculture. Take care of that backbone.",
    "Asking for help is farming wisdom, not weakness.",
    "Crisis line: 1-800-HELP • You deserve support.",
  ]

  const randomMessage = messages[Math.floor(Math.random() * messages.length)]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <Heart className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">{randomMessage}</p>
        <button
          onClick={onClose}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
export default function App() {
  const [user, setUser] = useState<UserData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("products")
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "", image: "" })
  const [authImagePreview, setAuthImagePreview] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [showInvestmentForm, setShowInvestmentForm] = useState(false)
  const [showJobForm, setShowJobForm] = useState(false)
  const [showBackingForm, setShowBackingForm] = useState<string | null>(null)
  const [productForm, setProductForm] = useState({ title: "", description: "", price: "", type: "SELL", image: "" })
  const [productImagePreview, setProductImagePreview] = useState("")
  const [investmentForm, setInvestmentForm] = useState({ title: "", description: "", goalAmount: "", image: "" })
  const [investmentImagePreview, setInvestmentImagePreview] = useState("")
  const [jobForm, setJobForm] = useState({ title: "", description: "", type: "OFFER", image: "" })
  const [jobImagePreview, setJobImagePreview] = useState("")
  const [backingAmount, setBackingAmount] = useState("")
  const [showMentalHealthSupport, setShowMentalHealthSupport] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const [selectedContact, setSelectedContact] = useState<{ type: "product" | "investment" | "job"; id: string } | null>(
    null,
  )

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  const [messageText, setMessageText] = useState("")
  const [selectedProductForMessage, setSelectedProductForMessage] = useState<string | null>(null)

  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [replyingToMessage, setReplyingToMessage] = useState<{ productId: string; messageId: number } | null>(null)

  useEffect(() => {
    if (token) {
      fetchUser()
      fetchData()
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else logout()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const [p, i, j] = await Promise.all([
        fetch(`${API_URL}/products`).then((r) => r.json()),
        fetch(`${API_URL}/investments`).then((r) => r.json()),
        fetch(`${API_URL}/jobs`).then((r) => r.json()),
      ])
      setProducts(p)
      setInvestments(i)
      setJobs(j)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (preview: string) => void,
    setFormImage: (image: string) => void,
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPreview(base64String)
        setFormImage(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const endpoint = authMode === "login" ? "login" : "register"
      const body = authMode === "login" ? { email: authForm.email, password: authForm.password } : { ...authForm }
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setToken(data.token)
        setUser(data.user)
      } else alert("Auth failed: " + (data.message || "Error"))
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const payload = {
        ...productForm,
        price: Number.parseFloat(productForm.price),
        ownerId: Number.parseInt(user.id),
      }

      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      const responseData = await res.json()

      if (res.ok) {
        fetchData()
        setShowProductForm(false)
        setProductForm({ title: "", description: "", price: "", type: "SELL", image: "" })
        setProductImagePreview("")
      } else {
        alert("Error creating product: " + JSON.stringify(responseData))
      }
    } catch (error) {
      alert("Error creating product")
    } finally {
      setIsLoading(false)
    }
  }

  const createInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const payload = {
        ...investmentForm,
        goalAmount: Number.parseFloat(investmentForm.goalAmount),
        creator: {
          id: Number.parseInt(user.id),
          name: user.name,
          email: user.email,
          image: user.image,
        },
      }

      const res = await fetch(`${API_URL}/investments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      const responseData = await res.json()

      if (res.ok) {
        fetchData()
        setShowInvestmentForm(false)
        setInvestmentForm({ title: "", description: "", goalAmount: "", image: "" })
        setInvestmentImagePreview("")
      } else {
        alert("Error creating investment: " + JSON.stringify(responseData))
      }
    } catch (error) {
      alert("Error creating investment")
    } finally {
      setIsLoading(false)
    }
  }

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const payload = {
        ...jobForm,
        poster: {
          id: Number.parseInt(user.id),
          name: user.name,
          email: user.email,
          image: user.image,
        },
      }

      const res = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      const responseData = await res.json()

      if (res.ok) {
        fetchData()
        setShowJobForm(false)
        setJobForm({ title: "", description: "", type: "OFFER", image: "" })
        setJobImagePreview("")
      } else {
        alert("Error creating job: " + JSON.stringify(responseData))
      }
    } catch (error) {
      alert("Error creating job")
    } finally {
      setIsLoading(false)
    }
  }

  const addBacking = async (investmentId: string) => {
    if (!user) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const res = await fetch(`${API_URL}/investments/${investmentId}/backings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user, amount: Number.parseFloat(backingAmount) }),
      })
      if (res.ok) {
        fetchData()
        setShowBackingForm(null)
        setBackingAmount("")
      }
    } catch {
      alert("Error adding backing")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchData()
      }
    } catch {
      alert("Error deleting product")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteInvestment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this investment?")) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const res = await fetch(`${API_URL}/investments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchData()
      }
    } catch {
      alert("Error deleting investment")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const res = await fetch(`${API_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchData()
      }
    } catch {
      alert("Error deleting job")
    } finally {
      setIsLoading(false)
    }
  }

  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: productForm.title,
          description: productForm.description,
          price: Number.parseFloat(productForm.price),
          type: productForm.type,
          image: productForm.image,
        }),
      })
      if (res.ok) {
        fetchData()
        setEditingProduct(null)
        setProductForm({ title: "", description: "", price: "", type: "SELL", image: "" })
        setProductImagePreview("")
      }
    } catch {
      alert("Error updating product")
    } finally {
      setIsLoading(false)
    }
  }

  const updateInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingInvestment) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const res = await fetch(`${API_URL}/investments/${editingInvestment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: investmentForm.title,
          description: investmentForm.description,
          goalAmount: Number.parseFloat(investmentForm.goalAmount),
          image: investmentForm.image,
        }),
      })
      if (res.ok) {
        fetchData()
        setEditingInvestment(null)
        setInvestmentForm({ title: "", description: "", goalAmount: "", image: "" })
        setInvestmentImagePreview("")
      }
    } catch {
      alert("Error updating investment")
    } finally {
      setIsLoading(false)
    }
  }

  const updateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJob) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const res = await fetch(`${API_URL}/jobs/${editingJob.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: jobForm.title,
          description: jobForm.description,
          type: jobForm.type,
          image: jobForm.image,
        }),
      })
      if (res.ok) {
        fetchData()
        setEditingJob(null)
        setJobForm({ title: "", description: "", type: "OFFER", image: "" })
        setJobImagePreview("")
      }
    } catch {
      alert("Error updating job")
    } finally {
      setIsLoading(false)
    }
  }

  const startEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      type: product.type,
      image: product.image,
    })
    setProductImagePreview(product.image)
  }

  const startEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment)
    setInvestmentForm({
      title: investment.title,
      description: investment.description,
      goalAmount: investment.goalAmount.toString(),
      image: investment.image,
    })
    setInvestmentImagePreview(investment.image)
  }

  const startEditJob = (job: Job) => {
    setEditingJob(job)
    setJobForm({
      title: job.title,
      description: job.description,
      type: job.type,
      image: job.image,
    })
    setJobImagePreview(job.image)
  }

  const sendMessage = async (productId: string) => {
    if (!user || !messageText.trim()) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const productRes = await fetch(`${API_URL}/products/${productId}`)
      if (!productRes.ok) {
        alert("Error fetching product")
        return
      }
      const product = await productRes.json()

      const existingMessages = product.messages || []
      const newMessage = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        text: messageText,
        createdAt: new Date().toISOString(),
      }
      const updatedMessages = [...existingMessages, newMessage]

      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      })

      if (res.ok) {
        fetchData()
        setMessageText("")
        setSelectedProductForMessage(null)
        alert("Message sent successfully!")
      } else {
        alert("Error sending message")
      }
    } catch (error) {
      alert("Error sending message")
    } finally {
      setIsLoading(false)
    }
  }

  const replyToMessage = async (productId: string, messageId: number) => {
    if (!user || !replyText[`${productId}-${messageId}`]?.trim()) return
    setIsLoading(true)
    setShowMentalHealthSupport(true)
    try {
      const productRes = await fetch(`${API_URL}/products/${productId}`)
      if (!productRes.ok) {
        alert("Error fetching product")
        return
      }
      const product = await productRes.json()

      const updatedMessages = product.messages.map((msg: Message) =>
        msg.id === messageId
          ? {
              ...msg,
              reply: replyText[`${productId}-${messageId}`],
              repliedAt: new Date().toISOString(),
            }
          : msg,
      )

      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      })

      if (res.ok) {
        fetchData()
        setReplyText({ ...replyText, [`${productId}-${messageId}`]: "" })
        setReplyingToMessage(null)
        alert("Reply sent successfully!")
      } else {
        alert("Error sending reply")
      }
    } catch (error) {
      alert("Error sending reply")
    } finally {
      setIsLoading(false)
    }
  }

  if (showMentalHealthSupport && isLoading) {
    return <MentalHealthSupport onClose={() => setShowMentalHealthSupport(false)} />
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-lime-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-2 border-green-100">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-600 p-3 rounded-full">
              <Sprout className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-green-700">
            {authMode === "login" ? "Welcome Back" : "Join AgriMarket"}
          </h1>
          <p className="text-center text-gray-600 mb-8">Growing communities, one harvest at a time</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
            {authMode === "register" && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition flex items-center justify-center gap-2">
                        <Upload size={20} className="text-green-600" />
                        <span className="text-green-700">{authImagePreview ? "Image Selected" : "Choose Image"}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageSelect(e, setAuthImagePreview, (img) => setAuthForm({ ...authForm, image: img }))
                        }
                      />
                    </label>
                    {authImagePreview && (
                      <img
                        src={authImagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-300"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold transition shadow-md"
            >
              {authMode === "login" ? "Sign In" : "Sign Up"}
            </button>
          </form>
          <button
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            className="w-full mt-4 text-green-700 hover:text-green-900 font-medium"
          >
            {authMode === "login" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    )
  }

  const myProducts = products.filter((p) => p.owner?.id === user.id)
  const myInvestments = investments.filter((i) => i.creator?.id === user.id)
  const myJobs = jobs.filter((j) => j.poster?.id === user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-lime-50">
      <header className="bg-white shadow-md border-b-4 border-green-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-lg">
              <Tractor className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-700">AgriMarket</h1>
              <p className="text-xs text-gray-600">Farm to Community</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-amber-50 px-4 py-2 rounded-lg border-2 border-green-200">
              <img
                src={user.image || "/placeholder.svg"}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-green-400"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
        {["products", "investments", "jobs", "myPosts"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md"
                : "bg-white border-2 border-green-200 text-green-700 hover:bg-green-50"
            }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === "myPosts" ? "My Posts" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {activeTab === "products" && (
          <>
            <div className="col-span-full flex justify-end mb-4">
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold transition shadow-md flex items-center gap-2"
              >
                <Sprout size={20} />+ Add Product
              </button>
            </div>
            {products.map((product) => {
              const isSelected = selectedContact?.type === "product" && selectedContact?.id === product.id
              const isMyProduct = product.owner?.id === user.id
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer border-2 border-green-100 hover:border-green-300"
                  onClick={() => setSelectedContact(isSelected ? null : { type: "product", id: product.id })}
                >
                  <img
                    src={product.image || "/placeholder.svg?height=200&width=400&query=agricultural+farm+products"}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-gray-800">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">${product.price}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.type === "SELL" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {product.type}
                      </span>
                    </div>
                    {isSelected && product.owner && (
                      <div className="mt-4 pt-4 border-t-2 border-green-100">
                        <p className="text-xs font-semibold text-green-700 uppercase mb-3 flex items-center gap-2">
                          <Users size={14} /> Contact Information
                        </p>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.owner.image || "/placeholder.svg"}
                            alt={product.owner.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-300"
                          />
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">Name:</span> {product.owner.name}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">Email:</span> {product.owner.email}
                            </p>
                          </div>
                        </div>
                        {!isMyProduct && (
                          <div className="mt-4 pt-4 border-t-2 border-green-100">
                            <p className="text-xs font-semibold text-green-700 uppercase mb-2 flex items-center gap-2">
                              <MessageCircle size={14} /> Send Message
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border-2 border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                value={selectedProductForMessage === product.id ? messageText : ""}
                                onChange={(e) => {
                                  setMessageText(e.target.value)
                                  setSelectedProductForMessage(product.id)
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  sendMessage(product.id)
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition flex items-center gap-1"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {activeTab === "investments" && (
          <>
            <div className="col-span-full flex justify-end mb-4">
              <button
                onClick={() => setShowInvestmentForm(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-orange-700 font-semibold transition shadow-md flex items-center gap-2"
              >
                <Sprout size={20} />+ Add Investment
              </button>
            </div>
            {investments.map((investment) => {
              const isSelected = selectedContact?.type === "investment" && selectedContact?.id === investment.id
              return (
                <div
                  key={investment.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer border-2 border-amber-100 hover:border-amber-300"
                  onClick={() => setSelectedContact(isSelected ? null : { type: "investment", id: investment.id })}
                >
                  <img
                    src={investment.image || "/placeholder.svg?height=200&width=400&query=agricultural+investment+farm"}
                    alt={investment.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-xl mb-1 text-gray-800">{investment.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{investment.description}</p>
                    <div className="text-amber-600 font-semibold text-lg">Goal: ${investment.goalAmount}</div>
                    {isSelected && investment.creator && (
                      <div className="mt-4 pt-4 border-t-2 border-amber-100">
                        <p className="text-xs font-semibold text-amber-700 uppercase mb-3 flex items-center gap-2">
                          <Users size={14} /> Contact Information
                        </p>
                        <div className="flex items-center gap-3">
                          <img
                            src={investment.creator.image || "/placeholder.svg"}
                            alt={investment.creator.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
                          />
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">Name:</span> {investment.creator.name}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">Email:</span> {investment.creator.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {activeTab === "jobs" && (
          <>
            <div className="col-span-full flex justify-end mb-4">
              <button
                onClick={() => setShowJobForm(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 font-semibold transition shadow-md flex items-center gap-2"
              >
                <Tractor size={20} />+ Add Job
              </button>
            </div>
            {jobs.map((job) => {
              const isSelected = selectedContact?.type === "job" && selectedContact?.id === job.id
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer border-2 border-blue-100 hover:border-blue-300"
                  onClick={() => setSelectedContact(isSelected ? null : { type: "job", id: job.id })}
                >
                  <img
                    src={job.image || "/placeholder.svg?height=200&width=400&query=agricultural+farm+work"}
                    alt={job.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-gray-800">{job.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{job.description}</p>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        job.type === "OFFER" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {job.type}
                    </div>
                    {isSelected && job.poster && (
                      <div className="mt-4 pt-4 border-t-2 border-blue-100">
                        <p className="text-xs font-semibold text-blue-700 uppercase mb-3 flex items-center gap-2">
                          <Users size={14} /> Contact Information
                        </p>
                        <div className="flex items-center gap-3">
                          <img
                            src={job.poster.image || "/placeholder.svg"}
                            alt={job.poster.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                          />
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">Name:</span> {job.poster.name}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">Email:</span> {job.poster.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {activeTab === "myPosts" && (
          <>
            <div className="col-span-full">
              <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <Sprout size={28} /> My Products
              </h2>
            </div>
            {myProducts.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8 bg-white rounded-xl border-2 border-dashed border-green-200">
                No products posted yet
              </div>
            )}
            {myProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-green-100">
                <img
                  src={product.image || "/placeholder.svg?height=200&width=400&query=agricultural+farm+products"}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-gray-800">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <div className="text-2xl font-bold text-green-600 mb-4">${product.price}</div>

                  {product.messages && product.messages.length > 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-amber-50 rounded-lg border-2 border-green-200">
                      <p className="text-xs font-semibold text-green-700 uppercase mb-3 flex items-center gap-2">
                        <MessageCircle size={14} /> Messages ({product.messages.length})
                      </p>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {product.messages.map((msg) => (
                          <div key={msg.id} className="bg-white p-3 rounded-lg border-2 border-green-100">
                            <div className="flex items-start gap-2 mb-2">
                              <div className="bg-green-100 p-1 rounded-full">
                                <MessageCircle size={12} className="text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-700">{msg.userName}</p>
                                <p className="text-sm text-gray-800 mt-1">{msg.text}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(msg.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {msg.reply && (
                              <div className="ml-6 mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs font-semibold text-green-700 mb-1">Your Reply:</p>
                                <p className="text-sm text-gray-800">{msg.reply}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(msg.repliedAt!).toLocaleDateString()}
                                </p>
                              </div>
                            )}

                            {!msg.reply && (
                              <div className="ml-6 mt-2">
                                {replyingToMessage?.productId === product.id &&
                                replyingToMessage?.messageId === msg.id ? (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Type your reply..."
                                      className="flex-1 px-3 py-2 border-2 border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      value={replyText[`${product.id}-${msg.id}`] || ""}
                                      onChange={(e) =>
                                        setReplyText({ ...replyText, [`${product.id}-${msg.id}`]: e.target.value })
                                      }
                                    />
                                    <button
                                      onClick={() => replyToMessage(product.id, msg.id)}
                                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition flex items-center gap-1"
                                    >
                                      <Send size={14} />
                                    </button>
                                    <button
                                      onClick={() => setReplyingToMessage(null)}
                                      className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 text-sm transition"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setReplyingToMessage({ productId: product.id, messageId: msg.id })}
                                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                                  >
                                    <MessageCircle size={14} /> Reply
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditProduct(product)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="col-span-full mt-8">
              <h2 className="text-2xl font-bold text-amber-700 mb-4 flex items-center gap-2">
                <Sprout size={28} /> My Investments
              </h2>
            </div>
            {myInvestments.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8 bg-white rounded-xl border-2 border-dashed border-amber-200">
                No investments posted yet
              </div>
            )}
            {myInvestments.map((investment) => (
              <div
                key={investment.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-amber-100"
              >
                <img
                  src={investment.image || "/placeholder.svg?height=200&width=400&query=agricultural+investment+farm"}
                  alt={investment.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-xl mb-1 text-gray-800">{investment.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{investment.description}</p>
                  <div className="text-amber-600 font-semibold mb-4 text-lg">Goal: ${investment.goalAmount}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditInvestment(investment)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteInvestment(investment.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="col-span-full mt-8">
              <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <Tractor size={28} /> My Jobs
              </h2>
            </div>
            {myJobs.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8 bg-white rounded-xl border-2 border-dashed border-blue-200">
                No jobs posted yet
              </div>
            )}
            {myJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-blue-100">
                <img
                  src={job.image || "/placeholder.svg?height=200&width=400&query=agricultural+farm+work"}
                  alt={job.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-gray-800">{job.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{job.description}</p>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
                      job.type === "OFFER" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {job.type}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditJob(job)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border-4 border-green-200">
            <h2 className="text-2xl font-bold mb-4 text-green-700 flex items-center gap-2">
              <Sprout size={24} /> Add New Product
            </h2>
            <form onSubmit={createProduct} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
              <select
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={productForm.type}
                onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
              >
                <option value="SELL">Sell</option>
                <option value="BUY">Buy</option>
              </select>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Image</label>
                <label className="cursor-pointer block">
                  <div className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition flex items-center justify-center gap-2">
                    <Upload size={20} className="text-green-600" />
                    <span className="text-green-700">{productImagePreview ? "Change Image" : "Choose Image"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageSelect(e, setProductImagePreview, (img) =>
                        setProductForm({ ...productForm, image: img }),
                      )
                    }
                  />
                </label>
                {productImagePreview && (
                  <img
                    src={productImagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-green-200"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false)
                    setProductForm({ title: "", description: "", price: "", type: "SELL", image: "" })
                    setProductImagePreview("")
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvestmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border-4 border-amber-200">
            <h2 className="text-2xl font-bold mb-4 text-amber-700 flex items-center gap-2">
              <Sprout size={24} /> Add New Investment
            </h2>
            <form onSubmit={createInvestment} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={investmentForm.title}
                onChange={(e) => setInvestmentForm({ ...investmentForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={investmentForm.description}
                onChange={(e) => setInvestmentForm({ ...investmentForm, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Goal Amount"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={investmentForm.goalAmount}
                onChange={(e) => setInvestmentForm({ ...investmentForm, goalAmount: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Image</label>
                <label className="cursor-pointer block">
                  <div className="w-full px-4 py-3 border-2 border-dashed border-amber-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition flex items-center justify-center gap-2">
                    <Upload size={20} className="text-amber-600" />
                    <span className="text-amber-700">{investmentImagePreview ? "Change Image" : "Choose Image"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageSelect(e, setInvestmentImagePreview, (img) =>
                        setInvestmentForm({ ...investmentForm, image: img }),
                      )
                    }
                  />
                </label>
                {investmentImagePreview && (
                  <img
                    src={investmentImagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-amber-200"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg hover:from-amber-700 hover:to-orange-700 transition font-semibold"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInvestmentForm(false)
                    setInvestmentForm({ title: "", description: "", goalAmount: "", image: "" })
                    setInvestmentImagePreview("")
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border-4 border-blue-200">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
              <Tractor size={24} /> Add New Job
            </h2>
            <form onSubmit={createJob} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                required
              />
              <select
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={jobForm.type}
                onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
              >
                <option value="OFFER">Offer</option>
                <option value="REQUEST">Request</option>
              </select>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Image</label>
                <label className="cursor-pointer block">
                  <div className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2">
                    <Upload size={20} className="text-blue-600" />
                    <span className="text-blue-700">{jobImagePreview ? "Change Image" : "Choose Image"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageSelect(e, setJobImagePreview, (img) => setJobForm({ ...jobForm, image: img }))
                    }
                  />
                </label>
                {jobImagePreview && (
                  <img
                    src={jobImagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJobForm(false)
                    setJobForm({ title: "", description: "", type: "OFFER", image: "" })
                    setJobImagePreview("")
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border-4 border-green-200">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Edit Product</h2>
            <form onSubmit={updateProduct} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
              <select
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={productForm.type}
                onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
              >
                <option value="SELL">Sell</option>
                <option value="BUY">Buy</option>
              </select>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Image</label>
                <label className="cursor-pointer block">
                  <div className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition flex items-center justify-center gap-2">
                    <Upload size={20} className="text-green-600" />
                    <span className="text-green-700">{productImagePreview ? "Change Image" : "Choose Image"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageSelect(e, setProductImagePreview, (img) =>
                        setProductForm({ ...productForm, image: img }),
                      )
                    }
                  />
                </label>
                {productImagePreview && (
                  <img
                    src={productImagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-green-200"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null)
                    setProductForm({ title: "", description: "", price: "", type: "SELL", image: "" })
                    setProductImagePreview("")
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border-4 border-amber-200">
            <h2 className="text-2xl font-bold mb-4 text-amber-700">Edit Investment</h2>
            <form onSubmit={updateInvestment} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={investmentForm.title}
                onChange={(e) => setInvestmentForm({ ...investmentForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={investmentForm.description}
                onChange={(e) => setInvestmentForm({ ...investmentForm, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Goal Amount"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={investmentForm.goalAmount}
                onChange={(e) => setInvestmentForm({ ...investmentForm, goalAmount: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Image</label>
                <label className="cursor-pointer block">
                  <div className="w-full px-4 py-3 border-2 border-dashed border-amber-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition flex items-center justify-center gap-2">
                    <Upload size={20} className="text-amber-600" />
                    <span className="text-amber-700">{investmentImagePreview ? "Change Image" : "Choose Image"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageSelect(e, setInvestmentImagePreview, (img) =>
                        setInvestmentForm({ ...investmentForm, image: img }),
                      )
                    }
                  />
                </label>
                {investmentImagePreview && (
                  <img
                    src={investmentImagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-amber-200"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg hover:from-amber-700 hover:to-orange-700 transition font-semibold"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingInvestment(null)
                    setInvestmentForm({ title: "", description: "", goalAmount: "", image: "" })
                    setInvestmentImagePreview("")
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border-4 border-blue-200">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Edit Job</h2>
            <form onSubmit={updateJob} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                required
              />
              <select
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={jobForm.type}
                onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
              >
                <option value="OFFER">Offer</option>
                <option value="REQUEST">Request</option>
              </select>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Image</label>
                <label className="cursor-pointer block">
                  <div className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2">
                    <Upload size={20} className="text-blue-600" />
                    <span className="text-blue-700">{jobImagePreview ? "Change Image" : "Choose Image"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageSelect(e, setJobImagePreview, (img) => setJobForm({ ...jobForm, image: img }))
                    }
                  />
                </label>
                {jobImagePreview && (
                  <img
                    src={jobImagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingJob(null)
                    setJobForm({ title: "", description: "", type: "OFFER", image: "" })
                    setJobImagePreview("")
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
