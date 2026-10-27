import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import people from '../starter/people.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/people.ts': people }

export default solutionFiles
