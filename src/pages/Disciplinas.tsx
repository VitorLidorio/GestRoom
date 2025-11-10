
import React, { useState } from "react"
import { useClassroomData } from "../hooks/useClassroomData"
import {Plus, Edit, Trash2, BookOpen, Clock, Award} from 'lucide-react'

interface Disciplina {
  _id: string
  codigo: string
  nome: string
  carga_horaria: number
  departamento: string
  ementa?: string
  pre_requisitos?: string[]
  creditos: number
  ativa: boolean
}

const Disciplinas: React.FC = () => {
  const { disciplinas, loading, createDisciplina, updateDisciplina, deleteDisciplina } = useClassroomData()
  const [showModal, setShowModal] = useState(false)
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const preRequisitos = (formData.get("pre_requisitos") as string)
      .split(",")
      .map(p => p.trim())
      .filter(p => p.length > 0)

    const disciplinaData = {
      codigo: formData.get("codigo") as string,
      nome: formData.get("nome") as string,
      carga_horaria: Number(formData.get("carga_horaria")),
      departamento: formData.get("departamento") as string,
      ementa: formData.get("ementa") as string,
      pre_requisitos: preRequisitos,
      creditos: Number(formData.get("creditos")),
      ativa: formData.get("ativa") === "on"
    }

    try {
      if (editingDisciplina) {
        await updateDisciplina(editingDisciplina._id, disciplinaData)
      } else {
        await createDisciplina(disciplinaData)
      }
      setShowModal(false)
      setEditingDisciplina(null)
    } catch (error) {
      console.error("Erro ao salvar disciplina:", error)
    }
  }

  const handleEdit = (disciplina: Disciplina) => {
    setEditingDisciplina(disciplina)
    setShowModal(true)
  }

  const handleDelete = async (disciplinaId: string, disciplinaNome: string) => {
    if (confirm(`Tem certeza que deseja excluir a disciplina "${disciplinaNome}"?`)) {
      await deleteDisciplina(disciplinaId)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Disciplinas</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as disciplinas oferecidas pela instituição
          </p>
        </div>
        <button
          onClick={() => { setEditingDisciplina(null); setShowModal(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Disciplina
        </button>
      </div>

      {/* Lista de Disciplinas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {disciplinas.map(disciplina => (
          <div key={disciplina._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{disciplina.nome}</h3>
                <p className="text-sm text-gray-500">{disciplina.codigo}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(disciplina)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(disciplina._id, disciplina.nome)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen size={16} className="mr-2" />
                {disciplina.departamento}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-2" />
                {disciplina.carga_horaria}h de carga horária
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Award size={16} className="mr-2" />
                {disciplina.creditos} créditos
              </div>

              <div className="flex items-center text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  disciplina.ativa 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {disciplina.ativa ? "Ativa" : "Inativa"}
                </span>
              </div>

              {disciplina.pre_requisitos && disciplina.pre_requisitos.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Pré-requisitos:</p>
                  <div className="flex flex-wrap gap-1">
                    {disciplina.pre_requisitos.map(prereq => (
                      <span key={prereq} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {disciplina.ementa && (
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded line-clamp-3">
                  {disciplina.ementa}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criar/Editar Disciplina */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingDisciplina ? "Editar Disciplina" : "Nova Disciplina"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código da Disciplina
                    </label>
                    <input
                      name="codigo"
                      type="text"
                      required
                      defaultValue={editingDisciplina?.codigo || ""}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: INF001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <input
                      name="departamento"
                      type="text"
                      required
                      defaultValue={editingDisciplina?.departamento || ""}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Ciência da Computação"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Disciplina
                  </label>
                  <input
                    name="nome"
                    type="text"
                    required
                    defaultValue={editingDisciplina?.nome || ""}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Algoritmos e Estruturas de Dados"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carga Horária (horas)
                    </label>
                    <input
                      name="carga_horaria"
                      type="number"
                      min="1"
                      required
                      defaultValue={editingDisciplina?.carga_horaria || ""}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Créditos
                    </label>
                    <input
                      name="creditos"
                      type="number"
                      min="1"
                      required
                      defaultValue={editingDisciplina?.creditos || ""}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 4"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pré-requisitos (separados por vírgula)
                  </label>
                  <input
                    name="pre_requisitos"
                    type="text"
                    defaultValue={editingDisciplina?.pre_requisitos?.join(", ") || ""}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: MAT001, FIS001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ementa
                  </label>
                  <textarea
                    name="ementa"
                    rows={4}
                    defaultValue={editingDisciplina?.ementa || ""}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descrição resumida do conteúdo da disciplina..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="ativa"
                    defaultChecked={editingDisciplina?.ativa ?? true}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Disciplina ativa
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingDisciplina ? "Atualizar Disciplina" : "Criar Disciplina"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingDisciplina(null) }}
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

export default Disciplinas
