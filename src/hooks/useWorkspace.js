import { useContext } from 'react'
import WorkspaceContext from '../context/workspaceContext'

export default function useWorkspace() {
  const context = useContext(WorkspaceContext)

  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }

  return context
}
