import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import items from '../starter/items.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/items.ts': items }

export default solutionFiles
