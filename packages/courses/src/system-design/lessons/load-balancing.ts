import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'load-balancing',
  title: 'Load Balancing',
  summary:
    'A load balancer gives clients one address and spreads their requests across a pool of servers, skipping servers that fail health checks. The algorithm decides how evenly the work lands; your session design decides whether servers can be swapped freely.',
  minutes: 15,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-load-balancing-1',
      text: 'explain what a load balancer does in front of a pool of servers, and how health checks keep traffic away from failed ones.',
    },
    {
      id: 'sd-load-balancing-2',
      text: 'compare round robin, weighted, least-connections and hash-based balancing, and pick one for a given workload.',
    },
    {
      id: 'sd-load-balancing-3',
      text: 'handle session state, sticky sessions and connection draining when servers are added, removed or replaced.',
    },
  ],
  concept: [
    {
      heading: 'Why one server is not enough',
      blocks: [
        {
          type: 'text',
          md: 'Your first deployment is usually one server. It works until it does not: traffic outgrows it, or it crashes and the whole site goes down with it, or you need to deploy and every request during the restart fails.\n\nRunning several copies of the server fixes the capacity and the single point of failure, but creates a new question: **which copy does each request go to?** Clients should not need to know how many servers you have or which ones are healthy right now.\n\nA **load balancer** answers that. It sits in front of the pool, gives clients one address, and forwards each request (or connection) to one of the servers behind it. Think of a host at a busy restaurant seating guests across many tables, and skipping any table that is being cleaned.',
        },
      ],
    },
    {
      heading: 'What a load balancer does',
      blocks: [
        {
          type: 'text',
          md: "A load balancer has three jobs:\n\n1. **Accept traffic** on a **listener**: a configured protocol and port.\n2. **Pick a backend** from a pool (NGINX calls it an **upstream group**, AWS a **target group**) using a balancing algorithm.\n3. **Avoid unhealthy backends.** It routes only to servers it believes are healthy, stops routing to one that fails, and resumes when it recovers.\n\n**Health checks** come in two kinds:\n\n- **Active:** the balancer periodically sends a request, such as `GET /health`, to each server. On an AWS Application Load Balancer you set the path, the interval, and how many consecutive failures mark a target unhealthy or successes mark it healthy again. Active checks in NGINX require NGINX Plus.\n- **Passive:** the balancer watches real traffic. In open-source NGINX, `max_fails` and `fail_timeout` mark a server unavailable after a number of failed attempts within a time window.\n\nWhat if every server fails its checks at once? An AWS ALB **fails open**: it sends traffic to all targets anyway, using its normal balancing algorithm, rather than refusing every request.\n\nBalancers also differ in what they look at. An AWS **Network Load Balancer** works at the connection level: it picks a target per TCP connection using a flow hash of the connection's protocol, addresses and ports, and keeps the whole connection on that target. An **Application Load Balancer** understands HTTP: it evaluates listener rules on each request before choosing a target.",
        },
        {
          type: 'diagram',
          caption:
            'Clients reach one address; the load balancer spreads requests across healthy servers and stops sending to a failed one.',
          nodes: [
            { id: 'clients', label: 'Clients', kind: 'client', col: 0, row: 2 },
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
              label: 'App server 3 (failing)',
              kind: 'service',
              col: 2,
              row: 3,
            },
            {
              id: 'sessions',
              label: 'Shared session store',
              kind: 'store',
              col: 3,
              row: 1,
            },
            { id: 'db', label: 'Database', kind: 'store', col: 3, row: 2 },
          ],
          edges: [
            { from: 'clients', to: 'lb', label: 'one address' },
            { from: 'lb', to: 'app1', label: 'request' },
            { from: 'lb', to: 'app2', label: 'request' },
            {
              from: 'lb',
              to: 'app3',
              label: 'health check fails',
              dashed: true,
            },
            { from: 'app1', to: 'sessions', label: 'read session' },
            { from: 'app2', to: 'db', label: 'queries' },
          ],
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Backend pool',
              definition:
                'The set of servers a load balancer can send traffic to (NGINX: upstream group; AWS: target group).',
            },
            {
              term: 'Health check',
              definition:
                'A test of whether a backend can serve traffic: active checks send probe requests, passive checks watch real requests fail.',
            },
            {
              term: 'Round robin',
              definition:
                'Sending each new request to the next server in turn, so requests are spread evenly by count.',
            },
            {
              term: 'Least connections / least outstanding requests',
              definition:
                'Sending each request to the server with the fewest requests or connections currently in progress.',
            },
            {
              term: 'Sticky session (session affinity)',
              definition:
                "Routing all of one client's requests to the same server, usually by a cookie the balancer sets.",
            },
            {
              term: 'Connection draining',
              definition:
                'Stopping new requests to a server being removed while letting its in-flight requests finish (AWS: deregistration delay).',
            },
          ],
        },
      ],
    },
    {
      heading: 'Balancing algorithms',
      blocks: [
        {
          type: 'text',
          md: "**Round robin** is the default in both NGINX and AWS ALB target groups: each request goes to the next server in turn. AWS describes it as suited to requests of similar complexity and servers of similar capacity.\n\n**Weighted round robin** gives some servers a bigger share. In NGINX, `weight=5` on one server and the default weight of 1 on another sends 5 of every 6 requests to the first. Use it when servers differ in capacity.\n\n**Least connections** (NGINX `least_conn`) and **least outstanding requests** (AWS ALB) send each request to the server with the fewest in progress. AWS recommends least outstanding requests when requests vary in complexity or servers vary in capability, because a server stuck on slow requests stops receiving new ones.\n\n**Hash-based** methods pick a server from a key. NGINX `ip_hash` uses the client address, so the same client reaches the same server unless it is unavailable; the generic `hash` directive takes any key, such as the URL, and its `consistent` option limits how many keys move when servers are added or removed.\n\nNo algorithm is perfect. Google's SRE book reports that simple round robin can leave a wide gap between the busiest and least busy servers, because requests differ greatly in cost and machines differ in speed. Counting in-flight requests has its own trap: a broken server that fails requests instantly looks idle, so it attracts more traffic and turns into a **sinkhole**. Google's fix is to count recent errors as if they were active requests.",
        },
        {
          type: 'example',
          title: 'The same traffic, three algorithms',
          md: "Illustrative scenario. Two identical servers, A and B. Requests alternate: a slow report export, then a fast page view, then another export, and so on.\n\n- **Round robin** sends every export to A and every page view to B. A falls behind while B sits mostly idle, even though each received the same number of requests.\n- **Least connections** sees A still busy with exports and sends new requests to B until A catches up, so the work evens out.\n- **IP hash** depends entirely on which clients send exports. If one heavy client hashes to A, A carries that client's whole load.\n\nThe lesson: round robin balances request counts, not work.",
        },
      ],
    },
    {
      heading: 'Sessions and changing pools',
      blocks: [
        {
          type: 'text',
          md: "A load balancer works best when **any server can handle any request**. That breaks if a server keeps user state, such as a login session or a cart, in its own memory: the next request may land on a different server that has never heard of the user.\n\nThere are two fixes:\n\n- **Make servers stateless.** Keep sessions in a shared store (a database or Redis) or in a signed cookie, so every server sees the same state. This is the robust option.\n- **Sticky sessions.** The balancer pins a client to one server, usually with a cookie. On an AWS ALB, the balancing algorithm picks the first target and later requests skip it and go straight to that target. AWS notes that when many targets are added, stickiness can leave load unevenly spread, and if the pinned target fails, the client is moved to another, where in-memory state is gone.\n\nPools also change during deploys and scaling, so removal and addition need care:\n\n- **Draining.** When a server is deregistered, an AWS ALB stops sending it new requests and waits (300 seconds by default) for in-flight requests to finish. Google's SRE book describes the same idea as a **lame duck** state: the server tells clients to stop sending new work while it finishes what it has.\n- **Slow start.** AWS ALBs can ramp traffic to a newly healthy target gradually instead of sending its full share at once, giving it time to warm up.",
        },
      ],
    },
  ],
  application: {
    heading: 'Load balancing a real web app',
    blocks: [
      {
        type: 'text',
        md: 'A common setup: DNS points at a managed load balancer (or an NGINX or HAProxy tier), which spreads HTTPS requests across several stateless app servers. Sessions live in Redis or the database, health checks hit a `/health` endpoint, and deploys deregister a few servers at a time, draining each before it is replaced.\n\nLimits to design around:\n\n- **The balancer can be a single point of failure.** Managed balancers run nodes in several availability zones; an AWS ALB requires at least two. A self-hosted balancer needs its own redundancy.\n- **Health checks only test what they test.** A `/health` route that returns `200` without touching anything the app needs will keep a broken server in rotation; one that fails whenever any dependency hiccups can pull every server out at once.\n- **The pool behind the balancer still shares bottlenecks.** Adding app servers does nothing for a database that is already at its limit.\n- **Long-lived connections** such as WebSockets stay on the server they started on, so the balancing decision is made once per connection, not per message.',
      },
    ],
  },
  misconceptions: [
    {
      claim: 'Round robin spreads load evenly across servers.',
      correction:
        "Round robin spreads requests evenly by count. When requests differ in cost or servers differ in speed, the actual work can be very uneven, which Google's SRE book documents in its own data centres.",
    },
    {
      claim:
        'Once a load balancer is in place, there is no single point of failure.',
      correction:
        'The balancer itself must be redundant, and shared dependencies behind it, such as one database, can still take the whole system down.',
    },
    {
      claim:
        'Sticky sessions make it safe to keep user sessions in server memory.',
      correction:
        'If the pinned server fails or is removed, the client moves to another server and the in-memory session is lost; stickiness can also skew load. Keeping sessions in a shared store avoids both problems.',
    },
  ],
  questions: [
    {
      id: 'sd-load-balancing-q1',
      objective: 'sd-load-balancing-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'What does an active health check do?',
      options: [
        {
          id: 'a',
          text: 'Probes each server regularly and stops routing to ones that fail',
          explanation:
            'Correct. The balancer sends periodic test requests, stops sending traffic to a server that fails them, and resumes when it passes again.',
        },
        {
          id: 'b',
          text: 'Lets each server report its CPU usage directly to the clients',
          explanation:
            'Clients do not receive server metrics; the balancer makes routing decisions for them.',
        },
        {
          id: 'c',
          text: 'Restarts any server process that has crashed or stopped',
          explanation:
            "A health check detects failure and changes routing. Restarting servers is a separate system's job.",
        },
        {
          id: 'd',
          text: "Checks that each client's browser supports the site",
          explanation: 'Health checks test backends, not clients.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-load-balancing-q2',
      objective: 'sd-load-balancing-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Which balancing algorithm do both NGINX upstream groups and AWS ALB target groups use by default?',
      options: [
        {
          id: 'a',
          text: 'Least connections',
          explanation:
            'NGINX supports it with `least_conn`, and ALB offers least outstanding requests, but neither is the default.',
        },
        {
          id: 'b',
          text: 'Client IP hash',
          explanation:
            'NGINX supports `ip_hash`, but it must be enabled explicitly.',
        },
        {
          id: 'c',
          text: 'Round robin',
          explanation:
            'Correct. Both use round robin unless you choose another method.',
        },
        {
          id: 'd',
          text: 'Weighted random',
          explanation:
            'ALB offers weighted random as an option, but it is not the default, and it is not the NGINX default either.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-load-balancing-q3',
      objective: 'sd-load-balancing-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Your servers are identical, but most requests take milliseconds while some report exports take many seconds. Which algorithm does AWS recommend for requests that vary this much in complexity?',
      options: [
        {
          id: 'a',
          text: 'Round robin, so each server gets the same number of requests',
          explanation:
            'Equal request counts are not equal work here; one server can collect several slow exports while others idle.',
        },
        {
          id: 'b',
          text: 'Least outstanding requests, so busy servers get fewer new ones',
          explanation:
            'Correct. A server tied up with slow exports has more requests in progress, so new requests go elsewhere.',
        },
        {
          id: 'c',
          text: 'Hashing on client IP, so each client always hits one server',
          explanation:
            'Hashing keeps a client on one server; it does nothing to steer work away from a busy one.',
        },
        {
          id: 'd',
          text: 'Weighted round robin, giving every server the same weight',
          explanation:
            'Equal weights make this identical to plain round robin, with the same problem.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-load-balancing-q4',
      objective: 'sd-load-balancing-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'All three targets in an AWS ALB target group fail their health checks at the same time. What does the load balancer do?',
      options: [
        {
          id: 'a',
          text: 'Returns an error to every client until a target passes again',
          explanation:
            'The ALB does not stop routing in this case; AWS documents a fail-open behaviour instead.',
        },
        {
          id: 'b',
          text: 'Keeps sending everything to the last target that was healthy',
          explanation:
            'There is no "last healthy target" rule. The documented behaviour covers all targets.',
        },
        {
          id: 'c',
          text: 'Holds requests in a queue until a health check passes',
          explanation:
            'The ALB does not queue requests waiting for health to return.',
        },
        {
          id: 'd',
          text: 'Fails open and routes requests to all of the targets',
          explanation:
            'Correct. AWS documents that when every target in a target group is unhealthy, the ALB routes requests to all of them regardless of health status.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-load-balancing-q5',
      objective: 'sd-load-balancing-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        "A balancer sends each request to the server with the fewest requests in progress. One server breaks and starts returning errors instantly. According to Google's SRE book, what can happen?",
      options: [
        {
          id: 'a',
          text: 'It gets fewer requests, because errors raise its in-progress count',
          explanation:
            'Fast failures finish immediately, so its in-progress count goes down, not up.',
        },
        {
          id: 'b',
          text: 'The algorithm detects the errors and removes the server itself',
          explanation:
            'Counting in-progress requests does not look at success or failure, so it does not notice errors on its own.',
        },
        {
          id: 'c',
          text: 'Traffic stays even, since this method behaves like round robin',
          explanation:
            'Least-loaded balancing reacts to in-progress counts, which is why a fast-failing server skews it.',
        },
        {
          id: 'd',
          text: 'It looks idle, attracts more traffic and becomes a sinkhole',
          explanation:
            "Correct. Instant errors keep its count low, so it receives a growing share of requests. The SRE book's fix is to count recent errors as active requests.",
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-load-balancing-q6',
      objective: 'sd-load-balancing-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        "An app keeps shopping carts in each server's memory and runs three servers behind a round-robin load balancer. Users say their carts randomly empty. What is the most robust fix?",
      options: [
        {
          id: 'a',
          text: 'Switch the balancer to least connections',
          explanation:
            'Requests would still land on different servers, each with its own memory, so carts would still go missing.',
        },
        {
          id: 'b',
          text: 'Store carts in a shared store every server can read',
          explanation:
            'Correct. With carts in a shared database or Redis, any server can handle any request, and losing a server loses no carts.',
        },
        {
          id: 'c',
          text: 'Add more servers so each one handles less traffic',
          explanation:
            'More servers makes it more likely that consecutive requests hit different servers, which makes the problem worse.',
        },
        {
          id: 'd',
          text: 'Lengthen the interval between health checks',
          explanation:
            'Health check timing does not decide which server a request lands on, so carts still split across servers.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-load-balancing-q7',
      objective: 'sd-load-balancing-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'During deploys you remove a server from the pool and stop it right away. Users who were mid-upload get errors. Which change addresses this directly?',
      options: [
        {
          id: 'a',
          text: 'Run health checks more often so removal is noticed sooner',
          explanation:
            'Faster detection does not let requests already in progress finish before the server stops.',
        },
        {
          id: 'b',
          text: 'Turn on sticky sessions so uploads stay on one server',
          explanation:
            'Stickiness keeps a client on the server being removed, which does not protect the request when that server stops.',
        },
        {
          id: 'c',
          text: 'Drain first: stop new requests, let in-flight ones finish, then stop',
          explanation:
            'Correct. Connection draining (AWS: deregistration delay) stops new traffic to the server while giving in-flight requests time to complete.',
        },
        {
          id: 'd',
          text: 'Switch to IP hash so each client always reaches one server',
          explanation:
            'Hashing changes which server a client uses, but the server still stops with requests in progress.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-load-balancing-q8',
      objective: 'sd-load-balancing-2',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Behind NGINX you have two servers. Server A has about twice the capacity of server B, and requests cost roughly the same. How do you send A about twice as many requests?',
      options: [
        {
          id: 'a',
          text: 'Keep round robin and give A `weight=2`',
          explanation:
            "Correct. Weights set each server's share, so A receives about two of every three requests.",
        },
        {
          id: 'b',
          text: 'Turn on `ip_hash` for the upstream group',
          explanation:
            '`ip_hash` keeps clients on a server based on their address; it does not give A a larger share.',
        },
        {
          id: 'c',
          text: 'Mark server B as a `backup` server',
          explanation:
            'A backup server gets traffic only when the primary servers are unavailable, so B would sit idle.',
        },
        {
          id: 'd',
          text: 'Use `hash $request_uri consistent`',
          explanation:
            'Hashing by URL groups requests by path, not by server capacity, so the split depends on which URLs are popular.',
        },
      ],
      answer: 'a',
    },
  ],
  scenario: {
    prompt:
      "A photo-sharing API runs on a single server and is moving to four servers behind a load balancer. Today: login sessions are stored in the server's memory; uploads can take up to a minute on slow connections; most other requests are quick, but generating an album ZIP can take several seconds; the team deploys several times a day; all servers share one PostgreSQL database.\n\nDescribe how you would set up the load balancer and the app: which balancing algorithm, what health check, what happens to sessions, and how deploys avoid breaking requests. Name one limit your setup does not solve.",
    modelAnswer:
      '**Sessions first.** In-memory sessions break as soon as requests spread across four servers. Move them to a shared store (Redis or a sessions table in PostgreSQL) so any server can serve any request. Sticky sessions would be a quicker patch, but a server failure or deploy would still log users out, and stickiness can skew load.\n\n**Algorithm.** Request cost varies a lot (quick reads, multi-second ZIPs, minute-long uploads), so use least connections or least outstanding requests rather than round robin, which would count a ZIP the same as a page view.\n\n**Health check.** Add a `/health` endpoint that the balancer probes at an interval, marking a server unhealthy after a few consecutive failures. It should confirm the app can actually serve requests (for example, the process is up and can reach its session store) without failing every server when one dependency blips briefly.\n\n**Deploys.** Replace servers a few at a time. For each one, deregister it, let the balancer drain it with a delay longer than the slowest upload (more than a minute), then stop and replace it. Optionally use slow start so a fresh server is not hit with a full share instantly.\n\n**Limit not solved:** all four servers share one PostgreSQL database. If the database is the bottleneck, more app servers will not help; that needs indexing, caching or replication (Level 2). The balancer itself also needs to be redundant.\n\nOther designs are valid, for example round robin if measurements showed request costs were similar, as long as each choice is tied to this workload.',
    checklist: [
      'Moves sessions out of server memory, or explains the risks of sticky sessions',
      'Chooses an algorithm based on the varying cost of requests',
      'Defines a health check and what it verifies',
      'Drains servers during deploys with a delay longer than the slowest request',
      'Names a remaining bottleneck or single point of failure, such as the database or the balancer',
    ],
  },
  takeaways: [
    'A load balancer gives clients one address and spreads requests across a pool, routing only to servers that pass health checks.',
    'Round robin balances request counts, not work; least connections or least outstanding requests cope better when request costs vary.',
    'Weights handle servers of different capacity, and hash-based methods keep a client or key on the same server.',
    'Keep servers stateless by storing sessions in a shared store; sticky sessions lose state when a server fails and can skew load.',
    'Drain servers before removing them, and remember the balancer and shared dependencies behind it can still be single points of failure.',
  ],
  references: [
    {
      title: 'HTTP Load Balancing',
      publisher: 'NGINX (F5) documentation',
      url: 'https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/',
      kind: 'source',
    },
    {
      title: 'HTTP Health Checks',
      publisher: 'NGINX (F5) documentation',
      url: 'https://docs.nginx.com/nginx/admin-guide/load-balancer/http-health-check/',
      kind: 'source',
    },
    {
      title: 'How Elastic Load Balancing works',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html',
      kind: 'source',
    },
    {
      title: 'Health checks for Application Load Balancer target groups',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html',
      kind: 'source',
    },
    {
      title: 'Edit target group attributes for your Application Load Balancer',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html',
      kind: 'source',
    },
    {
      title: 'Load Balancing in the Datacenter (Site Reliability Engineering)',
      publisher: 'Google',
      url: 'https://sre.google/sre-book/load-balancing-datacenter/',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}
