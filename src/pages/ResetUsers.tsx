import React, { useState } from "react"
import { lumi } from "../lib/lumi"
import {AlertTriangle, Trash2, UserPlus, CheckCircle} from 'lucide-react'
import toast from "react-hot-toast"

const ResetUsers: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<string>("")
  const [completed, setCompleted] = useState(false)

  const resetAllUsers = async () => {
    const confirmMessage = "⚠️ ATENÇÃO: Esta ação irá DELETAR TODOS os usuários e criar apenas o admin vitor.lidorio. Deseja continuar?"
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      setCompleted(false)
      setStep("🔍 Buscando todos os usuários no banco de dados...")

      // 1. Buscar todos os usuários
      const result = await lumi.entities.users.list()
      const allUsers = result.list || []
      
      console.log("Usuários encontrados:", allUsers)
      setStep(`📋 Encontrados ${allUsers.length} usuários. Iniciando deleção...`)
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 2. Deletar todos os usuários um por um
      if (allUsers.length > 0) {
        for (let i = 0; i < allUsers.length; i++) {
          const user = allUsers[i]
          if (user._id) {
            setStep(`🗑️ Deletando usuário ${i + 1}/${allUsers.length}: ${user.username || user.userName}...`)
            await lumi.entities.users.delete(user._id)
            console.log(`Usuário deletado:`, user)
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }
      }

      setStep("✅ Todos os usuários deletados com sucesso!")
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStep("👤 Criando novo usuário admin vitor.lidorio...")

      // 3. Criar o usuário admin limpo
      const adminUser = {
        username: "vitor.lidorio",
        password: "vRL@030212",
        userName: "Vitor Lidorio",
        userRole: "ADMIN" as const,
        ativo: true,
        createdTime: new Date().toISOString()
      }

      const createdUser = await lumi.entities.users.create(adminUser)
      console.log("Admin criado:", createdUser)
      
      setStep("✅ Usuário admin criado com sucesso!")
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCompleted(true)
      setStep("🎉 Reset completo! Redirecionando para o login...")
      toast.success("Todos os usuários foram resetados! Apenas o admin vitor.lidorio existe agora.")
      
      setTimeout(() => {
        window.location.href = "/"
      }, 2500)

    } catch (error) {
      console.error("Erro ao resetar usuários:", error)
      toast.error(`Erro ao resetar usuários: ${error}`)
      setStep(`❌ Erro durante o reset: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="text-red-600" size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Reset Total de Usuários</h1>
            <p className="text-gray-600 text-lg">Ação destrutiva - Use com extremo cuidado</p>
          </div>
        </div>

        <div className="bg-red-50 border-l-4 border-red-600 p-5 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-red-900 mb-3 text-lg">⚠️ ATENÇÃO - Ação Irreversível</h3>
              <p className="text-red-800 mb-2">
                Esta ação irá <strong className="underline">DELETAR PERMANENTEMENTE</strong> todos os usuários cadastrados no sistema.
              </p>
              <p className="text-red-800 mb-2">
                Após a execução, apenas o usuário <strong>vitor.lidorio</strong> (ADMIN) existirá no banco de dados.
              </p>
              <p className="text-red-700 text-sm font-medium">
                ⚠️ Não há como desfazer esta operação!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <Trash2 className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">Passo 1: Deletar Todos</h4>
              <p className="text-gray-700">Remove todos os usuários existentes do banco de dados MongoDB</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <UserPlus className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">Passo 2: Criar Admin</h4>
              <p className="text-gray-700 mb-3">Cria o usuário administrador com credenciais limpas</p>
              <div className="p-3 bg-white rounded-lg border border-gray-300">
                <p className="font-mono text-sm text-gray-800">
                  <strong>👤 Usuário:</strong> vitor.lidorio<br />
                  <strong>🔒 Senha:</strong> vRL@030212<br />
                  <strong>⚡ Função:</strong> ADMIN<br />
                  <strong>✅ Status:</strong> Ativo
                </p>
              </div>
            </div>
          </div>
        </div>

        {step && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            completed 
              ? "bg-green-50 border-green-300" 
              : "bg-blue-50 border-blue-300"
          }`}>
            <div className="flex items-center gap-3">
              {completed && <CheckCircle className="text-green-600" size={24} />}
              <p className={`font-medium ${
                completed ? "text-green-800" : "text-blue-800"
              }`}>
                {step}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={resetAllUsers}
          disabled={loading}
          className="w-full bg-red-600 text-white py-4 px-6 rounded-xl hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Processando...
            </>
          ) : (
            <>
              <Trash2 size={24} />
              Resetar Todos os Usuários Agora
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-gray-600 hover:text-gray-900 underline font-medium"
          >
            ← Voltar para o login
          </a>
        </div>
      </div>
    </div>
  )
}

export default ResetUsers
