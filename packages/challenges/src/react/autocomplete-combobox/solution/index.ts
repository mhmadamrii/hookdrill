import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import api from '../starter/api.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/api.ts': api }

export default solutionFiles
