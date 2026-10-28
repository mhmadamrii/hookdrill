import type { Submodule } from '../../types'

const REVIEWED_AT = '2026-10-28'

export const whatAiIs: Submodule = {
  slug: 'what-ai-is',
  title: 'What AI is',
  summary: `What the word "AI" actually refers to, the two big traditions behind it, and how to decide whether a problem needs AI at all or is better solved with ordinary code.`,
  lessons: [
    // ---------------------------------------------------------------------
    // Lesson 1
    // ---------------------------------------------------------------------
    {
      slug: 'what-is-ai',
      title: 'What is AI, and what problems does it solve?',
      summary: `A working definition of AI as the study of agents that perceive and act toward goals, where the term came from, the difference between narrow and general AI, and the four kinds of problems AI systems are built for.`,
      minutes: 12,
      label: 'foundational',
      objectives: [
        {
          id: 'm01-what-is-ai-1',
          text: `define AI using the rational-agent framing and explain where the term came from`,
        },
        {
          id: 'm01-what-is-ai-2',
          text: `distinguish narrow AI from general AI and judge claims about a system's generality`,
        },
        {
          id: 'm01-what-is-ai-3',
          text: `classify a real problem as perception, prediction or classification, generation, or decision-making and planning`,
        },
      ],
      concept: [
        {
          heading: 'Intuition: software that chooses what to do',
          blocks: [
            {
              type: 'text',
              md: `Most code you write maps inputs to outputs in a way you specified exactly: if the cart total is over 50, shipping is free. An AI system is still software, but it is built to handle situations where you could not spell out every case in advance. It takes in some view of the world, such as pixels, sound, text or a game board, and produces an output or an action that serves a goal: the right label, a useful reply, a good next move.

Because "AI" is used loosely in marketing, it helps to anchor on how the field itself defines it before looking at what it can do.`,
            },
          ],
        },
        {
          heading: 'Definitions and origin of the term',
          blocks: [
            {
              type: 'text',
              md: `There is no single agreed definition. A widely used way to organize the options, from Russell and Norvig's textbook *Artificial Intelligence: A Modern Approach*, sorts definitions along two axes: whether the target is **human-like** behavior or **ideal (rational)** behavior, and whether we care about **thinking** or **acting**. That gives four goals: systems that think like humans, think rationally, act like humans, or act rationally.

Russell and Norvig themselves take the **acting rationally** view. AI is the study of **agents**: things that perceive their environment and act on it. A **rational agent** chooses actions that are expected to best achieve its goals, given what it has perceived. This framing is useful for engineers because it judges a system by its behavior against a goal, not by whether it resembles a human mind or uses any particular technique.

The older "acting humanly" view goes back to Alan Turing's 1950 paper *Computing Machinery and Intelligence*, which replaced the question "Can machines think?" with a test: can a machine's conversation be told apart from a person's?

The name of the field comes from a proposal dated August 31, 1955, written by John McCarthy, Marvin Minsky, Nathaniel Rochester and Claude Shannon, for a two-month summer research project at Dartmouth College in 1956. The proposal rested on the conjecture that every aspect of learning or intelligence could in principle be described precisely enough for a machine to simulate it. That 1956 workshop is generally treated as the founding event of AI as a field.`,
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Agent',
                  definition: `Anything that perceives its environment through inputs (percepts) and acts on it through outputs (actions).`,
                },
                {
                  term: 'Rational agent',
                  definition: `An agent that selects the action expected to best achieve its goals, given what it has perceived so far.`,
                },
                {
                  term: 'Turing test (imitation game)',
                  definition: `Turing's 1950 proposal to judge machine intelligence by whether its conversation can be distinguished from a human's.`,
                },
                {
                  term: 'Narrow AI',
                  definition: `A system built for a specific task or set of tasks, such as speech recognition or playing chess. By most researchers' definitions, every AI system deployed today is narrow in this sense.`,
                },
                {
                  term: 'Artificial general intelligence (AGI)',
                  definition: `A hypothetical system that would match or exceed human ability across a broad range of tasks. It remains theoretical.`,
                },
              ],
            },
          ],
        },
        {
          heading: 'Narrow AI and general AI',
          blocks: [
            {
              type: 'text',
              md: `**Narrow AI** (sometimes called weak AI) is built for a particular task or family of tasks. A narrow system can be far better than any human at its task and still be useless outside it. IBM's Deep Blue beat world chess champion Garry Kasparov in 1997, and it could do nothing except play chess.

**General AI**, or **artificial general intelligence (AGI)**, would match or exceed humans across a wide range of tasks, including ones it was not specifically built for. No existing system meets that bar; it is a research goal, not a product category.

Modern large language models blur the intuition because one model can draft emails, summarize documents and write code. That breadth is real and useful, but it is still breadth within tasks that can be expressed as text in and text out, with well-documented failures. When a vendor calls something "general," the engineering question is not the label but whether it works reliably on **your** task, measured on **your** data.`,
            },
            {
              type: 'note',
              md: `Rule of thumb: generality is about the **range of tasks** a system can handle, not about which technique it uses, how fast it is, or how human it sounds.`,
            },
          ],
        },
        {
          heading: 'Four kinds of problems AI handles',
          blocks: [
            {
              type: 'text',
              md: `It helps to sort AI problems by what the system has to produce. Real products usually chain several of these together.

- **Perception**: turning raw sensor data into structured information. Recognizing speech, reading text in a photo, detecting a pedestrian in a camera frame.
- **Prediction and classification**: estimating an unknown value or category from known inputs. Is this email spam? How likely is this transaction to be fraud? How many units will sell next week?
- **Generation**: producing new content such as text, images, audio or code. Drafting a reply, writing a summary, creating an image from a description.
- **Decision-making and planning**: choosing an action, or a sequence of actions, to reach a goal. Picking a chess move, ordering delivery stops, deciding whether to block a payment given a fraud score.

The categories overlap at the edges: classification is a kind of prediction, and a perception system often ends in a classification. The point of the list is to ask a sharper question than "can AI do this?": **what exactly must the system output, and how will that output be used?**`,
            },
            {
              type: 'example',
              title: 'Decomposing a photo-sharing app',
              md: `This is our own illustration, not a description of any specific product.

A user uploads a photo. The app:

1. **Perceives** the image: detects faces and reads any visible text.
2. **Classifies** it: predicts whether it violates the content policy.
3. **Generates** a suggested caption and alt text for accessibility.
4. **Decides** what to do: publish it, hold it for human review, or block it, based on the classifier's score and the cost of each kind of mistake.

Each step can fail differently. A perception error (a missed face) and a decision error (blocking a harmless photo) need different fixes, which is why naming the problem type matters.`,
            },
          ],
        },
      ],
      application: {
        heading: 'In a real system: a voice assistant request',
        blocks: [
          {
            type: 'text',
            md: `A request such as "remind me to call the dentist tomorrow at nine" passes through several AI problem types in sequence. Speech recognition (**perception**) turns audio into text. A model works out what the user wants and which details matter (**classification** of intent and extraction of the time and task). The system **decides** which action to take, here creating a reminder, and may **generate** a spoken confirmation.

Limitations follow from this structure:

- **Errors compound.** If speech recognition mishears "nine" as "five," every later step can work perfectly and still produce the wrong reminder.
- **It is narrow.** The assistant handles the requests its designers anticipated or that its models generalize to; it is not a general problem-solver.
- **Rational is relative to the goal you encode.** If the system's objective is to complete requests quickly, it may act without confirming when it should ask. Choosing the goal is a design decision, not something the AI works out for itself.`,
          },
        ],
      },
      misconceptions: [
        {
          claim: `AI means building machines that think the way humans do.`,
          correction: `That is only one of several definitions. The dominant engineering view, from Russell and Norvig, defines AI as building agents that act rationally toward goals. A chess engine or route planner can be very effective without resembling human thought at all.`,
        },
        {
          claim: `A chatbot that can write, summarize and answer trivia is general AI.`,
          correction: `Breadth across text tasks is not the same as general intelligence. AGI would handle a wide range of tasks at or above human level, and by most definitions it remains theoretical. By that standard, today's systems are still narrow AI and should be evaluated on the specific task you need.`,
        },
        {
          claim: `AI and machine learning are the same thing.`,
          correction: `Machine learning is one approach within AI. Search, logic, planning and rule-based expert systems are also AI. Deep Blue, for example, relied heavily on searching enormous numbers of chess positions rather than on learning from data.`,
        },
      ],
      questions: [
        {
          id: 'm01-what-is-ai-q1',
          objective: 'm01-what-is-ai-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt: `Under the "acting rationally" definition of AI used by Russell and Norvig, what is an AI system primarily judged on?`,
          options: [
            {
              id: 'a',
              text: `Whether its internal reasoning resembles the way a human would think`,
              explanation: `That is the "thinking humanly" goal, one of the other quadrants. The rational-agent view cares about the quality of actions, not resemblance to human cognition.`,
            },
            {
              id: 'b',
              text: `Whether it takes the actions expected to best achieve its goals given what it perceives`,
              explanation: `Correct. A rational agent is judged by how well its actions serve its goals, given its percepts.`,
            },
            {
              id: 'c',
              text: `Whether a human judge can tell its conversation apart from a person's`,
              explanation: `That is Turing's imitation game, which belongs to the "acting humanly" view, not the "acting rationally" view.`,
            },
            {
              id: 'd',
              text: `Whether it learned its behavior from data instead of following written rules`,
              explanation: `The definition is about behavior, not technique. A rule-based or search-based agent can be perfectly rational.`,
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-what-is-ai-q2',
          objective: 'm01-what-is-ai-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt: `The term "artificial intelligence" comes from a proposal for which event?`,
          options: [
            {
              id: 'a',
              text: `The publication of Turing's paper "Computing Machinery and Intelligence"`,
              explanation: `Turing's 1950 paper asked whether machines can think and proposed the imitation game, but the field's name came from a later proposal.`,
            },
            {
              id: 'b',
              text: `A 1980s industry conference on commercial expert systems`,
              explanation: `By the 1980s the field had been named for about 25 years; expert systems were a later wave within it.`,
            },
            {
              id: 'c',
              text: `The 1986 publication of the backpropagation paper in Nature`,
              explanation: `The backpropagation paper came three decades after the field was named and concerned training neural networks.`,
            },
            {
              id: 'd',
              text: `A summer research project at Dartmouth College held in 1956`,
              explanation: `Correct. McCarthy, Minsky, Rochester and Shannon proposed the project in 1955 under the name "artificial intelligence," and it ran in 1956.`,
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-what-is-ai-q3',
          objective: 'm01-what-is-ai-1',
          kind: 'concept',
          difficulty: 'medium',
          prompt: `A thermostat reads a temperature sensor and switches the heating on below 19°C and off above 21°C. Viewed through the agent framing, which statement is most accurate?`,
          options: [
            {
              id: 'a',
              text: `It is a very simple agent: it perceives and acts toward a goal, though with fixed, narrow behavior`,
              explanation: `Correct. It maps percepts (temperature) to actions (heating on or off) in service of a goal. The agent framing covers simple systems; what varies is how capable the agent is.`,
            },
            {
              id: 'b',
              text: `It cannot be an agent at all, because it never learns anything from data`,
              explanation: `Learning is not part of the definition of an agent. Many agents follow fixed rules.`,
            },
            {
              id: 'c',
              text: `It counts as general AI because it operates without any human input`,
              explanation: `Autonomy is not generality. General AI means competence across a wide range of tasks; the thermostat does exactly one.`,
            },
            {
              id: 'd',
              text: `It is not an agent, because agents must understand and produce natural language`,
              explanation: `Agents can perceive and act through any inputs and outputs: sensors, motors, game moves, API calls. Language is not required.`,
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-what-is-ai-q4',
          objective: 'm01-what-is-ai-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt: `Which statement best captures the difference between narrow AI and general AI?`,
          options: [
            {
              id: 'a',
              text: `Narrow AI is built from hand-written rules; general AI is built from neural networks`,
              explanation: `The distinction is about the range of tasks, not the technique. Neural networks are used to build narrow systems all the time.`,
            },
            {
              id: 'b',
              text: `Narrow AI runs on a single device; general AI runs across large cloud clusters`,
              explanation: `Where a system runs says nothing about how many kinds of task it can handle.`,
            },
            {
              id: 'c',
              text: `Narrow AI targets specific tasks; general AI would match humans across many, and does not exist yet`,
              explanation: `Correct. Narrowness is about task scope, and AGI remains a theoretical goal.`,
            },
            {
              id: 'd',
              text: `Narrow AI performs below human level; general AI performs above human level`,
              explanation: `Narrow systems can be superhuman at their task, as Deep Blue was at chess in 1997, while remaining narrow.`,
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-what-is-ai-q5',
          objective: 'm01-what-is-ai-2',
          kind: 'application',
          difficulty: 'hard',
          prompt: `A vendor says its chatbot is "general AI" because it can write emails, summarize contracts and answer trivia. You are deciding whether to use it to triage legal documents. What is the most sound response?`,
          options: [
            {
              id: 'a',
              text: `Accept the claim, since any system with several distinct skills qualifies as general AI`,
              explanation: `Several text skills do not amount to human-level competence across a wide range of tasks. The claim does not hold, and it would not tell you about your task anyway.`,
            },
            {
              id: 'b',
              text: `Reject the product, since chatbots are only scripted rules and cannot count as AI`,
              explanation: `Modern chatbots are built on learned language models, and rule-based systems can also be AI. This dismisses the tool for the wrong reason.`,
            },
            {
              id: 'c',
              text: `Treat the label as irrelevant and test it on a sample of your own legal documents`,
              explanation: `Correct. The breadth is real but is not general intelligence, and what matters is measured performance on your specific task and data.`,
            },
            {
              id: 'd',
              text: `Accept the claim only if the chatbot can pass a Turing-style conversation test`,
              explanation: `Passing an imitation test measures human-like conversation, not competence at legal triage or general intelligence across tasks.`,
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-what-is-ai-q6',
          objective: 'm01-what-is-ai-3',
          kind: 'application',
          difficulty: 'easy',
          prompt: `A warehouse system takes camera images of parcels and turns the printed shipping labels into address text. Which kind of AI problem is this mainly?`,
          options: [
            {
              id: 'a',
              text: `Perception: turning raw sensor data into structured information`,
              explanation: `Correct. Reading text from images converts pixels into structured data, which is a perception task.`,
            },
            {
              id: 'b',
              text: `Generation: producing new content that did not exist before`,
              explanation: `The address already exists on the label; the system extracts it rather than creating new content.`,
            },
            {
              id: 'c',
              text: `Planning: choosing a sequence of actions to reach a goal`,
              explanation: `No sequence of actions is being chosen. Routing the parcel afterward might be planning, but reading the label is not.`,
            },
            {
              id: 'd',
              text: `Forecasting: estimating a future value from historical records`,
              explanation: `Nothing about the future is being estimated; the task is reading what is already in the image.`,
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-what-is-ai-q7',
          objective: 'm01-what-is-ai-3',
          kind: 'application',
          difficulty: 'medium',
          prompt: `A courier company wants software that decides the order in which a driver visits 30 stops so that total driving time is as low as possible. Which kind of problem is this?`,
          options: [
            {
              id: 'a',
              text: `Generation, because the software produces a new route that did not exist`,
              explanation: `"Generation" refers to producing content such as text or images. Choosing an ordering of actions to meet a goal is planning.`,
            },
            {
              id: 'b',
              text: `Perception, because the software has to understand the map of the city`,
              explanation: `The stops and road network are already structured data. The core task is choosing actions, not interpreting raw sensor input.`,
            },
            {
              id: 'c',
              text: `Classification, because each stop must be assigned a position label`,
              explanation: `Positions are not independent labels; each choice affects the others and the total cost. That interdependence is what makes it planning.`,
            },
            {
              id: 'd',
              text: `Decision-making and planning, because it chooses a sequence of actions for a goal`,
              explanation: `Correct. Finding a visit order that minimizes total time is a classic planning and search problem.`,
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-what-is-ai-q8',
          objective: 'm01-what-is-ai-3',
          kind: 'concept',
          difficulty: 'hard',
          prompt: `A bank's system has two parts. Part one estimates the probability that a card payment is fraudulent. Part two uses that estimate to allow the payment, block it, or send a verification text. Which description is most accurate?`,
          options: [
            {
              id: 'a',
              text: `Both parts are prediction problems, since both deal with uncertain fraud outcomes`,
              explanation: `Part two does not estimate anything new; it chooses an action. Treating it as prediction hides the costs and trade-offs the decision must weigh.`,
            },
            {
              id: 'b',
              text: `Part one is prediction; part two is a decision that weighs that estimate against action costs`,
              explanation: `Correct. A score is not a decision. Choosing an action means weighing the estimate against the cost of blocking a good customer versus letting fraud through.`,
            },
            {
              id: 'c',
              text: `Part one is generation, because it produces a number that did not exist before`,
              explanation: `Outputting an estimate is prediction. Generation refers to creating content such as text, images or audio.`,
            },
            {
              id: 'd',
              text: `The whole system is perception, because it processes incoming payment data`,
              explanation: `Payment records are already structured data. Perception means interpreting raw sensor input such as images or audio.`,
            },
          ],
          answer: 'b',
        },
      ],
      references: [
        {
          title:
            'Artificial Intelligence (Stanford Encyclopedia of Philosophy)',
          publisher: 'Stanford University',
          url: 'https://plato.stanford.edu/entries/artificial-intelligence/',
          kind: 'source',
        },
        {
          title:
            'A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence',
          publisher: 'John McCarthy, Stanford University (archived copy)',
          url: 'https://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html',
          kind: 'source',
        },
        {
          title: 'Computing Machinery and Intelligence (Turing, 1950)',
          publisher: 'Mind, Oxford University Press',
          url: 'https://academic.oup.com/mind/article/LIX/236/433/986238',
          kind: 'source',
        },
        {
          title: 'What is artificial intelligence (AI)?',
          publisher: 'IBM',
          url: 'https://www.ibm.com/think/topics/artificial-intelligence',
          kind: 'source',
        },
        {
          title: 'Deep Blue',
          publisher: 'IBM History',
          url: 'https://www.ibm.com/history/deep-blue',
          kind: 'source',
        },
        {
          title: 'Artificial Intelligence: A Modern Approach, 4th edition',
          publisher: 'Stuart Russell and Peter Norvig, UC Berkeley',
          url: 'https://aima.cs.berkeley.edu/',
          kind: 'further',
        },
        {
          title: 'Artificial Intelligence (AI) Coined at Dartmouth',
          publisher: 'Dartmouth College',
          url: 'https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth',
          kind: 'further',
        },
      ],
      reviewedAt: REVIEWED_AT,
    },

    // ---------------------------------------------------------------------
    // Lesson 2
    // ---------------------------------------------------------------------
    {
      slug: 'symbolic-and-statistical-ai',
      title: 'Symbolic AI, statistical learning, and how they relate',
      summary: `The two main ways knowledge gets into an AI system, written down by people as rules and search procedures, or learned from examples, along with what each is good and bad at, why the field shifted toward learning, and why modern systems combine both.`,
      minutes: 14,
      label: 'foundational',
      objectives: [
        {
          id: 'm01-symbolic-and-statistical-ai-1',
          text: `contrast symbolic AI and statistical learning by how knowledge gets into the system`,
        },
        {
          id: 'm01-symbolic-and-statistical-ai-2',
          text: `predict the typical strengths and failure modes of a rule-based system and a learned model`,
        },
        {
          id: 'm01-symbolic-and-statistical-ai-3',
          text: `explain why the field shifted toward learning and design a hybrid that uses each approach where it is strongest`,
        },
      ],
      concept: [
        {
          heading: 'Intuition: two ways to get knowledge into a program',
          blocks: [
            {
              type: 'text',
              md: `Imagine teaching a new colleague to spot fraudulent invoices. You could hand them a rulebook: "flag any invoice over 10,000 from a supplier added this month." Or you could show them a thousand past invoices, each marked fraud or not, and let them work out the patterns.

AI has followed both paths. **Symbolic AI** writes knowledge down explicitly as rules, logic and search procedures. **Statistical learning**, usually called **machine learning**, infers patterns from examples. The diagram contrasts the two.`,
            },
            {
              type: 'figure',
              figure: 'rules-vs-learning',
              caption: `Traditional programming: people write the rules, the program applies them to data, and answers come out. Machine learning: data and the expected answers go into training, which produces a model; new data then goes into the model, which produces predictions.`,
            },
            {
              type: 'text',
              md: `In the top path, you are the source of the rules. In the bottom path, the rules are implicit in a model's learned parameters, and you supply examples of correct behavior instead. That single difference explains most of the trade-offs below.`,
            },
          ],
        },
        {
          heading: 'Symbolic AI: rules, logic and search',
          blocks: [
            {
              type: 'text',
              md: `Symbolic AI represents knowledge as explicit symbols and manipulates them with rules. Its main tools are:

- **Logic and rules**: facts plus "if this, then that" statements, combined by an **inference engine** to reach conclusions.
- **Search**: exploring possible states or moves to find one that meets a goal, such as a chess move or a route.
- **Expert systems**: a **knowledge base** of rules gathered from human specialists, plus an inference engine that applies them. In the 1980s these moved from research into industry; a well-documented example is XCON (originally R1), which Digital Equipment Corporation used to configure its computer systems.

Deep Blue, which beat Garry Kasparov in a six-game match in May 1997, is a landmark of the search tradition. IBM describes it as relying on brute-force computing power, evaluating about 200 million chess positions per second.

**Strengths.** Behavior is explicit, so you can read, test and audit every rule. It needs no training data. When the rules are correct, it is exact and consistent.

**Failure modes.** It is **brittle**: inputs that the rule authors did not anticipate fall through the cracks or trigger confident wrong answers. Writing the rules depends on experts being able to state what they know, which is slow and often impossible for perceptual skills such as recognizing a face. As rule sets grow, rules interact in ways that become hard to maintain.`,
            },
          ],
        },
        {
          heading: 'Statistical learning: patterns from data',
          blocks: [
            {
              type: 'text',
              md: `Machine learning trains a piece of software, called a **model**, to make predictions or generate content from data. Instead of programming the rule, you supply examples and a training procedure adjusts the model's **parameters** until its outputs match the examples well. Common families include:

- **Supervised learning**: learn from examples labeled with the correct answer (emails marked spam or not).
- **Unsupervised learning**: find structure in unlabeled data, such as clusters of similar customers.
- **Reinforcement learning**: learn which actions earn rewards in an environment.
- **Generative models**: learn the patterns in existing data well enough to produce new text, images or audio.

**Strengths.** It handles tasks people do well but cannot write rules for, such as recognizing speech or objects. It can improve as more data arrives and can be retrained when the world changes.

**Failure modes.** It is only as good as its data: missing, biased or mislabeled examples become missing, biased or wrong behavior. When real inputs drift away from the training data (**distribution shift**), accuracy can drop without any warning. Errors are statistical, so the system is right most of the time rather than guaranteed right. Its reasoning lives in millions or billions of numbers, so it is hard to explain why it produced a specific output. Generative language models can produce fluent text that is false; OpenAI's own launch post for ChatGPT noted it "sometimes writes plausible-sounding but incorrect or nonsensical answers."`,
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Symbolic AI',
                  definition: `AI that represents knowledge as explicit symbols, rules and logic, and solves problems by inference or search.`,
                },
                {
                  term: 'Expert system',
                  definition: `A symbolic system with a knowledge base of rules gathered from human experts and an inference engine that applies them.`,
                },
                {
                  term: 'Model',
                  definition: `The software artifact produced by training. It maps inputs to predictions or generated content using learned parameters.`,
                },
                {
                  term: 'Training',
                  definition: `The process of adjusting a model's parameters so its outputs match the examples in a dataset.`,
                },
                {
                  term: 'Brittleness',
                  definition: `Failing badly on inputs slightly outside what the system was designed for, typical of hand-written rules.`,
                },
                {
                  term: 'Distribution shift',
                  definition: `A change in real-world inputs relative to the training data, which can quietly reduce a learned model's accuracy.`,
                },
              ],
            },
          ],
        },
        {
          heading: 'Why the field shifted, and how the two meet today',
          blocks: [
            {
              type: 'figure',
              figure: 'ai-timeline',
              caption: `Milestones: 1950, Turing publishes "Computing Machinery and Intelligence"; 1956, the Dartmouth workshop names the field; 1980s, the expert systems boom; 1986, backpropagation popularized by Rumelhart, Hinton and Williams; 1997, Deep Blue beats Kasparov; 2012, AlexNet wins ImageNet; 2017, the Transformer paper "Attention Is All You Need"; 2022, ChatGPT is released.`,
            },
            {
              type: 'text',
              md: `Both traditions are old. Neural network learning got its widely adopted training method, backpropagation, when Rumelhart, Hinton and Williams popularized it in "Learning representations by back-propagating errors" (Nature, 1986); the underlying idea had earlier roots. Symbolic approaches dominated much of the field's early history, and in the 1980s rule-based expert systems were deployed commercially.

The balance tipped decisively toward learning once large datasets and fast hardware made big models practical. In 2012, AlexNet, a deep convolutional network by Krizhevsky, Sutskever and Hinton trained on GPUs, won the ImageNet image classification challenge with a top-5 error of 15.3%, against 26.2% for the runner-up. In 2017, the Transformer architecture, introduced in "Attention Is All You Need," dropped recurrence in favor of attention and trained more efficiently in parallel. It became the basis of today's large language models. ChatGPT, released by OpenAI on November 30, 2022, brought those models to a mass audience.

The lesson is not that rules lost. Tasks where the rules can be written down, such as arithmetic, tax tables, access control and database queries, are still best done by deterministic code. Modern systems are often **hybrids**: a learned model handles the messy, perceptual or linguistic part, and hands the exact part to symbolic tools. A language model that recognizes a math question and calls a calculator, or that extracts details from a message and passes them to a rules engine, is a hybrid. Research such as Toolformer (2023) trained language models to decide when to call tools such as a calculator, a search engine and a calendar.`,
            },
            {
              type: 'example',
              title: 'A hybrid expense assistant',
              md: `Our own teaching example.

An employee types: "Taxi from the airport to the client office, 42 euros, last Tuesday."

- A **language model** extracts structured fields: category taxi, amount 42, currency EUR, date.
- A **deterministic converter** turns 42 EUR into the company currency using the official rate for that date.
- A **rules engine** checks policy: taxi claims over a set limit need a receipt; airport trips are allowed.
- The language model **writes the reply** explaining the result.

The model does what rules are bad at (understanding free text). The code does what models are bad at (exact arithmetic and auditable policy).`,
            },
          ],
        },
      ],
      application: {
        heading: 'In a real system: an LLM assistant with tools',
        blocks: [
          {
            type: 'text',
            md: `Current LLM platforms let developers declare **tools** (functions with typed parameters) that the model can ask to call. A support assistant might have tools such as \`getOrder(orderId)\` and \`calculateRefund(orderId, reason)\`. The model reads the customer's message, decides which tool to call with which arguments, and your code runs the tool and returns the result. Refund amounts come from your deterministic code, not from the model's guess.

Limitations remain:

- The model can still **choose the wrong tool or pass wrong arguments**, for example misreading an order number. Validate arguments in code and ask the user to confirm consequential actions.
- The model can **misreport a correct tool result** when writing its reply. For anything that matters, show the tool's output directly or check the reply against it.
- The deterministic part is only as good as its rules. A hybrid inherits **both** failure modes: brittle rules and statistical model errors.`,
          },
        ],
      },
      misconceptions: [
        {
          claim: `Symbolic AI is obsolete; everything is done with neural networks now.`,
          correction: `Search, logic and rules still run in production wherever the rules can be stated exactly, and modern LLM systems routinely call deterministic tools. The field shifted its emphasis, it did not discard the symbolic tradition.`,
        },
        {
          claim: `A learned model is always more accurate than hand-written rules, because it finds patterns humans miss.`,
          correction: `A model is only as good as its data and can fail silently under distribution shift. For problems with a clear, known rule, such as a tax rate table, a few lines of code are exact, while a model would only approximate them.`,
        },
        {
          claim: `Deep learning was invented in 2012.`,
          correction: `Neural networks and their training methods are much older; backpropagation was popularized in 1986. What 2012 brought was a landmark result, AlexNet's ImageNet win, showing that large networks trained on GPUs with lots of data could beat other approaches by a wide margin.`,
        },
      ],
      questions: [
        {
          id: 'm01-symbolic-and-statistical-ai-q1',
          objective: 'm01-symbolic-and-statistical-ai-1',
          kind: 'recall',
          difficulty: 'easy',
          prompt: `In the machine-learning path of the lesson's diagram (learning from labeled examples), what goes into the training process, and what comes out?`,
          options: [
            {
              id: 'a',
              text: `Hand-written rules and data go in; answers come out`,
              explanation: `That describes traditional programming, where people supply the rules.`,
            },
            {
              id: 'b',
              text: `A trained model and new data go in; predictions come out`,
              explanation: `That is using a model after training (inference), not training itself.`,
            },
            {
              id: 'c',
              text: `Data and the expected answers go in; a model comes out`,
              explanation: `Correct. Training uses examples paired with correct answers to produce a model, which is then applied to new data.`,
            },
            {
              id: 'd',
              text: `Expected answers alone go in; readable rules come out`,
              explanation: `Training needs the inputs as well as the answers, and the result is a set of learned parameters, not human-readable rules.`,
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-symbolic-and-statistical-ai-q2',
          objective: 'm01-symbolic-and-statistical-ai-3',
          kind: 'recall',
          difficulty: 'easy',
          prompt: `Which publication introduced the Transformer architecture that underlies today's large language models?`,
          options: [
            {
              id: 'a',
              text: `"Attention Is All You Need" (2017)`,
              explanation: `Correct. Vaswani and colleagues introduced the Transformer, built on attention without recurrence or convolutions.`,
            },
            {
              id: 'b',
              text: `"Learning representations by back-propagating errors" (1986)`,
              explanation: `This 1986 paper popularized backpropagation for training neural networks; it predates the Transformer by three decades.`,
            },
            {
              id: 'c',
              text: `"ImageNet Classification with Deep Convolutional Neural Networks" (2012)`,
              explanation: `This is the AlexNet paper, a convolutional network for images, not the Transformer.`,
            },
            {
              id: 'd',
              text: `"Computing Machinery and Intelligence" (1950)`,
              explanation: `Turing's paper proposed the imitation game; it describes no neural architecture.`,
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-symbolic-and-statistical-ai-q3',
          objective: 'm01-symbolic-and-statistical-ai-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt: `A rule-based system diagnoses faults in industrial pumps. It works well on known pump models, but when a new model with a different sensor layout is installed, it produces confident wrong diagnoses. Which failure mode is this?`,
          options: [
            {
              id: 'a',
              text: `Overfitting, because it memorized noise in its training labels`,
              explanation: `A rule-based system has no training labels to overfit. Its knowledge was written by people.`,
            },
            {
              id: 'b',
              text: `Hallucination, because it predicts the most likely next word`,
              explanation: `Hallucination describes generative language models. This system applies fixed rules, it does not predict words.`,
            },
            {
              id: 'c',
              text: `Insufficient compute, because the search space grew too large`,
              explanation: `Nothing suggests a performance limit. The rules simply do not describe the new sensor layout.`,
            },
            {
              id: 'd',
              text: `Brittleness, because the rules only cover situations their authors foresaw`,
              explanation: `Correct. Inputs outside what the rule authors anticipated are a classic weakness of symbolic systems.`,
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-symbolic-and-statistical-ai-q4',
          objective: 'm01-symbolic-and-statistical-ai-1',
          kind: 'concept',
          difficulty: 'medium',
          prompt: `Which task is better suited to learning from data than to hand-written rules, and for the right reason?`,
          options: [
            {
              id: 'a',
              text: `Computing sales tax from a published rate table, because the table is a form of data`,
              explanation: `The rate table is an exact, known rule. A lookup in code is exact; a model would only approximate it.`,
            },
            {
              id: 'b',
              text: `Recognizing handwritten digits, because people can do it but cannot write rules for every style`,
              explanation: `Correct. The skill is easy for humans but hard to state as rules, and labeled examples are easy to collect, which is exactly where learning helps.`,
            },
            {
              id: 'c',
              text: `Sorting invoices by date, because ordering many records requires recognizing patterns`,
              explanation: `Sorting is a precisely defined algorithm. There is nothing to learn.`,
            },
            {
              id: 'd',
              text: `Checking passwords have 12 or more characters, because users type passwords in many styles`,
              explanation: `A length check is a single exact rule, regardless of what users type.`,
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-symbolic-and-statistical-ai-q5',
          objective: 'm01-symbolic-and-statistical-ai-2',
          kind: 'concept',
          difficulty: 'hard',
          prompt: `A sentiment model trained on product reviews from several years ago increasingly misreads recent reviews that use new slang. What is the most accurate diagnosis?`,
          options: [
            {
              id: 'a',
              text: `The live inputs have drifted from the training data, so it needs newer labeled examples`,
              explanation: `Correct. This is distribution shift: the model learned patterns from older language, and the fix is updating the data it learns from.`,
            },
            {
              id: 'b',
              text: `The developers wrote its sentiment rules incorrectly and need to rewrite them`,
              explanation: `A learned model has no hand-written sentiment rules to fix. Its behavior comes from the training data.`,
            },
            {
              id: 'c',
              text: `The model has run out of memory because it has seen too many reviews`,
              explanation: `A deployed model does not accumulate memory from each input it processes; accuracy loss here comes from changed inputs.`,
            },
            {
              id: 'd',
              text: `Statistical models cannot process text, so a symbolic parser must replace it`,
              explanation: `Statistical models handle text very well; the problem is outdated training data, not the approach itself.`,
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-symbolic-and-statistical-ai-q6',
          objective: 'm01-symbolic-and-statistical-ai-3',
          kind: 'application',
          difficulty: 'medium',
          prompt: `Your LLM-based assistant reads supplier emails and reports invoice totals, but it occasionally adds line items up wrong. What is the most reliable fix?`,
          options: [
            {
              id: 'a',
              text: `Add "double-check all arithmetic carefully" to the prompt and ship it`,
              explanation: `This may reduce errors but guarantees nothing; the arithmetic is still done by a statistical model.`,
            },
            {
              id: 'b',
              text: `Fine-tune the model on many arithmetic examples until errors become rare`,
              explanation: `Costly, and the result is still probabilistic. Exact arithmetic does not need to be learned.`,
            },
            {
              id: 'c',
              text: `Replace the assistant with a rules engine that parses every email format`,
              explanation: `Free-form emails are exactly what rules handle badly. This would trade arithmetic errors for brittleness.`,
            },
            {
              id: 'd',
              text: `Have the model extract the line items and call code that computes the total`,
              explanation: `Correct. The model does the language part it is good at, and deterministic code does the exact calculation.`,
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-symbolic-and-statistical-ai-q7',
          objective: 'm01-symbolic-and-statistical-ai-3',
          kind: 'concept',
          difficulty: 'hard',
          prompt: `Which pair of milestones best illustrates the contrast between the search-based symbolic tradition and the learning-from-data tradition?`,
          options: [
            {
              id: 'a',
              text: `Deep Blue (1997) and ChatGPT (2022), both mainly trained from large datasets`,
              explanation: `Deep Blue relied mainly on brute-force search over chess positions, not on learning from large datasets, so this pair does not show the contrast.`,
            },
            {
              id: 'b',
              text: `Deep Blue (1997), built on massive search, and AlexNet (2012), learned from labeled images`,
              explanation: `Correct. Deep Blue exemplifies search; AlexNet exemplifies a model whose behavior was learned from labeled examples.`,
            },
            {
              id: 'c',
              text: `Turing's paper (1950) and the Dartmouth workshop (1956), both early statistical systems`,
              explanation: `Neither was a working system. One is a philosophical paper and the other a research workshop that named the field.`,
            },
            {
              id: 'd',
              text: `Backpropagation (1986), a symbolic method, and the Transformer (2017), a learned one`,
              explanation: `Backpropagation is a method for training neural networks, so both belong to the learning tradition.`,
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-symbolic-and-statistical-ai-q8',
          objective: 'm01-symbolic-and-statistical-ai-3',
          kind: 'application',
          difficulty: 'hard',
          prompt: `A team is building a tool that helps clinicians calculate medication doses from free-text patient notes. Which design uses each approach where it is strongest?`,
          options: [
            {
              id: 'a',
              text: `An LLM reads the notes and outputs the final dose directly`,
              explanation: `This puts a safety-critical calculation in a statistical model whose errors are not guaranteed to be caught.`,
            },
            {
              id: 'b',
              text: `A rules engine parses the free-text notes and computes the dose`,
              explanation: `Hand-written parsing of messy clinical prose is brittle; this is the part learning handles better.`,
            },
            {
              id: 'c',
              text: `An LLM extracts weight and drug for clinician review; validated rules compute the dose`,
              explanation: `Correct. The model handles unstructured text, a human confirms the extracted facts, and deterministic, auditable rules do the calculation.`,
            },
            {
              id: 'd',
              text: `A model trained on past prescriptions replaces all dosing rules and review`,
              explanation: `Past prescriptions can contain errors, and this removes the exact, auditable rules where they matter most.`,
            },
          ],
          answer: 'c',
        },
      ],
      references: [
        {
          title: 'Learning representations by back-propagating errors',
          publisher: 'Nature (Rumelhart, Hinton & Williams, 1986)',
          url: 'https://www.nature.com/articles/323533a0',
          kind: 'source',
        },
        {
          title:
            'ImageNet Classification with Deep Convolutional Neural Networks',
          publisher: 'NeurIPS 2012 (Krizhevsky, Sutskever & Hinton)',
          url: 'https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html',
          kind: 'source',
        },
        {
          title:
            'CS231n: Convolutional Neural Networks for Visual Recognition (course notes)',
          publisher: 'Stanford University',
          url: 'https://cs231n.github.io/convolutional-networks/',
          kind: 'source',
        },
        {
          title: 'Attention Is All You Need',
          publisher: 'arXiv (Vaswani et al., 2017)',
          url: 'https://arxiv.org/abs/1706.03762',
          kind: 'source',
        },
        {
          title: 'Deep Blue',
          publisher: 'IBM History',
          url: 'https://www.ibm.com/history/deep-blue',
          kind: 'source',
        },
        {
          title:
            'R1 and Beyond: AI Technology Transfer at Digital Equipment Corporation',
          publisher: 'AI Magazine, AAAI (Polit, 1984)',
          url: 'http://ojs.aaai.org/aimagazine/index.php/aimagazine/article/view/460',
          kind: 'source',
        },
        {
          title: 'What is machine learning?',
          publisher: 'Google for Developers',
          url: 'https://developers.google.com/machine-learning/intro-to-ml/what-is-ml',
          kind: 'source',
        },
        {
          title:
            'ChatGPT: Optimizing Language Models for Dialogue (archived launch post)',
          publisher: 'OpenAI, via the Internet Archive',
          url: 'https://web.archive.org/web/20221201000000/https://openai.com/blog/chatgpt/',
          kind: 'source',
        },
        {
          title:
            'Toolformer: Language Models Can Teach Themselves to Use Tools',
          publisher: 'arXiv (Schick et al., 2023)',
          url: 'https://arxiv.org/abs/2302.04761',
          kind: 'source',
        },
        {
          title: 'Tool use with Claude',
          publisher: 'Anthropic documentation',
          url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview',
          kind: 'source',
        },
        {
          title:
            'Artificial Intelligence (Stanford Encyclopedia of Philosophy)',
          publisher: 'Stanford University',
          url: 'https://plato.stanford.edu/entries/artificial-intelligence/',
          kind: 'further',
        },
      ],
      reviewedAt: REVIEWED_AT,
    },

    // ---------------------------------------------------------------------
    // Lesson 3
    // ---------------------------------------------------------------------
    {
      slug: 'when-to-use-ai',
      title: 'When AI is useful, and when ordinary software is better',
      summary: `A practical checklist for deciding between a rule and a model, grounded in Google's Rules of Machine Learning and its ML problem-framing guidance, with a worked example of starting simple and switching to a model only when it pays off.`,
      minutes: 13,
      label: 'foundational',
      objectives: [
        {
          id: 'm01-when-to-use-ai-1',
          text: `apply decision criteria (clear rule, data, error tolerance, cost and latency, explainability, maintenance) to decide whether a problem needs AI`,
        },
        {
          id: 'm01-when-to-use-ai-2',
          text: `explain why Google's guidance recommends launching with a simple heuristic and measuring before adopting ML`,
        },
        {
          id: 'm01-when-to-use-ai-3',
          text: `justify a choice between a rule and a model for a concrete feature, including when to switch later`,
        },
      ],
      concept: [
        {
          heading: 'Intuition: AI is for the rules you cannot write',
          blocks: [
            {
              type: 'text',
              md: `If you can write the rule down and it is correct, write the code. It will be exact, fast, cheap, testable and explainable. AI earns its place when the rule is unknown, too complex to state, or keeps changing, and when you can tolerate being wrong some of the time.

That sounds obvious, but teams often reach for a model because AI is fashionable, and then pay for data pipelines, evaluation and monitoring to approximate something a few lines of code would have done exactly.`,
            },
          ],
        },
        {
          heading: 'Decision criteria',
          blocks: [
            {
              type: 'text',
              md: `Ask these questions before choosing a model:

1. **Is there a clear, deterministic rule?** Tax tables, date validation, access control and pricing formulas have exact specifications. Use code.
2. **Is suitable data available?** A learned model needs examples that are plentiful, correct and representative of what it will see in production, and its inputs must be available at the moment it has to make a prediction. Large pre-trained models reduce how much data **you** need, but you still need examples to evaluate them.
3. **How costly is an error?** Learned models are right most of the time, not all of the time. If a wrong answer is cheap or a human reviews it, that may be fine. If it moves money or affects safety, you need guardrails or a deterministic path.
4. **What are the cost and latency budgets?** Model calls can add noticeable latency and per-request cost compared with a function call. Check them against the product's limits.
5. **Must decisions be explained or audited?** In some domains you must be able to say why a decision was made. Rules are easy to explain; learned models generally are not.
6. **Who maintains it?** Code needs tests. Models also need data pipelines, retraining, evaluation and monitoring for drift. Budget for that ongoing work.

A useful signal is how experts behave: if specialists perform a task reliably but cannot articulate their method as rules (recognizing a face, judging the tone of a message), learning is a good fit.`,
            },
            {
              type: 'terms',
              terms: [
                {
                  term: 'Heuristic',
                  definition: `A simple, hand-written rule of thumb that gives a reasonable answer without learning, such as ranking items by popularity.`,
                },
                {
                  term: 'Baseline',
                  definition: `A simple solution whose measured performance any more complex solution must beat to justify its cost.`,
                },
                {
                  term: 'Problem framing',
                  definition: `Stating the goal in product terms, then deciding whether ML is the right approach and, if so, what it should predict.`,
                },
                {
                  term: 'Error tolerance',
                  definition: `How much a wrong output costs the user or business, which sets how accurate and guarded a solution must be.`,
                },
              ],
            },
          ],
        },
        {
          heading: "What Google's ML guidance says",
          blocks: [
            {
              type: 'text',
              md: `Google's **Rules of Machine Learning** opens with advice that surprises many engineers:

- **Rule #1: Don't be afraid to launch a product without machine learning.** ML needs data, and a simple heuristic can get you a substantial part of the benefit. The guide's rough rule of thumb is that a heuristic gets you about half of the way. If ML is not absolutely required, don't use it until you have data.
- **Rule #2: First, design and implement metrics.** Track what users do in the heuristic version, so you have history and a clear picture of performance when you later consider ML.
- **Rule #3: Choose machine learning over a complex heuristic.** A simple heuristic is fine for launch, but a pile of special cases becomes hard to maintain. Once you have data and a clear goal, a learned model is easier to update.

Google's **Introduction to ML Problem Framing** course says the same thing from a different angle. Start by stating the goal in **non-ML terms** ("what am I trying to accomplish?"). Avoid a complex ML solution when a simpler non-ML one will work; optimize the non-ML approach first and use it as a **benchmark**. Then check the data: it should be abundant, consistent, reliable, available, correct and representative, with every input available at prediction time. When you do build a model, start with a simple one, which also serves as a baseline.`,
            },
          ],
        },
        {
          heading: 'Worked example: rule or model?',
          blocks: [
            {
              type: 'example',
              title: 'Routing support tickets',
              md: `Our own teaching example. A new SaaS product needs to route incoming support tickets to the billing, technical or account team.

**Launch (no history).** There are no past tickets to learn from. Following Rule #1, add a required "topic" dropdown to the support form and a few keyword rules for email tickets: "invoice," "refund" or "charge" go to billing. Following Rule #2, log every ticket's text, the automatic route, and the team that actually resolved it. Mis-routed tickets reassigned by agents become labeled examples for free.

**Six months later.** The keyword list has grown into dozens of overlapping special cases, and agents still reassign a noticeable share of tickets. There are now thousands of tickets labeled by the team that resolved them. Rule #3 applies: train a text classifier, compare it against the keyword rules on held-out tickets, and switch only if it is clearly better.

**What stays as code.** A few hard rules do not go into the model: tickets from accounts flagged for legal hold always go to the account team, and anything mentioning a security breach goes straight to the on-call engineer. Those are policy, must never be missed, and are easy to state.

The final system is a hybrid: deterministic rules for the cases that must be exact, a model for the messy middle, and the original heuristic kept as the baseline the model has to beat.`,
            },
            {
              type: 'note',
              md: `The question is rarely "AI or not" for a whole product. Make the decision **per feature**, and revisit it as data accumulates.`,
            },
          ],
        },
      ],
      application: {
        heading: 'In a real system: credit pre-screening',
        blocks: [
          {
            type: 'text',
            md: `Consider a lender's online pre-screening flow. Some checks have exact definitions: is the applicant old enough, do they live in a region the lender serves, is required identity information present? These are deterministic rules: cheap, instant and easy to audit.

Estimating the risk that a loan will not be repaid has no exact rule and lots of historical data, which is a classic prediction problem where a model can outperform hand-tuned scorecards.

The limitations shape the design. Lending is a domain where decisions may have to be explained to applicants or regulators, so teams favor models whose outputs can be tied to stated reasons, keep hard eligibility checks in code, and send borderline cases to human reviewers. Historical lending data can encode past biases, so the model needs evaluation across groups, not just an overall accuracy number. The specific legal requirements depend on the jurisdiction; treat them as constraints to check, not assumptions.`,
          },
        ],
      },
      misconceptions: [
        {
          claim: `Adding machine learning always makes a product better.`,
          correction: `Google's Rules of ML start with the opposite advice: don't be afraid to launch without ML. Without data, a heuristic is often the better first version, and it gives you the metrics and baseline a model would later need to beat.`,
        },
        {
          claim: `When a rule-based feature gets complicated, the right fix is to keep adding more precise rules.`,
          correction: `Rule #3 says to choose ML over a complex heuristic. Once special cases pile up and you have data and a clear goal, a learned model is usually easier to maintain than a tangle of rules.`,
        },
        {
          claim: `Any feature that processes text or images needs AI.`,
          correction: `Many text tasks have exact rules: validating an email address format, extracting an order ID with a fixed pattern, or checking a field's length. Reach for a model only when the rule cannot be written down reliably.`,
        },
      ],
      questions: [
        {
          id: 'm01-when-to-use-ai-q1',
          objective: 'm01-when-to-use-ai-2',
          kind: 'recall',
          difficulty: 'easy',
          prompt: `What does Rule #1 of Google's "Rules of Machine Learning" advise?`,
          options: [
            {
              id: 'a',
              text: `Start with the largest model you can afford, then simplify it`,
              explanation: `The guide recommends the opposite direction: begin simple, measure, and add complexity only when justified.`,
            },
            {
              id: 'b',
              text: `Collect at least a full year of data before launching anything`,
              explanation: `The guide encourages launching with a heuristic and gathering data along the way, not delaying launch.`,
            },
            {
              id: 'c',
              text: `Replace every heuristic with a learned model as early as possible`,
              explanation: `That contradicts Rule #1. ML is recommended once you have data and the heuristic becomes complex (Rule #3).`,
            },
            {
              id: 'd',
              text: `Don't be afraid to launch a product without machine learning`,
              explanation: `Correct. ML requires data, and a heuristic can deliver much of the value at launch.`,
            },
          ],
          answer: 'd',
        },
        {
          id: 'm01-when-to-use-ai-q2',
          objective: 'm01-when-to-use-ai-2',
          kind: 'recall',
          difficulty: 'medium',
          prompt: `According to Google's ML problem-framing guidance, what should a team do before committing to an ML solution?`,
          options: [
            {
              id: 'a',
              text: `Choose the model architecture so the data pipeline can be designed around it`,
              explanation: `Architecture comes later. The guidance starts with the goal and whether ML is needed at all.`,
            },
            {
              id: 'b',
              text: `State the goal in non-ML terms and check whether a simpler non-ML solution works`,
              explanation: `Correct. The course recommends optimizing a non-ML solution first and using it as a benchmark.`,
            },
            {
              id: 'c',
              text: `Label all historical data so it is ready whichever approach is chosen`,
              explanation: `Labeling everything up front is expensive and premature if a non-ML solution turns out to be enough.`,
            },
            {
              id: 'd',
              text: `Set a target of 99% accuracy so stakeholders know what to expect`,
              explanation: `An arbitrary accuracy target is not problem framing; the guidance distinguishes product success metrics from model metrics.`,
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-when-to-use-ai-q3',
          objective: 'm01-when-to-use-ai-1',
          kind: 'concept',
          difficulty: 'easy',
          prompt: `Which feature is the strongest candidate for ordinary deterministic code rather than a model?`,
          options: [
            {
              id: 'a',
              text: `Ranking news articles by how likely each user is to read them`,
              explanation: `Reading likelihood depends on many subtle signals with no exact rule, which suits learning from data.`,
            },
            {
              id: 'b',
              text: `Detecting whether an uploaded photo contains a dog`,
              explanation: `Recognizing objects in images is a perception task people cannot write reliable rules for.`,
            },
            {
              id: 'c',
              text: `Blocking checkout when the shipping country is on a no-ship list`,
              explanation: `Correct. The rule is explicit and complete, and a list lookup is exact, fast and auditable.`,
            },
            {
              id: 'd',
              text: `Flagging product reviews that are written sarcastically`,
              explanation: `Sarcasm depends on context and tone that resist explicit rules, so a model is the better fit.`,
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-when-to-use-ai-q4',
          objective: 'm01-when-to-use-ai-1',
          kind: 'concept',
          difficulty: 'hard',
          prompt: `In a test, a model is 3 percentage points more accurate than the current rule, but it adds 400 ms to a step that must finish within 100 ms, and the team has no way yet to monitor a model in production. What is the best conclusion?`,
          options: [
            {
              id: 'a',
              text: `Keep the rule for now: the gain does not fit the latency budget or the maintenance capacity`,
              explanation: `Correct. Accuracy is one criterion among several. Latency is a hard constraint here, and an unmonitored model is a maintenance risk.`,
            },
            {
              id: 'b',
              text: `Ship the model, because any accuracy improvement outweighs other concerns`,
              explanation: `Missing a hard latency limit can break the product, and accuracy gains do not automatically justify cost and risk.`,
            },
            {
              id: 'c',
              text: `Ship the model and drop the monitoring requirement to save time`,
              explanation: `Learned models can degrade silently under drift; skipping monitoring removes the only way to notice.`,
            },
            {
              id: 'd',
              text: `Abandon both, since a 3-point accuracy difference is meaningless`,
              explanation: `The rule is working and within budget, so there is no reason to abandon it. Whether 3 points matters depends on the product.`,
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-when-to-use-ai-q5',
          objective: 'm01-when-to-use-ai-2',
          kind: 'concept',
          difficulty: 'medium',
          prompt: `Rule #3 of Google's guide says to choose machine learning over a complex heuristic. What is the reasoning?`,
          options: [
            {
              id: 'a',
              text: `Heuristics are always less accurate than learned models on any task`,
              explanation: `The guide says heuristics can deliver much of the benefit; the issue is maintainability, not inherent accuracy.`,
            },
            {
              id: 'b',
              text: `Complex heuristics get hard to maintain; with data and a goal, a model is easier to update`,
              explanation: `Correct. The argument is about maintenance: piles of special cases are fragile, while a model can be retrained.`,
            },
            {
              id: 'c',
              text: `Complex heuristics cannot be deployed to production infrastructure`,
              explanation: `Heuristics deploy like any other code; deployment is not the problem.`,
            },
            {
              id: 'd',
              text: `Machine learning removes the need to collect data or define metrics`,
              explanation: `ML depends on data and metrics; Rule #2 says to build metrics first for exactly that reason.`,
            },
          ],
          answer: 'b',
        },
        {
          id: 'm01-when-to-use-ai-q6',
          objective: 'm01-when-to-use-ai-3',
          kind: 'application',
          difficulty: 'medium',
          prompt: `A startup is launching a support inbox next week with no ticket history. It wants tickets routed to the right team automatically. What is the best first step?`,
          options: [
            {
              id: 'a',
              text: `Train a custom classifier on the first 20 tickets that arrive`,
              explanation: `Twenty examples are far too few to train or even evaluate a reliable classifier.`,
            },
            {
              id: 'b',
              text: `Postpone automatic routing until 100,000 tickets have been collected`,
              explanation: `Delaying gives users nothing in the meantime; a heuristic can route reasonably from day one.`,
            },
            {
              id: 'c',
              text: `Ship simple form or keyword routing, log outcomes, and revisit ML once data exists`,
              explanation: `Correct. This follows Rules #1 and #2: launch with a heuristic and instrument it so you collect labeled data.`,
            },
            {
              id: 'd',
              text: `Route tickets at random so the collected data is free of bias`,
              explanation: `Random routing gives a poor experience, and agents correcting routes produce the same labels under a sensible heuristic.`,
            },
          ],
          answer: 'c',
        },
        {
          id: 'm01-when-to-use-ai-q7',
          objective: 'm01-when-to-use-ai-3',
          kind: 'application',
          difficulty: 'hard',
          prompt: `Suppose a lender is required to give applicants specific reasons whenever a loan is declined. Which design best fits that constraint?`,
          options: [
            {
              id: 'a',
              text: `Hard eligibility rules in code, plus a risk model whose outputs map to stated, auditable reasons`,
              explanation: `Correct. Exact checks stay explainable as rules, and the model is chosen so its decisions can be traced to reasons the lender can state and audit.`,
            },
            {
              id: 'b',
              text: `The most accurate black-box model available, with no reasons recorded`,
              explanation: `This fails the stated requirement: the lender could not tell applicants why they were declined.`,
            },
            {
              id: 'c',
              text: `Any model, with an LLM writing a plausible-sounding reason after each decision`,
              explanation: `Generated text may not reflect the factors that actually drove the decision, so the reasons would not be trustworthy.`,
            },
            {
              id: 'd',
              text: `A single model that also replaces the eligibility checks, for consistency`,
              explanation: `Eligibility criteria have exact definitions; folding them into a statistical model makes them less reliable and harder to explain.`,
            },
          ],
          answer: 'a',
        },
        {
          id: 'm01-when-to-use-ai-q8',
          objective: 'm01-when-to-use-ai-1',
          kind: 'application',
          difficulty: 'medium',
          prompt: `Which situation most strongly argues for a learned model rather than hand-written rules?`,
          options: [
            {
              id: 'a',
              text: `The input format is fixed and a complete written specification exists`,
              explanation: `A complete specification is a rule. Code implements it exactly.`,
            },
            {
              id: 'b',
              text: `Every output must be provably correct, with no tolerance for errors`,
              explanation: `Learned models are statistically right, not guaranteed right. Zero error tolerance points to deterministic code.`,
            },
            {
              id: 'c',
              text: `No examples exist and there is no practical way to collect any`,
              explanation: `Without data there is nothing to learn from or evaluate against; rules or heuristics are the only option.`,
            },
            {
              id: 'd',
              text: `Experts do the task reliably but cannot state their method, and labeled examples are plentiful`,
              explanation: `Correct. Knowledge that is hard to articulate but easy to demonstrate with examples is what learning captures.`,
            },
          ],
          answer: 'd',
        },
      ],
      references: [
        {
          title: 'Rules of Machine Learning: Best Practices for ML Engineering',
          publisher: 'Google for Developers',
          url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
          kind: 'source',
        },
        {
          title:
            'Introduction to Machine Learning Problem Framing: Understand the problem',
          publisher: 'Google for Developers',
          url: 'https://developers.google.com/machine-learning/problem-framing/problem',
          kind: 'source',
        },
        {
          title:
            'Introduction to Machine Learning Problem Framing: Implementing a model',
          publisher: 'Google for Developers',
          url: 'https://developers.google.com/machine-learning/problem-framing/implement-model',
          kind: 'source',
        },
        {
          title: 'Introduction to Machine Learning Problem Framing',
          publisher: 'Google for Developers',
          url: 'https://developers.google.com/machine-learning/problem-framing',
          kind: 'further',
        },
      ],
      reviewedAt: REVIEWED_AT,
    },
  ],

  // -----------------------------------------------------------------------
  // Exam
  // -----------------------------------------------------------------------
  examQuestions: [
    {
      id: 'm01-what-ai-is-x1',
      objective: 'm01-when-to-use-ai-1',
      kind: 'application',
      difficulty: 'medium',
      prompt: `A product manager asks for "AI-powered validation" of postal codes on a signup form. Each country's postal code format is published and fixed. What should you recommend?`,
      options: [
        {
          id: 'a',
          text: `Deterministic validation against each country's published pattern, since the rule is exact`,
          explanation: `Correct. A known, complete rule is best implemented as code: exact, instant and testable. AI is for rules that cannot be written down.`,
        },
        {
          id: 'b',
          text: `An LLM call per signup, because language models understand all kinds of text`,
          explanation: `This adds cost, latency and occasional errors to a problem that has an exact answer.`,
        },
        {
          id: 'c',
          text: `A trained classifier, because learned models have replaced symbolic approaches`,
          explanation: `Learning did not make rules obsolete; for an exact specification, rules are the better tool.`,
        },
        {
          id: 'd',
          text: `An expert system with an inference engine, because validation needs reasoning`,
          explanation: `A pattern check per country is a simple rule; an inference engine adds machinery without benefit.`,
        },
      ],
      answer: 'a',
    },
    {
      id: 'm01-what-ai-is-x2',
      objective: 'm01-symbolic-and-statistical-ai-2',
      kind: 'application',
      difficulty: 'hard',
      prompt: `A spam filter has grown to 3,000 hand-maintained rules. Spammers change tactics weekly, and the team has millions of messages that users marked as spam or not spam. What is the best next step?`,
      options: [
        {
          id: 'a',
          text: `Keep adding rules weekly, since rules are transparent and need no data`,
          explanation: `This is the brittle, hard-to-maintain complex heuristic that Rule #3 warns against, and it ignores the labeled data.`,
        },
        {
          id: 'b',
          text: `Wait for general AI, since spam requires human-level understanding`,
          explanation: `General AI does not exist, and spam filtering is a well-defined narrow classification task.`,
        },
        {
          id: 'c',
          text: `Train a classifier on the user labels, keep a few hard rules, and monitor for drift`,
          explanation: `Correct. Abundant labels and a shifting problem favor learning; exact rules such as known-bad senders stay in code; drift monitoring addresses the model's main failure mode.`,
        },
        {
          id: 'd',
          text: `Remove filtering entirely, since spammers will always adapt to any system`,
          explanation: `Adaptation is a reason to retrain regularly, not to give up a feature users depend on.`,
        },
      ],
      answer: 'c',
    },
    {
      id: 'm01-what-ai-is-x3',
      objective: 'm01-what-is-ai-3',
      kind: 'application',
      difficulty: 'medium',
      prompt: `A feature spec says: "Draft a reply to each customer email, then decide whether to send it automatically or hold it for human review." Which analysis is most sound?`,
      options: [
        {
          id: 'a',
          text: `It is perception and planning; every draft can be sent automatically once it is good enough`,
          explanation: `Drafting text is generation, not perception, and "send everything" ignores that some errors are costly.`,
        },
        {
          id: 'b',
          text: `It is generation plus a decision; that decision should weigh error cost, holding risky cases`,
          explanation: `Correct. The draft is generation; sending is a decision, and error tolerance determines which cases need a human.`,
        },
        {
          id: 'c',
          text: `It is classification only, because generating text is not really an AI problem`,
          explanation: `Generating new text is one of the main AI problem types.`,
        },
        {
          id: 'd',
          text: `It is generation only; no decision step is needed because LLMs are general AI`,
          explanation: `Whatever label a vendor gives it, an LLM can produce a wrong or inappropriate draft, so deciding what to send is a separate, necessary step.`,
        },
      ],
      answer: 'b',
    },
    {
      id: 'm01-what-ai-is-x4',
      objective: 'm01-symbolic-and-statistical-ai-3',
      kind: 'application',
      difficulty: 'hard',
      prompt: `A travel app's LLM assistant sometimes states flight prices that do not exist. Prices change many times a day. Which fix addresses the root cause?`,
      options: [
        {
          id: 'a',
          text: `Switch to a larger language model that has memorized more fares`,
          explanation: `Fares change constantly, so memorized prices go stale, and a larger model can still produce plausible but false numbers.`,
        },
        {
          id: 'b',
          text: `Add a disclaimer that AI answers may be inaccurate, and change nothing else`,
          explanation: `A disclaimer shifts responsibility to users without fixing an error that has a clear technical solution.`,
        },
        {
          id: 'c',
          text: `Fine-tune the model nightly on the previous day's fares`,
          explanation: `Prices would still be a day old, and the model would still generate rather than look up numbers.`,
        },
        {
          id: 'd',
          text: `Have the assistant call the live pricing service and only phrase that result`,
          explanation: `Correct. Exact, changing facts come from a deterministic source; the model handles the language. This is the hybrid pattern.`,
        },
      ],
      answer: 'd',
    },
    {
      id: 'm01-what-ai-is-x5',
      objective: 'm01-when-to-use-ai-3',
      kind: 'application',
      difficulty: 'hard',
      prompt: `A new online store wants personalized product recommendations "powered by AI," but it has just launched and has almost no purchase history. What is the best plan?`,
      options: [
        {
          id: 'a',
          text: `Train a deep recommendation model now so it is ready when traffic grows`,
          explanation: `With almost no data, there is nothing to train on or evaluate against; the model would be guesswork.`,
        },
        {
          id: 'b',
          text: `Hide recommendations entirely until a large purchase history exists`,
          explanation: `A simple heuristic can provide useful recommendations now while data accumulates.`,
        },
        {
          id: 'c',
          text: `Show bestsellers per category, log clicks and purchases, and learn a model once data exists`,
          explanation: `Correct. Recommendation is a prediction problem that needs data; a heuristic launches now (Rule #1), and instrumentation builds the dataset (Rule #2).`,
        },
        {
          id: 'd',
          text: `Have merchandisers write permanent rules, since rules never need updating`,
          explanation: `Hand-written rules also need maintenance, and personal preferences are the kind of pattern rules capture poorly.`,
        },
      ],
      answer: 'c',
    },
    {
      id: 'm01-what-ai-is-x6',
      objective: 'm01-what-is-ai-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt: `Deep Blue beat the world chess champion in 1997 but could not perform any other task. What does this best illustrate?`,
      options: [
        {
          id: 'a',
          text: `Narrow AI can exceed human performance on one task without being general`,
          explanation: `Correct. Deep Blue was superhuman at chess and incapable of anything else, the definition of narrow AI.`,
        },
        {
          id: 'b',
          text: `Symbolic search methods produce general intelligence when given enough compute`,
          explanation: `Deep Blue's enormous search made it strong at chess only; compute did not make it general.`,
        },
        {
          id: 'c',
          text: `Artificial general intelligence was effectively reached in the late 1990s`,
          explanation: `Beating one person at one game is not competence across a wide range of tasks; AGI remains theoretical.`,
        },
        {
          id: 'd',
          text: `Superhuman performance requires learning from large labeled datasets`,
          explanation: `Deep Blue relied mainly on brute-force search, showing that strong results do not always come from learning.`,
        },
      ],
      answer: 'a',
    },
    {
      id: 'm01-what-ai-is-x7',
      objective: 'm01-symbolic-and-statistical-ai-1',
      kind: 'application',
      difficulty: 'medium',
      prompt: `A developer says: "If our image classifier mislabels a product, I will just find the line of code with the wrong rule and fix it." What is the best response?`,
      options: [
        {
          id: 'a',
          text: `That works, because a trained model is compiled from a list of hand-written rules`,
          explanation: `Training produces learned parameters, not a list of rules written by people.`,
        },
        {
          id: 'b',
          text: `That works, provided the team has access to the model's source code`,
          explanation: `The code that runs a model does not contain the learned decision rule; it lives in the parameters.`,
        },
        {
          id: 'c',
          text: `That fails, because a model can never be changed once training is finished`,
          explanation: `Models can be retrained, fine-tuned or wrapped with guards; they are not frozen forever.`,
        },
        {
          id: 'd',
          text: `That fails: the behavior lives in learned parameters, so fix data or training, or add guards`,
          explanation: `Correct. You change a learned model's behavior through its data, labels and training, or by adding deterministic checks around it.`,
        },
      ],
      answer: 'd',
    },
    {
      id: 'm01-what-ai-is-x8',
      objective: 'm01-when-to-use-ai-1',
      kind: 'application',
      difficulty: 'hard',
      prompt: `An HR system needs two features: (A) calculate overtime pay using a published labor rule, and (B) forecast which teams will need overtime next month for staffing plans. Which approach fits best?`,
      options: [
        {
          id: 'a',
          text: `A learned model for both, so the system is consistent and AI-powered throughout`,
          explanation: `Using a statistical model for an exact, auditable pay rule adds error where none is acceptable.`,
        },
        {
          id: 'b',
          text: `Code for A, an exact rule with costly errors; a forecast for B, trying a simple baseline first`,
          explanation: `Correct. A has a deterministic rule and low error tolerance; B is a prediction problem where approximate answers are useful, and a baseline tells you whether a model is worth it.`,
        },
        {
          id: 'c',
          text: `Hand-written rules for both, since AI should never be used in HR software`,
          explanation: `Forecasting demand is a reasonable prediction problem; the domain alone does not rule out models, though it raises the bar for review.`,
        },
        {
          id: 'd',
          text: `A learned model for A and hand-written rules for B, since pay data is plentiful`,
          explanation: `This reverses the criteria: A has an exact rule, while B has no exact rule to write.`,
        },
      ],
      answer: 'b',
    },
  ],
}
