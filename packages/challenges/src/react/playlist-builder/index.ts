import type { Challenge } from '../../types'
import { meta } from './meta'
import { hints } from './hints'
import description from './description.md?raw'
import starterApp from './starter/App.tsx?raw'
import starterSongs from './starter/songs.ts?raw'
import playlistTest from './tests/playlist.test.tsx?raw'

const challenge: Challenge = {
  ...meta,
  description,
  hints,
  starterFiles: { '/App.tsx': starterApp, '/songs.ts': starterSongs },
  testFiles: { '/tests/playlist.test.tsx': playlistTest },
  dependencies: {
    '@testing-library/react': '16.3.0',
    '@testing-library/dom': '10.4.0',
    '@testing-library/user-event': '14.6.1',
  },
}

export default challenge
