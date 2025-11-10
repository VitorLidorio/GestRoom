
import React, { useState } from "react"
import { useClassroomData } from "../hooks/useClassroomData"
import {Plus, Edit, Trash2, Users, Calendar, MapPin, BookOpen, User} from 'lucide-react'

interface Horario {
  dia_semana: string
  hora_inicio: string
  hora_fim: string
}

interface Turma {
  _id: string
  codigo_turma: string
  disciplina_id: string
  professor: string
  semestre: number
  ano: number
  horarios: Horario[]
  sala_id: string
  vagas_total: number
  vagas_ocupadas: number
  ativa: boolean
  observacoes?: string
}

const Turmas: React.FC = () => {
  const { turmas, disciplinas, salas, loading, createTurma, updateTurma, deleteTurma } = useClassroomData()
  const [showModal, setShowModal] = useState(false)
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null)
  const [horarios, setHorarios] = useState<Horario[]>([])

  const diasSemana = [
    { value: "segunda", label: "Segunda-feira" },
    { value: "terca", label: "Terça-feira" },
    { value: "quarta", label: "Quarta-feira" },
    { value: "quinta", label: "Quinta-feira" },
    { value: "sexta", label: "Sexta-feira" },
    { value: "sabado", label: "Sábado" }
  ]

  const getDisciplinaNome = (disciplinaId: string) => {
    const disciplina = disciplinas.find(d => d.codigo === disciplinaId)
    return disciplina ? disciplina.nome : disciplinaId
  }

  const getSalaNome = (salaId: string) => {
    const sala = salas.find(s => s.numero === salaId)
    return sala ? sala.nome : `Sala ${salaId}`
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const turmaData = {
      codigo_turma: formData.get("codigo_turma") as string,
      disciplina_id: formData.get("disciplina_id") as string,
      professor: formData.get("professor") as string,
      semestre: Number(formData.get("semestre")),
      ano: Number(formData.get("ano")),
      horarios: horarios,
      sala_id: formData.get("sala_id") as string,
      vagas_total: Number(formData.get("vagas_total")),
      vagas_ocupadas: Number(formData.get("vagas_ocupadas")),
      ativa: formData.get("ativa") === "on",
      observacoes: formData.get("observacoes") as string
    }

    try {
      if (editingTurma) {
        await updateTurma(editingTurma._id, turmaData)
      } else {
        await createTurma(turmaData)
      }
      setShowModal(false)
      setEditingTurma(null)
      setHorarios([])
    } catch (error) {
      console.error("Erro ao salvar turma:", error)
    }
  }

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma)
    setHorarios(turma.horarios || [])
    setShowModal(true)
  }

  const handleDelete = async (turmaId: string, turmaCodigo: string) => {
    if (confirm(`Tem certeza que deseja excluir a turma "${turmaCodigo}"?`)) {
      await deleteTurma(turmaId)
    }
  }

  const adicionarHorario = () => {
    setHorarios([...horarios, { dia_semana: "segunda", hora_inicio: "08:00", hora_fim: "10:00" }])
  }

  const removerHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index))
  }

  const atualizarHorario = (index: number, campo: keyof Horario, valor: string) => {
    const novosHorarios = [...horarios]
    novosHorarios[index] = { ...novosHorarios[index], [campo]: valor }
    setHorarios(novosHorarios)
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
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Turmas</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as turmas oferecidas em cada semestre
          </p>
        </div>
        <button
          onClick={() => { 
            setEditingTurma(null)
            setHorarios([{ dia_semana: "segunda", hora_inicio: "08:00", hora_fim: "10:00" }])
            setShowModal(true) 
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Turma
        </button>
      </div>

      {/* Lista de Turmas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {turmas.map(turma => (
          <div key={turma._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{turma.codigo_turma}</h3>
                <p className="text-sm text-gray-500">{getDisciplinaNome(turma.disciplina_id)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(turma)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(turma._id, turma.codigo_turma)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <User size={16} className="mr-2" />
                {turma.professor}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-2" />
                {getSalaNome(turma.sala_id)}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2" />
                {turma.semestre}º Semestre / {turma.ano}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2" />
                {turma.vagas_ocupadas}/{turma.vagas_total} vagas ocupadas
              </div>

              <div className="flex items-center text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  turma.ativa 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {turma.ativa ? "Ativa" : "Inativa"}
                </span>
              </div>

              {turma.horarios && turma.horarios.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Horários:</p>
                  <div className="space-y-1">
                    {turma.horarios.map((horario, idx) => (
                      <div key={idx} className="text-xs bg-blue-50 px-3 py-2 rounded flex items-center">
                        <Calendar size={12} className="mr-2 text-blue-600" />
                        <span className="capitalize font-medium">{horario.dia_semana}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span>{horario.hora_inicio} - {horario.hora_fim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {turma.observacoes && (
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {turma.observacoes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criar/Editar Turma */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingTurma ? "Editar Turma" : "Nova Turma"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código da Turma
                    </label>
                    <input
                      name="codigo_turma"
                      type="text"
                      required
                      defaultValue={editingTurma?.codigo_turma || ""}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: INF001-2025-1-A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disciplina
                    </label>
                    <select
                      name="disciplina_id"
                      required
                      defaultValue={editingTurma?.disciplina_id || ""}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione a disciplina</option>
                      {disciplinas.filter(d => d.ativa).map(disciplina => (
                        <option key={disciplina._id} value={disciplina.codigo}>
                          {disciplina.codigo} - {disciplina.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professor
                    </label>
                    <input
                      name="professor"
                      type="text"
                      required
                      defaultValue={editingTurma?.professor || ""}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Dr. João Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sala
                    </label>
                    <select
                      name="sala_id"
                      required
                      defaultValue={editingTurma?.sala_id || ""}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione a sala</option>
                      {salas.filter(s => s.ativa).map(sala => (
                        <option key={sala._id} value={sala.numero}>
                          {sala.numero} - {sala.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semestre
                    </label>
                    <select
                      name="semestre"
                      required
                      defaultValue={editingTurma?.semestre || 1}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="1">1º Semestre</option>
                      <option value="2">2º Semestre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ano
                    </label>
                    <input
                      name="ano"
                      type="number"
                      min="2020"
                      max="2030"
                      required
                      defaultValue={editingTurma?.ano || new Date().getFullYear()}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vagas Totais
                    </label>
                    <input
                      name="vagas_total"
                      type="number"
                      min="1"
                      required
                      defaultValue={editingTurma?.vagas_total || ""}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vagas Ocupadas
                    </label>
                    <input
                      name="vagas_ocupadas"
                      type="number"
                      min="0"
                      required
                      defaultValue={editingTurma?.vagas_ocupadas || 0}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 25"
                    />
                  </div>
                </div>

                {/* Horários */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Horários
                    </label>
                    <button
                      type="button"
                      onClick={adicionarHorario}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      + Adicionar Horário
                    </button>
                  </div>
                  <div className="space-y-3">
                    {horarios.map((horario, index) => (
                      <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg">
                        <select
                          value={horario.dia_semana}
                          onChange={(e) => atualizarHorario(index, "dia_semana", e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {diasSemana.map(dia => (
                            <option key={dia.value} value={dia.value}>
                              {dia.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="time"
                          value={horario.hora_inicio}
                          onChange={(e) => atualizarHorario(index, "hora_inicio", e.target.value)}
                          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-500">até</span>
                        <input
                          type="time"
                          value={horario.hora_fim}
                          onChange={(e) => atualizarHorario(index, "hora_fim", e.target.value)}
                          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removerHorario(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="observacoes"
                    rows={3}
                    defaultValue={editingTurma?.observacoes || ""}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Informações adicionais sobre a turma..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="ativa"
                    defaultChecked={editingTurma?.ativa ?? true}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Turma ativa
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingTurma ? "Atualizar Turma" : "Criar Turma"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { 
                      setShowModal(false)
                      setEditingTurma(null)
                      setHorarios([])
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

export default Turmas
