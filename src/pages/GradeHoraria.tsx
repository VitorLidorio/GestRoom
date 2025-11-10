
import React, { useMemo } from 'react'
import { useClassroomData } from '../hooks/useClassroomData'
import {Clock, MapPin, User, BookOpen} from 'lucide-react'

const GradeHoraria: React.FC = () => {
  const { turmas, salas, disciplinas, loading } = useClassroomData()

  const diasSemana = [
    'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'
  ]

  const diasSemanaLabels = {
    'segunda': 'Segunda-feira',
    'terca': 'Terça-feira', 
    'quarta': 'Quarta-feira',
    'quinta': 'Quinta-feira',
    'sexta': 'Sexta-feira',
    'sabado': 'Sábado'
  }

  // Organizar turmas por horário
  const gradeOrganizada = useMemo(() => {
    const grade: Record<string, Array<{
      turma: any
      disciplina: any
      sala: any
      horario: any
    }>> = {}

    diasSemana.forEach(dia => {
      grade[dia] = []
    })

    turmas.filter(t => t.ativa).forEach(turma => {
      const disciplina = disciplinas.find(d => d._id === turma.disciplina_id || d.codigo === turma.disciplina_id)
      const sala = salas.find(s => s._id === turma.sala_id || s.numero === turma.sala_id)

      turma.horarios?.forEach(horario => {
        if (grade[horario.dia_semana]) {
          grade[horario.dia_semana].push({
            turma,
            disciplina,
            sala,
            horario
          })
        }
      })
    })

    // Ordenar por horário
    Object.keys(grade).forEach(dia => {
      grade[dia].sort((a, b) => {
        const timeA = a.horario.hora_inicio.replace(':', '')
        const timeB = b.horario.hora_inicio.replace(':', '')
        return timeA.localeCompare(timeB)
      })
    })

    return grade
  }, [turmas, disciplinas, salas])

  // Extrair todos os horários únicos para criar a grade
  const horariosUnicos = useMemo(() => {
    const horarios = new Set<string>()
    
    Object.values(gradeOrganizada).flat().forEach(item => {
      horarios.add(`${item.horario.hora_inicio}-${item.horario.hora_fim}`)
    })
    
    return Array.from(horarios).sort()
  }, [gradeOrganizada])

  const getCorPorTipo = (tipo: string) => {
    const cores = {
      'laboratorio': 'bg-blue-100 border-blue-300 text-blue-800',
      'anfiteatro': 'bg-purple-100 border-purple-300 text-purple-800',
      'sala_comum': 'bg-green-100 border-green-300 text-green-800',
      'auditorio': 'bg-red-100 border-red-300 text-red-800',
      'biblioteca': 'bg-yellow-100 border-yellow-300 text-yellow-800'
    }
    return cores[tipo as keyof typeof cores] || 'bg-gray-100 border-gray-300 text-gray-800'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Grade Horária</h1>
        <p className="mt-2 text-gray-600">
          Visualização semanal das turmas e horários
        </p>
      </div>

      {/* Legenda */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Legenda - Tipos de Sala:</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { tipo: 'laboratorio', label: 'Laboratório' },
            { tipo: 'anfiteatro', label: 'Anfiteatro' },
            { tipo: 'sala_comum', label: 'Sala Comum' },
            { tipo: 'auditorio', label: 'Auditório' },
            { tipo: 'biblioteca', label: 'Biblioteca' }
          ].map(({ tipo, label }) => (
            <div key={tipo} className={`px-3 py-1 rounded-lg border ${getCorPorTipo(tipo)} text-sm font-medium`}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Grade Horária por Dia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {diasSemana.map(dia => (
          <div key={dia} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {diasSemanaLabels[dia as keyof typeof diasSemanaLabels]}
              </h2>
              <p className="text-sm text-gray-500">
                {gradeOrganizada[dia].length} aula(s) agendada(s)
              </p>
            </div>
            
            <div className="p-4 space-y-3">
              {gradeOrganizada[dia].length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma aula agendada
                </p>
              ) : (
                gradeOrganizada[dia].map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getCorPorTipo(item.sala?.tipo || 'sala_comum')}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm font-bold">
                          <Clock size={14} className="mr-1" />
                          {item.horario.hora_inicio} - {item.horario.hora_fim}
                        </div>
                        <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                          {item.turma.codigo_turma}
                        </span>
                      </div>
                      
                      <div className="flex items-start">
                        <BookOpen size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm leading-tight">
                            {item.disciplina?.nome || 'Disciplina não encontrada'}
                          </p>
                          <p className="text-xs opacity-75">
                            {item.disciplina?.codigo || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs">
                        <User size={12} className="mr-1" />
                        {item.turma.professor}
                      </div>
                      
                      <div className="flex items-center text-xs">
                        <MapPin size={12} className="mr-1" />
                        {item.sala ? (
                          <>
                            Sala {item.sala.numero} - {item.sala.nome}
                            <span className="ml-2 text-xs opacity-75">
                              ({item.sala.localizacao.bloco} - {item.sala.localizacao.andar})
                            </span>
                          </>
                        ) : (
                          'Sala não encontrada'
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span>
                          Vagas: {item.turma.vagas_ocupadas || 0}/{item.turma.vagas_total || 0}
                        </span>
                        <span className="opacity-75">
                          {item.turma.semestre}º sem {item.turma.ano}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumo de Ocupação */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Resumo de Ocupação Semanal
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {diasSemana.map(dia => {
            const totalAulas = gradeOrganizada[dia].length
            const totalHoras = gradeOrganizada[dia].reduce((acc, item) => {
              const inicio = parseInt(item.horario.hora_inicio.replace(':', ''))
              const fim = parseInt(item.horario.hora_fim.replace(':', ''))
              return acc + (fim - inicio) / 100 // Aproximação simples
            }, 0)
            
            return (
              <div key={dia} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">
                  {diasSemanaLabels[dia as keyof typeof diasSemanaLabels].split('-')[0]}
                </p>
                <p className="text-2xl font-bold text-blue-600">{totalAulas}</p>
                <p className="text-xs text-gray-500">
                  {totalHoras.toFixed(0)}h aprox.
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GradeHoraria
