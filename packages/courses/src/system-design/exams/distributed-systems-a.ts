import type { Question } from '../../types'

export const examQuestions: Question[] = [
  {
    id: 'sd-distributed-systems-x1',
    objective: 'sd-consistency-models-2',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'A social app runs in two regions, each with its own replica. Requirements: during a partition between the regions, both regions keep accepting posts from their local users, and every user always sees their own posts. Which design meets both requirements?',
    options: [
      {
        id: 'a',
        text: 'Make all reads linearizable, so every user sees every post immediately',
        explanation:
          'Linearizability cannot stay available on every node during a partition, so one region would have to stop accepting posts, failing the first requirement.',
      },
      {
        id: 'b',
        text: 'Route each user to any region at random and rely on eventual consistency',
        explanation:
          'A user who posts in one region and is then routed to the other may not see their post until the partition heals, failing the second requirement.',
      },
      {
        id: 'c',
        text: 'Keep each user on their home region, which accepts and serves their posts',
        explanation:
          'Correct. Read-your-writes is sticky available: it can be kept during a partition as long as each client keeps talking to the same server, and each region stays available to its own users.',
      },
      {
        id: 'd',
        text: 'Send every write to one primary region and refuse writes elsewhere',
        explanation:
          'This chooses consistency: users in the other region cannot post during the partition, failing the first requirement.',
      },
    ],
    answer: 'c',
  },
  {
    id: 'sd-distributed-systems-x2',
    objective: 'sd-distributed-transactions-3',
    kind: 'application',
    difficulty: 'hard',
    prompt:
      'A choreographed checkout saga uses events. When the payment service publishes `PaymentFailed`, the inventory service releases the stock it reserved. The outbox relay sometimes publishes an event twice. What must the inventory service do?',
    options: [
      {
        id: 'a',
        text: 'Make the release idempotent, for example by checking the reservation is still held',
        explanation:
          'Correct. A compensation triggered by an event can be delivered more than once, so it must have the same effect whether it runs once or twice; otherwise stock is released twice.',
      },
      {
        id: 'b',
        text: 'Lock the inventory table while handling each event so copies never run at once',
        explanation:
          'A lock stops the two copies running at the same time, but they still run one after the other, so the stock is released twice.',
      },
      {
        id: 'c',
        text: 'Ask the payment service to switch to two-phase commit for this step',
        explanation:
          'Duplicates come from delivery, not from how payment commits. 2PC would also couple the services and does not fit a choreographed saga.',
      },
      {
        id: 'd',
        text: 'Release stock on every delivery, since releasing twice does no harm',
        explanation:
          'Releasing twice adds the units back twice, so stock counts go too high and the shop can sell items it does not have.',
      },
    ],
    answer: 'a',
  },
  {
    id: 'sd-distributed-systems-x3',
    objective: 'sd-distributed-transactions-2',
    kind: 'concept',
    difficulty: 'medium',
    prompt:
      'A two-phase commit spans databases in two data centers. Both have voted yes when the link to the coordinator is cut. In terms of the CAP lesson’s choice, how do the participants behave?',
    options: [
      {
        id: 'a',
        text: 'They favor availability: each commits locally and they reconcile when the link returns',
        explanation:
          'Committing without the decision could split the outcome if the coordinator chose abort. 2PC participants do not decide on their own after voting yes.',
      },
      {
        id: 'b',
        text: 'They favor availability: each aborts after a timeout so its locks are freed',
        explanation:
          'Aborting alone could also split the outcome if the coordinator chose commit. A yes vote gives up the right to abort unilaterally.',
      },
      {
        id: 'c',
        text: 'They favor neither: after voting yes, each may decide the outcome alone',
        explanation:
          'A yes vote gives up the right to decide alone. Cut off from the coordinator, each participant faces the choice between waiting and acting without coordination.',
      },
      {
        id: 'd',
        text: 'They favor consistency: they wait in doubt, holding locks, until the decision arrives',
        explanation:
          'Correct. Participants keep the outcome atomic by refusing to guess, and the rows they lock stay unavailable to other requests until the coordinator is reachable.',
      },
    ],
    answer: 'd',
  },
  {
    id: 'sd-distributed-systems-x4',
    objective: 'sd-event-driven-architecture-3',
    kind: 'application',
    difficulty: 'medium',
    prompt:
      'An "order history" page is served from a read model that a consumer builds from order events. Customers complain that right after they cancel an order, the page still shows it as active. Other customers’ views do not matter here. Which change addresses the complaint most directly?',
    options: [
      {
        id: 'a',
        text: 'Make every read of every page in the app linearizable',
        explanation:
          'This is far stronger than needed and would remove the benefits of the event-fed read model; only the canceling customer’s own view is the problem.',
      },
      {
        id: 'b',
        text: 'Give that customer read-your-writes, e.g. wait until the model has the cancel',
        explanation:
          'Correct. The complaint is a missing read-your-writes guarantee. Returning the event’s position or version from the cancel call and having the page wait until the read model has applied it (or reading that order from the source) fixes it for the customer who acted.',
      },
      {
        id: 'c',
        text: 'Add partitions to the event topic so the consumer processes events faster',
        explanation:
          'More partitions may shorten the lag, but the read model is still updated asynchronously, so the customer can still read before the cancel is applied.',
      },
      {
        id: 'd',
        text: 'Publish the cancel event before writing the cancellation to the database',
        explanation:
          'This risks announcing a cancellation that never commits, and it does not stop the page from being read before the consumer applies the event.',
      },
    ],
    answer: 'b',
  },
]
