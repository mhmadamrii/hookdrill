import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'service-discovery',
  title: 'Service Discovery',
  summary:
    'Instances start, stop and move, so their addresses cannot be hard-coded. A service registry, kept accurate by registration and health checks, lets callers find healthy instances by name.',
  minutes: 16,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-service-discovery-1',
      text: 'explain why hard-coded addresses break when instances scale, fail or move, and what a service registry stores.',
    },
    {
      id: 'sd-service-discovery-2',
      text: 'compare client-side, server-side and DNS-based discovery, and name the trade-offs of each.',
    },
    {
      id: 'sd-service-discovery-3',
      text: 'explain how registration and health checks keep the registry accurate, and diagnose problems caused by stale or wrong discovery data.',
    },
  ],
  concept: [
    {
      heading: 'Where is the payments service right now?',
      blocks: [
        {
          type: 'text',
          md: 'In a small app, the orders service might find the payments service through a config line like `PAYMENTS_URL=http://10.0.1.12:8080`. That works while payments lives on one fixed machine.\n\nIt stops working once instances come and go:\n\n- **Autoscaling** adds instances under load and removes them later.\n- **Deploys** replace old instances with new ones.\n- **Failures** kill instances, and replacements start somewhere else.\n- **Containers and VMs** usually get a different IP address each time they start.\n\nThe Kubernetes documentation puts it plainly: the set of Pods running an application at one moment can differ from the set running it a moment later. A hard-coded list is out of date as soon as anything changes, and callers end up sending traffic to addresses that no longer exist while new instances sit idle.\n\n**Service discovery** solves this by letting callers ask for a service **by name** and get back the current, healthy instances. The Load Balancing lesson showed one half of the job, spreading requests across a known set of servers. Discovery is the other half: keeping that set accurate as it changes.',
        },
      ],
    },
    {
      heading: 'Registries, registration and health',
      blocks: [
        {
          type: 'text',
          md: "At the centre is a **service registry**: a database that maps each service name to the network locations (address and port) of its available instances, often with health status and metadata. Consul calls its registry the catalog, a single source of truth for what is running where.\n\nThe registry is only useful if it is accurate, and two mechanisms keep it that way:\n\n**Registration** gets instances in and out.\n\n- With **self-registration**, each instance registers itself at startup, renews its registration periodically, and unregisters on shutdown. The drawback: an instance that crashes or hangs cannot unregister itself, and every service needs registration code for its language or framework.\n- With **third-party registration**, the platform does it. In Kubernetes, the control plane watches for Pods that match a Service's selector and keeps the Service's **EndpointSlices** (its list of endpoints) up to date. The application does nothing.\n\n**Health checks** get broken instances out. The registry or platform probes each instance, and failing ones stop receiving traffic. Consul removes unhealthy instances from the pool it returns. In Kubernetes, when a Pod's **readiness probe** fails, its IP is removed from the EndpointSlices of every Service that selects it, and a new Pod receives no traffic until its readiness probe first succeeds.\n\nA registry that relies on periodic renewal learns about a crashed instance from the renewals that stop arriving; one that relies on health checks learns from failed checks. Either way there is a delay, so callers still need timeouts and retries for the short window when the registry is behind.",
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Service registry',
              definition:
                'A database of the network locations of each service’s available instances, looked up by service name.',
            },
            {
              term: 'Self-registration',
              definition:
                'Each instance registers itself on startup, renews periodically, and unregisters on shutdown.',
            },
            {
              term: 'Third-party registration',
              definition:
                'The platform, not the instance, adds and removes instances from the registry, as Kubernetes does with EndpointSlices.',
            },
            {
              term: 'Readiness probe',
              definition:
                'A Kubernetes health check that decides whether a Pod should receive traffic; failing it removes the Pod from Service endpoints.',
            },
            {
              term: 'SRV record',
              definition:
                'A DNS record that gives the host and port for a named service, with a priority and a weight for each target.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Client-side, server-side and DNS-based discovery',
      blocks: [
        {
          type: 'text',
          md: "Once the registry exists, someone has to query it and pick an instance.\n\n**Client-side discovery.** The caller asks the registry for the instances of `payments`, chooses one (for example round-robin), and sends the request directly. Netflix's Eureka registry with the Ribbon client library is the classic example. It has fewer network hops, but every caller is coupled to the registry, and the lookup-and-choose logic must exist in every language your services use.\n\n**Server-side discovery.** The caller sends every request to a **router or load balancer** at a stable, well-known address. The router consults the registry and forwards the request to a healthy instance. Callers stay simple and language does not matter. The cost is an extra hop and one more component to run, replicate and scale, unless your platform provides it. AWS Elastic Load Balancing works this way, with instances registered through the API or an auto scaling group, and so does a Kubernetes Service with a cluster IP.\n\n**DNS-based discovery.** DNS is a registry everyone already knows how to query. A name such as `payments.prod.svc` resolves to the current instances, or an **SRV record** (RFC 2782), named like `_http._tcp.payments.example.com`, returns hosts and ports with a **priority** (try the lowest number first, move to higher numbers only if those are unreachable) and a **weight** (share traffic among targets of equal priority). Kubernetes gives every Service a DNS name such as `my-service.my-ns`, with SRV records for named ports, and Consul offers a DNS interface to its catalog. The catch is **caching**: resolvers and clients keep answers until they look up again, so DNS can lag behind the registry, and a client that resolves once at startup may never notice changes.",
        },
        {
          type: 'diagram',
          caption:
            'Server-side discovery: the orders service calls one stable address. The router reads healthy endpoints from the registry, which instances join through registration and health checks.',
          nodes: [
            {
              id: 'orders',
              label: 'Orders service',
              kind: 'service',
              col: 0,
              row: 2,
            },
            {
              id: 'router',
              label: 'Payments router',
              kind: 'balancer',
              col: 2,
              row: 2,
            },
            {
              id: 'registry',
              label: 'Service registry',
              kind: 'store',
              col: 2,
              row: 0,
            },
            { id: 'p1', label: 'Payments #1', kind: 'service', col: 4, row: 1 },
            { id: 'p2', label: 'Payments #2', kind: 'service', col: 4, row: 2 },
            {
              id: 'p3',
              label: 'Payments #3 (starting)',
              kind: 'service',
              col: 4,
              row: 3,
            },
          ],
          edges: [
            { from: 'orders', to: 'router', label: 'payments:443' },
            { from: 'router', to: 'registry', label: 'healthy endpoints' },
            { from: 'router', to: 'p1' },
            { from: 'router', to: 'p2' },
            {
              from: 'p1',
              to: 'registry',
              label: 'register + health',
              dashed: true,
            },
            {
              from: 'p3',
              to: 'registry',
              label: 'not ready yet',
              dashed: true,
            },
          ],
        },
        {
          type: 'example',
          title: 'Scaling up during a sale',
          md: "Payments runs three instances. Traffic rises, and the autoscaler starts two more.\n\n- **With hard-coded addresses:** callers keep using the original three; the new ones sit idle until someone edits config and redeploys the callers.\n- **With discovery:** each new instance starts, loads its config and warms its connections. Only when its readiness check passes does it appear in the registry's list of healthy endpoints, and the router starts sending it traffic. Callers changed nothing.\n\nWhen the sale ends and two instances are removed, they are taken out of the healthy list first, finish the requests they already have, and then stop. A caller that resolved DNS a few minutes ago and cached the answer may still try a removed address once, which is why it needs a timeout and a retry to another instance.",
        },
      ],
    },
    {
      heading: 'Discovery in real platforms',
      blocks: [
        {
          type: 'text',
          md: "- **Kubernetes** gives each Service a stable name and a cluster IP. The control plane keeps the Service's EndpointSlices matched to ready Pods, and in-cluster DNS resolves the name. Kubernetes also injects environment variables for Services, but only for Services that existed when the Pod started, which is one reason DNS is the more robust option. A **headless** Service (cluster IP set to `None`) skips the virtual IP: DNS returns the Pod IPs directly and the client chooses.\n- **Consul** keeps a catalog of services, removes instances that fail health checks, and lets consumers look up services through Consul DNS.\n- **Netflix Eureka with Ribbon** is the well-known client-side design: services register with Eureka, and the Ribbon HTTP client in each caller looks up and picks instances.\n- **Cloud load balancers** such as AWS ELB act as server-side discovery, with the load balancer as both router and registry.",
        },
      ],
    },
  ],
  application: {
    heading: 'Running discovery in production, and its limits',
    blocks: [
      {
        type: 'text',
        md: '- **The registry is now critical.** If nobody can look up anything, nothing can call anything. Run it replicated, and have callers or routers keep using their last known list if the registry is briefly unreachable.\n- **Health checks can lie.** A check that only confirms the port is open will pass for a process that is deadlocked. A useful readiness check exercises what the service needs to serve a request. But a check that also fails whenever a shared dependency hiccups can mark every instance unhealthy at once.\n- **Readiness is not liveness.** In Kubernetes, a failing readiness probe removes a Pod from traffic; a failing liveness probe restarts its container. Using liveness for slow startups or dependency outages causes needless restarts, and the Kubernetes docs warn that badly implemented liveness probes can lead to cascading failures.\n- **Stale data is normal.** Between an instance dying and the registry noticing, and between the registry changing and DNS caches expiring, some requests will go to the wrong place. Timeouts and retries to another instance cover that window.\n- **Shut down gracefully.** Take an instance out of the healthy list before stopping it, so in-flight requests finish and new ones go elsewhere.\n\nDiscovery tells callers **where** instances are. Choosing among them is load balancing, and handling the moments when the answer is wrong is fault tolerance.',
      },
    ],
  },
  misconceptions: [
    {
      claim:
        'Once DNS is updated, all clients immediately use the new addresses.',
      correction:
        'Resolvers and clients cache DNS answers, and some clients resolve only once at startup. Changes reach callers only as those caches expire or the client looks up again.',
    },
    {
      claim: 'If an instance is in the registry, it can serve traffic.',
      correction:
        'Registration only says an instance exists. Health and readiness checks decide whether it should receive traffic, and an instance that crashed may stay registered until its renewals stop or its checks fail.',
    },
    {
      claim: 'Service discovery and load balancing are the same thing.',
      correction:
        'Discovery keeps the list of instances accurate; load balancing chooses one for each request. In server-side discovery one component, the router, does both, which is why they are easy to confuse.',
    },
  ],
  questions: [
    {
      id: 'sd-service-discovery-q1',
      objective: 'sd-service-discovery-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'What does a service registry store?',
      options: [
        {
          id: 'a',
          text: 'The source code version deployed on each instance',
          explanation:
            'Deployment tools track versions. A registry may hold metadata, but its job is locating instances.',
        },
        {
          id: 'b',
          text: 'A log of every request each service has handled',
          explanation:
            'Request logs belong to logging and tracing systems, not to discovery.',
        },
        {
          id: 'c',
          text: 'The database schema each service reads and writes',
          explanation:
            'Schemas are managed by the databases and migrations, not by discovery.',
        },
        {
          id: 'd',
          text: 'The network locations of available instances, by service name',
          explanation:
            'Correct. Callers look up a service by name and get the addresses and ports of its instances.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-service-discovery-q2',
      objective: 'sd-service-discovery-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt: 'In a DNS SRV record, what does the priority field control?',
      options: [
        {
          id: 'a',
          text: 'The share of traffic among targets of equal priority',
          explanation:
            'That is the weight field. Priority decides the order of groups, weight splits traffic within a group.',
        },
        {
          id: 'b',
          text: 'Which targets to try first: the lowest number goes first',
          explanation:
            'Correct. Clients use the lowest-numbered priority first and move to higher numbers only if those targets are unreachable.',
        },
        {
          id: 'c',
          text: 'How long resolvers may cache the record before asking again',
          explanation:
            'Caching time is set by the record’s TTL, not by its priority.',
        },
        {
          id: 'd',
          text: 'The port on the target host where the service listens',
          explanation: 'The SRV record has a separate port field for that.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-service-discovery-q3',
      objective: 'sd-service-discovery-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'What is the key difference between client-side and server-side discovery?',
      options: [
        {
          id: 'a',
          text: 'Client-side discovery works without any service registry',
          explanation:
            'In client-side discovery the caller queries the registry itself, so a registry is still needed.',
        },
        {
          id: 'b',
          text: 'Server-side discovery needs discovery code in every language',
          explanation:
            'This is reversed. Client-side discovery needs logic in every caller; server-side keeps callers simple.',
        },
        {
          id: 'c',
          text: 'Client-side callers query and pick; server-side a router does both',
          explanation:
            'Correct. Client-side puts lookup and choice in the caller; server-side moves them into a router or load balancer.',
        },
        {
          id: 'd',
          text: 'Client-side always uses DNS, and server-side never does',
          explanation:
            'Either style can use DNS or a registry API; the difference is who does the lookup and choosing.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-service-discovery-q4',
      objective: 'sd-service-discovery-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'Why do hard-coded instance addresses break in an autoscaled container platform?',
      options: [
        {
          id: 'a',
          text: 'Instances are created and replaced with new addresses, so lists go stale',
          explanation:
            'Correct. Scaling, deploys and failures keep changing which instances exist and where, so a fixed list soon points at the wrong places.',
        },
        {
          id: 'b',
          text: 'IP addresses are too long to keep in a configuration file',
          explanation:
            'Length is not an issue. The problem is that the addresses keep changing.',
        },
        {
          id: 'c',
          text: 'DNS rules forbid putting raw IP addresses in configuration',
          explanation:
            'No such rule exists. Raw IPs work; they just go out of date.',
        },
        {
          id: 'd',
          text: 'Load balancers drop any request that is sent to a raw IP',
          explanation:
            'Load balancers do not reject requests for that reason. The issue is stale lists, not request format.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-service-discovery-q5',
      objective: 'sd-service-discovery-3',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'Under self-registration, an instance loses power without warning. How does the registry learn it is gone?',
      options: [
        {
          id: 'a',
          text: 'The instance sends an unregister call as it shuts down',
          explanation:
            'A sudden power loss gives the instance no chance to unregister. That only works on a clean shutdown.',
        },
        {
          id: 'b',
          text: 'Its renewals stop or its health checks fail, so it is dropped',
          explanation:
            'Correct. Missing renewals or failed checks reveal the dead instance, after some delay.',
        },
        {
          id: 'c',
          text: 'The load balancer edits the instance’s own configuration',
          explanation:
            'The instance is off; editing its configuration would tell the registry nothing.',
        },
        {
          id: 'd',
          text: 'It cannot: an operator must always delete the entry by hand',
          explanation:
            'Registries are designed to detect dead instances through renewals and health checks, without manual work.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-service-discovery-q6',
      objective: 'sd-service-discovery-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'In Kubernetes, new Pods of a service need about 30 seconds to warm a cache before they can answer correctly, and requests sent to them during that time fail. What should you add?',
      options: [
        {
          id: 'a',
          text: 'A liveness probe that restarts any Pod that is still warming up',
          explanation:
            'Restarting a warming Pod resets its warm-up, so it may never become ready. Liveness is for restarting broken containers.',
        },
        {
          id: 'b',
          text: 'More replicas, so that fewer requests land on any new Pod',
          explanation:
            'New Pods would still get traffic before they are ready; the failures would only be spread thinner.',
        },
        {
          id: 'c',
          text: 'A readiness probe that passes only once the warm-up is done',
          explanation:
            'Correct. A Pod receives Service traffic only after its readiness probe succeeds.',
        },
        {
          id: 'd',
          text: 'A headless Service, so that callers pick the Pods themselves',
          explanation:
            'Headless DNS returns the Pods that count as ready. With no readiness probe a warming Pod counts as ready, so callers would still pick it.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-service-discovery-q7',
      objective: 'sd-service-discovery-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Services find each other through DNS. After two instances were removed, some callers kept sending them requests for several minutes. What is the most likely cause?',
      options: [
        {
          id: 'a',
          text: 'Callers or resolvers cached the old DNS answer until it expired',
          explanation:
            'Correct. Cached DNS answers keep old addresses in use until the cache expires or the client resolves again.',
        },
        {
          id: 'b',
          text: 'The SRV weights of the remaining instances were all zero',
          explanation:
            'Weights shape how traffic is shared among listed targets; they would not make callers use removed ones.',
        },
        {
          id: 'c',
          text: 'The registry kept too many replicas of its own data',
          explanation:
            'Registry replication improves availability; it does not send callers to removed instances.',
        },
        {
          id: 'd',
          text: 'The removed instances re-registered after they had stopped',
          explanation:
            'A stopped instance cannot register itself, so it cannot reappear on its own.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-service-discovery-q8',
      objective: 'sd-service-discovery-2',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'Your services are written in Go, Python and Node.js, and the team does not want to maintain discovery logic in each language. Which approach fits best?',
      options: [
        {
          id: 'a',
          text: 'A client-side discovery library added to each service',
          explanation:
            'That is exactly the per-language logic the team wants to avoid.',
        },
        {
          id: 'b',
          text: 'Instance lists kept in one shared configuration file',
          explanation:
            'Hard-coded lists go stale as instances change, whichever file holds them.',
        },
        {
          id: 'c',
          text: 'Each service polls the registry API and picks at random',
          explanation:
            'This is client-side discovery, so it still needs lookup code in every language.',
        },
        {
          id: 'd',
          text: 'Server-side discovery through a router that reads the registry',
          explanation:
            'Correct. Callers only send to a stable address; the router does lookup and choice for every language.',
        },
      ],
      answer: 'd',
    },
  ],
  scenario: {
    prompt:
      'Your company runs five services on fixed virtual machines, and each service has the IP addresses of the others in a config file. You are moving everything to containers with autoscaling. During the first trial, deploys caused minutes of errors because callers kept using addresses of replaced containers, and new containers got traffic before they had finished loading their caches. Design how services will find each other on the new platform, and how you will stop both problems.',
    modelAnswer:
      "**Pick a discovery style.** Since the services are in several languages and the platform is container-based, I would use server-side discovery provided by the platform, for example Kubernetes Services: each service gets a stable DNS name and a stable address, and the platform keeps the list of endpoints behind it up to date. Callers change only their config from IP lists to service names. Client-side discovery with a registry like Consul would also work, but needs a client library in every language.\n\n**Fix traffic to new containers too early.** Add a **readiness probe** to each service that passes only after startup work (cache loading, connections) is done. The platform then leaves a new instance out of the endpoints until it is ready. I would not use a liveness probe for this: it would restart slow starters.\n\n**Fix traffic to replaced containers.** Make shutdown graceful: when an instance is told to stop, it fails readiness or is removed from endpoints first, finishes in-flight requests, then exits. Avoid clients that resolve DNS once at startup and cache it forever; keep DNS TTLs short where DNS is used, or use the stable service address so caches do not matter.\n\n**Cover the gaps.** Discovery data will be briefly stale during changes, so callers keep timeouts and retry idempotent requests on another instance.\n\n**Protect the registry.** Whether it is the platform's control plane or Consul, run it replicated, and let routers keep their last known endpoints if it is briefly unreachable.\n\nOther valid answers exist, for example a service mesh sidecar doing the routing. A good answer explains how instances get into and out of the list, how health decides traffic, and how callers survive stale data.",
    checklist: [
      'Replaces hard-coded IPs with lookup by service name, and justifies client-side or server-side discovery',
      'Uses readiness (not liveness) checks so instances get traffic only when ready',
      'Removes instances from the healthy list before shutdown so in-flight requests finish',
      'Accounts for DNS or client caching of old addresses',
      'Keeps timeouts and retries on callers for the window when discovery data is stale',
      'Treats the registry as critical: replicated, with callers tolerating brief outages',
    ],
  },
  takeaways: [
    'Instances change address as they scale, deploy and fail, so callers should find services by name, not by hard-coded IP.',
    'A service registry maps service names to instance locations, and registration plus health checks keep it accurate.',
    'Client-side discovery has fewer hops but puts lookup logic in every caller; server-side discovery keeps callers simple at the cost of a router.',
    'DNS is a convenient registry interface, but cached answers lag behind changes.',
    'Discovery data is always slightly stale, so callers still need timeouts and retries.',
  ],
  references: [
    {
      title: 'Service',
      publisher: 'Kubernetes Documentation',
      url: 'https://kubernetes.io/docs/concepts/services-networking/service/',
      kind: 'source',
    },
    {
      title: 'Liveness, Readiness, and Startup Probes',
      publisher: 'Kubernetes Documentation',
      url: 'https://kubernetes.io/docs/concepts/workloads/pods/probes/',
      kind: 'source',
    },
    {
      title: 'Service discovery',
      publisher: 'HashiCorp Consul Documentation',
      url: 'https://developer.hashicorp.com/consul/docs/use-case/service-discovery',
      kind: 'source',
    },
    {
      title:
        'RFC 2782: A DNS RR for specifying the location of services (DNS SRV)',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc2782.html',
      kind: 'source',
    },
    {
      title: 'Pattern: Client-side service discovery',
      publisher: 'Chris Richardson, microservices.io',
      url: 'https://microservices.io/patterns/client-side-discovery.html',
      kind: 'source',
    },
    {
      title: 'Pattern: Server-side service discovery',
      publisher: 'Chris Richardson, microservices.io',
      url: 'https://microservices.io/patterns/server-side-discovery.html',
      kind: 'source',
    },
    {
      title: 'Pattern: Self Registration',
      publisher: 'Chris Richardson, microservices.io',
      url: 'https://microservices.io/patterns/self-registration.html',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}
