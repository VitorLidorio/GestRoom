import { useState, useEffect } from "react"
import { lumi } from "../lib/lumi"

interface User {
  _id: string
  password: string
  userName: string
  userRole: "ADMIN" | "USER"
  ativo: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch (error) {
        console.error("Erro ao carregar usuário do localStorage:", error)
        localStorage.removeItem("currentUser")
        return null
      }
    }
    return null
  })
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("currentUser") !== null
  })
  const [isLoading, setIsLoading] = useState(false)

  const signIn = async (username: string, password: string) => {
    try {
      console.log("Tentando login com:", { username, password })
      
      const result = await lumi.entities.users.list({ 
        filter: { userName: username.trim() } 
      })
      
      console.log("Resultado da busca:", result)
      
      if (!result.list || result.list.length === 0) {
        throw new Error("Usuário não encontrado")
      }
      
      const dbUser = result.list[0]
      console.log("Usuário encontrado:", { 
        username: dbUser.username, 
        senhaDigitada: password,
        senhaBanco: dbUser.password,
        senhasIguais: dbUser.password === password.trim()
      })
      
      if (dbUser.password !== password.trim()) {
        throw new Error("Senha incorreta")
      }
      
      if (!dbUser.ativo) {
        throw new Error("Usuário inativo. Entre em contato com o administrador.")
      }
      
      const userData: User = {
        _id: dbUser._id,
        password: dbUser.password,
        userName: dbUser.userName,
        userRole: dbUser.userRole,
        ativo: dbUser.ativo
      }
      
      localStorage.setItem("currentUser", JSON.stringify(userData))
      
      setUser(userData)
      setIsAuthenticated(true)
      
      return userData
    } catch (error: any) {
      console.error("Erro de autenticação:", error)
      throw error
    }
  }

  const signOut = () => {
    localStorage.removeItem("currentUser")
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = "/"
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.userRole === "ADMIN",
    isUser: user?.userRole === "USER",
    signIn,
    signOut,
  }
}
