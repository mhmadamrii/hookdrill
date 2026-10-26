import type { Challenge } from '../../types'
import { meta } from './meta'
import { hints } from './hints'
import description from './description.md?raw'
import starterApp from './starter/App.jsx?raw'
import tests from './tests/challenge.test.jsx?raw'

const challenge: Challenge = {
  ...meta,
  description,
  hints,
  // The first file opens in the editor. Add more files (e.g. '/data.js') as needed.
  starterFiles: { '/App.jsx': starterApp },
  testFiles: { '/tests/challenge.test.jsx': tests },
  dependencies: {
    '@testing-library/react': '16.3.0',
    '@testing-library/dom': '10.4.0',
    '@testing-library/user-event': '14.6.1',
  },
}

export default challenge
