import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'horizontal-vertical-scaling',
  title: 'Horizontal vs Vertical Scaling',
  summary:
    'Bigger machines or more machines, and what each demands of your design.',
  minutes: 15,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-horizontal-vertical-scaling-1',
      text: 'distinguish vertical scaling from horizontal scaling and name the main limits of each.',
    },
    {
      id: 'sd-horizontal-vertical-scaling-2',
      text: 'explain why scaling out an application tier requires stateless servers, and identify the state that has to move out of each server.',
    },
    {
      id: 'sd-horizontal-vertical-scaling-3',
      text: 'pick a scaling step that targets the actual bottleneck, including recognising when the database, not the app servers, limits growth.',
    },
  ],
  concept: [
    {
      heading: 'Bigger machine or more machines',
      blocks: [
        {
          type: 'text',
          md: "Every app you have built so far probably ran on one server. That works until traffic grows past what the machine can handle: pages slow down, CPU sits near 100%, and requests start timing out.\n\nYou have two basic ways out:\n\n- **Make the machine bigger.** Move to a server with more CPU cores, more memory or faster disks. This is **vertical scaling**, or *scaling up*.\n- **Add more machines.** Run several copies of the app and spread requests across them with a load balancer, which you met in the previous lesson. This is **horizontal scaling**, or *scaling out*.\n\nA kitchen is a useful picture. Vertical scaling is buying a bigger stove for your one cook. Horizontal scaling is hiring more cooks. More cooks can serve far more diners, but only if any cook can make any dish, which means the recipes can't live in one cook's head. That last point is the heart of this lesson: scaling out changes how you design the software, not just how much hardware you buy.",
        },
      ],
    },
    {
      heading: 'Scaling up and scaling out, precisely',
      blocks: [
        {
          type: 'text',
          md: "**Vertical scaling** raises the capacity of one server. Its appeal is that nothing in your code has to change: the same process simply gets more resources. Its limits:\n\n- **A ceiling.** There is a largest machine you can buy or rent. Once you reach it, vertical scaling has nothing left to give.\n- **A single point of failure.** One machine, however large, still takes the whole service down when it fails or is patched.\n- **Disruptive changes.** Moving to a bigger machine often means a restart or a migration, so each step up can cost a maintenance window.\n\n**Horizontal scaling** spreads the load over several servers and adds servers as demand grows. Its strengths mirror vertical scaling's weaknesses: capacity grows in small steps, and losing one server removes only part of the capacity instead of the whole service. AWS's reliability guidance makes this point directly: replacing one large resource with several smaller ones reduces the impact of any single failure. The price is **complexity**: a load balancer, health checks, deployments across many machines, and above all a design in which any server can handle any request.\n\nHorizontal scaling also enables **autoscaling**: adding or removing servers automatically when a metric such as CPU or request rate crosses a threshold. New servers are not instant, though. A virtual machine has to boot, start the app and pass health checks before it takes traffic.",
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Vertical scaling (scaling up)',
              definition:
                'Increasing the capacity of a single server with more CPU, memory, storage or network bandwidth.',
            },
            {
              term: 'Horizontal scaling (scaling out)',
              definition:
                'Increasing capacity by adding more servers and dividing the work among them.',
            },
            {
              term: 'Stateless server',
              definition:
                'A server that keeps no data between requests that a later request depends on, so any instance can serve any request.',
            },
            {
              term: 'Sticky session (session affinity)',
              definition:
                'A load balancer setting that sends all requests from one user to the same server, usually so that server can keep the user’s session in memory.',
            },
            {
              term: 'Autoscaling',
              definition:
                'Automatically adding or removing server instances based on measured load, such as CPU use or requests per second.',
            },
            {
              term: 'Bottleneck',
              definition:
                'The component whose capacity limits the whole system; adding capacity anywhere else does not help.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Stateless servers make scaling out work',
      blocks: [
        {
          type: 'diagram',
          caption:
            'A horizontally scaled web tier. The load balancer can send any request to any app server, because shared state lives in the session store and the database, not inside the servers.',
          nodes: [
            { id: 'users', label: 'Users', kind: 'client', col: 0, row: 2 },
            {
              id: 'lb',
              label: 'Load balancer',
              kind: 'balancer',
              col: 1,
              row: 2,
            },
            {
              id: 'app1',
              label: 'App server 1',
              kind: 'service',
              col: 2,
              row: 1,
            },
            {
              id: 'app2',
              label: 'App server 2',
              kind: 'service',
              col: 2,
              row: 2,
            },
            {
              id: 'app3',
              label: 'App server 3',
              kind: 'service',
              col: 2,
              row: 3,
            },
            {
              id: 'sessions',
              label: 'Session store',
              kind: 'cache',
              col: 3,
              row: 1,
            },
            { id: 'db', label: 'Database', kind: 'store', col: 3, row: 3 },
          ],
          edges: [
            { from: 'users', to: 'lb', label: 'HTTPS requests' },
            { from: 'lb', to: 'app1' },
            { from: 'lb', to: 'app2', label: 'any healthy server' },
            { from: 'lb', to: 'app3' },
            { from: 'app1', to: 'sessions' },
            { from: 'app2', to: 'sessions', label: 'session data' },
            { from: 'app2', to: 'db', label: 'queries' },
            { from: 'app3', to: 'db' },
          ],
        },
        {
          type: 'text',
          md: "With one server, it is natural to keep things in its memory or on its disk. With several servers behind a load balancer, the next request from the same user may land on a different machine, and anything kept locally is simply not there. Before you scale out, find every piece of state that lives inside a server and decide where it goes:\n\n- **Login sessions** move to a shared store with expiry, such as Redis or the database, or into a signed cookie the client sends each time.\n- **Uploaded files** written to local disk move to shared storage such as object storage, so every server can read them.\n- **Scheduled jobs** defined in the app now run once *per server*. A nightly email job on four servers sends four emails unless one instance is chosen to run it or a lock ensures only one run.\n- **In-memory caches** can stay local, because they hold copies of data that lives elsewhere. Each server's copy may be briefly different, which you must be able to tolerate.\n\n**Sticky sessions** look like a shortcut: tell the load balancer to keep sending each user to the same server, and leave the session in memory. It works until that server dies or is replaced, at which point its users lose their sessions. It also spreads load unevenly, because a few heavy users stay pinned to one machine. The Twelve-Factor App guidance calls sticky sessions a violation of stateless design and recommends a time-expiring datastore for session data instead.",
        },
        {
          type: 'example',
          title: 'From one server to three',
          md: 'A small booking site runs on one server. Sessions sit in an in-memory map, user avatars are saved to `/var/uploads`, and a cron job inside the app sends reminder emails at 08:00.\n\nThe team adds two servers behind a load balancer, changing nothing else. Within an hour:\n\n- Users are logged out at random, because their next request reached a server that never saw their session.\n- Avatars show as broken images two times out of three, because the file exists on only one disk.\n- Customers get three reminder emails each morning.\n\nThe fix is not more hardware. It is moving sessions to a shared store, avatars to object storage, and the reminder job to a single scheduled worker. After that, the team can add a fourth or a tenth server without touching the code again.',
        },
      ],
    },
    {
      heading: 'Where the bottleneck moves',
      blocks: [
        {
          type: 'text',
          md: 'Stateless app servers are the easy part to scale out. The **database** is harder, because it *is* the state. Every app server talks to the same database, so adding app servers adds load to it: more queries, and more open connections, which databases cap. Many teams discover that after scaling out the web tier, the database becomes the bottleneck.\n\nFor a database, vertical scaling is usually the first and simplest step: a bigger machine needs no change to the data model. When that runs out, the options are to copy the data to more machines to spread reads (**replication**, next lesson) or to split the data across machines so each handles part of the writes (**sharding**, after that). Both are horizontal scaling for state, and both cost more design effort than adding app servers did.\n\nThe practical rule: **measure first, then scale the component that is saturated.** Adding app servers while the database is at full CPU makes things worse, not better.',
        },
        {
          type: 'note',
          md: 'Vertical and horizontal scaling are not rivals. Real systems mix them: a fleet of modest app servers scaled out, in front of a database scaled up as far as is sensible before it is replicated or sharded.',
        },
      ],
    },
  ],
  application: {
    heading: 'Scaling a real web app in stages',
    blocks: [
      {
        type: 'text',
        md: 'A typical growth path for a web app looks like this:\n\n1. **One server** for app and database. Scale it up while that is cheap and quick.\n2. **Separate the database** onto its own machine, so the app and database stop competing for CPU and memory.\n3. **Make the app stateless** and run several instances behind a load balancer with health checks. Now a server can fail or be redeployed without an outage.\n4. **Autoscale the app tier** on a metric that tracks load, with a minimum number of instances so there is always spare capacity.\n5. **Scale the data tier**: a bigger database machine, then read replicas, caching, and eventually sharding.\n\nLimits to keep in mind:\n\n- **Autoscaling reacts after load rises.** New instances take time to boot and pass health checks, so a sudden spike can overwhelm the servers you already have. For predictable spikes (a ticket sale, a marketing email), add capacity ahead of time.\n- **Scaling out only helps work that can be split.** A single slow query, a global lock, or one overloaded shared service caps the whole system no matter how many app servers you add.\n- **More servers means more to operate:** more deployments, more logs, more partial failures to reason about.',
      },
    ],
  },
  misconceptions: [
    {
      claim: 'Horizontal scaling is always better than vertical scaling.',
      correction:
        'Horizontal scaling removes the single-machine ceiling and single point of failure, but it demands stateless design and adds operational complexity. For a database, scaling up first is often the simpler and correct step.',
    },
    {
      claim: 'If I add enough app servers, the whole system scales.',
      correction:
        'App servers usually share one database. Adding them increases load and connection count on that database, which then becomes the bottleneck. You have to scale the component that is actually saturated.',
    },
    {
      claim: 'Sticky sessions make an app safe to scale out.',
      correction:
        'Sticky sessions keep state on individual servers instead of removing it. When a server fails or is replaced, its users lose their sessions, and pinned users can leave load uneven. Moving session data to a shared store is the robust fix.',
    },
  ],
  questions: [
    {
      id: 'sd-horizontal-vertical-scaling-q1',
      objective: 'sd-horizontal-vertical-scaling-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'Which change is an example of vertical scaling?',
      options: [
        {
          id: 'a',
          text: 'Adding two more app servers behind the existing load balancer',
          explanation:
            'Adding servers and splitting traffic between them is horizontal scaling.',
        },
        {
          id: 'b',
          text: 'Moving the database to a machine with more CPU cores and memory',
          explanation:
            'Correct. Giving one server more resources is vertical scaling, or scaling up.',
        },
        {
          id: 'c',
          text: 'Splitting the users table across three database servers',
          explanation:
            'Dividing data across several servers is sharding, a form of horizontal scaling.',
        },
        {
          id: 'd',
          text: 'Adding read replicas that serve copies of the database',
          explanation:
            'Adding more database machines is horizontal scaling of reads, not making one machine bigger.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-horizontal-vertical-scaling-q2',
      objective: 'sd-horizontal-vertical-scaling-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Which limitation applies to vertical scaling but is avoided by horizontal scaling?',
      options: [
        {
          id: 'a',
          text: 'It needs a load balancer in front of the servers',
          explanation:
            'A load balancer is something horizontal scaling needs, not a limit of vertical scaling.',
        },
        {
          id: 'b',
          text: 'It requires the application code to be stateless',
          explanation:
            'Statelessness is a requirement of horizontal scaling. A single bigger server can keep state in memory.',
        },
        {
          id: 'c',
          text: 'It increases the number of machines to deploy and monitor',
          explanation:
            'Vertical scaling keeps one machine. More machines to operate is a cost of horizontal scaling.',
        },
        {
          id: 'd',
          text: 'Its capacity is capped by the largest machine available',
          explanation:
            'Correct. One server can only grow as large as the biggest hardware you can buy or rent; adding machines has no such single-machine ceiling.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-horizontal-vertical-scaling-q3',
      objective: 'sd-horizontal-vertical-scaling-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'An app keeps login sessions in an in-memory map inside each server process. After a second server is added behind a round-robin load balancer, users are logged out at random. What is the cause?',
      options: [
        {
          id: 'a',
          text: 'Requests can reach a server that does not hold that user’s session',
          explanation:
            'Correct. Each server only knows sessions created on it. Round-robin sends the next request to either server, and the other one treats the user as logged out.',
        },
        {
          id: 'b',
          text: 'The load balancer removes session cookies from the requests',
          explanation:
            'A load balancer forwards cookies unchanged. The cookie arrives; the server it reaches just has no matching session.',
        },
        {
          id: 'c',
          text: 'Running two servers halves the session expiry time',
          explanation:
            'Session lifetime is a setting in the app; the number of servers does not change it.',
        },
        {
          id: 'd',
          text: 'The database cannot handle connections from two servers',
          explanation:
            'The sessions are in server memory, not the database, and a database easily handles two clients.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-horizontal-vertical-scaling-q4',
      objective: 'sd-horizontal-vertical-scaling-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'In a horizontally scaled app tier, which of these can safely stay local to each server?',
      options: [
        {
          id: 'a',
          text: 'User login sessions created when people sign in',
          explanation:
            'The next request may reach another server, which would not find the session. Sessions belong in a shared store.',
        },
        {
          id: 'b',
          text: 'Profile photos that users upload to the local disk',
          explanation:
            'Other servers cannot read that disk, so the photo would be missing for most requests. Uploads belong in shared storage.',
        },
        {
          id: 'c',
          text: 'An in-memory cache of data that is also stored in the database',
          explanation:
            'Correct. A cache only holds copies. Losing it costs a refill from the database, as long as brief differences between servers are acceptable.',
        },
        {
          id: 'd',
          text: 'A running count of orders placed today, kept in memory',
          explanation:
            'Each server would count only its own orders, and the count is lost on restart. Shared counters belong in a shared store.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-horizontal-vertical-scaling-q5',
      objective: 'sd-horizontal-vertical-scaling-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A nightly job that emails each user a daily summary is scheduled inside the app code. After autoscaling runs the app on four instances, every user gets four summaries. What is the best fix?',
      options: [
        {
          id: 'a',
          text: 'Turn on sticky sessions so each user maps to one instance',
          explanation:
            'Sticky sessions route incoming user requests. The job is not triggered by requests; each instance runs it on its own timer.',
        },
        {
          id: 'b',
          text: 'Go back to running the whole app on a single instance',
          explanation:
            'This stops the duplicates but gives up the capacity and availability that scaling out provided.',
        },
        {
          id: 'c',
          text: 'Run the job from one scheduler, or take a lock so one instance runs it',
          explanation:
            'Correct. Scheduled work must run once, not once per server. A single scheduler or a shared lock keeps the web tier scalable.',
        },
        {
          id: 'd',
          text: 'Add a random delay so the instances start the job at different times',
          explanation:
            'The job still runs four times; the emails just arrive at slightly different moments.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-horizontal-vertical-scaling-q6',
      objective: 'sd-horizontal-vertical-scaling-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Response times are rising. Monitoring shows the app servers at about 20% CPU and the single database server at about 95% CPU, with many slow queries. Which step targets the bottleneck?',
      options: [
        {
          id: 'a',
          text: 'Reduce load on the database or give it more capacity',
          explanation:
            'Correct. The database is saturated, so fixing slow queries, adding indexes or moving it to a bigger machine addresses the real limit.',
        },
        {
          id: 'b',
          text: 'Add more app servers behind the load balancer',
          explanation:
            'The app servers are mostly idle. More of them would send even more queries to the overloaded database.',
        },
        {
          id: 'c',
          text: 'Enable sticky sessions on the load balancer',
          explanation:
            'Session routing does not change how much work the database does.',
        },
        {
          id: 'd',
          text: 'Upgrade the load balancer to a larger instance',
          explanation:
            'Nothing suggests the load balancer is limiting throughput; the database is.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-horizontal-vertical-scaling-q7',
      objective: 'sd-horizontal-vertical-scaling-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why is scaling out a relational database harder than scaling out stateless app servers?',
      options: [
        {
          id: 'a',
          text: 'Relational databases cannot run on more than one machine',
          explanation:
            'They can, through replication and sharding. It just takes more design work.',
        },
        {
          id: 'b',
          text: 'Load balancers are unable to forward database connections',
          explanation:
            'Proxies and load balancers for database traffic exist. Routing is not the hard part; keeping the data correct is.',
        },
        {
          id: 'c',
          text: 'Databases cannot be scaled vertically, so only scaling out remains',
          explanation:
            'Databases scale up well, and a bigger machine is often the first step.',
        },
        {
          id: 'd',
          text: 'Every node holds data, so copies must stay in sync or data must be split',
          explanation:
            'Correct. Identical stateless servers are interchangeable. Database nodes hold the state, so you must either keep copies consistent or divide the data, and both add complexity.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-horizontal-vertical-scaling-q8',
      objective: 'sd-horizontal-vertical-scaling-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'A ticketing site autoscales its stateless app tier on CPU. When a big sale opens at a published time, traffic jumps sharply within seconds, and users see errors for the first few minutes until new instances finish booting. Which change directly addresses this?',
      options: [
        {
          id: 'a',
          text: 'Lower the CPU threshold that triggers the autoscaler',
          explanation:
            'Scaling would start slightly sooner, but it still starts only after the spike arrives, and new instances still need minutes to boot.',
        },
        {
          id: 'b',
          text: 'Add capacity on a schedule before the sale opens',
          explanation:
            'Correct. The spike is predictable, so scaling out ahead of it means the instances are already running and healthy when traffic arrives.',
        },
        {
          id: 'c',
          text: 'Switch the load balancer to sticky sessions',
          explanation:
            'Pinning users to servers does not add capacity and can make load less even.',
        },
        {
          id: 'd',
          text: 'Move the database to a larger machine',
          explanation:
            'The errors come from too few app instances during the spike, not from the database.',
        },
      ],
      answer: 'b',
    },
  ],
  scenario: {
    prompt:
      'You run a small event-ticketing site on one app server and a separate PostgreSQL server. The app keeps login sessions in memory, saves uploaded event posters to its local disk, and runs a cron job inside the app that emails reminders an hour before each event. Today the app server peaks at about 70% CPU and the database at about 30% (illustrative numbers). Next month a popular concert goes on sale at a published time, and you expect several times today’s peak traffic. Write a scaling plan: what you change before adding servers, how you add them, how you handle the sale’s opening minutes, and what you watch on the database.',
    modelAnswer:
      '**1. Make the app stateless first.** Before adding any server, move the three pieces of local state:\n\n- Sessions go to a shared store with expiry (for example Redis), or into signed cookies.\n- Posters go to object storage, served by URL, so every server can reach them.\n- The reminder job runs in one place: a single scheduled worker, or a job protected by a database lock so only one instance runs it.\n\nSkipping this step would cause random logouts, broken images and duplicate emails as soon as there is a second server.\n\n**2. Scale out the app tier.** Run at least two or three instances behind the load balancer with health checks, so one can fail or be redeployed without an outage. Add autoscaling on CPU or request rate with a sensible minimum.\n\n**3. Pre-scale for the sale.** Autoscaling reacts after load rises and new instances take time to boot, so a spike at a known time calls for scheduled extra capacity shortly before the sale opens. Scale back down afterwards.\n\n**4. Watch the database.** More app instances mean more queries and more connections to one PostgreSQL server. Use a connection pool with a cap per instance so the total stays under the database limit, check the slowest queries the sale will run (seat availability, checkout), and if CPU climbs, scale the database up. Read replicas and caching are later options if reads dominate.\n\nOther valid plans exist. A queue or virtual waiting room in front of checkout is a strong addition, and some teams would scale the single app server up for one event instead. What matters is that the plan removes local state before scaling out, targets the real bottleneck, and accounts for the time autoscaling takes.',
    checklist: [
      'Moves sessions, uploaded files and scheduled jobs out of individual servers before adding more',
      'Runs several app instances behind a load balancer with health checks',
      'Adds capacity ahead of the known sale time instead of relying only on reactive autoscaling',
      'Considers database load and connection limits as app instances grow',
      'Names what would justify scaling the database up, and later options such as replicas',
    ],
  },
  takeaways: [
    'Vertical scaling makes one machine bigger; it needs no code changes but hits a hardware ceiling and leaves a single point of failure.',
    'Horizontal scaling adds machines, which grows capacity in small steps and survives the loss of one server, at the cost of more complexity.',
    'Scaling out an app tier requires stateless servers: sessions, uploads and scheduled jobs must move out of individual servers.',
    'Sticky sessions hide state instead of removing it, so a server failure still loses its users’ sessions.',
    'Scale the component that is actually saturated; once app servers scale out, the shared database is often the next bottleneck.',
  ],
  references: [
    {
      title: 'Reliability pillar: design principles',
      publisher: 'AWS Well-Architected Framework',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html',
      kind: 'source',
    },
    {
      title: 'REL05-BP06 Make systems stateless where possible',
      publisher: 'AWS Well-Architected Framework',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_stateless.html',
      kind: 'source',
    },
    {
      title: 'Sharding (vertical and horizontal scaling)',
      publisher: 'MongoDB Manual',
      url: 'https://www.mongodb.com/docs/manual/sharding/',
      kind: 'source',
    },
    {
      title: 'VI. Processes',
      publisher: 'The Twelve-Factor App',
      url: 'https://12factor.net/processes',
      kind: 'source',
    },
    {
      title: 'Patterns for scalable and resilient apps',
      publisher: 'Google Cloud Architecture Center',
      url: 'https://docs.cloud.google.com/architecture/scalable-and-resilient-apps',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}
