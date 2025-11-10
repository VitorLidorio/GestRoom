import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Salas from './pages/Salas'
import Disciplinas from './pages/Disciplinas'
import Turmas from './pages/Turmas'
import GradeHoraria from './pages/GradeHoraria'
import Users from './pages/Users'
import Profile from './pages/Profile'
import InitializeAdmin from './pages/InitializeAdmin'
import { useAuth } from './hooks/useAuth'
import {LogIn} from 'lucide-react'
import toast from 'react-hot-toast'

function App() {
  const { isAuthenticated, isAdmin, isLoading, signIn } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Debug: Monitora mudanças no estado de autenticação
  useEffect(() => {
    console.log("Estado de autenticação mudou:", { isAuthenticated, isLoading })
  }, [isAuthenticated, isLoading])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    
    try {
      console.log("Iniciando processo de login...")
      const result = await signIn(username, password)
      console.log("Login retornou:", result)
      toast.success("Login realizado com sucesso!")
      setIsLoggingIn(false)
      // Não precisa de reload - o estado já foi atualizado
    } catch (error: any) {
      console.error("Erro no handleSignIn:", error)
      toast.error(error.message || "Erro ao fazer login")
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-blue-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema Acadêmico</h1>
            <p className="text-gray-600">
              Gerenciamento de Salas e Turmas
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite seu usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {isLoggingIn ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { 
            background: '#363636', 
            color: '#fff',
            borderRadius: '8px'
          },
          success: { 
            style: { 
              background: '#10b981',
              color: '#fff'
            } 
          },
          error: { 
            style: { 
              background: '#ef4444',
              color: '#fff'
            } 
          }
        }}
      />
      
      <Router>
        <Routes>
          {/* Rota de inicialização do sistema */}
          <Route path="/initialize" element={<InitializeAdmin />} />
          
          {/* Rotas principais com Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/salas" element={<Salas />} />
                <Route path="/disciplinas" element={<Disciplinas />} />
                <Route path="/turmas" element={<Turmas />} />
                <Route path="/grade" element={<GradeHoraria />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={isAdmin ? <Users /> : <Navigate to="/" />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </>
  )
}

export default App
