import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import files from '../starter/files.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/files.ts': files }

export default solutionFiles
