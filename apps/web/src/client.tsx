// Custom client entry: same as TanStack Start's default, minus <StrictMode>.
// StrictMode's double-mount makes Sandpack's useSandpackClient register its
// bundler iframe twice; the second client never gets answers, so the preview
// stays blank and test runs hang. Revisit if Sandpack fixes this.
import { StartClient } from '@tanstack/react-start/client'
import { hydrateRoot } from 'react-dom/client'

hydrateRoot(document, <StartClient />)
