import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from './api'
import { normalizeTask, normalizeProject } from './projectUtils'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data.data),
    staleTime: 30_000,
  })
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data.data),
    staleTime: 30_000,
  })
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then(r => r.data.data.project),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

export function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: () => api.get('/partners').then(r => r.data.data),
    staleTime: 30_000,
  })
}

export function usePartnerRequests() {
  return useQuery({
    queryKey: ['partner-requests'],
    queryFn: () => api.get('/partners/requests').then(r => r.data.data),
    staleTime: 15_000,
  })
}

export function useInvalidate() {
  const qc = useQueryClient()
  return (...keys) => {
    keys.forEach(key => qc.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] }))
  }
}
