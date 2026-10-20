import type { Challenge } from '../../types'
import { meta } from './meta'
import { hints } from './hints'
import description from './description.md?raw'
import starterApp from './starter/App.jsx?raw'
import todoTest from './tests/todo.test.jsx?raw'

const challenge: Challenge = {
  ...meta,
  description,
  hints,
  starterFiles: { '/App.jsx': starterApp },
  testFiles: { '/tests/todo.test.jsx': todoTest },
  dependencies: {
    '@testing-library/react': '16.3.0',
    '@testing-library/dom': '10.4.0',
    '@testing-library/user-event': '14.6.1',
  },
}

export default challenge
