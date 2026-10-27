import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import players from '../starter/players.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/players.ts': players }

export default solutionFiles
