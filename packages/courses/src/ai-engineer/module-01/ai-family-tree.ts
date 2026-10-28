import type { Submodule } from '../../types'

export const aiFamilyTree: Submodule = {
  slug: 'ai-family-tree',
  title: 'The AI family tree',
  summary:
    'How artificial intelligence, machine learning, deep learning, large language models and AI agents relate to each other, and what each layer adds.',
  lessons: [
    // ------------------------------------------------------------------
    // Lesson 1
    // ------------------------------------------------------------------
    {
      slug: 'ai-ml-dl',
      title: 'AI vs. machine learning vs. deep learning',
      summary:
        'AI is the broad goal, machine learning is the approach of improving from data, and deep learning is machine learning with multi-layer neural networks that learn their own features.',
      minutes: 11,
      label: 'foundational',
      objectives: [
        {
          id: 'm01-ai-ml-dl-1',
          text: 'place AI, machine learning, deep learning and large language models in their nested relationship, and name a system that belongs to an outer level but not the next one in.',
        },
        {
          id: 'm01-ai-ml-dl-2',
          text: 'decide whether a system counts as machine learning by identifying its task, performance measure and experience.',
        },
        {
          id: 'm01-ai-ml-dl-3',
          text: 'explain what deep learning adds over classic machine learning, and question an "AI-powered" product claim by asking which level it actually uses.',
        },
      ],
      concept: [
        {
          heading: 'Circles inside circles',
          blocks: [
            {
              type: 'text',
              md: 'The words **AI**, **machine learning** and **deep learning** are not three competing technologies. They are three levels of the same family, each one a subset of the one before it.\n\n- **Artificial intelligence** is the broadest term: building systems that do things we would call intelligent if a person did them. It includes hand-written rules, search and knowledge bases, the symbolic approaches from the previous submodule.\n- **Machine learning (ML)** is one way to build AI: instead of writing the rules, you let the system improve at a task from data.\n- **Deep learning (DL)** is one family of ML methods: it uses neural networks with many layers.\n- **Large language models (LLMs)** are one kind of deep learning model, trained on very large amounts of text.\n\nBecause the circles nest, every statement about an inner circle inherits the outer ones. An LLM is a deep learning model, so it is also an ML system, so it is also AI. The reverse does not hold: plenty of AI involves no learning, and plenty of ML involves no neural networks.',
            },
            {
              type: 'figure',
              figure: 'ai-nesting',
              caption:
                'Nested regions: artificial intelligence contains machine learning, which contains deep learning, which contains large language models.',
            },
            {
              type: 'note',
              md: 'The textbook *Deep Learning* (Goodfellow, Bengio and Courville) draws the same picture, with one extra ring between ML and DL called *representation learning*. It also notes that ML is used for many, but not all, approaches to AI.',
            },
          ],
        },
        {
          heading: 'Machine learning: getting better from experience',
          blocks: [
            {
              type: 'text',
              md: "In ordinary software you write the logic: `if amount > 10000 then flag()`. In machine learning you write a program that **finds** the logic by looking at examples, and you judge it by how well it performs.\n\nTom Mitchell gives a precise test. A system learns with respect to a **task T**, a **performance measure P**, and a kind of **experience E** if its performance at T, measured by P, reliably improves after experience E. If you cannot name all three, you are probably not looking at machine learning.\n\nGoogle's introductory ML course groups ML systems into a few broad kinds:\n\n- **Supervised learning**: learn from examples that come with the right answer (emails labeled spam or not spam).\n- **Unsupervised learning**: find structure in data with no labels (grouping customers by behavior).\n- **Reinforcement learning**: learn by acting and receiving rewards or penalties.\n- **Generative AI**: models that create new content from user input. Lesson 3 returns to this.",
            },
            {
              type: 'example',
              title: 'Two spam filters',
              md: '**Filter A** is a list of rules a developer wrote: block messages containing "free money", block senders on a list. When spammers change their wording, a developer has to add a new rule. This is AI in the broad sense, but it does not learn.\n\n**Filter B** is trained on thousands of emails that users marked as spam or not spam.\n\n- Task T: label incoming email as spam or not spam.\n- Performance P: the share of emails it labels correctly on a held-out set.\n- Experience E: the labeled emails.\n\nWhen it is retrained on newer labeled emails, its score on recent spam goes up. Filter B is machine learning. Notice that nobody wrote the rule "free money is suspicious"; the model found that pattern in the data.',
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Artificial intelligence (AI)',
                  definition:
                    'The broad field of building systems that perform tasks we associate with intelligence, by any method, learned or hand-written.',
                },
                {
                  term: 'Machine learning (ML)',
                  definition:
                    'Methods that let a system improve at a task from data or experience instead of following only hand-written rules.',
                },
                {
                  term: 'Model',
                  definition:
                    'The artifact a learning process produces: a function, with learned settings, that turns inputs into predictions or generated output.',
                },
                {
                  term: 'Feature',
                  definition:
                    "One piece of information given to a model about an input, such as an email's sender domain or a patient's age.",
                },
                {
                  term: 'Deep learning (DL)',
                  definition:
                    'Machine learning with neural networks of many layers, which learn useful intermediate representations of the input on their own.',
                },
              ],
            },
          ],
        },
        {
          heading: 'Deep learning: learning the features too',
          blocks: [
            {
              type: 'text',
              md: "Classic ML methods learn how much each feature matters, but a person usually decides what the features are. The *Deep Learning* book gives a clear case: a simple model such as **logistic regression** can use a doctor's structured report (for example, whether a patient has a uterine scar) to make a useful prediction, but handed the raw pixels of an MRI scan it is useless, because no single pixel tells you much. The model's success depends on the **representation** of the data it receives.\n\nDeep learning addresses this by learning the representation as well as the final mapping. A deep network builds simple concepts in its early layers and composes them into more abstract ones in later layers. That is why deep learning took over problems where good features are hard to write down by hand: images, audio and natural language.\n\nWhat each level adds:\n\n- **AI → ML**: the rules are learned from data instead of written by hand.\n- **ML → DL**: the features are learned too, through many stacked layers.\n- **DL → LLMs**: one specific architecture (the Transformer, Lesson 3) trained on huge amounts of text to predict what comes next.",
            },
          ],
        },
        {
          heading: 'Why "AI" in marketing usually means ML',
          blocks: [
            {
              type: 'text',
              md: '"AI" is the umbrella word, so product pages and press releases use it for anything in the family. When a feature adapts to data (recommendations, fraud scores, speech recognition, chat assistants), it is machine learning underneath, and recent ones are very often deep learning. A product that says "AI" might equally be a set of hand-written rules.\n\nThe label tells you little. The useful questions are about the level and the evidence: Does it learn from data? What task, measure and data was it trained and tested on? Does it learn its own features, or rely on ones someone designed?',
            },
          ],
        },
      ],
      application: {
        heading: 'Reading an "AI-powered" feature as an engineer',
        blocks: [
          {
            type: 'text',
            md: 'Suppose your company is offered an "AI-powered" tool that routes support tickets to the right team. Placing it on the family tree tells you what to expect:\n\n- If it is **rule-based**, it will be predictable and easy to audit, but someone must update the rules as products and wording change.\n- If it is **machine learning**, ask for T, P and E: the task (pick a team), how accuracy was measured, and what tickets it learned from. Tickets unlike its training data (a new product line, another language) may be routed badly until it is retrained.\n- If it is **deep learning**, it can work directly on raw ticket text without hand-built keyword features, but it usually needs more data and compute, and it is harder to explain why it chose a team.\n\nLimits to keep in mind: a learned system is only as good as the data and the measurement behind it, and a good average score still leaves individual mistakes. Many real systems mix levels, for example a learned model with hand-written rules around it for cases that must never go wrong.',
          },
        ],
      },
      misconceptions: [
        {
          claim: 'AI and machine learning mean the same thing.',
          correction:
            'Machine learning is a subset of AI. Rule-based expert systems, search algorithms and knowledge bases are AI that involves no learning from data.',
        },
        {
          claim:
            'Deep learning is a separate field that competes with machine learning.',
          correction:
            'Deep learning is a kind of machine learning. It still improves at a task from data; what it adds is multi-layer neural networks that learn their own intermediate features.',
        },
        {
          claim: 'Any software that uses data is machine learning.',
          correction:
            'Reading from a database or applying a fixed threshold uses data but does not learn. A system is ML when its performance at a task improves from experience, which you can check by naming its task, performance measure and experience.',
        },
      ],
      questions: [
        {
          id: 'm01-ai-ml-dl-q1',
          objective: 'm01-ai-ml-dl-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            'Which ordering goes from the broadest category to the narrowest?',
          options: [
            {
              id: 'a',
              text: 'Machine learning, artificial intelligence, deep learning, large language models',
              explanation:
                'Machine learning is not broader than AI; it is one approach to building AI.',
            },
            {
              id: 'b',
              text: 'Deep learning, machine learning, artificial intelligence, large language models',
              explanation:
                'This reverses the nesting. Deep learning is the narrowest of the first three, not the broadest.',
            },
            {
              id: 'c',
              text: 'Artificial intelligence, machine learning, deep learning, large language models',
              explanation:
                'Correct. AI contains ML, ML contains deep learning, and LLMs are one kind of deep learning model.',
            },
            {
              id: 'd',
              text: 'Artificial intelligence, deep learning, large language models, machine learning',
              explanation:
                'Machine learning is not inside LLMs. LLMs are a kind of deep learning, which is itself a kind of ML.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-ai-ml-dl-q2',
          objective: 'm01-ai-ml-dl-2',
          kind: 'recall',
          difficulty: 'easy',
          prompt:
            "Under Tom Mitchell's definition, which three things must be specified to say a program learns?",
          options: [
            {
              id: 'a',
              text: 'A task, a performance measure, and the experience it improves from',
              explanation:
                'Correct. A program learns when its performance P at task T improves with experience E.',
            },
            {
              id: 'b',
              text: 'A dataset, a neural network, and a graphics processor to train on',
              explanation:
                'These are common ingredients of deep learning in practice, but the definition does not require neural networks or particular hardware.',
            },
            {
              id: 'c',
              text: 'A set of rules, an input format, and an expected output format',
              explanation:
                'This describes ordinary rule-based software. The definition is about improvement from experience, not hand-written rules.',
            },
            {
              id: 'd',
              text: 'A goal, a list of tools, and a condition for stopping the loop',
              explanation:
                'This sounds like an AI agent design (Lesson 3), not the definition of learning.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-ai-ml-dl-q3',
          objective: 'm01-ai-ml-dl-1',
          kind: 'concept',
          difficulty: 'medium',
          prompt: 'Which system is AI but is not machine learning?',
          options: [
            {
              id: 'a',
              text: 'A spam filter trained on emails that users labeled as spam',
              explanation:
                'This improves from labeled examples, so it is machine learning.',
            },
            {
              id: 'b',
              text: 'An image classifier built from a many-layered neural network',
              explanation:
                'A many-layered neural network is deep learning, which sits inside machine learning.',
            },
            {
              id: 'c',
              text: 'A chat assistant built on a large language model',
              explanation:
                'LLMs are deep learning models, so they are machine learning too.',
            },
            {
              id: 'd',
              text: 'A diagnosis helper whose if-then rules were written by experts',
              explanation:
                'Correct. Hand-written expert rules are a classic form of AI, but nothing in the system learns from data.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-ai-ml-dl-q4',
          objective: 'm01-ai-ml-dl-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt: 'Which of these systems is doing machine learning?',
          options: [
            {
              id: 'a',
              text: 'A thermostat that switches on the heat whenever it drops below 19°C',
              explanation:
                'The threshold was set by a person and never changes with experience, so there is no learning.',
            },
            {
              id: 'b',
              text: 'A shop recommender whose click predictions improve after training on more logs',
              explanation:
                'Correct. Task: predict clicks. Measure: prediction accuracy. Experience: click logs. Performance improves with experience.',
            },
            {
              id: 'c',
              text: 'A search box that runs a SQL query to find products matching a keyword',
              explanation:
                'It uses data, but it applies a fixed query. Its behavior does not improve from experience.',
            },
            {
              id: 'd',
              text: 'A sorting function that orders a list of orders by date, newest first',
              explanation:
                'A sorting algorithm follows fixed logic written by a developer. It has no performance measure that improves with data.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-ai-ml-dl-q5',
          objective: 'm01-ai-ml-dl-3',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'What is the main thing deep learning adds compared with classic machine learning methods such as logistic regression?',
          options: [
            {
              id: 'a',
              text: 'It learns useful intermediate features from raw input through many layers',
              explanation:
                'Correct. Classic methods mostly rely on features people design; deep networks learn layered representations themselves.',
            },
            {
              id: 'b',
              text: 'It can learn a good model without needing any training data at all',
              explanation:
                'Deep learning is still machine learning and usually needs more data, not less.',
            },
            {
              id: 'c',
              text: 'It guarantees that each prediction is correct once training is done',
              explanation:
                'No learning method guarantees correct predictions; deep models make mistakes too.',
            },
            {
              id: 'd',
              text: 'It replaces learning from examples with rules written by domain experts',
              explanation:
                'That describes symbolic AI, the opposite direction from deep learning.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-ai-ml-dl-q6',
          objective: 'm01-ai-ml-dl-3',
          kind: 'application',
          difficulty: 'hard',
          prompt:
            "In which project would deep learning's ability to learn its own features matter most?",
          options: [
            {
              id: 'a',
              text: 'Looking up the sales tax rate for an address from a government table',
              explanation:
                'This is a lookup with a known answer. There is nothing to learn, so neither ML nor deep learning is needed.',
            },
            {
              id: 'b',
              text: 'Predicting churn from ten account fields an analyst already picked as useful',
              explanation:
                'With a few well-chosen features, a classic ML model often does well. Learned features add the least here.',
            },
            {
              id: 'c',
              text: 'Spotting defects in raw factory photos where no one can define a defect in rules',
              explanation:
                'Correct. Single pixels carry little meaning, and good features are hard to write by hand. Learning layered representations from raw images is where deep learning shines.',
            },
            {
              id: 'd',
              text: 'Applying a refund policy that the legal team has written as clear rules',
              explanation:
                'Clear, stable rules are best written as code. Learning them from data would add error without benefit.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-ai-ml-dl-q7',
          objective: 'm01-ai-ml-dl-3',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            'A vendor pitches an "AI-powered" invoice approval tool. What is the most useful first question to ask?',
          options: [
            {
              id: 'a',
              text: 'How many layers does the neural network inside the product have?',
              explanation:
                'This assumes it is deep learning, and layer count says nothing about whether it does your task well.',
            },
            {
              id: 'b',
              text: 'Is the product built on the newest and largest available model?',
              explanation:
                'Model size or newness does not tell you whether it was tested on a task like yours.',
            },
            {
              id: 'c',
              text: 'Does the product use AI, or does it use machine learning instead?',
              explanation:
                'This treats AI and ML as alternatives. ML is a kind of AI, so the question has no clear answer.',
            },
            {
              id: 'd',
              text: 'Does it learn from data, and on what task, measure and data was it tested?',
              explanation:
                'Correct. This places it on the family tree and asks for the evidence that it performs your task.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-ai-ml-dl-q8',
          objective: 'm01-ai-ml-dl-1',
          kind: 'concept',
          difficulty: 'hard',
          prompt:
            'Given the nesting AI ⊃ machine learning ⊃ deep learning ⊃ large language models, which statement must be true?',
          options: [
            {
              id: 'a',
              text: 'Every machine learning system is some kind of large language model',
              explanation:
                'This reverses the nesting. Most ML systems, such as a spam classifier, are not LLMs.',
            },
            {
              id: 'b',
              text: 'Every large language model is also a machine learning system',
              explanation:
                'Correct. LLMs sit inside deep learning, which sits inside machine learning, so the property carries outward.',
            },
            {
              id: 'c',
              text: 'Every deep learning system generates text, images or other content',
              explanation:
                'Many deep learning models classify or predict instead, for example an image classifier.',
            },
            {
              id: 'd',
              text: 'Every system outside deep learning is not really artificial intelligence',
              explanation:
                'Rule-based systems and classic ML are still AI. They just sit in the outer rings.',
            },
          ],
          answer: 'b',
        },
      ],
      references: [
        {
          title: 'The Discipline of Machine Learning (CMU-ML-06-108)',
          publisher: 'Tom M. Mitchell, Carnegie Mellon University',
          url: 'https://www.cs.cmu.edu/~tom/pubs/MachineLearning.pdf',
          kind: 'source',
        },
        {
          title: 'Deep Learning, Chapter 1: Introduction',
          publisher: 'Goodfellow, Bengio and Courville, MIT Press',
          url: 'https://www.deeplearningbook.org/contents/intro.html',
          kind: 'source',
        },
        {
          title: 'What is Machine Learning?',
          publisher: 'Google for Developers',
          url: 'https://developers.google.com/machine-learning/intro-to-ml/what-is-ml',
          kind: 'source',
        },
        {
          title: 'CS229: Machine Learning',
          publisher: 'Stanford University',
          url: 'https://cs229.stanford.edu/',
          kind: 'further',
        },
      ],
      reviewedAt: '2026-10-28',
    },

    // ------------------------------------------------------------------
    // Lesson 2
    // ------------------------------------------------------------------
    {
      slug: 'neural-networks-intro',
      title: 'Neural networks at a glance',
      summary:
        'A neural network is layers of simple units, each computing a weighted sum and an activation. Training adjusts the weights and biases to reduce error on examples.',
      minutes: 13,
      label: 'foundational',
      objectives: [
        {
          id: 'm01-neural-networks-intro-1',
          text: 'describe what an artificial neuron computes and how neurons are arranged into input, hidden and output layers.',
        },
        {
          id: 'm01-neural-networks-intro-2',
          text: 'explain training as adjusting weights and biases to reduce a loss on examples, using the terms loss, gradient descent and backpropagation correctly.',
        },
        {
          id: 'm01-neural-networks-intro-3',
          text: 'explain what makes a network "deep", why nonlinear activations are needed for depth to help, and where the brain analogy breaks down.',
        },
      ],
      concept: [
        {
          heading: 'A neuron is a weighted vote',
          blocks: [
            {
              type: 'text',
              md: 'Forget biology for a moment. An **artificial neuron** is a tiny function:\n\n1. Take several numbers as input.\n2. Multiply each one by its own **weight**, which says how much that input matters and in which direction.\n3. Add the results together, plus one extra number called the **bias**, which shifts the result up or down.\n4. Pass that total through an **activation function**, which reshapes it, for example by turning every negative value into zero.\n\nThat is all a single neuron does. The power comes from wiring many of them together and letting training choose the weights.',
            },
            {
              type: 'example',
              title: 'Should I bring an umbrella?',
              md: 'Imagine one neuron with three inputs, each scaled from 0 to 1: cloud cover, humidity, and the forecast\'s chance of rain.\n\n- The forecast gets a large positive weight: it matters a lot.\n- Cloud cover gets a smaller positive weight.\n- Humidity gets a weight near zero: it turned out not to help much.\n- A negative bias means "by default, don\'t bother" unless the evidence adds up.\n\nThe weighted sum plus bias goes through the activation, and a high output means "bring one". Nobody typed these weights in. In a trained network they come out of training on past days, and real networks have thousands to billions of them.',
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Artificial neuron (node)',
                  definition:
                    'A unit that computes a weighted sum of its inputs, adds a bias, and applies an activation function.',
                },
                {
                  term: 'Weight',
                  definition:
                    'A learned number on a connection that scales how strongly one input influences the next neuron.',
                },
                {
                  term: 'Bias',
                  definition:
                    "A learned number added to a neuron's weighted sum, shifting its output independently of the inputs.",
                },
                {
                  term: 'Activation function',
                  definition:
                    "A nonlinear function applied to a neuron's total, such as ReLU, sigmoid or tanh.",
                },
                {
                  term: 'Parameters',
                  definition:
                    'All the weights and biases of a network: the values that training adjusts.',
                },
                {
                  term: 'Loss',
                  definition:
                    "A number that measures how far the network's predictions are from the correct answers on a set of examples.",
                },
              ],
            },
          ],
        },
        {
          heading: 'Layers make a network',
          blocks: [
            {
              type: 'text',
              md: "Neurons are arranged in **layers**:\n\n- The **input layer** just holds the input values (pixels, numbers from a form, and so on). It does no computing.\n- One or more **hidden layers** each take the previous layer's outputs as their inputs. They are called hidden because you never see their values directly in the data or in the answer.\n- The **output layer** produces the final result, such as a score for each possible label.\n\nIn a **fully connected** (dense) layer, every neuron receives every output of the layer before it, and each of those connections has its own weight.",
            },
            {
              type: 'figure',
              figure: 'neural-network',
              caption:
                'A fully connected network: 3 inputs feed two hidden layers of 4 neurons each, which feed 2 outputs. Each connection carries its own learned weight.',
            },
            {
              type: 'example',
              title: 'Counting the parameters in the figure',
              md: 'Every connection is one weight, and every neuron outside the input layer has one bias.\n\n- Inputs to first hidden layer: 3 × 4 = 12 weights.\n- First hidden to second hidden: 4 × 4 = 16 weights.\n- Second hidden to outputs: 4 × 2 = 8 weights.\n- Biases: 4 + 4 + 2 = 10.\n\nThat is 36 weights plus 10 biases, **46 parameters**. A modern language model has the same kinds of parts, just billions of them.',
            },
          ],
        },
        {
          heading: 'Training: nudging weights to reduce error',
          blocks: [
            {
              type: 'text',
              md: 'A new network starts with weights that are essentially arbitrary, so its outputs are nonsense. **Training** fixes that using examples where the right answer is known:\n\n1. Run an example through the network to get a prediction.\n2. Compare the prediction with the right answer and compute the **loss**.\n3. Work out, for every weight and bias, which small change would reduce the loss.\n4. Nudge all of them a small step in that direction.\n5. Repeat over many examples, many times, until the loss stops improving.\n\nStep 4, repeated, is **gradient descent**: the gradient points in the direction that would increase the loss fastest, and descent means taking small steps the opposite way. Step 3 is done efficiently by **backpropagation**, the standard algorithm for computing those directions in a multi-layer network. In practice libraries such as PyTorch or Keras do this for you. Later modules show the math.\n\nOnce training ends, the weights are usually frozen. Using the network to make predictions is called **inference**, and it only reads the weights.',
            },
            {
              type: 'note',
              md: 'Training and inference are separate phases. A deployed model does not get better just because it is used; it changes only when someone trains it again.',
            },
          ],
        },
        {
          heading: 'What "deep" means, and why the brain analogy is loose',
          blocks: [
            {
              type: 'text',
              md: '**Deep** refers to the number of layers that transform the input one after another. Each layer builds on the representation produced by the previous one, which is how deep networks build simple patterns into complex ones (Lesson 1). There is no agreed threshold for how many layers count as deep. Google\'s ML glossary uses a working definition: a neural network with more than one hidden layer.\n\nDepth only helps because of the **activation function**. Without a nonlinear activation, each layer is just a weighted sum, and a weighted sum of weighted sums is still a weighted sum: ten such layers can do no more than one. Nonlinear activations such as **ReLU** are what let stacked layers model complicated relationships.\n\nDeeper is not automatically better. Very deep networks can be hard to train: the signals that tell early layers how to change can shrink toward zero (vanishing gradients) or grow out of control (exploding gradients).\n\nAs for the name, early learning algorithms were partly inspired by models of the brain, which is why these are called *artificial neural networks*. The *Deep Learning* textbook is explicit that modern networks are engineered systems that are generally not designed to be realistic models of how biological neurons work. Treat "neuron" as a label for a weighted sum plus activation, not as a claim about biology.',
            },
          ],
        },
      ],
      application: {
        heading: 'Where a neural network sits in a product',
        blocks: [
          {
            type: 'text',
            md: 'Picture a photo app that tags pictures as "receipt", "screenshot" or "pet". Inside it:\n\n- The **architecture** (how many layers, how wide) was chosen by engineers.\n- The **parameters** were produced by training on labeled photos, usually offline on powerful hardware, and shipped as a weights file.\n- At run time the app does **inference**: it turns the photo into numbers, pushes them through the layers, and reads the output scores.\n\nLimits that follow from how it works:\n\n- Individual weights have no readable meaning, so it is hard to explain why a given photo got its tag.\n- It learned from examples, so it needs plenty of representative labeled data, and nothing in the architecture guarantees good behavior on inputs unlike that data.\n- It does not improve from use. Fixing a systematic mistake means collecting new examples and retraining.',
          },
        ],
      },
      misconceptions: [
        {
          claim: 'A neural network is a simulation of how the brain works.',
          correction:
            'Neural networks were loosely inspired by neurons, but modern networks are engineered systems built from weighted sums and simple functions. They are generally not designed as realistic models of biological brains.',
        },
        {
          claim: 'Programmers decide the weights that make a network work.',
          correction:
            'Programmers choose the architecture, the data and the loss. The weights and biases are set by training, which adjusts them to reduce the loss on examples.',
        },
        {
          claim: 'Adding more layers always makes a network more capable.',
          correction:
            'Without nonlinear activations, extra layers add nothing because stacked linear steps stay linear. Even with them, deeper networks can be harder to train, for example because of vanishing or exploding gradients.',
        },
      ],
      questions: [
        {
          id: 'm01-neural-networks-intro-q1',
          objective: 'm01-neural-networks-intro-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt: 'What does a single artificial neuron compute?',
          options: [
            {
              id: 'a',
              text: 'It looks up the input in a table of stored answers from training',
              explanation:
                'Neurons do not store or look up answers. They compute with learned weights.',
            },
            {
              id: 'b',
              text: 'A weighted sum of its inputs plus a bias, passed through an activation',
              explanation:
                'Correct. That is the whole computation of one artificial neuron.',
            },
            {
              id: 'c',
              text: 'It fires an electrical spike when a chemical threshold is crossed',
              explanation:
                'This describes a biological neuron. Artificial neurons only borrow the name.',
            },
            {
              id: 'd',
              text: 'It runs an if-then rule written by the developer for that input',
              explanation:
                "That is rule-based software. A neuron's behavior comes from learned weights, not hand-written rules.",
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-neural-networks-intro-q2',
          objective: 'm01-neural-networks-intro-2',
          kind: 'recall',
          difficulty: 'easy',
          prompt: 'Which values does training adjust in a neural network?',
          options: [
            {
              id: 'a',
              text: 'The number of layers and the number of neurons in each one',
              explanation:
                'These describe the architecture, which engineers choose before training starts.',
            },
            {
              id: 'b',
              text: 'The examples in the training set and their correct labels',
              explanation:
                'The data is the input to training. Training does not change it.',
            },
            {
              id: 'c',
              text: 'Which activation function each neuron in the network uses',
              explanation:
                'The activation function is a design choice. Training adjusts the numbers that feed into it.',
            },
            {
              id: 'd',
              text: 'The weights on the connections and the bias of each neuron',
              explanation:
                "Correct. Weights and biases are the network's parameters, and training adjusts them to reduce the loss.",
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-neural-networks-intro-q3',
          objective: 'm01-neural-networks-intro-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt: 'What does gradient descent do during training?',
          options: [
            {
              id: 'a',
              text: 'Repeatedly nudges the parameters in the direction that lowers the loss',
              explanation:
                'Correct. It takes many small steps against the gradient, which over time reduce the loss on the training examples.',
            },
            {
              id: 'b',
              text: 'Removes neurons whose weights are near zero to shrink the network',
              explanation:
                'That describes pruning, a separate technique. Gradient descent changes parameter values.',
            },
            {
              id: 'c',
              text: 'Picks the best number of hidden layers by trying every option',
              explanation:
                'Choosing the number of layers is an architecture decision, not what gradient descent does.',
            },
            {
              id: 'd',
              text: 'Sorts the training examples so the easiest ones are learned first',
              explanation:
                'Gradient descent does not order the data. It updates weights and biases from the loss.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-neural-networks-intro-q4',
          objective: 'm01-neural-networks-intro-3',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'Why do neural networks need nonlinear activation functions between layers?',
          options: [
            {
              id: 'a',
              text: "They make the network's outputs easier for people to interpret",
              explanation:
                'Activations do not make networks interpretable. Their role is to add nonlinearity.',
            },
            {
              id: 'b',
              text: 'They stop the weights from changing once training has finished',
              explanation:
                'Weights stay fixed after training because training stops, not because of activations.',
            },
            {
              id: 'c',
              text: 'Without them, stacked layers collapse into a single linear step',
              explanation:
                'Correct. A weighted sum of weighted sums is still a weighted sum, so extra layers would add no power.',
            },
            {
              id: 'd',
              text: 'They let the network skip training and use hand-set weights',
              explanation:
                'Activation functions have nothing to do with avoiding training. The weights are still learned.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-neural-networks-intro-q5',
          objective: 'm01-neural-networks-intro-3',
          kind: 'concept',
          difficulty: 'medium',
          prompt: 'In "deep learning", what does "deep" refer to?',
          options: [
            {
              id: 'a',
              text: 'The very large size of the datasets the models are trained on',
              explanation:
                "Deep models often use large datasets, but the word refers to the network's structure, not data size.",
            },
            {
              id: 'b',
              text: 'The many layers that transform the input one after another',
              explanation:
                'Correct. Depth is about how many layers of composed transformations sit between input and output.',
            },
            {
              id: 'c',
              text: "The model's ability to understand meaning the way people do",
              explanation:
                '"Deep" is not a claim about human-like understanding. It is a structural term.',
            },
            {
              id: 'd',
              text: 'The long time the model spends thinking before it answers',
              explanation:
                'Thinking time is unrelated. A deep network can return an answer in milliseconds.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-neural-networks-intro-q6',
          objective: 'm01-neural-networks-intro-1',
          kind: 'application',
          difficulty: 'hard',
          prompt:
            'A fully connected network has 3 inputs, two hidden layers of 4 neurons, and 2 outputs. Every non-input neuron has a bias. How many parameters does it have?',
          options: [
            {
              id: 'a',
              text: '13 parameters, one for each neuron in the network',
              explanation:
                '13 counts neurons including inputs. Parameters are weights and biases, and there is a weight on every connection.',
            },
            {
              id: 'b',
              text: '36 parameters, one for each connection between layers',
              explanation:
                '36 is the number of weights (12 + 16 + 8). It leaves out the 10 biases.',
            },
            {
              id: 'c',
              text: '46 parameters, the connection weights plus the biases',
              explanation:
                'Correct. 12 + 16 + 8 = 36 weights, plus 4 + 4 + 2 = 10 biases, gives 46.',
            },
            {
              id: 'd',
              text: '49 parameters, the connection weights plus a bias per neuron',
              explanation:
                'This adds biases to the 3 input values too. The input layer only holds data and has no biases.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-neural-networks-intro-q7',
          objective: 'm01-neural-networks-intro-2',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            "A trained image classifier is deployed, and a user's photo is misclassified. In a standard deployment, what happens to the network's weights while it makes that prediction?",
          options: [
            {
              id: 'a',
              text: 'Nothing: inference only reads the weights, which change only on retraining',
              explanation:
                'Correct. Inference runs the input through fixed weights. Updating them requires a separate training step.',
            },
            {
              id: 'b',
              text: 'Backpropagation runs right away and corrects the weights for next time',
              explanation:
                'Backpropagation needs a known correct answer and a training step. Normal inference does neither.',
            },
            {
              id: 'c',
              text: 'The weights drift slightly with each request until the error disappears',
              explanation:
                'Served models do not drift on their own. Their weights stay the same between training runs.',
            },
            {
              id: 'd',
              text: 'The network adds a new neuron that remembers this particular photo',
              explanation:
                'The architecture is fixed. Networks do not grow neurons to memorize individual inputs at run time.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-neural-networks-intro-q8',
          objective: 'm01-neural-networks-intro-3',
          kind: 'concept',
          difficulty: 'hard',
          prompt:
            'Which statement best describes how artificial neural networks relate to the brain?',
          options: [
            {
              id: 'a',
              text: 'They are detailed simulations of biological neurons, scaled down for computers',
              explanation:
                'Artificial neurons are weighted sums plus a simple function. They are not detailed simulations of biology.',
            },
            {
              id: 'b',
              text: 'They prove the brain learns by gradient descent and backpropagation',
              explanation:
                'Neural networks working well tells us nothing certain about how brains learn.',
            },
            {
              id: 'c',
              text: 'They have no connection to the brain, and the name is pure marketing',
              explanation:
                'This overcorrects. Early work was genuinely inspired by brain models, which is where the name comes from.',
            },
            {
              id: 'd',
              text: 'They were loosely inspired by the brain but are not built as models of it',
              explanation:
                'Correct. The inspiration is historical. Modern networks are engineered systems, generally not designed to be realistic models of biological function.',
            },
          ],
          answer: 'd',
        },
      ],
      references: [
        {
          title: 'Neural networks: Nodes and hidden layers',
          publisher: 'Google Machine Learning Crash Course',
          url: 'https://developers.google.com/machine-learning/crash-course/neural-networks/nodes-hidden-layers',
          kind: 'source',
        },
        {
          title: 'Neural networks: Activation functions',
          publisher: 'Google Machine Learning Crash Course',
          url: 'https://developers.google.com/machine-learning/crash-course/neural-networks/activation-functions',
          kind: 'source',
        },
        {
          title: 'Neural networks: Training using backpropagation',
          publisher: 'Google Machine Learning Crash Course',
          url: 'https://developers.google.com/machine-learning/crash-course/neural-networks/backpropagation',
          kind: 'source',
        },
        {
          title: 'Linear regression: Gradient descent',
          publisher: 'Google Machine Learning Crash Course',
          url: 'https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent',
          kind: 'source',
        },
        {
          title: 'Machine Learning Glossary (deep model)',
          publisher: 'Google for Developers',
          url: 'https://developers.google.com/machine-learning/glossary',
          kind: 'source',
        },
        {
          title: 'Deep Learning, Chapter 1: Introduction',
          publisher: 'Goodfellow, Bengio and Courville, MIT Press',
          url: 'https://www.deeplearningbook.org/contents/intro.html',
          kind: 'source',
        },
        {
          title: 'Deep Learning, Chapter 6: Deep Feedforward Networks',
          publisher: 'Goodfellow, Bengio and Courville, MIT Press',
          url: 'https://www.deeplearningbook.org/contents/mlp.html',
          kind: 'further',
        },
      ],
      reviewedAt: '2026-10-28',
    },

    // ------------------------------------------------------------------
    // Lesson 3
    // ------------------------------------------------------------------
    {
      slug: 'generative-ai-llms-agents',
      title: 'Generative AI, LLMs, and AI agents',
      summary:
        'Generative models produce new content. LLMs are Transformer networks trained to predict the next token, then tuned to follow instructions. Agents put an LLM in a loop with tools.',
      minutes: 15,
      label: 'current-practice',
      objectives: [
        {
          id: 'm01-generative-ai-llms-agents-1',
          text: 'distinguish generative models from discriminative (predictive) models, and place LLMs among them.',
        },
        {
          id: 'm01-generative-ai-llms-agents-2',
          text: 'explain how an LLM is built (tokens, the Transformer, next-token pretraining, instruction tuning) and why that makes it fluent yet able to state falsehoods.',
        },
        {
          id: 'm01-generative-ai-llms-agents-3',
          text: 'describe an AI agent as a model that uses tools in a loop toward a goal, and tell an agent apart from a workflow.',
        },
      ],
      concept: [
        {
          heading: 'Two jobs for a model: tell apart, or produce',
          blocks: [
            {
              type: 'text',
              md: 'Most of the ML you met in Lesson 1 **tells things apart**: spam or not spam, cat or dog, fraud or fine. Models like these are called **discriminative**. They learn how likely each label is given an input.\n\n**Generative** models learn what the data itself looks like well enough to **produce** new examples: a new image, a paragraph of text, a voice clip. Google\'s ML course puts the formal distinction this way: a generative model captures the joint probability of inputs and labels (or just of the inputs, if there are no labels), while a discriminative model captures the probability of a label given an input. You do not need the formulas yet; the intuition is "produce" versus "classify".\n\nA model that predicts the next word of a sentence is generative: by assigning probabilities to sequences of words, it can produce new text one piece at a time. That is exactly what an LLM does.',
            },
            {
              type: 'note',
              md: '"Generative AI" describes what a model does, not a separate branch of the family tree. Today\'s best-known generative systems, including LLMs, are deep learning models.',
            },
          ],
        },
        {
          heading: 'How an LLM is made',
          blocks: [
            {
              type: 'text',
              md: "**Tokens.** An LLM does not read characters or whole words. Text is split into **tokens**, which can be words, pieces of words, or single characters. A common word is often a single token, while a rare word may be split into several pieces. Tokenizers such as byte-pair encoding learn which pieces to use from a body of text. Tokens are the unit everything else counts in: model input, output, context limits and API pricing.\n\n**The Transformer.** Modern LLMs are built on the **Transformer**, a neural network architecture introduced in the 2017 paper *Attention Is All You Need*. Its key mechanism, **self-attention**, lets each token weigh how much every other token in the input matters to its meaning. The paper's design relies on attention alone, dropping the recurrence and convolutions that earlier leading sequence models used, which made training more parallelizable.\n\n**Pretraining.** GPT-style models are first trained on very large amounts of raw text to predict the **next token** from the tokens before it (also called causal language modeling). No one labels this data: the next token in the text is the answer, so the task is called *self-supervised*. This is the same training loop as Lesson 2, adjusting billions of weights to reduce prediction loss.\n\n**Instruction tuning.** A model that only predicts the next token continues text; it does not reliably follow requests. So most chat models get further training on examples of instructions and good responses. In the InstructGPT paper (Ouyang et al., 2022), OpenAI fine-tuned GPT-3 on human-written demonstrations and then used reinforcement learning from human feedback (RLHF), where people rank outputs. Human raters preferred the outputs of a 1.3-billion-parameter tuned model to those of the original 175-billion-parameter GPT-3.",
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Generative model',
                  definition:
                    'A model that learns the shape of its data well enough to produce new examples, such as text or images.',
                },
                {
                  term: 'Discriminative model',
                  definition:
                    'A model that learns to assign labels or predictions to inputs, such as spam or not spam.',
                },
                {
                  term: 'Token',
                  definition:
                    'The unit of text an LLM reads and writes: a word, part of a word, or a character.',
                },
                {
                  term: 'Transformer',
                  definition:
                    "A neural network architecture built around self-attention. It is the basis of today's LLMs.",
                },
                {
                  term: 'Pretraining',
                  definition:
                    'The first, large training phase. For GPT-style LLMs, it means learning to predict the next token across a huge text corpus.',
                },
                {
                  term: 'Instruction tuning',
                  definition:
                    'Further training that teaches a pretrained model to follow instructions, for example with demonstrations and human feedback.',
                },
                {
                  term: 'Hallucination',
                  definition:
                    'Model output that is fluent but factually wrong or inconsistent with the context it was given.',
                },
                {
                  term: 'AI agent',
                  definition:
                    'A system in which an LLM directs its own steps, calling tools and reading their results in a loop until the goal is met or a stop condition is reached.',
                },
              ],
            },
          ],
        },
        {
          heading: 'Fluent and wrong: hallucination',
          blocks: [
            {
              type: 'text',
              md: "Pretraining rewards one thing: predicting likely next tokens. Text that *sounds* right and text that *is* right overlap a great deal, which is why LLMs are often correct. But nothing in that objective checks facts, so a model can produce a confident, well-formed answer that is false. This is called **hallucination**. Google's ML course lists it as a core LLM problem, and Anthropic's documentation notes that even the most capable models sometimes produce text that is factually incorrect or inconsistent with the context provided.\n\nAn LLM answering a question is not looking anything up unless your system gives it a tool or documents to look things up with. Its knowledge lives in its weights, as patterns learned during training.\n\nAnthropic's guidance for reducing hallucinations includes: explicitly allow the model to say \"I don't know\"; supply the relevant documents and ask it to answer only from them; have it quote and cite the passages that support each claim; and verify important claims. These techniques reduce hallucinations but do not eliminate them, so critical information still needs checking.",
            },
            {
              type: 'example',
              title: "The function that doesn't exist",
              md: 'A developer asks a chat model how to paginate results in a small open-source library. The model replies with clean code that calls `client.fetchAllPages()`, complete with a sensible explanation.\n\nThe library has no such method. The name is a plausible blend of conventions the model saw in many other libraries, so it is exactly the kind of text the model was trained to produce. The fix is not to ask the model to "be more careful" but to give it the library\'s actual documentation, or a tool that can search it, and to run the code before trusting it.',
            },
          ],
        },
        {
          heading: 'From model to agent',
          blocks: [
            {
              type: 'text',
              md: 'On its own, an LLM takes text in and produces text out. Two additions turn it into something that can act.\n\n**Tools.** With tool use, you describe functions to the model (search the docs, query an order, run a test). The model never runs anything itself: it replies with a structured request naming a tool and its arguments, your code runs it, and you send the result back. Anthropic calls an LLM extended with retrieval, tools and memory an **augmented LLM**, the basic building block of agentic systems.\n\n**A loop.** An **AI agent** repeats that exchange toward a goal. The model decides the next step, calls a tool, observes the result, and decides again, until it produces a final answer or hits a stop condition such as a maximum number of steps. Anthropic\'s *Building effective agents* describes agents as LLMs using tools based on feedback from the environment in a loop, and stresses that the agent needs real results ("ground truth") from the environment at each step to judge its progress.',
            },
            {
              type: 'figure',
              figure: 'agent-loop',
              caption:
                'The agent loop: given a goal, the model decides the next step, calls a tool, and observes the result, then returns to the model. The loop repeats until the model gives a final answer or a stop condition is reached.',
            },
            {
              type: 'text',
              md: 'Not every LLM system is an agent. *Building effective agents* draws a useful line:\n\n- **Workflows**: LLMs and tools are orchestrated through **predefined code paths**. You decide the steps; the model fills them in. Example: summarize a ticket, then translate the summary, then file it.\n- **Agents**: the LLM **dynamically directs its own process and tool use**, deciding which steps to take and when it is done.\n\nThe same article recommends finding the simplest solution that works and adding complexity only when needed. Workflows give predictability for well-defined tasks; agents give flexibility when the steps cannot be known in advance, at the cost of latency, expense and the risk of errors that compound across steps.',
            },
            {
              type: 'example',
              title: 'A test-fixing agent',
              md: 'Goal: "Make the failing test in `cart.test.ts` pass."\n\n1. The model decides to read the test file and calls a `read_file` tool.\n2. It observes the test and decides to run it, calling a `run_tests` tool.\n3. It observes an error about a missing discount, reads `cart.ts`, and calls an `edit_file` tool with a fix.\n4. It runs the tests again, sees them pass, and returns a final summary.\n\nNo one scripted these four steps; the model chose each one from the previous result. The surrounding code still sets a limit, say 20 tool calls, so a confused run cannot loop forever.',
            },
          ],
        },
      ],
      application: {
        heading: 'The agent loop in a real API',
        blocks: [
          {
            type: 'text',
            md: 'With Anthropic\'s Messages API, the loop is ordinary application code. You send the user\'s request with a list of tool definitions. If the model wants a tool, the response stops with `stop_reason: "tool_use"` and contains a `tool_use` block naming the tool and its arguments. Your code runs the tool and sends the output back in a `tool_result` block. You repeat while the stop reason is `tool_use`; any other stop reason (a finished answer, a token limit, a refusal) ends the loop and your code decides what to do.\n\nWhat this means in practice:\n\n- **You own execution and safety.** The model only requests actions. Your code decides whether to run them, with what permissions, and what to send back.\n- **You need your own stop conditions.** Cap the number of iterations and the cost, and handle every way the loop can end.\n- **Tool arguments can be wrong.** If the request lacks information, a model may ask for it, or it may fill in a plausible guess. Validate arguments before acting on them.\n- **Errors compound.** A hallucinated fact early in the loop can steer every later step, which is why real tool results at each step matter and why a fixed workflow is often the safer choice when the steps are known.',
          },
        ],
      },
      misconceptions: [
        {
          claim:
            'An LLM looks up facts in a database when it answers a question.',
          correction:
            'An LLM generates tokens from patterns stored in its learned weights. It only consults outside information if your system provides documents or a retrieval tool, which is why it can state falsehoods fluently.',
        },
        {
          claim: 'Any application that calls an LLM is an AI agent.',
          correction:
            'An agent is a system where the model directs its own steps and tool use in a loop. A fixed sequence of LLM calls written in code is a workflow, and a single call is just a model call.',
        },
        {
          claim:
            'Agents are always better than workflows because they are more autonomous.',
          correction:
            'Autonomy costs latency, money and predictability, and errors can compound. Anthropic recommends the simplest approach that works: a workflow for well-defined steps, an agent only when the steps cannot be fixed in advance.',
        },
      ],
      questions: [
        {
          id: 'm01-generative-ai-llms-agents-q1',
          objective: 'm01-generative-ai-llms-agents-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt: 'Which of these is a discriminative model?',
          options: [
            {
              id: 'a',
              text: 'A model that writes product descriptions from a short list of facts',
              explanation:
                'Writing new text is producing content, so this is a generative model.',
            },
            {
              id: 'b',
              text: 'A model that creates new images of rooms from a text description',
              explanation:
                'Creating images is producing new examples, which is what generative models do.',
            },
            {
              id: 'c',
              text: 'A model that synthesizes a spoken voice reading a piece of text',
              explanation: 'Producing new audio is a generative task.',
            },
            {
              id: 'd',
              text: 'A model that labels each incoming support ticket as urgent or not',
              explanation:
                'Correct. It assigns a label to an input, which is the job of a discriminative model.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-generative-ai-llms-agents-q2',
          objective: 'm01-generative-ai-llms-agents-2',
          kind: 'recall',
          difficulty: 'easy',
          prompt: 'What is a GPT-style LLM trained to do during pretraining?',
          options: [
            {
              id: 'a',
              text: 'Answer questions using answers written by human experts',
              explanation:
                'Training on human-written demonstrations is part of instruction tuning, which comes after pretraining.',
            },
            {
              id: 'b',
              text: 'Predict the next token of text from the tokens before it',
              explanation:
                'Correct. Next-token prediction on large amounts of raw text is the pretraining objective.',
            },
            {
              id: 'c',
              text: 'Classify documents by topic using a set of labeled examples',
              explanation:
                'That is a supervised classification task, not the self-supervised pretraining objective of an LLM.',
            },
            {
              id: 'd',
              text: 'Retrieve the most relevant web page for each search query',
              explanation:
                'Retrieval is a different system. LLM pretraining learns to predict text, not to fetch pages.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-generative-ai-llms-agents-q3',
          objective: 'm01-generative-ai-llms-agents-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            'Why can an LLM produce an answer that is fluent and confident but false?',
          options: [
            {
              id: 'a',
              text: 'It is designed to insert random errors so that answers sound more human',
              explanation:
                'Errors are not deliberately inserted. They come from what the training objective rewards.',
            },
            {
              id: 'b',
              text: 'Its built-in fact database is out of date and needs to be refreshed',
              explanation:
                'An LLM has no built-in fact database. Its knowledge is stored as patterns in its weights.',
            },
            {
              id: 'c',
              text: 'It learned to produce likely text, and nothing in that checks the facts',
              explanation:
                'Correct. Likely-sounding text and true text often overlap, but the next-token objective does not verify truth.',
            },
            {
              id: 'd',
              text: 'Its vocabulary has too few tokens to spell out the correct facts',
              explanation:
                'Tokens can be combined to spell any text. Vocabulary size is not why answers are false.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-generative-ai-llms-agents-q4',
          objective: 'm01-generative-ai-llms-agents-3',
          kind: 'concept',
          difficulty: 'medium',
          prompt:
            "Using Anthropic's distinction, which of these systems is an agent rather than a workflow?",
          options: [
            {
              id: 'a',
              text: 'The model picks which tools to call and when it is done, based on results',
              explanation:
                'Correct. The model dynamically directs its own process and tool use, which defines an agent.',
            },
            {
              id: 'b',
              text: 'Code calls the model to summarize, then to translate, then files the output',
              explanation:
                'The steps are fixed in code, so this is a workflow even though it calls the model twice.',
            },
            {
              id: 'c',
              text: 'A classifier routes each message to one of three fixed handler prompts',
              explanation:
                'Routing to predefined paths is a workflow pattern. The paths are set by the developer.',
            },
            {
              id: 'd',
              text: 'A single model call answers a question using a long, detailed prompt',
              explanation:
                'One call with no tools and no loop is neither an agent nor a multi-step workflow.',
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-generative-ai-llms-agents-q5',
          objective: 'm01-generative-ai-llms-agents-1',
          kind: 'concept',
          difficulty: 'hard',
          prompt: 'Where do LLMs fit on the AI family tree?',
          options: [
            {
              id: 'a',
              text: 'Discriminative models, because each step predicts the most likely next token',
              explanation:
                'Predicting the next token assigns probabilities to sequences of text, which makes the model generative, not discriminative.',
            },
            {
              id: 'b',
              text: 'Symbolic AI systems, because they manipulate words according to grammar',
              explanation:
                'LLMs learn from data with neural networks. No one writes their grammar rules.',
            },
            {
              id: 'c',
              text: 'Generative models built with deep learning, using the Transformer architecture',
              explanation:
                'Correct. They generate text, they are multi-layer neural networks, and they are based on the Transformer.',
            },
            {
              id: 'd',
              text: 'Lookup systems outside machine learning, because they retrieve stored text',
              explanation:
                'LLMs do not retrieve stored answers. They are trained models that generate new text.',
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-generative-ai-llms-agents-q6',
          objective: 'm01-generative-ai-llms-agents-2',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            "An internal assistant answering questions about HR policy sometimes invents policies that don't exist. What is the most effective first fix?",
          options: [
            {
              id: 'a',
              text: 'Tell the model in its prompt to sound more certain when it answers',
              explanation:
                'Asking for confidence does not add knowledge. It can make wrong answers more convincing.',
            },
            {
              id: 'b',
              text: 'Give it the policy text, have it answer only from that, and allow "I don\'t know"',
              explanation:
                'Correct. Grounding the model in the source documents and allowing uncertainty are standard ways to reduce hallucination.',
            },
            {
              id: 'c',
              text: 'Raise the maximum number of output tokens so it can write fuller answers',
              explanation:
                'Longer answers do not make them more accurate. The model still has no access to the real policy.',
            },
            {
              id: 'd',
              text: 'Switch to a larger model and stop checking its answers against policy',
              explanation:
                'Any LLM can hallucinate, and a bigger one still has no access to your policy. Dropping verification makes the problem worse.',
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-generative-ai-llms-agents-q7',
          objective: 'm01-generative-ai-llms-agents-3',
          kind: 'application',
          difficulty: 'hard',
          prompt:
            'Your research agent sometimes keeps calling its search tool over and over without finishing. Which design change addresses this most directly?',
          options: [
            {
              id: 'a',
              text: 'Give the agent several more search tools so it has more ways to look',
              explanation:
                'More tools add more choices, which can make looping more likely rather than less.',
            },
            {
              id: 'b',
              text: 'Let it run until the model decides it is done, since agents are autonomous',
              explanation:
                'That is the behavior causing the problem. Agents still need limits set by your code.',
            },
            {
              id: 'c',
              text: 'Remove the loop and ask the model to answer from memory in a single call',
              explanation:
                "This removes the agent's ability to research at all and invites hallucination.",
            },
            {
              id: 'd',
              text: 'Add a stop condition, such as a cap on tool calls, enforced by your code',
              explanation:
                'Correct. Stopping conditions like a maximum number of iterations keep an agent loop under control.',
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-generative-ai-llms-agents-q8',
          objective: 'm01-generative-ai-llms-agents-3',
          kind: 'application',
          difficulty: 'medium',
          prompt:
            'Every night, new support tickets must be summarized in a fixed format and filed in the same tracker. The steps never change. What should you build?',
          options: [
            {
              id: 'a',
              text: 'A workflow: code runs the fixed steps and calls the model to summarize',
              explanation:
                'Correct. The steps are known in advance, so a predefined code path is simpler, cheaper and more predictable.',
            },
            {
              id: 'b',
              text: 'An agent that decides each night which steps to take and in what order',
              explanation:
                'Agents add value when steps cannot be fixed in advance. Here they only add cost and unpredictability.',
            },
            {
              id: 'c',
              text: 'A new model trained from scratch on past tickets and their summaries',
              explanation:
                'Training a model from scratch is far more effort than needed for a task an existing LLM can do in a fixed pipeline.',
            },
            {
              id: 'd',
              text: 'A chat interface where staff paste in each ticket by hand every morning',
              explanation:
                'This throws away the automation the task allows and adds manual work for no benefit.',
            },
          ],
          answer: 'a',
        },
      ],
      references: [
        {
          title: 'Background: What is a Generative Model?',
          publisher: 'Google for Developers',
          url: 'https://developers.google.com/machine-learning/gan/generative',
          kind: 'source',
        },
        {
          title: 'Introduction to Large Language Models',
          publisher: 'Google Machine Learning Crash Course',
          url: 'https://developers.google.com/machine-learning/crash-course/llm',
          kind: 'source',
        },
        {
          title: "LLMs: What's a large language model?",
          publisher: 'Google Machine Learning Crash Course',
          url: 'https://developers.google.com/machine-learning/crash-course/llm/transformers',
          kind: 'source',
        },
        {
          title: 'How do Transformers work?',
          publisher: 'Hugging Face LLM Course',
          url: 'https://huggingface.co/learn/llm-course/chapter1/4',
          kind: 'source',
        },
        {
          title: 'Attention Is All You Need',
          publisher: 'Vaswani et al., arXiv',
          url: 'https://arxiv.org/abs/1706.03762',
          kind: 'source',
        },
        {
          title:
            'Training language models to follow instructions with human feedback',
          publisher: 'Ouyang et al., arXiv',
          url: 'https://arxiv.org/abs/2203.02155',
          kind: 'source',
        },
        {
          title: 'Reduce hallucinations',
          publisher: 'Anthropic, Claude Docs',
          url: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations',
          kind: 'source',
        },
        {
          title: 'Building effective agents',
          publisher: 'Anthropic',
          url: 'https://www.anthropic.com/engineering/building-effective-agents',
          kind: 'source',
        },
        {
          title: 'How tool use works',
          publisher: 'Anthropic, Claude Docs',
          url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works',
          kind: 'source',
        },
        {
          title: 'Tool use with Claude',
          publisher: 'Anthropic, Claude Docs',
          url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview',
          kind: 'source',
        },
        {
          title: 'Byte-Pair Encoding tokenization',
          publisher: 'Hugging Face LLM Course',
          url: 'https://huggingface.co/learn/llm-course/chapter6/5',
          kind: 'further',
        },
      ],
      reviewedAt: '2026-10-28',
    },
  ],

  // --------------------------------------------------------------------
  // Exam
  // --------------------------------------------------------------------
  examQuestions: [
    {
      id: 'm01-ai-family-tree-x1',
      objective: 'm01-ai-ml-dl-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A startup says its product "uses AI" to draft contract clauses from a short description, and it is built on an LLM. Which description is most accurate?',
      options: [
        {
          id: 'a',
          text: 'A rule-based expert system, because contracts follow legal rules',
          explanation:
            'LLMs learn from data rather than following hand-written rules, so this places it in the wrong part of the tree.',
        },
        {
          id: 'b',
          text: "Generative deep learning, so ML's dependence on data and risk of error apply",
          explanation:
            "Correct. An LLM is a generative deep learning model, which is ML, so it inherits ML's limits and can hallucinate.",
        },
        {
          id: 'c',
          text: 'A discriminative classifier, because it picks the best clause type',
          explanation:
            'Drafting new clauses is producing content, which is generative, not discriminative.',
        },
        {
          id: 'd',
          text: 'Not machine learning, because users never train the model themselves',
          explanation:
            'The model was trained by its maker. Whether the end user trains it does not change what it is.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'm01-ai-family-tree-x2',
      objective: 'm01-neural-networks-intro-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'What is actually being learned when an LLM is pretrained?',
      options: [
        {
          id: 'a',
          text: 'A searchable database of facts, indexed by the tokens they contain',
          explanation:
            "Pretraining does not build a fact database. Knowledge ends up spread across the network's weights.",
        },
        {
          id: 'b',
          text: 'A set of grammar rules that engineers then check and approve',
          explanation:
            'No grammar rules are written or approved. The behavior emerges from learned parameters.',
        },
        {
          id: 'c',
          text: 'The weights and biases of a Transformer, tuned to reduce next-token loss',
          explanation:
            'Correct. Pretraining is the Lesson 2 training loop applied to a Transformer: adjust parameters to reduce the loss of predicting the next token.',
        },
        {
          id: 'd',
          text: 'A fixed list of tool calls the model should make for each type of goal',
          explanation:
            'Tool use is added in the surrounding system. Pretraining learns to predict text, not a tool plan.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'm01-ai-family-tree-x3',
      objective: 'm01-ai-ml-dl-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'Team A detects fraud by feeding ten hand-picked transaction features into logistic regression. Team B feeds raw transaction histories into a many-layered neural network. Which statement is correct?',
      options: [
        {
          id: 'a',
          text: "Both are ML, and Team B's network can learn its own features from raw data",
          explanation:
            "Correct. Both learn from data. Team B's deep network also learns intermediate representations instead of relying on hand-picked features.",
        },
        {
          id: 'b',
          text: 'Only Team B is doing ML, because logistic regression is a hand-written rule',
          explanation:
            'Logistic regression learns how much each feature matters from data, so Team A is doing ML too.',
        },
        {
          id: 'c',
          text: 'Team B needs no labeled examples, because deep networks label data themselves',
          explanation:
            'A fraud classifier still needs examples with known outcomes. Depth does not remove the need for training data.',
        },
        {
          id: 'd',
          text: 'Team A is not doing AI at all, because only neural networks count as AI',
          explanation:
            'AI includes classic ML and even rule-based systems. Neural networks are one inner ring.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'm01-ai-family-tree-x4',
      objective: 'm01-generative-ai-llms-agents-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A production agent makes a bad tool call. A teammate says, "It will learn from that and avoid it next time." What is the most accurate response?',
      options: [
        {
          id: 'a',
          text: "Right: each mistake is backpropagated into the model's weights straight away",
          explanation:
            'Backpropagation runs during training, not while the agent is serving requests.',
        },
        {
          id: 'b',
          text: 'Right: the agent loop retrains the model after every tool result it observes',
          explanation:
            'The loop feeds tool results back as context. It does not retrain the model.',
        },
        {
          id: 'c',
          text: 'Wrong: neural networks can never be changed once they have been deployed',
          explanation:
            'Overstated. A model can be retrained or fine-tuned later; it just does not happen automatically during use.',
        },
        {
          id: 'd',
          text: 'Wrong: weights are fixed in use, so change needs retraining, prompts or memory',
          explanation:
            'Correct. Inference does not change weights. Lasting improvement comes from retraining, or from changing the prompt, tools or stored memory around the model.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'm01-ai-family-tree-x5',
      objective: 'm01-ai-ml-dl-2',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        "Apply Mitchell's task T, performance P and experience E to LLM pretraining. Which mapping fits best?",
      options: [
        {
          id: 'a',
          text: 'T: follow user instructions; P: user ratings; E: chat logs from users',
          explanation:
            'This describes later instruction tuning or feedback, not the pretraining phase.',
        },
        {
          id: 'b',
          text: 'T: predict the next token; P: prediction loss on text; E: a large text corpus',
          explanation:
            'Correct. Pretraining improves next-token prediction, measured by loss, through exposure to a large body of text.',
        },
        {
          id: 'c',
          text: "T: call tools; P: number of steps taken; E: the tools' documentation",
          explanation:
            'Tool calling belongs to the agent system around the model, not to pretraining.',
        },
        {
          id: 'd',
          text: 'T: store facts; P: database size; E: encyclopedias loaded into memory',
          explanation:
            'LLMs are not trained to store facts in a database, and size is not a performance measure.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'm01-ai-family-tree-x6',
      objective: 'm01-neural-networks-intro-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'Why are LLMs classified as deep learning?',
      options: [
        {
          id: 'a',
          text: 'They are neural networks with many stacked layers of learned parameters',
          explanation:
            'Correct. Transformers stack many layers, and "deep" refers to that depth of composed transformations.',
        },
        {
          id: 'b',
          text: 'They are trained on such a deep pool of data from across the internet',
          explanation:
            'Dataset size is not what "deep" means. Depth refers to the number of layers.',
        },
        {
          id: 'c',
          text: 'They understand language at a deeper level than earlier software did',
          explanation:
            '"Deep" is a structural term about layers, not a claim about understanding.',
        },
        {
          id: 'd',
          text: 'They can act as agents that take many steps toward a complex goal',
          explanation:
            'Agent behavior comes from the loop around the model. A single-call LLM is still deep learning.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'm01-ai-family-tree-x7',
      objective: 'm01-generative-ai-llms-agents-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'Expense reports under $50 with a receipt are auto-approved; everything else goes to a manager. Receipts arrive as photos and messy PDFs. What is the best design?',
      options: [
        {
          id: 'a',
          text: 'An LLM agent that decides approvals end to end, since it is the most capable',
          explanation:
            'The approval rule is clear and stable. Handing it to an agent adds cost and the risk of wrong decisions for no benefit.',
        },
        {
          id: 'b',
          text: 'Train a deep network on past approvals so it learns the $50 rule itself',
          explanation:
            'Learning a rule you can write down adds error. A model might learn it imperfectly from past data.',
        },
        {
          id: 'c',
          text: 'Code the approval rule; use a model only to read amounts off the receipts',
          explanation:
            'Correct. Use plain code where rules are clear, and learning where they are not, such as extracting data from messy images.',
        },
        {
          id: 'd',
          text: 'Avoid AI entirely and have staff type every receipt amount in by hand',
          explanation:
            'Reading messy receipts is exactly where learned models help. Ruling them out adds manual work.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'm01-ai-family-tree-x8',
      objective: 'm01-generative-ai-llms-agents-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        "Gradient descent steadily lowers an LLM's next-token loss during pretraining. Why doesn't that guarantee its answers will be true?",
      options: [
        {
          id: 'a',
          text: 'Gradient descent stops working once a network has billions of parameters',
          explanation:
            'Gradient descent is exactly how large networks are trained. Its success is not the issue.',
        },
        {
          id: 'b',
          text: 'The training text contains no true statements for the model to learn from',
          explanation:
            'Training text contains many true statements, which is why LLMs are often right.',
        },
        {
          id: 'c',
          text: 'Transformer networks have no way to represent facts in their weights',
          explanation:
            'Models clearly capture many facts in their weights. The problem is that nothing checks which outputs are true.',
        },
        {
          id: 'd',
          text: 'Lower loss means more likely text, which overlaps with truth but is not the same',
          explanation:
            'Correct. The objective rewards plausible continuations. Plausible and true often coincide, but not always, so hallucination remains.',
        },
      ],
      answer: 'd',
    },
  ],
}
