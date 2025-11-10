
import React from 'react'
import { useClassroomData } from '../hooks/useClassroomData'
import {MapPin, BookOpen, Users, Calendar, TrendingUp, BarChart3} from 'lucide-react'

const Dashboard: React.FC = () => {
  const { salas, disciplinas, turmas, loading } = useClassroomData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const salasAtivas = salas.filter(s => s.ativa).length
  const disciplinasAtivas = disciplinas.filter(d => d.ativa).length
  const turmasAtivas = turmas.filter(t => t.ativa).length
  const totalVagas = turmas.reduce((acc, t) => acc + (t.vagas_total || 0), 0)
  const vagasOcupadas = turmas.reduce((acc, t) => acc + (t.vagas_ocupadas || 0), 0)
  const taxaOcupacao = totalVagas > 0 ? Math.round((vagasOcupadas / totalVagas) * 100) : 0

  const stats = [
    {
      name: 'Salas Ativas',
      value: salasAtivas,
      total: salas.length,
      icon: MapPin,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      name: 'Disciplinas Ativas',
      value: disciplinasAtivas,
      total: disciplinas.length,
      icon: BookOpen,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      name: 'Turmas Ativas',
      value: turmasAtivas,
      total: turmas.length,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      name: 'Taxa de Ocupação',
      value: `${taxaOcupacao}%`,
      total: `${vagasOcupadas}/${totalVagas}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ]

  // Dados para gráfico simples de ocupação por tipo de sala
  const ocupacaoPorTipo = salas.reduce((acc, sala) => {
    const turmasDaSala = turmas.filter(t => t.sala_id === sala.numero && t.ativa)
    if (!acc[sala.tipo]) {
      acc[sala.tipo] = { total: 0, ocupadas: 0 }
    }
    acc[sala.tipo].total += 1
    acc[sala.tipo].ocupadas += turmasDaSala.length > 0 ? 1 : 0
    return acc
  }, {} as Record<string, { total: number; ocupadas: number }>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Visão geral do sistema de gerenciamento acadêmico
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className={`${stat.bgColor} rounded-xl p-6 border border-gray-200`}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                    <p className="ml-2 text-sm text-gray-500">
                      de {stat.total}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ocupação por Tipo de Sala */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Ocupação por Tipo de Sala
        </h2>
        <div className="space-y-4">
          {Object.entries(ocupacaoPorTipo).map(([tipo, dados]) => {
            const porcentagem = dados.total > 0 ? Math.round((dados.ocupadas / dados.total) * 100) : 0
            return (
              <div key={tipo} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-32">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {tipo.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${porcentagem}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{porcentagem}%</p>
                  <p className="text-xs text-gray-500">
                    {dados.ocupadas}/{dados.total}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Gráfico de Disciplinas por Departamento */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">
            Disciplinas por Departamento
          </h2>
        </div>
        <div className="space-y-4">
          {Object.entries(
            disciplinas.reduce((acc, disc) => {
              if (disc.ativa) {
                acc[disc.departamento] = (acc[disc.departamento] || 0) + 1
              }
              return acc
            }, {} as Record<string, number>)
          )
            .sort((a, b) => b[1] - a[1])
            .map(([departamento, quantidade]) => {
              const maxQuantidade = Math.max(...Object.values(
                disciplinas.reduce((acc, disc) => {
                  if (disc.ativa) {
                    acc[disc.departamento] = (acc[disc.departamento] || 0) + 1
                  }
                  return acc
                }, {} as Record<string, number>)
              ))
              const porcentagem = (quantidade / maxQuantidade) * 100
              return (
                <div key={departamento} className="flex items-center">
                  <div className="w-48 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {departamento}
                    </p>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${porcentagem}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right w-16">
                    <p className="text-sm font-bold text-gray-900">{quantidade}</p>
                    <p className="text-xs text-gray-500">disc.</p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Resumo de Turmas por Período */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Turmas por Semestre
          </h2>
          <div className="space-y-3">
            {[1, 2].map(semestre => {
              const turmasSemestre = turmas.filter(t => t.semestre === semestre && t.ativa)
              return (
                <div key={semestre} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{semestre}º Semestre</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {turmasSemestre.length}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Salas Mais Utilizadas
          </h2>
          <div className="space-y-3">
            {salas
              .map(sala => ({
                ...sala,
                turmasCount: turmas.filter(t => t.sala_id === sala.numero && t.ativa).length
              }))
              .sort((a, b) => b.turmasCount - a.turmasCount)
              .slice(0, 3)
              .map(sala => (
                <div key={sala._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{sala.nome}</span>
                    <p className="text-sm text-gray-500">Sala {sala.numero}</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {sala.turmasCount} turmas
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
