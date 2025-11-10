import React, { useState, useEffect } from "react"
import { lumi } from "../lib/lumi"
import {Plus, Edit, Trash2, UserCircle, Shield, CheckCircle, XCircle} from 'lucide-react'
import toast from "react-hot-toast"

interface User {
  _id?: string
  password: string
  userName: string
  userRole: "ADMIN" | "USER"
  ativo: boolean
  createdTime: string
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const password = formData.get("password") as string

    const userData: any = {
      userName: formData.get("userName") as string,
      userRole: formData.get("userRole") as "ADMIN" | "USER",
      ativo: formData.get("ativo") === "true",
      createdTime: editingUser?.createdTime || new Date().toISOString()
    }

    // Ao editar: só incluir senha se foi preenchida, senão manter a antiga
    if (editingUser) {
      // Modo edição: se senha foi preenchida, atualiza; senão, mantém a antiga
      if (password && password.trim() !== "") {
        userData.password = password
      } else {
        // Manter a senha antiga
        userData.password = editingUser.password
      }
    } else {
      // Modo criação: senha é obrigatória
      if (password && password.trim() !== "") {
        userData.password = password
      } else {
        toast.error("Senha é obrigatória para novos usuários")
        return
      }
    }

    try {
      if (editingUser?._id) {
        await lumi.entities.users.update(editingUser._id, userData)
        toast.success("Usuário atualizado com sucesso!")
      } else {
        await lumi.entities.users.create(userData)
        toast.success("Usuário criado com sucesso!")
      }
      await loadUsers()
      setShowModal(false)
      setEditingUser(null)
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      toast.error("Erro ao salvar usuário")
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleDelete = async (user: User) => {
    if (!user._id) return
    
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.userName}?`)) {
      try {
        await lumi.entities.users.delete(user._id)
        toast.success("Usuário excluído com sucesso!")
        await loadUsers()
      } catch (error) {
        console.error("Erro ao excluir usuário:", error)
        toast.error("Erro ao excluir usuário")
      }
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      if (user._id) {
        await lumi.entities.users.update(user._id, { ativo: !user.ativo })
        toast.success(`Usuário ${!user.ativo ? "ativado" : "desativado"} com sucesso!`)
        await loadUsers()
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error)
      toast.error("Erro ao alterar status do usuário")
    }
  }

  const handleNewUser = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Cadastre e gerencie os usuários do sistema
          </p>
        </div>
        <button
          onClick={handleNewUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      {/* Lista de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${user.ativo ? "bg-blue-100" : "bg-gray-100"}`}>
                  {user.userRole === "ADMIN" ? (
                    <Shield className={user.ativo ? "text-blue-600" : "text-gray-400"} size={24} />
                  ) : (
                    <UserCircle className={user.ativo ? "text-blue-600" : "text-gray-400"} size={24} />
                  )}
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold ${user.ativo ? "text-gray-900" : "text-gray-400"}`}>
                    {user.userName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">{user.userRole === "ADMIN" ? "Administrador" : "Usuário"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar usuário"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleToggleStatus(user)}
                  className={`transition-colors ${user.ativo ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600"}`}
                  title={user.ativo ? "Desativar usuário" : "Ativar usuário"}
                >
                  {user.ativo ? <CheckCircle size={18} /> : <XCircle size={18} />}
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Excluir usuário"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Função:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.userRole === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.userRole === "ADMIN" ? "Administrador" : "Usuário"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.ativo
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Criado em: {new Date(user.createdTime).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criar/Editar Usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    name="userName"
                    type="text"
                    required
                    defaultValue={editingUser?.userName || ""}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    name="password"
                    type="password"
                    required={!editingUser}
                    defaultValue=""
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={editingUser ? "Digite para alterar a senha" : "Digite a senha"}
                  />
                  {editingUser && <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a senha atual</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                  <select
                    name="userRole"
                    required
                    defaultValue={editingUser?.userRole || "USER"}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USER">Usuário</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="ativo"
                    required
                    defaultValue={editingUser?.ativo !== undefined ? (editingUser.ativo ? "true" : "false") : "true"}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingUser ? "Atualizar" : "Criar"} Usuário
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingUser(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
