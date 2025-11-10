
import React, { useState } from 'react'
import { useClassroomData } from '../hooks/useClassroomData'
import {Plus, Edit, Trash2, MapPin, Users, Wifi, Monitor, Wind, Volume2} from 'lucide-react'

interface Sala {
  _id: string
  numero: string
  nome: string
  capacidade: number
  tipo: string
  localizacao: {
    bloco: string
    andar: string
    descricao?: string
  }
  recursos?: string[]
  ativa: boolean
  observacoes?: string
}

const Salas: React.FC = () => {
  const { salas, loading, createSala, updateSala, deleteSala } = useClassroomData()
  const [showModal, setShowModal] = useState(false)
  const [editingSala, setEditingSala] = useState<Sala | null>(null)

  const tiposSala = [
    { value: 'laboratorio', label: 'Laboratório' },
    { value: 'anfiteatro', label: 'Anfiteatro' },
    { value: 'sala_comum', label: 'Sala Comum' },
    { value: 'auditorio', label: 'Auditório' },
    { value: 'biblioteca', label: 'Biblioteca' }
  ]

  const recursosDisponiveis = [
    'computadores', 'projetor', 'ar_condicionado', 'quadro_digital',
    'sistema_som', 'microfone', 'wifi', 'quadro_branco', 'tomadas'
  ]

  const getRecursoIcon = (recurso: string) => {
    const icons: Record<string, any> = {
      'computadores': Monitor,
      'projetor': Monitor,
      'ar_condicionado': Wind,
      'sistema_som': Volume2,
      'microfone': Volume2,
      'wifi': Wifi,
      'quadro_digital': Monitor,
      'quadro_branco': Monitor,
      'tomadas': Monitor
    }
    return icons[recurso] || Monitor
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const recursos = recursosDisponiveis.filter(recurso => 
      formData.get(`recurso_${recurso}`) === 'on'
    )

    const salaData = {
      numero: formData.get('numero') as string,
      nome: formData.get('nome') as string,
      capacidade: Number(formData.get('capacidade')),
      tipo: formData.get('tipo') as string,
      localizacao: {
        bloco: formData.get('bloco') as string,
        andar: formData.get('andar') as string,
        descricao: formData.get('descricao_localizacao') as string
      },
      recursos,
      ativa: formData.get('ativa') === 'on',
      observacoes: formData.get('observacoes') as string
    }

    try {
      if (editingSala) {
        await updateSala(editingSala._id, salaData)
      } else {
        await createSala(salaData)
      }
      setShowModal(false)
      setEditingSala(null)
    } catch (error) {
      console.error('Erro ao salvar sala:', error)
    }
  }

  const handleEdit = (sala: Sala) => {
    setEditingSala(sala)
    setShowModal(true)
  }

  const handleDelete = async (salaId: string, salaName: string) => {
    if (confirm(`Tem certeza que deseja excluir a sala "${salaName}"?`)) {
      await deleteSala(salaId)
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
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Salas</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as salas de aula e laboratórios da instituição
          </p>
        </div>
        <button
          onClick={() => { setEditingSala(null); setShowModal(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Sala
        </button>
      </div>

      {/* Lista de Salas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salas.map(sala => (
          <div key={sala._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{sala.nome}</h3>
                <p className="text-sm text-gray-500">Sala {sala.numero}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(sala)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(sala._id, sala.nome)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2" />
                Capacidade: {sala.capacidade} pessoas
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-2" />
                {sala.localizacao.bloco} - {sala.localizacao.andar}
              </div>

              <div className="flex items-center text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  sala.ativa 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {sala.ativa ? 'Ativa' : 'Inativa'}
                </span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                  {sala.tipo.replace('_', ' ')}
                </span>
              </div>

              {sala.recursos && sala.recursos.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Recursos:</p>
                  <div className="flex flex-wrap gap-1">
                    {sala.recursos.slice(0, 3).map(recurso => {
                      const Icon = getRecursoIcon(recurso)
                      return (
                        <div key={recurso} className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                          <Icon size={12} className="mr-1" />
                          {recurso.replace('_', ' ')}
                        </div>
                      )
                    })}
                    {sala.recursos.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{sala.recursos.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              )}

              {sala.observacoes && (
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {sala.observacoes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criar/Editar Sala */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingSala ? 'Editar Sala' : 'Nova Sala'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número da Sala
                    </label>
                    <input
                      name="numero"
                      type="text"
                      required
                      defaultValue={editingSala?.numero || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Sala
                    </label>
                    <input
                      name="nome"
                      type="text"
                      required
                      defaultValue={editingSala?.nome || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Laboratório de Informática I"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacidade
                    </label>
                    <input
                      name="capacidade"
                      type="number"
                      min="1"
                      required
                      defaultValue={editingSala?.capacidade || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo
                    </label>
                    <select
                      name="tipo"
                      required
                      defaultValue={editingSala?.tipo || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione o tipo</option>
                      {tiposSala.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bloco
                    </label>
                    <input
                      name="bloco"
                      type="text"
                      required
                      defaultValue={editingSala?.localizacao.bloco || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Andar
                    </label>
                    <input
                      name="andar"
                      type="text"
                      required
                      defaultValue={editingSala?.localizacao.andar || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 1º andar"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Localização
                  </label>
                  <input
                    name="descricao_localizacao"
                    type="text"
                    defaultValue={editingSala?.localizacao.descricao || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Próximo à entrada principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Recursos Disponíveis
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {recursosDisponiveis.map(recurso => (
                      <label key={recurso} className="flex items-center">
                        <input
                          type="checkbox"
                          name={`recurso_${recurso}`}
                          defaultChecked={editingSala?.recursos?.includes(recurso) || false}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm capitalize">
                          {recurso.replace('_', ' ')}
                        </span>
                      </label>
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
                    defaultValue={editingSala?.observacoes || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Informações adicionais sobre a sala..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="ativa"
                    defaultChecked={editingSala?.ativa ?? true}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Sala ativa
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingSala ? 'Atualizar Sala' : 'Criar Sala'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingSala(null) }}
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

export default Salas
