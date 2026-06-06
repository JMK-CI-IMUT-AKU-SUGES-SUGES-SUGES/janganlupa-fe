import { lazy } from 'react'

const routeImporters = {
  landing: () => import('../pages/Landing'),
  login: () => import('../pages/Login'),
  register: () => import('../pages/Register'),
  dashboard: () => import('../pages/Dashboard'),
  mytask: () => import('../pages/TaskList'),
  calendar: () => import('../pages/Calendar'),
  profile: () => import('../pages/Profile'),
  projects: () => import('../pages/Project'),
  projectDetail: () => import('../pages/ProjectDetail'),
  partner: () => import('../pages/Partner'),
}

function createPreloadableLazy(importer) {
  let loadedModulePromise

  const load = () => {
    loadedModulePromise ??= importer()
    return loadedModulePromise
  }

  const Component = lazy(load)
  Component.preload = load

  return Component
}

export const LandingPage = createPreloadableLazy(routeImporters.landing)
export const LoginPage = createPreloadableLazy(routeImporters.login)
export const RegisterPage = createPreloadableLazy(routeImporters.register)
export const DashboardPage = createPreloadableLazy(routeImporters.dashboard)
export const TaskListPage = createPreloadableLazy(routeImporters.mytask)
export const CalendarPage = createPreloadableLazy(routeImporters.calendar)
export const ProfilePage = createPreloadableLazy(routeImporters.profile)
export const ProjectPage = createPreloadableLazy(routeImporters.projects)
export const ProjectDetailPage = createPreloadableLazy(routeImporters.projectDetail)
export const PartnerPage = createPreloadableLazy(routeImporters.partner)

export const routePreloaders = {
  '/': LandingPage.preload,
  '/login': LoginPage.preload,
  '/register': RegisterPage.preload,
  '/dashboard': DashboardPage.preload,
  '/mytask': TaskListPage.preload,
  '/projects': ProjectPage.preload,
  '/calendar': CalendarPage.preload,
  '/partner': PartnerPage.preload,
  '/profile': ProfilePage.preload,
}

export function preloadRoute(path) {
  return routePreloaders[path]?.()
}

export function preloadRoutes(paths = []) {
  paths.forEach((path) => {
    preloadRoute(path)
  })
}

export function preloadRoutesWhenIdle(paths = [], timeout = 1500) {
  if (typeof window === 'undefined') {
    preloadRoutes(paths)
    return () => {}
  }

  if ('requestIdleCallback' in window) {
    const callbackId = window.requestIdleCallback(() => preloadRoutes(paths), { timeout })
    return () => window.cancelIdleCallback(callbackId)
  }

  const timeoutId = window.setTimeout(() => preloadRoutes(paths), 350)
  return () => window.clearTimeout(timeoutId)
}
