import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'networking-basics',
  title: 'HTTP, DNS, TCP, and Networking',
  summary:
    'Between typing a URL and seeing a response, a client looks up an IP address with DNS, opens a TCP connection (and a TLS session for HTTPS), and exchanges HTTP messages over it. Each step costs time and can fail on its own, and HTTP versions differ in how they use connections.',
  minutes: 15,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-networking-basics-1',
      text: 'trace the steps from typing a URL to receiving a response (DNS lookup, TCP connection, TLS, HTTP request and response) and say which step a given failure points to.',
    },
    {
      id: 'sd-networking-basics-2',
      text: 'explain how DNS turns a name into an address, including resolvers, authoritative name servers, caching and TTL, and predict how a DNS change spreads.',
    },
    {
      id: 'sd-networking-basics-3',
      text: 'contrast what TCP guarantees with what HTTP adds, and explain how HTTP/1.1, HTTP/2 and HTTP/3 differ in their use of connections.',
    },
  ],
  concept: [
    {
      heading: 'Why a designer cares about the network',
      blocks: [
        {
          type: 'text',
          md: 'In the previous lesson, a client sent a request and a server answered. Between them sits the network, and it is not free. Before your server sees a single byte of a request, the client has had to find the server\'s address, set up a connection and, for HTTPS, agree on encryption. Each of those steps takes at least one trip across the network and back, and each can fail independently.\n\nThat matters for design in three ways. It explains **latency** you cannot remove by making your code faster. It explains **failures** that are not your code\'s fault ("the name doesn\'t resolve", "the connection timed out"). And it explains several design choices you will meet later, such as reusing connections, putting servers closer to users, and planning DNS changes ahead of a migration.',
        },
      ],
    },
    {
      heading: 'Layers: IP, TCP, TLS and HTTP',
      blocks: [
        {
          type: 'text',
          md: 'Network protocols stack, each one using the one below:\n\n- **IP** moves individual **packets** from one address to another. It makes no promise that packets arrive, or arrive in order.\n- **TCP** builds on IP to give two programs a **connection**: a reliable, in-order **byte stream**. It numbers the data, detects loss, retransmits, and controls how fast the sender may send. Setting up a connection takes a **three-way handshake**: the client sends SYN, the server replies SYN-ACK, the client sends ACK. That is one round trip before the request can go out.\n- **TLS** runs on top of TCP for HTTPS. It authenticates the server with a certificate and encrypts the bytes. It needs its own handshake after the TCP one.\n- **HTTP** is the application protocol: the client sends a request (method, target, headers, optional body) and the server sends a response (status code, headers, body). RFC 9110 defines HTTP as **stateless**: each request can be understood on its own.\n\nOne detail surprises many developers: TCP carries a stream of bytes, **not messages**. RFC 9293 states there is no link between the boundaries of what the sender writes and what the receiver reads. Two writes can arrive as one read, or one write as several. HTTP solves this with its own **framing** (headers that say where a message ends), which is one of the jobs HTTP does on top of TCP.',
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'IP address',
              definition:
                'The numeric address of a host on a network, such as 192.0.2.10. Packets are routed by IP address, not by name.',
            },
            {
              term: 'TCP',
              definition:
                'A transport protocol that gives a connection between two programs a reliable, in-order byte stream, with flow and congestion control.',
            },
            {
              term: 'Round trip',
              definition:
                'One message from client to server and its reply. Network latency is often counted in round trips, because each handshake costs at least one.',
            },
            {
              term: 'TLS',
              definition:
                'The protocol that authenticates the server and encrypts the connection. HTTPS is HTTP sent over TLS.',
            },
            {
              term: 'DNS resolver',
              definition:
                "The server a client asks to turn a name into an address. It queries other name servers on the client's behalf and caches the answers.",
            },
            {
              term: 'Authoritative name server',
              definition:
                'A name server that holds the original records for a domain, set by whoever manages that domain.',
            },
            {
              term: 'TTL (time to live)',
              definition:
                "For a DNS record, how long resolvers may keep it in their cache before asking again. Set by the domain's administrator.",
            },
          ],
        },
      ],
    },
    {
      heading: 'From a URL to a response',
      blocks: [
        {
          type: 'text',
          md: "Packets are routed by IP address, so the first job is to turn the name in the URL into an address. That is **DNS**, the Domain Name System. RFC 1034 describes it as three parts: a tree of names with records attached, **name servers** that hold those records, and **resolvers** that fetch records for clients.\n\nThe client checks its local cache first. If the answer is not there, it asks a **resolver** (usually run by the ISP, the company network or a public DNS service). If the resolver has no cached answer, it works down the tree of name servers until it reaches the domain's **authoritative name server**, which returns the record, for example an `A` record mapping `shop.example` to an IPv4 address.\n\nEach answer carries a **TTL**: the time a cache may keep it. Caching is what makes DNS fast, because most lookups are answered without leaving the resolver. It is also why DNS changes are not instant: a resolver that cached the old record keeps using it until the TTL runs out.\n\nWith the address in hand, the client opens a TCP connection, performs the TLS handshake for HTTPS, and sends the HTTP request. The server replies over the same connection.",
        },
        {
          type: 'diagram',
          caption:
            'Loading a page: a DNS lookup first, then a connection and the HTTP exchange with the web server.',
          nodes: [
            { id: 'browser', label: 'Browser', kind: 'client', col: 0, row: 2 },
            {
              id: 'resolver',
              label: 'DNS resolver',
              kind: 'service',
              col: 1,
              row: 0,
            },
            {
              id: 'auth',
              label: 'Authoritative DNS',
              kind: 'external',
              col: 3,
              row: 0,
            },
            { id: 'web', label: 'Web server', kind: 'service', col: 2, row: 2 },
            { id: 'db', label: 'Database', kind: 'store', col: 3, row: 2 },
          ],
          edges: [
            { from: 'browser', to: 'resolver', label: '1. name to address?' },
            {
              from: 'resolver',
              to: 'auth',
              label: 'only if not cached',
              dashed: true,
            },
            { from: 'browser', to: 'web', label: '2. TCP, TLS, HTTP' },
            { from: 'web', to: 'db', label: '3. query' },
          ],
        },
        {
          type: 'example',
          title: 'Reading a failure by its step',
          md: 'A user says "the site is down". Knowing the steps tells you where to look:\n\n- **The name does not resolve.** DNS failed: the record is missing, mistyped, or the domain has lapsed. Your servers may be perfectly healthy.\n- **The address resolves, but connecting times out.** The TCP connection never completes: the server is unreachable, a firewall drops the traffic, or nothing is listening.\n- **The connection opens, but the browser warns about the certificate.** The TLS handshake failed, for example because the certificate expired or does not match the name.\n- **You get a response with status `502` or `503`.** The network path worked; the problem is in the servers behind the one that answered.\n\nCommand-line tools such as `dig` (DNS) and `curl -v` (connection, TLS and HTTP) show each step separately.',
        },
      ],
    },
    {
      heading: 'HTTP versions and connections',
      blocks: [
        {
          type: 'text',
          md: "Because opening a connection costs handshakes, how HTTP uses connections matters. MDN's history of HTTP summarizes the evolution:\n\n- **HTTP/1.1** made connections **persistent**: one TCP connection can carry many requests one after another, so the handshakes are paid once. But on a connection, a response must finish before the next request's response can start. MDN notes that browsers work around this by opening several connections per origin, up to six in most browsers.\n- **HTTP/2** is a **binary** protocol that **multiplexes** many requests in parallel over one TCP connection. The catch is that TCP delivers bytes strictly in order, so one lost packet stalls every request on that connection until it is retransmitted. RFC 9114 describes exactly this: a lost or reordered packet causes all active transactions to stall.\n- **HTTP/3** keeps the same HTTP semantics but replaces TCP with **QUIC**, which runs over UDP and recovers lost packets **per stream**. A lost packet now blocks only the stream it belonged to.\n\nThe meaning of methods, status codes and headers is the same in all three versions; they differ in how messages travel. In practice this is mostly handled by browsers, servers and proxies, but it explains why reusing connections matters so much for latency.",
        },
      ],
    },
  ],
  application: {
    heading: 'Networking decisions in real systems, and their limits',
    blocks: [
      {
        type: 'text',
        md: 'These mechanics show up directly in design and operations:\n\n- **Planning a migration with DNS.** Before moving a site to new servers, teams lower the record\'s TTL well in advance (at least one old TTL ahead), so that when they switch the record, caches pick up the new address quickly. They also keep the old servers running until the old TTL has passed, since some clients will still use the old address.\n- **Reusing connections between services.** A service that calls another service over HTTPS for every request pays a TCP and TLS handshake each time unless it reuses connections. HTTP clients usually keep a **connection pool** for this reason.\n- **Status codes as signals.** Because HTTP\'s meaning is the same regardless of version, load balancers and clients can act on status codes, for example treating a `503` as "try again later".\n\nLimits to keep in mind:\n\n- **You cannot force caches to forget.** Once a resolver has cached a record, it may use it until the TTL expires. A long TTL means fewer lookups but slower changes.\n- **The speed of light does not negotiate.** Each handshake costs at least one round trip, and round trips grow with distance. Faster code cannot remove them; only fewer round trips or shorter distances can, which is why later lessons cover CDNs and multiple regions.\n- **Newer HTTP versions help, but do not remove every delay.** HTTP/2 still suffers when TCP loses a packet, and a slow server is slow over any protocol.',
      },
    ],
  },
  misconceptions: [
    {
      claim: 'TCP delivers the messages your program sends, one at a time.',
      correction:
        'TCP delivers a byte stream. It keeps bytes reliable and in order, but write boundaries are not preserved, so protocols such as HTTP add their own framing to mark where a message ends.',
    },
    {
      claim:
        'When you change a DNS record, everyone sees the new address immediately.',
      correction:
        'Resolvers may keep the old record until its TTL expires. Changes spread as caches expire, which is why teams lower the TTL before a planned change.',
    },
    {
      claim: 'HTTP/2 removed head-of-line blocking completely.',
      correction:
        'HTTP/2 lets many requests share one connection, but it still runs over TCP, so one lost packet stalls all of them until it is retransmitted. HTTP/3 over QUIC recovers losses per stream to avoid this.',
    },
  ],
  questions: [
    {
      id: 'sd-networking-basics-q1',
      objective: 'sd-networking-basics-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'A browser loads https://shop.example/ for the first time, with nothing cached. In what order do these steps happen?',
      options: [
        {
          id: 'a',
          text: 'DNS lookup, TCP handshake, TLS handshake, HTTP request',
          explanation:
            'Correct. The client needs an address before it can connect, a TCP connection before TLS, and TLS before sending the HTTPS request.',
        },
        {
          id: 'b',
          text: 'TCP handshake, DNS lookup, HTTP request, TLS handshake',
          explanation:
            'The client cannot open a TCP connection without the IP address DNS provides, and TLS must be set up before the request is sent.',
        },
        {
          id: 'c',
          text: 'DNS lookup, HTTP request, TCP handshake, TLS handshake',
          explanation:
            'The HTTP request travels over the connection, so the TCP and TLS handshakes have to happen first.',
        },
        {
          id: 'd',
          text: 'TLS handshake, DNS lookup, TCP handshake, HTTP request',
          explanation:
            'TLS runs over an existing TCP connection to a known address, so it cannot come before DNS or TCP.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-networking-basics-q2',
      objective: 'sd-networking-basics-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Running `curl -v https://api.example.com` shows the hostname resolving to an IP address, then the connection attempt times out with no response. Which step failed?',
      options: [
        {
          id: 'a',
          text: 'The DNS lookup, because the record must be wrong',
          explanation:
            'The name did resolve to an address. A wrong record is possible, but the failing step is establishing the connection.',
        },
        {
          id: 'b',
          text: 'The HTTP layer, because the server returned an error',
          explanation:
            'No response was received at all, so there was no HTTP status to read. The failure happened before any HTTP exchange.',
        },
        {
          id: 'c',
          text: 'Opening the TCP connection to that address',
          explanation:
            'Correct. Name resolution succeeded but the handshake never completed: the host may be unreachable, blocked by a firewall, or not listening.',
        },
        {
          id: 'd',
          text: 'The TLS handshake, because the certificate expired',
          explanation:
            'An expired certificate produces a certificate error after the connection opens, not a connection timeout.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-networking-basics-q3',
      objective: 'sd-networking-basics-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'What does the TTL on a DNS record control?',
      options: [
        {
          id: 'a',
          text: 'How many name servers a lookup may pass through',
          explanation:
            'The DNS record TTL is a time limit for caching, not a count of hops.',
        },
        {
          id: 'b',
          text: 'How long a cache may keep the record before asking again',
          explanation:
            'Correct. RFC 1034 defines the TTL as the time limit on how long a record can be kept in a cache.',
        },
        {
          id: 'c',
          text: 'How long a TCP connection to that address stays open',
          explanation:
            'DNS records do not control TCP connections; connection lifetime is decided by the client and server.',
        },
        {
          id: 'd',
          text: 'How long the domain stays registered to its owner',
          explanation:
            'Domain registration periods are handled by registrars, not by the TTL on individual records.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-networking-basics-q4',
      objective: 'sd-networking-basics-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        "Your site's A record has a TTL of 86,400 seconds (one day). At noon you point it at a new server and shut the old server down at 12:05. What should you expect?",
      options: [
        {
          id: 'a',
          text: 'All users reach the new server within a few seconds of the change',
          explanation:
            'Resolvers that cached the old record may keep using it until its TTL expires, up to a day later.',
        },
        {
          id: 'b',
          text: 'Nobody can reach the site until every resolver has refreshed',
          explanation:
            'Resolvers without a cached copy, or whose copy expires, fetch the new record right away, so many users reach the new server.',
        },
        {
          id: 'c',
          text: 'Users only reach the new server after they clear their browser',
          explanation:
            "The stale copies that matter are in resolvers, not only in the browser. Clearing the browser does not clear the resolver's cache.",
        },
        {
          id: 'd',
          text: 'Some users keep the old address for up to a day and see failures',
          explanation:
            'Correct. Cached copies of the old record stay valid until the TTL runs out. The fix is to lower the TTL in advance and keep the old server up longer.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-networking-basics-q5',
      objective: 'sd-networking-basics-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'What is the difference between a recursive DNS resolver and an authoritative name server?',
      options: [
        {
          id: 'a',
          text: "The resolver finds answers for clients; the authoritative one holds a domain's records",
          explanation:
            "Correct. Resolvers query name servers on a client's behalf and cache results; authoritative servers hold the original records for their zone.",
        },
        {
          id: 'b',
          text: "The resolver holds a domain's records; the authoritative one caches other answers",
          explanation:
            "This reverses the roles. The authoritative server is the source of a domain's records; the resolver is the one that caches.",
        },
        {
          id: 'c',
          text: 'The resolver handles IPv4 lookups; the authoritative one handles IPv6',
          explanation:
            'Both kinds handle any record type. The difference is their role, not the address family.',
        },
        {
          id: 'd',
          text: 'The resolver runs in the browser; the authoritative one runs at the ISP',
          explanation:
            'Resolvers are usually run by ISPs, companies or public services, and authoritative servers are run by or for the domain owner.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-networking-basics-q6',
      objective: 'sd-networking-basics-3',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'A developer writes a custom protocol over raw TCP. The sender writes two separate JSON messages, but the receiver sometimes reads both in one call. Why?',
      options: [
        {
          id: 'a',
          text: 'TCP lost a packet and merged the retransmission with the next message',
          explanation:
            'Retransmission restores missing bytes in order; it does not explain the merging. Merged reads happen even with no loss.',
        },
        {
          id: 'b',
          text: 'TCP is a byte stream, so the app must mark where each message ends',
          explanation:
            'Correct. TCP keeps bytes reliable and ordered but does not preserve write boundaries. Protocols such as HTTP add framing for this.',
        },
        {
          id: 'c',
          text: 'TCP sends each message as one packet but the receiver reads too slowly',
          explanation:
            'TCP does not promise one message per packet or per read. Read speed is not the root cause; missing framing is.',
        },
        {
          id: 'd',
          text: 'The receiver should have used UDP, which never splits or joins data',
          explanation:
            'UDP does keep datagram boundaries, but it gives up reliability and ordering. The fix for this bug is framing over TCP.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-networking-basics-q7',
      objective: 'sd-networking-basics-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'What problem of HTTP/2 does HTTP/3 address by running over QUIC instead of TCP?',
      options: [
        {
          id: 'a',
          text: 'HTTP/2 could send only one request at a time on a connection',
          explanation:
            'HTTP/2 already multiplexes many requests in parallel over one connection; that was its main change from HTTP/1.1.',
        },
        {
          id: 'b',
          text: 'HTTP/2 messages were text, which made them slow to parse',
          explanation:
            'HTTP/2 is already a binary protocol. Text framing was a feature of HTTP/1.x.',
        },
        {
          id: 'c',
          text: 'HTTP/2 had different methods and status codes from HTTP/1.1',
          explanation:
            'All HTTP versions share the same semantics: methods, status codes and headers mean the same thing.',
        },
        {
          id: 'd',
          text: 'One lost TCP packet stalls every request on the HTTP/2 connection',
          explanation:
            'Correct. TCP delivers bytes strictly in order, so a loss blocks all streams. QUIC recovers losses per stream, so only the affected stream waits.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-networking-basics-q8',
      objective: 'sd-networking-basics-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why do persistent connections (HTTP keep-alive) reduce latency for a client that sends many requests to the same server?',
      options: [
        {
          id: 'a',
          text: 'They compress headers so each request carries fewer bytes',
          explanation:
            'Header compression is a separate feature of HTTP/2 and HTTP/3. Keep-alive is about reusing a connection.',
        },
        {
          id: 'b',
          text: 'They let the server push responses before they are requested',
          explanation:
            'Reusing a connection does not change who starts an exchange; the client still sends each request.',
        },
        {
          id: 'c',
          text: 'Later requests skip the TCP and TLS handshakes already done',
          explanation:
            'Correct. Each new connection costs at least one round trip for TCP plus the TLS handshake; reusing one pays that once.',
        },
        {
          id: 'd',
          text: 'They make DNS lookups unnecessary for the rest of the session',
          explanation:
            'DNS is a separate step, and its results are cached by TTL anyway. Keep-alive saves connection setup, not lookups.',
        },
      ],
      answer: 'c',
    },
  ],
  scenario: {
    prompt:
      'Your company is moving its web app from an old hosting provider to a new one this Saturday. The app is reached at www.shop.example, whose A record currently has a TTL of 24 hours. Users are worldwide. Write a plan that covers: (1) what to do with DNS before, during and after the move, (2) how long to keep the old servers running, and (3) how you would check, step by step, that a user can reach the new servers.',
    modelAnswer:
      "**Before.** At least 24 hours before the move (one full old TTL), lower the record's TTL to something short, for example 5 minutes. Resolvers that cached the old record with a 24-hour TTL will have refreshed by Saturday and will now hold the record for only a few minutes. Make sure the new servers are serving the app and have a valid TLS certificate for www.shop.example before switching.\n\n**During.** Change the A record to the new address. Because the TTL is now short, most resolvers pick up the change within minutes.\n\n**Old servers.** Keep them running for a while after the switch, at least the short TTL plus a safety margin, and longer if possible, because some clients and resolvers do not refresh exactly on time. If both providers serve the same database, writes from either side are safe; if not, plan how to handle writes that land on the old servers.\n\n**After.** Once traffic on the old servers has dropped to nothing, shut them down and raise the TTL again to reduce lookup load.\n\n**Checking a user's path, step by step.** `dig www.shop.example` (from more than one network or public resolver) to confirm the new address is returned; `curl -v https://www.shop.example` to confirm the TCP connection opens, the TLS certificate is valid for the name, and the HTTP response is `200`.\n\nOther valid plans exist: for example, putting a reverse proxy or load balancer on the old address that forwards to the new servers removes the dependency on DNS timing. What matters is respecting the old TTL and checking each layer separately.",
    checklist: [
      'Lowers the TTL at least one old TTL before the switch',
      'Keeps the old servers available while cached records still point at them',
      'Confirms the new servers have a valid TLS certificate for the name',
      'Verifies DNS, TCP/TLS and HTTP as separate steps',
      'Restores a longer TTL once the move is complete',
    ],
  },
  takeaways: [
    'Loading a URL means a DNS lookup, a TCP connection, a TLS handshake for HTTPS, and then the HTTP request and response.',
    'Each step costs at least one round trip and can fail on its own, so a failure tells you which layer to inspect.',
    'DNS answers are cached for their TTL, so changes spread gradually; lower the TTL before a planned change.',
    'TCP gives a reliable, ordered byte stream but no message boundaries; HTTP adds framing and request/response meaning on top.',
    'HTTP/1.1 reuses connections, HTTP/2 multiplexes over one TCP connection, and HTTP/3 uses QUIC so one lost packet stalls only its own stream.',
  ],
  references: [
    {
      title: 'How the web works',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works',
      kind: 'source',
    },
    {
      title: 'RFC 1034: Domain Names, Concepts and Facilities',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc1034.html',
      kind: 'source',
    },
    {
      title: 'RFC 9293: Transmission Control Protocol (TCP)',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc9293.html',
      kind: 'source',
    },
    {
      title: 'RFC 9110: HTTP Semantics',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc9110.html',
      kind: 'source',
    },
    {
      title: 'Evolution of HTTP',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP',
      kind: 'source',
    },
    {
      title: 'RFC 9114: HTTP/3',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc9114.html',
      kind: 'source',
    },
    {
      title: 'What is a domain name?',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}
