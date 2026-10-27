import type { Challenge } from '../../types'
import { meta } from './meta'
import { hints } from './hints'
import description from './description.md?raw'
import starterApp from './starter/App.tsx?raw'
import starterItems from './starter/items.ts?raw'
import tests from './tests/challenge.test.tsx?raw'

const challenge: Challenge = {
  ...meta,
  description,
  hints,
  // The first file opens in the editor. Add more files (e.g. '/data.ts') as needed.
  starterFiles: { '/App.tsx': starterApp, '/items.ts': starterItems },
  testFiles: { '/tests/challenge.test.tsx': tests },
  dependencies: {
    '@testing-library/react': '16.3.0',
    '@testing-library/dom': '10.4.0',
    '@testing-library/user-event': '14.6.1',
  },
}

export default challenge
