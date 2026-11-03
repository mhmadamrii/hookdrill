import type { Module } from '../../types'
import { numpyEssentials } from './numpy-essentials'
import { pythonForData } from './python-for-data'

export const module02: Module = {
  slug: 'python-numpy',
  number: 2,
  title: 'Python and NumPy for scientific computing',
  summary:
    'The everyday Python and NumPy that ML code is written in: containers, functions and generators, loading tables with pandas, and fast array math with shapes, broadcasting and axes.',
  submodules: [pythonForData, numpyEssentials],
}
