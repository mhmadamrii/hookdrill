import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import faq from '../starter/faq.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/faq.ts': faq }

export default solutionFiles
