import type { Module } from '../../types'
import { aiFamilyTree } from './ai-family-tree'
import { whatAiIs } from './what-ai-is'

export const module01: Module = {
  slug: 'ai-concepts',
  number: 1,
  title: 'AI concepts and terminology',
  summary:
    'The mental model everything else builds on: what AI is, how its branches relate, and when it is the right tool.',
  submodules: [whatAiIs, aiFamilyTree],
}
