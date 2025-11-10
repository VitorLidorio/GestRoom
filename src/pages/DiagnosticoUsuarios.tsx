import React, { useState, useEffect } from "react"
import { lumi } from "../lib/lumi"
import {AlertCircle, CheckCircle, RefreshCw} from 'lucide-react'
import toast from "react-hot-toast"

interface User {
  _id?: string
  username: string
  password: string
  userName: string
  userRole: "ADMIN" | "USER"
  ativo: boolean
}

const DiagnosticoUsuarios: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const result = await lumi.entities.users.list()
      setUsers(result.list || [])
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async (username: string, password: string) => {
    try {
      const result = await lumi.entities.users.list({ 
        filter: { username, password } 
      })
      
      const success = result.list && result.list.length > 0
      setTestResults(prev => ({ ...prev, [username]: success }))
      
      if (success) {
        toast.success(`✅ Login OK para ${username}`)
      } else {
        toast.error(`❌ Login falhou para ${username}`)
      }
      
      return success
    } catch (error) {
      console.error("Erro no teste:", error)
      setTestResults(prev => ({ ...prev, [username]: false }))
      toast.error(`❌ Erro ao testar ${username}`)
      return false
    }
  }

  const criarUsuarioVitor = async () => {
    try {
      // Primeiro, verificar se já existe
      const existing = await lumi.entities.users.list({ 
        filter: { username: "vitor.lidorio" } 
      })
      
      // Se existir, deletar
      if (existing.list && existing.list.length > 0) {
        for (const user of existing.list) {
          if (user._id) {
            await lumi.entities.users.delete(user._id)
          }
        }
        toast.success("Usuário existente removido")
      }
      
      // Criar novo usuário
      const newUser = await lumi.entities.users.create({
        username: "vitor.lidorio",
        password: "vRL@030212",
        userName: "Vitor Lidorio",
        userRole: "ADMIN",
        ativo: true,
        createdTime: new Date().toISOString()
      })
      
      toast.success("✅ Usuário vitor.lidorio criado com sucesso!")
      await loadUsers()
      
      // Testar login automaticamente
      setTimeout(() => {
        testLogin("vitor.lidorio", "vRL@030212")
      }, 500)
      
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      toast.error("Erro ao criar usuário")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <AlertCircle className="text-yellow-400" size={24} />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Página de Diagnóstico - Apenas para Testes
            </h3>
            <p className="mt-2 text-sm text-yellow-700">
              Esta página mostra todos os usuários cadastrados e suas senhas (em texto plano) 
              para diagnóstico. Use apenas para resolver problemas de login.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Diagnóstico de Usuários</h1>
        <div className="flex gap-3">
          <button
            onClick={criarUsuarioVitor}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Criar/Recriar vitor.lidorio
          </button>
          <button
            onClick={loadUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Atualizar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Senha (Plano)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome Completo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teste Login
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-50">
                  {user.password || "(vazio)"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.userRole === "ADMIN" 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {user.userRole}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.ativo 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {user.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => testLogin(user.username, user.password)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                  >
                    {testResults[user.username] === true ? (
                      <><CheckCircle size={16} className="text-green-600" /> OK</>
                    ) : testResults[user.username] === false ? (
                      <><AlertCircle size={16} className="text-red-600" /> Falhou</>
                    ) : (
                      "Testar"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <AlertCircle className="mx-auto text-gray-400" size={48} />
          <p className="mt-4 text-gray-600">Nenhum usuário encontrado no banco de dados</p>
          <button
            onClick={criarUsuarioVitor}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Usuário Inicial
          </button>
        </div>
      )}
    </div>
  )
}

export default DiagnosticoUsuarios
