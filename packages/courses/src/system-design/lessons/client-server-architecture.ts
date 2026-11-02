import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'client-server-architecture',
  title: 'Client-Server Architecture',
  summary:
    'A client sends requests and a server answers them. Client and server are roles, not machines; keeping servers stateless lets you add more of them; and anything that must be trusted or kept secret belongs on the server side.',
  minutes: 12,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-client-server-architecture-1',
      text: 'describe the client and server roles in a request/response exchange, including that one program can be a server on one connection and a client on another.',
    },
    {
      id: 'sd-client-server-architecture-2',
      text: 'explain what a stateless server is, where the state goes instead, and why statelessness makes it easy to run several servers.',
    },
    {
      id: 'sd-client-server-architecture-3',
      text: 'decide which work belongs on the client and which must stay on the server, based on trust, secrets and shared data.',
    },
  ],
  concept: [
    {
      heading: 'Someone asks, someone answers',
      blocks: [
        {
          type: 'text',
          md: 'Every web app you have built already follows one pattern. A browser or mobile app **asks** for something: a page, a list of orders, "save this comment". A program somewhere else **answers**: it looks up data, applies rules and sends back a result. The asker is the **client**; the answerer is the **server**.\n\nThis split is the foundation of nearly every design in this course. It decides where code runs, where data lives, who you can trust, and what happens when you need to handle more users. Most of the later building blocks (load balancers, caches, queues) are ways of arranging more servers, or more layers of servers, behind the same basic exchange.',
        },
      ],
    },
    {
      heading: 'Roles, requests and responses',
      blocks: [
        {
          type: 'text',
          md: "HTTP's specification (RFC 9110) defines the roles precisely. A **client** is a program that opens a connection to send requests; a **server** is a program that accepts connections and sends back responses. The client always starts the exchange: a server does not send an HTTP response nobody asked for. (Techniques for server-to-client updates exist, but they are layered on top of this pattern.)\n\nTwo details matter for design:\n\n- **Client and server are roles, not machines.** RFC 9110 notes that the same program can be a client on some connections and a server on others. Your API server is a server to the browser and, at the same moment, a client of the database, the payment provider and any other service it calls.\n- **A request carries everything the server needs to act on it**: a method such as `GET` or `POST`, a target such as `/orders/42`, headers (for example, a cookie or token identifying the user) and sometimes a body. The response carries a **status code** (such as `200` or `404`), headers and usually a body.\n\nMDN's server-side guide describes the classic dynamic website: the browser sends a request, the web application works out what is being asked for, queries a database, puts the data into a template or JSON, and returns it. The data lives in the database, not in the server's files.",
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Client',
              definition:
                'The program that starts an exchange by sending a request, such as a browser, a mobile app or another service.',
            },
            {
              term: 'Server',
              definition:
                'The program that accepts requests and sends responses. A role, not a type of hardware.',
            },
            {
              term: 'Request / response',
              definition:
                'One message from client to server and the matching reply. The client waits for the response or gives up after a timeout.',
            },
            {
              term: 'Tier',
              definition:
                'A layer in the request path with one job: presentation (client), application logic (app servers) and data (databases).',
            },
            {
              term: 'Stateless server',
              definition:
                'A server that keeps no per-user data in its own memory between requests, so any copy of it can handle any request.',
            },
            {
              term: 'Reverse proxy',
              definition:
                'A server that receives client requests and forwards them to one of several servers behind it. RFC 9110 calls it a gateway.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Tiers and where state lives',
      blocks: [
        {
          type: 'text',
          md: 'A typical web system has three **tiers**: the client, a tier of **application servers** that hold the logic, and a **data tier** that stores what must last. Requests flow inward; data flows back out.\n\nThe important design question is **where state lives**. State is anything that must be remembered between requests: who is logged in, what is in a cart, which step of a form the user is on. If an app server keeps it in its own memory, two problems appear as soon as you run more than one server:\n\n- The next request may go to a **different** server, which has never heard of this user.\n- When a server restarts or crashes, the state it held is **gone**.\n\nA **stateless** application server keeps no such data between requests. The state goes somewhere shared instead: a database, a shared cache, or the client itself (for example, a signed token sent with each request). Then every server is interchangeable. RFC 9110 points out that many HTTP implementations rely on this property to load balance requests across multiple servers. Note that the *system* still has state; it has simply moved to the tier built to hold it.',
        },
        {
          type: 'diagram',
          caption:
            'Three tiers. App servers keep no user state of their own, so the proxy can send any request to either one.',
          nodes: [
            { id: 'web', label: 'Browser', kind: 'client', col: 0, row: 1 },
            {
              id: 'mobile',
              label: 'Mobile app',
              kind: 'client',
              col: 0,
              row: 3,
            },
            {
              id: 'proxy',
              label: 'Reverse proxy',
              kind: 'balancer',
              col: 1,
              row: 2,
            },
            {
              id: 'app1',
              label: 'App server A',
              kind: 'service',
              col: 2,
              row: 1,
            },
            {
              id: 'app2',
              label: 'App server B',
              kind: 'service',
              col: 2,
              row: 3,
            },
            {
              id: 'sessions',
              label: 'Session store',
              kind: 'cache',
              col: 3,
              row: 0,
            },
            { id: 'db', label: 'Database', kind: 'store', col: 3, row: 2 },
          ],
          edges: [
            { from: 'web', to: 'proxy', label: 'HTTPS request' },
            { from: 'mobile', to: 'proxy', label: 'HTTPS request' },
            { from: 'proxy', to: 'app1', label: 'any server' },
            { from: 'proxy', to: 'app2', label: 'any server' },
            { from: 'app1', to: 'sessions', label: 'look up session' },
            { from: 'app1', to: 'db', label: 'query' },
            { from: 'app2', to: 'db', label: 'query' },
          ],
        },
        {
          type: 'example',
          title: 'The cart that kept disappearing',
          md: "A small shop runs one app server and keeps each visitor's cart in a dictionary in server memory, keyed by a session cookie. It works.\n\nTraffic grows, so the team adds a second server behind a reverse proxy that alternates requests between them. Customers start reporting that items vanish from their cart and then reappear. Nothing is wrong with either server: a visitor adds an item on server A, and the next page load goes to server B, whose memory has no cart for that cookie.\n\nThe fix is to make the app servers stateless: store carts in the database or a shared cache, keyed by the session id. Now both servers see the same cart, and a restart no longer empties anyone's cart.",
        },
      ],
    },
    {
      heading: 'Splitting the work between client and server',
      blocks: [
        {
          type: 'text',
          md: 'The client runs on a device you do not control. Anyone can read its code, change it, or skip it entirely and send requests with a tool like `curl`. That leads to a simple rule: **the client is for experience, the server is for authority.**\n\n- **Good on the client:** rendering, instant feedback, input checks that save a round trip ("this email looks malformed"), caching what the user has already seen.\n- **Must be on the server:** anything that has to be true for every user. Checking permissions, enforcing prices and limits, validating input again before saving it, and holding secrets such as database credentials or a payment provider\'s API key.\n- **Shared data lives behind the server.** If two users must see the same inventory count, it is stored in one place on the server side, not in each client.\n\nReal-world examples follow the same split. A single-page app in the browser renders the interface and calls a JSON API; the API checks every request. A mobile banking app shows your balance, but the transfer rules run on the bank\'s servers. And between services the pattern repeats: an order service is a client of a payment service, which is a server to it.',
        },
      ],
    },
  ],
  application: {
    heading: 'Client-server in a real system, and its limits',
    blocks: [
      {
        type: 'text',
        md: 'A common production layout is exactly the diagram above: browsers and mobile apps call an API through a reverse proxy or load balancer, a pool of identical stateless app servers handles requests, and a database (plus perhaps a shared cache for sessions) holds the state. To handle more traffic you add app servers; because none of them holds user state, the new ones are useful immediately.\n\nLimits to keep in mind:\n\n- **The server side can still be a bottleneck or single point of failure.** Making app servers stateless moves the pressure onto the shared state store. Scaling and protecting that tier is the subject of later lessons on replication and sharding.\n- **Every request crosses a network.** Each round trip adds delay and a new way to fail: the server can be slow, unreachable or return an error, and the client must decide what to do, for example retry or show a message.\n- **The client starts every exchange.** If the server needs to tell the client something (a new chat message, a finished job), plain request/response forces the client to ask repeatedly. Mechanisms such as WebSockets and server-sent events exist for this, built on top of an initial client request.\n- **Statelessness has a cost.** Looking state up in a shared store on each request adds a network hop compared with reading local memory. That is usually a good trade for interchangeable servers, but it is a trade.',
      },
    ],
  },
  misconceptions: [
    {
      claim: 'A server is a physical machine in a data centre.',
      correction:
        'Client and server are roles a program plays on a connection. One machine can run many servers, and one program, such as an API server calling a database, can be a server and a client at the same time.',
    },
    {
      claim: 'If the browser validates a form, the server does not need to.',
      correction:
        'Anyone can bypass client code and send requests directly. Client checks improve the experience; the server must validate and authorize every request itself.',
    },
    {
      claim: 'A stateless system has no state.',
      correction:
        'Stateless describes the app servers: they keep no per-user data in their own memory between requests. The state still exists, in a database, a shared cache or a token the client sends.',
    },
  ],
  questions: [
    {
      id: 'sd-client-server-architecture-q1',
      objective: 'sd-client-server-architecture-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'In a plain HTTP request/response exchange, which side starts the exchange?',
      options: [
        {
          id: 'a',
          text: 'The server, whenever it has new data for the client',
          explanation:
            'In plain request/response the server only answers. Server-to-client updates need extra mechanisms built on a client request.',
        },
        {
          id: 'b',
          text: 'Whichever side has more data to send at that moment',
          explanation:
            'The amount of data does not decide anything. In HTTP the client always sends the request first, however large or small the response will be.',
        },
        {
          id: 'c',
          text: 'The client, by sending a request to the server',
          explanation:
            'Correct. The client sends a request; the server processes it and sends back a response.',
        },
        {
          id: 'd',
          text: 'Either side, depending on the HTTP method used',
          explanation:
            'The method says what the client wants done. It does not change who sends the request.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-client-server-architecture-q2',
      objective: 'sd-client-server-architecture-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Your API server receives a request from a browser and, to answer it, runs a query against PostgreSQL. On the connection to PostgreSQL, what role does the API server play?',
      options: [
        {
          id: 'a',
          text: 'Client, because it sends the query and waits for the result',
          explanation:
            'Correct. Roles are per connection: the API server is a server to the browser and a client of the database.',
        },
        {
          id: 'b',
          text: 'Server, because it is the program that runs on server hardware',
          explanation:
            'Client and server are roles, not hardware. On this connection the API server is the one asking.',
        },
        {
          id: 'c',
          text: 'Proxy, because it passes the browser request on to the database',
          explanation:
            'The API server does not forward the browser request; it runs its own query and builds its own response.',
        },
        {
          id: 'd',
          text: 'Server, because it already acts as a server for the browser',
          explanation:
            'A program can play different roles on different connections. Its role toward the browser does not carry over.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-client-server-architecture-q3',
      objective: 'sd-client-server-architecture-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'What makes an application server "stateless"?',
      options: [
        {
          id: 'a',
          text: 'It never writes anything to a database',
          explanation:
            'Stateless servers usually read and write databases constantly. The state lives there instead of in server memory.',
        },
        {
          id: 'b',
          text: 'It answers every request with the same response',
          explanation:
            'Responses can differ by user and data. Statelessness is about where data is kept between requests, not about identical output.',
        },
        {
          id: 'c',
          text: 'It does not use cookies or tokens of any kind',
          explanation:
            'Cookies and tokens are how a stateless server identifies the user on each request, by looking state up in a shared store.',
        },
        {
          id: 'd',
          text: 'It keeps no per-user data in memory between requests',
          explanation:
            'Correct. Each request carries or points to what is needed, so any instance can serve it.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-client-server-architecture-q4',
      objective: 'sd-client-server-architecture-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'An app stores logged-in sessions in server memory. After the team adds a second server behind a reverse proxy that alternates requests, users are randomly logged out. What is the best fix?',
      options: [
        {
          id: 'a',
          text: 'Give both servers more memory so sessions are not evicted',
          explanation:
            'Memory size is not the problem. Each server simply has no record of sessions created on the other one.',
        },
        {
          id: 'b',
          text: 'Store sessions in a shared store that both servers can read',
          explanation:
            'Correct. With sessions in a database or shared cache, either server can check any session, and restarts no longer log users out.',
        },
        {
          id: 'c',
          text: 'Remove the second server and buy a larger single machine',
          explanation:
            'That hides the symptom but keeps sessions tied to one machine, so a restart still logs everyone out and you cannot add servers later.',
        },
        {
          id: 'd',
          text: 'Make the browser resend the login form on every request',
          explanation:
            'Sending credentials with every request is a security and usability problem, and it does not fix where session state lives.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-client-server-architecture-q5',
      objective: 'sd-client-server-architecture-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why do stateless application servers make it easy to handle more traffic?',
      options: [
        {
          id: 'a',
          text: 'They process each request faster than stateful servers do',
          explanation:
            'Stateless servers are often slightly slower per request, since they look state up in a shared store instead of local memory.',
        },
        {
          id: 'b',
          text: 'They remove the need for a database in the system',
          explanation:
            'The state still has to live somewhere. Stateless servers depend on a shared data tier.',
        },
        {
          id: 'c',
          text: 'Any copy can serve any request, so you can just add copies',
          explanation:
            'Correct. Because no server holds user data of its own, new servers are useful as soon as they start.',
        },
        {
          id: 'd',
          text: 'They keep each user on the same server for the whole visit',
          explanation:
            'Pinning users to one server is what stateful servers need. Stateless servers avoid that requirement.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-client-server-architecture-q6',
      objective: 'sd-client-server-architecture-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A shop checks discount codes in browser JavaScript and sends the final discounted price to the server, which saves the order as received. What is the core problem?',
      options: [
        {
          id: 'a',
          text: 'The check runs slowly because browsers are slower than servers',
          explanation:
            'Speed is not the issue; the check is simple. The problem is that the result cannot be trusted.',
        },
        {
          id: 'b',
          text: 'The discount codes will not work for users on mobile browsers',
          explanation:
            'Mobile browsers run JavaScript too. The flaw is about trust, not compatibility.',
        },
        {
          id: 'c',
          text: 'The order could be saved twice if the user double-clicks',
          explanation:
            'Duplicate orders are a separate problem and nothing in the setup causes it. The question is about who decides the price.',
        },
        {
          id: 'd',
          text: 'Anyone can send any price, so the server must check it itself',
          explanation:
            'Correct. Client code can be modified or skipped, so prices and discounts must be computed or verified on the server.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-client-server-architecture-q7',
      objective: 'sd-client-server-architecture-3',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'Which of these must be kept on the server side only?',
      options: [
        {
          id: 'a',
          text: 'The layout and styling of the checkout page',
          explanation:
            "Presentation is the client's job; the browser needs the layout and styles to draw the page.",
        },
        {
          id: 'b',
          text: 'The secret API key for the payment provider',
          explanation:
            'Correct. Anything shipped to the client can be read, so secrets stay on the server, which calls the provider itself.',
        },
        {
          id: 'c',
          text: 'A check that the email field is not left empty',
          explanation:
            'This check is fine on the client for quick feedback, as long as the server validates again before saving.',
        },
        {
          id: 'd',
          text: 'The list of products the user just viewed',
          explanation:
            'Keeping recently viewed items on the client is a harmless convenience; it is not secret or authoritative.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-client-server-architecture-q8',
      objective: 'sd-client-server-architecture-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'To save time, a team builds a mobile app that connects straight to the production database, with the database username and password inside the app. What is the main problem?',
      options: [
        {
          id: 'a',
          text: 'Anyone can extract the credentials and run any query they like',
          explanation:
            'Correct. Whatever ships in the app can be extracted. An API server in between holds the credentials and allows only the operations each user is permitted.',
        },
        {
          id: 'b',
          text: 'Mobile networks are not able to carry database protocols',
          explanation:
            'Database protocols run over ordinary network connections. The problem is trust, not whether it works.',
        },
        {
          id: 'c',
          text: 'The database will be slower than an API at returning rows',
          explanation:
            'An API server adds a hop, if anything. The issue is that the database is exposed to untrusted clients.',
        },
        {
          id: 'd',
          text: 'App stores do not accept apps that contain a password',
          explanation:
            'Store policy is not the core design flaw. Even if accepted, the app would hand full database access to every user.',
        },
      ],
      answer: 'a',
    },
  ],
  scenario: {
    prompt:
      'You are designing a simple online quiz platform. Teachers create quizzes; students take them in a browser, and a quiz has a 20-minute time limit. The first version runs on one server, but the school expects to need several servers next term. Decide: (1) which work happens in the browser and which on the server, (2) where the timer and the answers in progress are stored, and (3) how your choices let you add servers later.',
    modelAnswer:
      "**Browser.** Render questions, show a countdown, save answers locally as the student types for a smooth experience, and send them to the server as they go.\n\n**Server.** Authenticate students and teachers; serve only quizzes the student is allowed to take; record the **start time** when the quiz is opened; accept answers and **reject any submitted after the deadline**; grade answers. Grading and the answer key stay on the server, because anything sent to the browser can be read.\n\n**Where state lives.** The quiz attempt (student, quiz, start time, answers so far) is stored in the database, not in server memory. The countdown in the browser is only a display; the server's stored start time is the authority. If the browser clock is changed or the page is reloaded, the server still knows the real deadline.\n\n**Adding servers.** Because no app server keeps the attempt in memory, any server can accept the next answer or the final submission. Adding a second or third server behind a load balancer needs no change to the code, and a restart does not lose anyone's progress.\n\nA different valid answer might keep answers in progress in a shared cache and write them to the database on submit, or sign the start time into a token the browser sends back. What matters is that the deadline and grading are enforced on the server and no attempt depends on one server's memory.",
    checklist: [
      'Keeps the answer key and grading on the server',
      'Treats the browser timer as display only and enforces the deadline on the server',
      "Stores attempt state in a shared store rather than one server's memory",
      'Explains why that lets any server handle any request',
      'Uses the client for responsiveness, not for decisions that must be trusted',
    ],
  },
  takeaways: [
    'A client sends requests and a server answers; the client always starts the exchange.',
    'Client and server are roles on a connection, so one program can be both at once.',
    'Stateless app servers keep no per-user data in memory, so any copy can serve any request and you can add copies freely.',
    'State does not disappear; it moves to a database, shared cache or a token the client carries.',
    'The client is for experience and the server is for authority: validate, authorize and keep secrets on the server.',
  ],
  references: [
    {
      title:
        'RFC 9110: HTTP Semantics, section 3.3 (Connections, Clients, and Servers)',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc9110.html#section-3.3',
      kind: 'source',
    },
    {
      title: 'Client-Server overview',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview',
      kind: 'source',
    },
    {
      title: 'Overview of HTTP',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview',
      kind: 'source',
    },
    {
      title:
        'Architectural Styles and the Design of Network-based Software Architectures, ch. 5 (REST)',
      publisher: 'Roy T. Fielding, University of California, Irvine',
      url: 'https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}
