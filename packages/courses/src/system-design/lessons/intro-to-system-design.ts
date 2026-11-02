import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'intro-to-system-design',
  title: 'Introduction to System Design',
  summary:
    'System design is choosing the components of a system and how they work together, then defending those choices against the requirements. A design is judged by qualities such as reliability, scalability, latency and cost, and every choice trades some of them against others.',
  minutes: 13,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-intro-to-system-design-1',
      text: 'separate functional from non-functional requirements and turn a vague product request into concrete requirements of both kinds.',
    },
    {
      id: 'sd-intro-to-system-design-2',
      text: 'name the qualities a design is judged by, such as reliability, availability, scalability, latency and cost, and explain why improving one usually costs another.',
    },
    {
      id: 'sd-intro-to-system-design-3',
      text: 'apply a repeatable approach to an open-ended design problem: clarify requirements, estimate scale, sketch a design, then examine bottlenecks, failures and trade-offs.',
    },
  ],
  concept: [
    {
      heading: 'From one app to a system',
      blocks: [
        {
          type: 'text',
          md: 'You already know how to build a web app: a server process, some routes, a database. For a small number of users that is often the whole story, and it is a perfectly good design.\n\n**System design** starts when that is no longer enough, or when you need to decide up front what will be enough. It is the work of choosing the **components** of a system (servers, databases, caches, queues, external services), how they **talk to each other**, and where data lives, so that the system meets its requirements. The output is not code. It is a set of decisions and, just as important, the **reasons** for them.\n\nTwo ideas run through this whole course:\n\n- **There is rarely one correct design.** Different designs can meet the same requirements; they differ in what they make easy, hard, cheap or expensive.\n- **Every choice is a trade-off.** Adding a cache makes reads faster but adds a component that can serve stale data. Copying data to a second region helps you survive a regional outage but costs money and makes keeping copies in agreement harder. A good designer can say what they gave up and why it was worth it.',
        },
      ],
    },
    {
      heading: 'Requirements and the qualities a design is judged by',
      blocks: [
        {
          type: 'text',
          md: 'Every design starts from **requirements**, and they come in two kinds.\n\n- **Functional requirements** say what the system does: "users can upload a photo", "users see a feed of photos from people they follow". They are features you could demo.\n- **Non-functional requirements** say how well it must do it: how fast, how often available, for how many users, at what cost, with what security. They rarely appear in a feature list, yet they drive most architecture decisions. A photo app for 50 people and one for 50 million can have the same features and completely different designs.\n\nNon-functional requirements are usually stated as **qualities**. The book *Designing Data-Intensive Applications* frames the core goal as systems that are **reliable, scalable and maintainable**. AWS\'s Well-Architected Framework judges workloads on six pillars: operational excellence, security, reliability, performance efficiency, cost optimization and sustainability. The lists differ, but the point is the same: a design is good or bad relative to qualities you can name.\n\nTo make a quality testable, you measure it. Google\'s SRE book uses three terms: a **service level indicator (SLI)** is a measured quantity, such as request latency or the share of requests that succeed; a **service level objective (SLO)** is a target for an SLI; a **service level agreement (SLA)** is a contract with users that includes consequences for missing the SLOs. The same book prefers **percentiles** to averages for latency, because an average can hide a slow minority of requests: the 99th percentile shows the slow end that some users actually experience.\n\nQualities pull against each other. More copies of the data improve availability but raise cost and make consistency harder. Strong security checks add latency. The SRE book argues that **100% reliability is almost never the right target**: past a certain point each extra bit of reliability costs a lot more, and users cannot tell the difference because their own network and device fail more often than that.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Functional requirement',
              definition:
                'A behaviour the system must provide, such as "users can reset their password".',
            },
            {
              term: 'Non-functional requirement',
              definition:
                'A constraint on how well the system behaves: latency, availability, scale, cost, security, durability.',
            },
            {
              term: 'Availability',
              definition:
                'The share of time, or of requests, for which the system works. Google measures it as the request success rate over a window.',
            },
            {
              term: 'Scalability',
              definition:
                'The ability to handle more load, such as more users, requests or data, by adding resources rather than redesigning.',
            },
            {
              term: 'Latency percentile (p99)',
              definition:
                'The value below which that share of requests fall: a p99 of 400 ms means 99% of requests took 400 ms or less.',
            },
            {
              term: 'SLO',
              definition:
                'A service level objective: a target value for a measured indicator, such as "99.9% of requests succeed over 30 days".',
            },
            {
              term: 'Trade-off',
              definition:
                'A choice where gaining one quality costs another, such as speed for freshness or availability for cost.',
            },
          ],
        },
      ],
    },
    {
      heading: 'The building blocks',
      blocks: [
        {
          type: 'text',
          md: 'Most web systems are assembled from a small set of parts, and this level of the course gives each one its own lesson. A request flows from a **client** to a **load balancer**, which spreads traffic across several **application servers**. They read and write a **database**, keep hot data in a **cache**, and hand slow work to a **queue** that background **workers** process later.\n\nYou will not need every block in every design. Part of the skill is leaving out what the requirements do not call for.',
        },
        {
          type: 'diagram',
          caption:
            'A typical web system. Requests flow left to right; the dashed path is work done later, outside the request.',
          nodes: [
            {
              id: 'client',
              label: 'Browser or app',
              kind: 'client',
              col: 0,
              row: 2,
            },
            {
              id: 'lb',
              label: 'Load balancer',
              kind: 'balancer',
              col: 1,
              row: 2,
            },
            {
              id: 'app1',
              label: 'App server',
              kind: 'service',
              col: 2,
              row: 1,
            },
            {
              id: 'app2',
              label: 'App server',
              kind: 'service',
              col: 2,
              row: 3,
            },
            { id: 'cache', label: 'Cache', kind: 'cache', col: 3, row: 0 },
            { id: 'db', label: 'Database', kind: 'store', col: 3, row: 2 },
            { id: 'queue', label: 'Job queue', kind: 'queue', col: 3, row: 4 },
            { id: 'worker', label: 'Worker', kind: 'service', col: 4, row: 4 },
          ],
          edges: [
            { from: 'client', to: 'lb', label: 'HTTPS request' },
            { from: 'lb', to: 'app1' },
            { from: 'lb', to: 'app2' },
            { from: 'app1', to: 'cache', label: 'hot reads' },
            { from: 'app1', to: 'db', label: 'read/write' },
            { from: 'app2', to: 'db', label: 'read/write' },
            { from: 'app2', to: 'queue', label: 'enqueue job', dashed: true },
            {
              from: 'queue',
              to: 'worker',
              label: 'process later',
              dashed: true,
            },
          ],
        },
        {
          type: 'note',
          md: 'The next lessons build this picture piece by piece: client-server roles, the network between them, API design, databases, caching and load balancing.',
        },
      ],
    },
    {
      heading: 'A repeatable approach to an open-ended problem',
      blocks: [
        {
          type: 'text',
          md: 'A prompt like "design a photo-sharing app" is deliberately vague. Jumping straight to boxes and arrows usually produces a design for the wrong problem. A dependable order of work:\n\n1. **Clarify requirements.** List the core features, and ask about the non-functional side: how many users, how many reads per write, how fast, how available, what must never be lost.\n2. **Estimate scale.** Rough numbers (requests per second, data per day, total storage) tell you whether one database is plenty or nowhere near enough. Being within a factor of a few is the goal, not precision.\n3. **Sketch a high-level design.** The simplest set of components that meets the requirements, with the main request paths and data stores.\n4. **Go deeper where it matters.** Data model, API, the component under the most load.\n5. **Examine bottlenecks, failures and trade-offs.** What breaks first as load grows? What happens when a component fails? What did you give up, and why is that acceptable?',
        },
        {
          type: 'example',
          title: 'Clarifying a photo-sharing app',
          md: 'A product manager asks for "Instagram, but for our hiking club".\n\n**Functional:** members upload photos to a trip, view a trip\'s photos, comment.\n\n**Non-functional (after asking):** about 2,000 members, a few hundred uploads after a big trip; viewing should feel instant; photos must never be lost; the budget is small.\n\n**Estimate (illustrative numbers):** 300 photos on a busy day at about 5 MB each is roughly 1.5 GB per day at peak, and far less on a typical day. Requests per second are tiny.\n\n**Consequence:** one app server, one relational database for members and comments, and photos in durable object storage is plenty. A cluster of servers, a cache and a queue would add cost and moving parts for no requirement. If the club later opens the app to the public, the same questions, asked again, tell you which part to change first.',
        },
        {
          type: 'text',
          md: 'Real-world reviews follow the same spirit. AWS describes its Well-Architected review as a constructive conversation about architectural decisions, not an audit, and Google\'s SRE practice starts from explicit SLOs instead of an open-ended wish for "as reliable as possible".',
        },
      ],
    },
  ],
  application: {
    heading: 'How teams use system design, and where it stops helping',
    blocks: [
      {
        type: 'text',
        md: 'In practice, system design shows up as **design documents** and **design reviews** before a large change is built. A useful design document states the requirements, including numbers for the non-functional ones, proposes an architecture, lists alternatives that were considered, and says what each alternative would have cost. Reviewers then probe the weak spots: the busiest path, the component with no backup, the assumption nobody checked.\n\nOperating teams close the loop with measurement. An SLO such as "99.9% of checkout requests succeed" turns a vague goal into something you can monitor, and it tells you when reliability work should take priority over new features.\n\nLimits to keep in mind:\n\n- **Estimates are rough.** They tell you the order of magnitude, not the exact server count. Plan to measure and adjust.\n- **Requirements change.** A design that fits today\'s load may need rework later; that is normal, not a failure of the original design.\n- **Over-engineering is a real cost.** Designing for a hundred times your expected load adds components to build, run and debug, often for traffic that never arrives.\n- **A diagram is not a system.** Boxes and arrows hide details such as timeouts, retries and data formats, which is where many real problems live.',
      },
    ],
  },
  misconceptions: [
    {
      claim:
        'Every design problem has one correct answer that experts would all draw.',
      correction:
        'Several designs can meet the same requirements. They are judged by how well they fit the stated requirements and by how clearly the designer explains the trade-offs, not by matching a reference diagram.',
    },
    {
      claim: 'A good design should be built for massive scale from day one.',
      correction:
        'A design should fit its requirements. Building for far more load than expected adds cost and complexity now for a benefit that may never come; it is often better to choose a design that can be changed when load grows.',
    },
    {
      claim: 'The goal is always 100% availability.',
      correction:
        "Google's SRE book argues 100% is almost never the right target: each extra increment of reliability costs more, and users cannot perceive it past the reliability of their own network and device. Teams pick an explicit target instead.",
    },
  ],
  questions: [
    {
      id: 'sd-intro-to-system-design-q1',
      objective: 'sd-intro-to-system-design-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'Which of these is a non-functional requirement?',
      options: [
        {
          id: 'a',
          text: 'Users can add a comment to any photo they can view',
          explanation:
            'This describes a behaviour the system provides, so it is a functional requirement.',
        },
        {
          id: 'b',
          text: '99% of photo page loads complete within 500 milliseconds',
          explanation:
            'Correct. It constrains how well the system behaves (latency), not what it does, so it is non-functional.',
        },
        {
          id: 'c',
          text: 'Users can reset their password through an emailed link',
          explanation:
            'This is a feature the system offers, so it is a functional requirement.',
        },
        {
          id: 'd',
          text: 'Admins can remove photos that break the community rules',
          explanation:
            'This is a capability given to a type of user, so it is a functional requirement.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-intro-to-system-design-q2',
      objective: 'sd-intro-to-system-design-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A product brief says: "Shoppers can save items to a wishlist, and the wishlist must still work during our holiday sale, when traffic is about ten times normal." How do the two parts of this sentence split?',
      options: [
        {
          id: 'a',
          text: 'Both parts are functional, since both describe how the wishlist works',
          explanation:
            'Working under ten times normal traffic is not a feature a user invokes; it constrains capacity, which makes it non-functional.',
        },
        {
          id: 'b',
          text: 'Both parts are non-functional, since both come from business goals',
          explanation:
            'Where a requirement comes from does not decide its kind. Saving items is a behaviour, so that part is functional.',
        },
        {
          id: 'c',
          text: 'Saving is non-functional and the holiday traffic part is functional',
          explanation:
            'This reverses the two. Saving items is what the system does; handling the traffic is how well it must do it.',
        },
        {
          id: 'd',
          text: 'Saving is functional and handling holiday traffic is non-functional',
          explanation:
            'Correct. Saving items is a behaviour; staying usable at ten times normal load is a scalability and availability constraint.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-intro-to-system-design-q3',
      objective: 'sd-intro-to-system-design-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        "In Google's SRE terminology, what is a service level objective (SLO)?",
      options: [
        {
          id: 'a',
          text: 'A target value or range for a measured service level indicator',
          explanation:
            'Correct. The SRE book defines an SLO as a target for a service level that is measured by an SLI.',
        },
        {
          id: 'b',
          text: 'A contract with users that sets penalties for missed targets',
          explanation:
            'That describes an SLA, which contains SLOs plus the consequences of meeting or missing them.',
        },
        {
          id: 'c',
          text: 'A measured quantity, such as the share of requests that succeed',
          explanation:
            'That is a service level indicator (SLI): the measurement itself, not the target set for it.',
        },
        {
          id: 'd',
          text: 'A list of the features a service promises to deliver to users',
          explanation:
            'Features are functional requirements. An SLO is a numeric target for a quality such as latency or availability.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-intro-to-system-design-q4',
      objective: 'sd-intro-to-system-design-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why do teams usually track latency with percentiles such as p99 rather than with the average?',
      options: [
        {
          id: 'a',
          text: 'Percentiles are cheaper to compute than averages on large volumes of data',
          explanation:
            'Cost of computation is not the reason. Percentiles are, if anything, more work to compute than a mean.',
        },
        {
          id: 'b',
          text: 'The average is always higher than the p99, so it overstates latency',
          explanation:
            'The mean is not always higher than p99; with skewed latency it is usually far lower, because most requests are fast.',
        },
        {
          id: 'c',
          text: 'An average can hide a slow minority of requests that p99 makes visible',
          explanation:
            'Correct. A few very slow requests barely move the mean, but they show up in high percentiles, and real users experience them.',
        },
        {
          id: 'd',
          text: 'Percentiles leave out slow requests, so the numbers are more stable',
          explanation:
            'A high percentile such as p99 is chosen precisely to describe the slow end, not to drop it.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-intro-to-system-design-q5',
      objective: 'sd-intro-to-system-design-2',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'A team adds a cache in front of its database so product pages load faster. Which statement best describes the trade-off they accepted?',
      options: [
        {
          id: 'a',
          text: 'None worth noting, since a cache only removes work from the system',
          explanation:
            'A cache is another component to run, size and monitor, and the data in it can fall out of date. Those are real costs.',
        },
        {
          id: 'b',
          text: 'Faster reads in exchange for possibly stale data and one more component',
          explanation:
            'Correct. Cached copies can lag behind the database, and the cache itself must be operated and can fail.',
        },
        {
          id: 'c',
          text: 'Faster reads in exchange for losing all data whenever the cache restarts',
          explanation:
            'The database is still the source of truth. A cache restart loses cached copies, which slows reads until it refills, but no data is lost.',
        },
        {
          id: 'd',
          text: 'Faster writes in exchange for slower reads on every product page',
          explanation:
            'A read cache speeds up reads. It does not make writes faster, and reads that hit the cache get quicker, not slower.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-intro-to-system-design-q6',
      objective: 'sd-intro-to-system-design-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        "According to Google's SRE book, why is 100% reliability almost never the right target?",
      options: [
        {
          id: 'a',
          text: 'Monitoring tools cannot measure availability above 99.9%',
          explanation:
            'Measurement limits are not the argument. Request success rates can be measured to many more digits.',
        },
        {
          id: 'b',
          text: 'Reliability matters less to users than new features do',
          explanation:
            'The book does not say reliability matters less. It says the target should be chosen deliberately, balancing it against cost and feature work.',
        },
        {
          id: 'c',
          text: 'Industry regulations forbid promising perfect uptime',
          explanation:
            'The argument is economic and about user experience, not regulatory.',
        },
        {
          id: 'd',
          text: 'Each extra bit costs much more, and users cannot notice it',
          explanation:
            "Correct. Cost rises steeply with each added nine, while users' own networks and devices fail more often than the service would, hiding the gain.",
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-intro-to-system-design-q7',
      objective: 'sd-intro-to-system-design-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'In a design review you are asked to "design a URL shortener". What should you do first?',
      options: [
        {
          id: 'a',
          text: 'Ask about features and scale, such as custom aliases, expiry and traffic',
          explanation:
            'Correct. Requirements decide everything else; the answers tell you which features to support and how much load to plan for.',
        },
        {
          id: 'b',
          text: 'Pick a NoSQL database, since a shortener stores simple key-value pairs',
          explanation:
            'Choosing storage before knowing the requirements risks solving the wrong problem; the choice should follow from the access patterns and scale.',
        },
        {
          id: 'c',
          text: 'Draw a load balancer and several app servers so the design can scale',
          explanation:
            'Adding components before you know the expected load may add cost and complexity the requirements never called for.',
        },
        {
          id: 'd',
          text: 'Write the code that turns a long URL into a short code to prove it works',
          explanation:
            'Implementation detail comes later. A design discussion starts with what the system must do and how well.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-intro-to-system-design-q8',
      objective: 'sd-intro-to-system-design-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'Estimating scale for a new app, you are told to expect 1,000,000 new posts per day, and to assume peak traffic is 5 times the daily average. A day has 86,400 seconds. Roughly what peak write rate should you plan for?',
      options: [
        {
          id: 'a',
          text: 'About 12 writes per second',
          explanation:
            'That is the daily average (1,000,000 / 86,400 ≈ 11.6). It ignores the stated peak of 5 times average.',
        },
        {
          id: 'b',
          text: 'About 600 writes per second',
          explanation:
            'This is ten times too high. 5 × 11.6 is about 58, not 600.',
        },
        {
          id: 'c',
          text: 'About 60 writes per second',
          explanation:
            'Correct. The average is about 11.6 writes per second, and 5 times that is about 58, so plan for roughly 60.',
        },
        {
          id: 'd',
          text: 'About 1,000 writes per second',
          explanation:
            'This looks like 1,000,000 divided by 1,000 rather than by the 86,400 seconds in a day.',
        },
      ],
      answer: 'c',
    },
  ],
  scenario: {
    prompt:
      'Your manager says: "We want an app where local restaurants post a daily lunch menu and office workers nearby can browse menus and pre-order. Launch is in one city." Write down: (1) three functional requirements; (2) three non-functional requirements with numbers you would propose and the questions you would ask to confirm them; (3) one rough estimate of scale; (4) the simplest high-level design that fits, and one trade-off it makes.',
    modelAnswer:
      '**Functional requirements.** Restaurants publish a menu for a date; workers browse menus near a location; workers place a pre-order for pickup at a chosen time, and the restaurant sees incoming orders.\n\n**Non-functional requirements (proposed, to confirm).** Menu pages load quickly for most users, say p99 under 1 second. Ordering is available during the lunch rush, say 99.9% of order requests succeed between 10:00 and 14:00. Orders are never silently lost once confirmed. Questions to ask: how many restaurants and workers at launch? Is there payment in the app? How late can an order be changed?\n\n**Estimate (illustrative).** Suppose 300 restaurants and 20,000 workers, each worker placing at most one order a day. That is at most 20,000 orders, concentrated in a few hours: 20,000 / (3 × 3,600) is under 2 orders per second on average in the rush, maybe a few times that at the peak. Menu views might be ten times orders. That is small.\n\n**Design.** One stateless app server (or two for redundancy) behind a load balancer, a single relational database for restaurants, menus and orders, and email or push notifications sent from a background job so a slow provider does not delay checkout.\n\n**Trade-off.** A single database is simple and keeps orders consistent, but it is a single point of failure; I accept that at this scale and rely on backups and a managed failover, and would revisit it before expanding to many cities.\n\nOther answers can be just as valid. A team might skip the background job, choose a different store or propose different targets; what matters is that the numbers are stated, the design follows from them, and the trade-off is named.',
    checklist: [
      'Lists functional requirements as behaviours a user can perform',
      'States non-functional requirements as measurable targets, not adjectives',
      'Asks clarifying questions instead of assuming scale',
      'Makes a rough estimate and shows the arithmetic',
      'Proposes a design no bigger than the requirements need',
      'Names at least one trade-off and why it is acceptable',
    ],
  },
  takeaways: [
    'System design is choosing components and how they interact, and being able to explain why.',
    'Functional requirements say what the system does; non-functional requirements say how well, and they drive most architecture decisions.',
    'Make qualities measurable with indicators and targets, and use percentiles rather than averages for latency.',
    'Qualities trade against each other, so a good design names what it gives up; 100% is almost never the right reliability target.',
    'Work in order: clarify requirements, estimate scale, sketch, go deep where it matters, then examine failures and trade-offs.',
  ],
  references: [
    {
      title: 'Designing Data-Intensive Applications',
      publisher: 'Martin Kleppmann, O’Reilly',
      url: 'https://dataintensive.net/',
      kind: 'source',
    },
    {
      title: 'The pillars of the framework (AWS Well-Architected Framework)',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html',
      kind: 'source',
    },
    {
      title: 'AWS Well-Architected Framework: Introduction',
      publisher: 'Amazon Web Services',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html',
      kind: 'source',
    },
    {
      title: 'Service Level Objectives (Site Reliability Engineering, ch. 4)',
      publisher: 'Google',
      url: 'https://sre.google/sre-book/service-level-objectives/',
      kind: 'source',
    },
    {
      title: 'Embracing Risk (Site Reliability Engineering, ch. 3)',
      publisher: 'Google',
      url: 'https://sre.google/sre-book/embracing-risk/',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}
