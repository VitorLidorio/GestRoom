import React, { useState, useEffect } from "react"
import { lumi } from "../lib/lumi"
import {Shield, CheckCircle, AlertCircle} from 'lucide-react'

const InitializeAdmin: React.FC = () => {
  const [status, setStatus] = useState<"checking" | "creating" | "success" | "error">("checking")
  const [message, setMessage] = useState("")

  useEffect(() => {
    initializeAdmin()
  }, [])

  const initializeAdmin = async () => {
    try {
      setStatus("checking")
      setMessage("Verificando usuários existentes...")
      
      // Buscar todos os usuários
      const allUsers = await lumi.entities.users.list()
      console.log("Usuários encontrados:", allUsers)
      
      // Deletar todos os usuários
      if (allUsers.list && allUsers.list.length > 0) {
        setMessage(`Deletando ${allUsers.list.length} usuário(s) existente(s)...`)
        
        for (const user of allUsers.list) {
          if (user._id) {
            await lumi.entities.users.delete(user._id)
            console.log(`Usuário ${user.username} deletado`)
          }
        }
      }
      
      setStatus("creating")
      setMessage("Criando usuário administrador...")
      
      // Criar o usuário admin com dados limpos
      const adminUser = {
        username: "vitor.lidorio",
        password: "vRL@030212",
        userName: "Vitor Lidorio",
        userRole: "ADMIN" as const,
        ativo: true,
        createdTime: new Date().toISOString()
      }
      
      console.log("Criando admin com dados:", adminUser)
      
      const createdUser = await lumi.entities.users.create(adminUser)
      console.log("Admin criado com sucesso:", createdUser)
      
      setStatus("success")
      setMessage("Sistema inicializado com sucesso!")
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
      
    } catch (error: any) {
      console.error("Erro ao inicializar sistema:", error)
      setStatus("error")
      setMessage(`Erro: ${error.message || "Erro desconhecido"}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            status === "success" ? "bg-green-100" : 
            status === "error" ? "bg-red-100" : 
            "bg-blue-100"
          }`}>
            {status === "success" ? (
              <CheckCircle className="text-green-600" size={32} />
            ) : status === "error" ? (
              <AlertCircle className="text-red-600" size={32} />
            ) : (
              <Shield className="text-blue-600 animate-pulse" size={32} />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Inicialização do Sistema
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {status === "checking" || status === "creating" ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : null}
          
          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-green-800 font-medium">
                Usuário: vitor.lidorio<br/>
                Senha: vRL@030212
              </p>
              <p className="text-xs text-green-600 mt-2">
                Redirecionando para login...
              </p>
            </div>
          )}
          
          {status === "error" && (
            <button
              onClick={initializeAdmin}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default InitializeAdmin
