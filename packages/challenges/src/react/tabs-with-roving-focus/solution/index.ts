import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import tabs from '../starter/tabs.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/tabs.ts': tabs }

export default solutionFiles
