import type { FileMap } from '../../../types'
import app from './App.tsx?raw'
import songs from '../starter/songs.ts?raw'

const solutionFiles: FileMap = { '/App.tsx': app, '/songs.ts': songs }

export default solutionFiles
