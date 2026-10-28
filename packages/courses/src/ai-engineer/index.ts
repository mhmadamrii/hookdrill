import type { Course } from '../types'
import { module01 } from './module-01'

/**
 * The AI Engineer curriculum. Every planned module is listed so learners can
 * see the whole path; a module links to content once it is written and
 * reviewed. Foundation → algorithms → deep learning → modern AI systems →
 * production engineering.
 */
export const aiEngineer: Course = {
  slug: 'ai-engineer',
  title: 'AI Engineer',
  tagline: 'From what AI is to shipping evaluated AI systems.',
  description:
    'A progressive path through the foundations, classical machine learning, deep learning, LLM engineering and production practice. It prepares you to understand, build, evaluate and deploy AI applications; research-level topics are electives.',
  level: 'Beginner to advanced',
  status: 'available',
  outcomes: [
    'Explain how AI, machine learning, deep learning and LLMs relate',
    'Train and evaluate classical and neural models',
    'Build retrieval, tool-using and agentic LLM applications',
    'Measure quality, cost and risk before you ship',
  ],
  prerequisites: [
    'Comfortable programming in any language',
    'No machine learning background needed',
  ],
  phases: [
    {
      number: 1,
      title: 'Understand the AI landscape',
      summary: 'The vocabulary and mental models, before formulas or code.',
      modules: [
        {
          number: 1,
          title: 'AI concepts and terminology',
          topics: [
            'What AI is, and what problems it solves',
            'AI vs. machine learning vs. deep learning',
            'Neural networks, generative AI, LLMs and AI agents',
            'Symbolic AI, statistical learning and how they relate',
            'When AI is useful and when ordinary software is better',
          ],
          module: module01,
        },
      ],
    },
    {
      number: 2,
      title: 'Mathematics and programming foundations',
      summary: 'Just enough code and math to read and reason about models.',
      modules: [
        {
          number: 2,
          title: 'Python and NumPy for scientific computing',
          topics: ['Python for data work', 'NumPy arrays and vectorization'],
        },
        {
          number: 3,
          title: 'Linear algebra and calculus for ML',
          topics: [
            'Vectors, matrices, dot products and matrix operations',
            'Functions, derivatives, gradients and the chain rule',
          ],
        },
        {
          number: 4,
          title: 'Probability, statistics and optimization',
          topics: [
            'Probability, statistics, distributions and Bayes’ theorem',
            'Optimization intuition and gradient descent',
          ],
        },
      ],
    },
    {
      number: 3,
      title: 'Data and classical machine learning',
      summary: 'Learning from data, and proving a model actually works.',
      modules: [
        {
          number: 5,
          title: 'Data and learning paradigms',
          topics: [
            'Datasets, features, labels and preprocessing',
            'Supervised, unsupervised and reinforcement learning',
          ],
        },
        {
          number: 6,
          title: 'Classical models',
          topics: [
            'Regression and classification',
            'Decision trees, random forests and boosting',
            'Clustering, dimensionality reduction and anomaly detection',
          ],
        },
        {
          number: 7,
          title: 'Evaluating models',
          topics: [
            'Training, validation and test sets, leakage and overfitting',
            'Metrics, baselines and model selection',
          ],
        },
      ],
    },
    {
      number: 4,
      title: 'Neural networks and deep learning',
      summary: 'How networks learn, and the architectures behind modern AI.',
      modules: [
        {
          number: 8,
          title: 'Neural network fundamentals',
          topics: [
            'Perceptrons, layers, weights, biases and activations',
            'Loss functions, forward propagation and backpropagation',
          ],
        },
        {
          number: 9,
          title: 'Training deep networks with PyTorch',
          topics: [
            'Gradient descent, optimizers and regularization',
            'Building and training neural networks with PyTorch',
          ],
        },
        {
          number: 10,
          title: 'Architectures and representations',
          topics: [
            'CNNs, sequence models, attention and Transformers',
            'Embeddings and representation learning',
          ],
        },
      ],
    },
    {
      number: 5,
      title: 'Generative AI and LLM engineering',
      summary: 'How LLMs work, and how to build reliable systems on them.',
      modules: [
        {
          number: 11,
          title: 'Language models and Transformers',
          topics: [
            'Generative models and language modeling',
            'Tokenization and next-token prediction',
            'Transformer architecture and attention',
          ],
        },
        {
          number: 12,
          title: 'Training, adapting and prompting LLMs',
          topics: [
            'Pretraining, instruction tuning and fine-tuning',
            'Prompt engineering and structured outputs',
          ],
        },
        {
          number: 13,
          title: 'Retrieval and RAG',
          topics: [
            'Embeddings, semantic search and vector databases',
            'Retrieval-augmented generation',
          ],
        },
        {
          number: 14,
          title: 'Agents, tools and multimodal AI',
          topics: [
            'Tool calling, agents and workflow orchestration',
            'Multimodal AI: text, images, audio and vision',
          ],
        },
      ],
    },
    {
      number: 6,
      title: 'Production AI engineering',
      summary: 'Serving, measuring and securing AI systems in the real world.',
      modules: [
        {
          number: 15,
          title: 'Serving and AI system design',
          topics: [
            'Model serving, APIs and inference',
            'AI application architecture and system design',
            'Latency, throughput, caching and cost',
          ],
        },
        {
          number: 16,
          title: 'Evaluation and quality',
          topics: [
            'Evaluation datasets and quality testing',
            'LLM-as-judge and its limitations',
          ],
        },
        {
          number: 17,
          title: 'MLOps, security and responsible AI',
          topics: [
            'Experiment tracking, versioning and monitoring',
            'Security, privacy and prompt injection',
            'Responsible AI',
          ],
        },
      ],
    },
    {
      number: 7,
      title: 'Real-world projects and specialization',
      summary: 'End-to-end projects with practical, graded milestones.',
      modules: [
        {
          number: 18,
          title: 'Capstone projects',
          topics: [
            'An end-to-end classical ML application',
            'A neural network training project',
            'A production-ready RAG application',
            'An evaluated AI agent with tools',
            'Deployment, monitoring and cost analysis',
          ],
        },
        {
          number: 19,
          title: 'Electives',
          topics: [
            'Computer vision',
            'Recommendation systems',
            'Reinforcement learning',
            'Model optimization',
          ],
        },
      ],
    },
  ],
  sources: [
    {
      title: 'Machine Learning Crash Course',
      publisher: 'Google for Developers',
      url: 'https://developers.google.com/machine-learning/crash-course',
      kind: 'source',
    },
    {
      title: 'CS229: Machine Learning',
      publisher: 'Stanford University',
      url: 'https://cs229.stanford.edu/',
      kind: 'source',
    },
    {
      title: 'LLM Course',
      publisher: 'Hugging Face',
      url: 'https://huggingface.co/learn/llm-course/',
      kind: 'source',
    },
    {
      title: 'PyTorch Tutorials',
      publisher: 'PyTorch',
      url: 'https://docs.pytorch.org/tutorials/',
      kind: 'source',
    },
  ],
}
