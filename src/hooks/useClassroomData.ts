
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface Sala {
  _id: string
  userId: string
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

interface Disciplina {
  _id: string
  userId: string
  codigo: string
  nome: string
  carga_horaria: number
  departamento: string
  ementa?: string
  pre_requisitos?: string[]
  creditos: number
  ativa: boolean
}

interface Horario {
  dia_semana: string
  hora_inicio: string
  hora_fim: string
}

interface Turma {
  _id: string
  userId: string
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

export const useClassroomData = () => {
  const [salas, setSalas] = useState<Sala[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(false)

  // Buscar salas
  const fetchSalas = useCallback(async () => {
    try {
      const userId = lumi.auth.user?.userId
      if (!userId) return
      
      const response = await lumi.entities.salas.list({
        filter: { userId },
        sort: { numero: 1 }
      })
      setSalas(response.list || [])
    } catch (error) {
      console.error('Erro ao buscar salas:', error)
      toast.error('Erro ao carregar salas')
    }
  }, [])

  // Buscar disciplinas
  const fetchDisciplinas = useCallback(async () => {
    try {
      const userId = lumi.auth.user?.userId
      if (!userId) return
      
      const response = await lumi.entities.disciplinas.list({
        filter: { userId },
        sort: { codigo: 1 }
      })
      setDisciplinas(response.list || [])
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error)
      toast.error('Erro ao carregar disciplinas')
    }
  }, [])

  // Buscar turmas
  const fetchTurmas = useCallback(async () => {
    try {
      const userId = lumi.auth.user?.userId
      if (!userId) return
      
      const response = await lumi.entities.turmas.list({
        filter: { userId },
        sort: { codigo_turma: 1 }
      })
      setTurmas(response.list || [])
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
      toast.error('Erro ao carregar turmas')
    }
  }, [])

  // Carregar todos os dados
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchSalas(),
        fetchDisciplinas(),
        fetchTurmas()
      ])
    } finally {
      setLoading(false)
    }
  }, [fetchSalas, fetchDisciplinas, fetchTurmas])

  // CRUD para Salas
  const createSala = async (salaData: Omit<Sala, '_id' | 'userId'>) => {
    try {
      const userId = lumi.auth.user?.userId
      if (!userId) {
        toast.error('Usuário não autenticado')
        throw new Error('Usuário não autenticado')
      }
      
      const processedData = {
        ...salaData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const newSala = await lumi.entities.salas.create(processedData)
      setSalas(prev => [...prev, newSala].sort((a, b) => a.numero.localeCompare(b.numero)))
      toast.success('Sala criada com sucesso')
      return newSala
    } catch (error) {
      console.error('Erro ao criar sala:', error)
      toast.error('Erro ao criar sala')
      throw error
    }
  }

  const updateSala = async (salaId: string, updates: Partial<Sala>) => {
    try {
      const processedUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      const updatedSala = await lumi.entities.salas.update(salaId, processedUpdates)
      setSalas(prev => prev.map(s => s._id === salaId ? updatedSala : s))
      toast.success('Sala atualizada com sucesso')
      return updatedSala
    } catch (error) {
      console.error('Erro ao atualizar sala:', error)
      toast.error('Erro ao atualizar sala')
      throw error
    }
  }

  const deleteSala = async (salaId: string) => {
    try {
      await lumi.entities.salas.delete(salaId)
      setSalas(prev => prev.filter(s => s._id !== salaId))
      toast.success('Sala excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir sala:', error)
      toast.error('Erro ao excluir sala')
      throw error
    }
  }

  // CRUD para Disciplinas
  const createDisciplina = async (disciplinaData: Omit<Disciplina, '_id' | 'userId'>) => {
    try {
      const userId = lumi.auth.user?.userId
      if (!userId) {
        toast.error('Usuário não autenticado')
        throw new Error('Usuário não autenticado')
      }
      
      const processedData = {
        ...disciplinaData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const newDisciplina = await lumi.entities.disciplinas.create(processedData)
      setDisciplinas(prev => [...prev, newDisciplina].sort((a, b) => a.codigo.localeCompare(b.codigo)))
      toast.success('Disciplina criada com sucesso')
      return newDisciplina
    } catch (error) {
      console.error('Erro ao criar disciplina:', error)
      toast.error('Erro ao criar disciplina')
      throw error
    }
  }

  const updateDisciplina = async (disciplinaId: string, updates: Partial<Disciplina>) => {
    try {
      const processedUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      const updatedDisciplina = await lumi.entities.disciplinas.update(disciplinaId, processedUpdates)
      setDisciplinas(prev => prev.map(d => d._id === disciplinaId ? updatedDisciplina : d))
      toast.success('Disciplina atualizada com sucesso')
      return updatedDisciplina
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error)
      toast.error('Erro ao atualizar disciplina')
      throw error
    }
  }

  const deleteDisciplina = async (disciplinaId: string) => {
    try {
      await lumi.entities.disciplinas.delete(disciplinaId)
      setDisciplinas(prev => prev.filter(d => d._id !== disciplinaId))
      toast.success('Disciplina excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error)
      toast.error('Erro ao excluir disciplina')
      throw error
    }
  }

  // CRUD para Turmas
  const createTurma = async (turmaData: Omit<Turma, '_id' | 'userId'>) => {
    try {
      const userId = lumi.auth.user?.userId
      if (!userId) {
        toast.error('Usuário não autenticado')
        throw new Error('Usuário não autenticado')
      }
      
      const processedData = {
        ...turmaData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const newTurma = await lumi.entities.turmas.create(processedData)
      setTurmas(prev => [...prev, newTurma].sort((a, b) => a.codigo_turma.localeCompare(b.codigo_turma)))
      toast.success('Turma criada com sucesso')
      return newTurma
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      toast.error('Erro ao criar turma')
      throw error
    }
  }

  const updateTurma = async (turmaId: string, updates: Partial<Turma>) => {
    try {
      const processedUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      const updatedTurma = await lumi.entities.turmas.update(turmaId, processedUpdates)
      setTurmas(prev => prev.map(t => t._id === turmaId ? updatedTurma : t))
      toast.success('Turma atualizada com sucesso')
      return updatedTurma
    } catch (error) {
      console.error('Erro ao atualizar turma:', error)
      toast.error('Erro ao atualizar turma')
      throw error
    }
  }

  const deleteTurma = async (turmaId: string) => {
    try {
      await lumi.entities.turmas.delete(turmaId)
      setTurmas(prev => prev.filter(t => t._id !== turmaId))
      toast.success('Turma excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir turma:', error)
      toast.error('Erro ao excluir turma')
      throw error
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return {
    // Dados
    salas,
    disciplinas,
    turmas,
    loading,
    
    // Funções de busca
    fetchAllData,
    fetchSalas,
    fetchDisciplinas,
    fetchTurmas,
    
    // CRUD Salas
    createSala,
    updateSala,
    deleteSala,
    
    // CRUD Disciplinas
    createDisciplina,
    updateDisciplina,
    deleteDisciplina,
    
    // CRUD Turmas
    createTurma,
    updateTurma,
    deleteTurma
  }
}
