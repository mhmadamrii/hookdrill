import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import tasks from '../starter/tasks.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/tasks.ts': tasks }

export default solutionFiles
