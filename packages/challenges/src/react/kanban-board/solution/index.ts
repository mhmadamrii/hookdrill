import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import board from '../starter/board.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/board.ts': board }

export default solutionFiles
