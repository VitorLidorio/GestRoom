import React, { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { lumi } from "../lib/lumi"
import {User, Lock, Save} from 'lucide-react'
import toast from "react-hot-toast"

const Profile: React.FC = () => {
  const { user, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const userName = formData.get("userName") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    try {
      setIsSaving(true)
      const updateData: any = { userName }

      if (newPassword) {
        updateData.password = newPassword
      }

      if (user?._id) {
        await lumi.entities.users.update(user._id, updateData)
        toast.success("Dados atualizados com sucesso!")
        
        // Atualizar localStorage
        const updatedUser = { ...user, userName }
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
        
        // Se alterou senha, fazer logout
        if (newPassword) {
          toast.success("Senha alterada! Por favor, faça login novamente.")
          setTimeout(() => {
            signOut()
          }, 2000)
        } else {
          setIsEditing(false)
          window.location.reload()
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error)
      toast.error("Erro ao atualizar dados")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Gerencie suas informações pessoais
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {!isEditing ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <User className="text-blue-600" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.userName}</h2>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <p className="text-base text-gray-900">{user.userName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário
                </label>
                <p className="text-base text-gray-900">@{user.username}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    user.userRole === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.userRole === "ADMIN" ? "Administrador" : "Usuário"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Editar Perfil
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                name="userName"
                type="text"
                required
                defaultValue={user.userName}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">O nome de usuário não pode ser alterado</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={20} />
                Alterar Senha (Opcional)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <input
                    name="newPassword"
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite a nova senha (deixe em branco para manter)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirme a nova senha"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
