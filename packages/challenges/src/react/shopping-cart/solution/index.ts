import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import products from '../starter/products.ts?raw'

// Every editable file of the solution, keyed like starterFiles.
const solutionFiles: FileMap = { '/App.tsx': app, '/products.ts': products }

export default solutionFiles
