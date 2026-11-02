import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'rest-api-design',
  title: 'REST API Design',
  summary:
    'A REST-style API exposes resources at URIs and acts on them with standard HTTP methods whose safety and idempotency clients can rely on. Accurate status codes let clients react correctly, and page tokens and versioning let the API grow without breaking the clients already using it.',
  minutes: 15,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-rest-api-design-1',
      text: 'model an API as resources with URIs and choose the HTTP method for each operation, using what safe and idempotent mean.',
    },
    {
      id: 'sd-rest-api-design-2',
      text: 'choose status codes that let a client react correctly, distinguishing success, client errors and server errors and common codes such as 201, 401, 403, 404, 409, 429 and 503.',
    },
    {
      id: 'sd-rest-api-design-3',
      text: 'design pagination and versioning so an API can grow without breaking existing clients.',
    },
  ],
  concept: [
    {
      heading: 'An API is a contract',
      blocks: [
        {
          type: 'text',
          md: 'Once an API is public, or even just used by a mobile app that people do not update, you no longer control every caller. Clients will retry on errors, cache responses and depend on the exact field names you chose. A well-designed API makes the right thing easy for those clients: they can guess the URL for a resource, know whether a request is safe to retry, and tell from the response what went wrong and what to do next.\n\n**REST** (Representational State Transfer) is the architectural style Roy Fielding described in his 2000 dissertation to explain the design of the web. It is a set of constraints: client-server, **stateless** requests (each request carries everything needed to understand it), responses labelled as cacheable or not, a **uniform interface**, a layered system, and optional code-on-demand. In everyday use, "REST API" usually means an HTTP API organised around resources and standard methods, often with JSON bodies. Not every API called REST meets all of Fielding\'s constraints, but the resource-and-method core is what this lesson covers.',
        },
      ],
    },
    {
      heading: 'Resources, URIs and methods',
      blocks: [
        {
          type: 'text',
          md: 'Design around **resources**: the nouns of your domain, such as orders, customers or invoices. Each gets a URI, usually as a **collection** and its **items**:\n\n- `/orders`: the collection of orders\n- `/orders/42`: one order\n- `/customers/7/orders`: orders belonging to customer 7\n\nThe **method** says what to do with the resource. RFC 9110 gives each standard method a meaning, and two properties that clients and intermediaries rely on:\n\n- A method is **safe** if the client does not request any change on the server: `GET`, `HEAD` and `OPTIONS` are safe. Crawlers, prefetchers and caches assume a `GET` can be repeated without harm, so never make a `GET` change data.\n- A method is **idempotent** if sending the same request many times has the same intended effect as sending it once. `PUT`, `DELETE` and all safe methods are idempotent. That is what makes them safe to **retry** after a timeout, when the client cannot tell whether the first attempt worked.\n\nThe common methods:\n\n- `GET /orders/42`: read. Safe and idempotent.\n- `POST /orders`: ask the collection to process the body, typically creating a new order with a server-chosen id. **Not idempotent**: two identical POSTs can create two orders.\n- `PUT /orders/42`: create or **replace** the resource at that URI with the body. Idempotent: replacing with the same body twice leaves the same state.\n- `PATCH /orders/42`: apply a partial change. RFC 5789 says PATCH is neither safe nor idempotent in general, though a particular patch can be written to be idempotent.\n- `DELETE /orders/42`: remove. Idempotent: after one or many deletes, the order is gone. A repeat may return `404`, but the server state is the same.\n\nIdempotency is about the **intended effect**, not every side effect: the server may still log each request.',
        },
        {
          type: 'diagram',
          caption:
            'Different clients use the same resource URIs and methods; the API server applies the rules and owns the data.',
          nodes: [
            { id: 'web', label: 'Web app', kind: 'client', col: 0, row: 0 },
            {
              id: 'mobile',
              label: 'Mobile app',
              kind: 'client',
              col: 0,
              row: 2,
            },
            {
              id: 'partner',
              label: 'Partner system',
              kind: 'external',
              col: 0,
              row: 4,
            },
            {
              id: 'api',
              label: 'Orders API /v1',
              kind: 'service',
              col: 2,
              row: 2,
            },
            {
              id: 'db',
              label: 'Orders database',
              kind: 'store',
              col: 4,
              row: 2,
            },
          ],
          edges: [
            { from: 'web', to: 'api', label: 'GET /v1/orders' },
            { from: 'mobile', to: 'api', label: 'POST /v1/orders' },
            { from: 'partner', to: 'api', label: 'PUT /v1/orders/42' },
            { from: 'api', to: 'db', label: 'read/write' },
          ],
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Resource',
              definition:
                'A named thing the API exposes, such as an order or a collection of orders, identified by a URI.',
            },
            {
              term: 'Representation',
              definition:
                'The data that describes a resource in a request or response, for example a JSON document.',
            },
            {
              term: 'Safe method',
              definition:
                'A method that requests no change on the server: GET, HEAD, OPTIONS.',
            },
            {
              term: 'Idempotent method',
              definition:
                'A method where repeating the same request has the same intended effect as sending it once: PUT, DELETE and the safe methods.',
            },
            {
              term: 'Breaking change',
              definition:
                'A change that can make an existing, correct client fail, such as removing or renaming a field.',
            },
            {
              term: 'Page token',
              definition:
                'An opaque value returned with one page of results that the client sends back to get the next page.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Status codes and errors',
      blocks: [
        {
          type: 'text',
          md: 'The status code is the first thing a client checks, and often the only thing a load balancer or retry library looks at. RFC 9110 groups codes by their first digit:\n\n- **2xx success.** `200 OK`; `201 Created` for a new resource (with a `Location` header pointing to it); `204 No Content` when there is nothing to return, such as after a delete.\n- **3xx redirection.** The client must go elsewhere, for example `301 Moved Permanently`.\n- **4xx client error.** The request is wrong and **retrying it unchanged will not help**: `400 Bad Request` for malformed input; `401 Unauthorized` when valid credentials are missing (despite the name, it means *unauthenticated*); `403 Forbidden` when the server knows who you are but refuses; `404 Not Found`; `409 Conflict` when the request clashes with the resource\'s current state; `422 Unprocessable Content` for well-formed but invalid content; `429 Too Many Requests` when the client is being rate limited.\n- **5xx server error.** The server failed: `500 Internal Server Error`; `502 Bad Gateway` and `504 Gateway Timeout` when a proxy got a bad or no answer from the server behind it; `503 Service Unavailable` for temporary overload or maintenance, optionally with a `Retry-After` header.\n\nThe split between 4xx and 5xx is what lets a client decide: fix the request, or try again later. Returning `200` with `{"error": ...}` in the body hides that signal from every client, cache and monitor that reads only the status. Pair accurate codes with a consistent error body (a machine-readable code and a human-readable message) so clients can handle specific cases.',
        },
      ],
    },
    {
      heading: 'Growing without breaking clients',
      blocks: [
        {
          type: 'text',
          md: "Two decisions are hard to change later, so make them early.\n\n**Pagination.** Any list that can grow should return results in pages from day one. Google's API guidelines (AIP-158) point out that adding pagination to an existing list method is a **breaking change**: old clients would silently receive only the first page. Two common styles:\n\n- **Offset**: `?offset=40&limit=20`. Simple, and it allows jumping to page 5. But if items are inserted or deleted while the client is paging, positions shift and the client sees duplicates or misses items. Large offsets can also be slow, because the database must step past all the skipped rows.\n- **Cursor or page token**: the response includes a `next_page_token` that encodes where the last page ended; the client sends it back to get the next one. Pages stay stable as data changes. AIP-158 requires the token to be **opaque**, so clients cannot depend on its format, and an empty token to mean the end of the list.\n\n**Versioning.** Google's guidelines put the major version in the path (`/v1/orders`) and never expose minor versions. Within a major version, only **backward-compatible** changes are allowed (AIP-180):\n\n- Compatible: adding a new resource, a new method or a new optional field.\n- Breaking: removing or renaming a field, changing a field's type, making an optional field required, changing default behaviour.\n\nBreaking changes go into a new major version (`/v2`) that runs alongside the old one while clients migrate.",
        },
        {
          type: 'example',
          title: 'An orders API, end to end',
          md: "- `POST /v1/orders` with the cart in the body → `201 Created`, `Location: /v1/orders/9137`, and the new order in the body. Missing required fields → `400` with an error body naming the field.\n- `GET /v1/orders/9137` → `200` with the order. Not your order → `404` or `403`, chosen deliberately: `404` avoids revealing that the order exists.\n- `GET /v1/orders?page_size=20` → `200` with 20 orders and a `next_page_token`; the client sends `page_token=...` for the next 20.\n- `POST /v1/orders/9137:cancel` → cancelling is an action, not a field update; Google's guidelines model such actions as custom methods on the resource. Already shipped → `409 Conflict` with a message explaining why.\n- Too many requests from one client → `429` with `Retry-After`. Database down → `503`.\n\nLater, the team wants to add a `currency` field to orders. That is an added field, so it stays in `v1`. Renaming `total` to `amount` would break clients and would need `v2`, or keeping both fields.",
        },
      ],
    },
  ],
  application: {
    heading: 'REST in production, and where it fits less well',
    blocks: [
      {
        type: 'text',
        md: 'Large public APIs follow these patterns closely. Google\'s API Improvement Proposals, for example, require a major version as the first part of the path, page tokens for list methods, and a strict list of what counts as a breaking change. Teams that publish an API often write similar rules down so that every endpoint behaves the same way.\n\nThe rules also matter inside a system. A load balancer or gateway can retry a failed `GET` or `PUT` because they are idempotent, but must not blindly retry a `POST`. Monitors can count `5xx` responses as server failures and `4xx` as client mistakes, but only if the codes are accurate.\n\nLimits to keep in mind:\n\n- **Not everything is a resource.** Actions such as "cancel" or "send" fit awkwardly into CRUD. Model them as a state change (`PATCH` the status), a sub-resource (`POST /orders/42/cancellation`) or a custom method, and pick one convention.\n- **Chatty clients.** A screen that needs data from several resources may need several requests, each a network round trip. Designs respond with combined endpoints, embedded related data, or alternative styles such as GraphQL or RPC frameworks, each with its own trade-offs.\n- **POST is not retry-safe on its own.** A timeout on `POST /payments` leaves the client unsure whether to retry. Making such requests safe to repeat (for example with idempotency keys) is the subject of a later lesson.\n- **Versions cost money.** Every live major version is code to maintain, so teams add fields compatibly whenever possible and reserve new versions for changes that truly need them.',
      },
    ],
  },
  misconceptions: [
    {
      claim: 'PUT and POST are interchangeable ways to save data.',
      correction:
        'PUT replaces the resource at a URI the client names and is idempotent, so it can be retried. POST asks a resource to process data, usually creating a new item with a server-chosen id, and repeating it can create duplicates.',
    },
    {
      claim:
        'Returning 200 with an error message in the body is fine as long as the client reads the body.',
      correction:
        'Caches, proxies, monitors and retry logic act on the status code. A 200 tells all of them the request succeeded; use the 4xx or 5xx code that matches the failure, plus an error body.',
    },
    {
      claim: 'Any change to the API needs a new version.',
      correction:
        'Backward-compatible changes, such as adding a resource or an optional field, stay in the current version. A new major version is for breaking changes such as removing, renaming or retyping fields.',
    },
  ],
  questions: [
    {
      id: 'sd-rest-api-design-q1',
      objective: 'sd-rest-api-design-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'According to RFC 9110, which group contains only idempotent methods?',
      options: [
        {
          id: 'a',
          text: 'GET, POST and DELETE',
          explanation:
            'POST is not idempotent: repeating it can create a second resource or repeat an action.',
        },
        {
          id: 'b',
          text: 'GET, PUT and DELETE',
          explanation:
            'Correct. RFC 9110 lists PUT, DELETE and the safe methods (such as GET) as idempotent.',
        },
        {
          id: 'c',
          text: 'POST, PUT and PATCH',
          explanation:
            'POST is not idempotent, and RFC 5789 says PATCH is not idempotent in general.',
        },
        {
          id: 'd',
          text: 'PUT, PATCH and DELETE',
          explanation:
            'PUT and DELETE are idempotent, but PATCH is not in general, because a patch such as "add 1" changes the result each time.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-rest-api-design-q2',
      objective: 'sd-rest-api-design-1',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Clients need to create a new support ticket, and the server assigns the ticket id. Which request fits best?',
      options: [
        {
          id: 'a',
          text: 'GET /tickets/create?subject=Login+fails',
          explanation:
            'GET must be safe. Creating data with a GET means prefetchers, crawlers or caches could create tickets by accident.',
        },
        {
          id: 'b',
          text: 'PUT /tickets with the ticket in the body',
          explanation:
            'PUT replaces the resource at the given URI, so this would replace the whole collection, not add one ticket to it.',
        },
        {
          id: 'c',
          text: 'POST /tickets with the ticket in the body',
          explanation:
            'Correct. POST to the collection asks it to process the body, here creating a ticket whose id the server chooses.',
        },
        {
          id: 'd',
          text: 'PATCH /tickets/new with the ticket in the body',
          explanation:
            'PATCH partially modifies an existing resource. "new" is not a real ticket, and the server, not the client, assigns the id.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-rest-api-design-q3',
      objective: 'sd-rest-api-design-1',
      kind: 'concept',
      difficulty: 'hard',
      prompt:
        'A client sends DELETE /files/88. The connection times out before any response arrives, so the client cannot tell whether the file was deleted. It sends the same DELETE again. Which statement is correct?',
      options: [
        {
          id: 'a',
          text: 'The retry is fine: DELETE is idempotent, so the end state is the same',
          explanation:
            'Correct. Whether the first attempt worked or not, after the retry file 88 is gone. The retry may return 404, but the intended effect is unchanged.',
        },
        {
          id: 'b',
          text: 'The retry is risky: it may delete a second file if the first succeeded',
          explanation:
            'The request targets one URI. Repeating it cannot delete some other file, which is what idempotent means.',
        },
        {
          id: 'c',
          text: 'The retry is fine only if both attempts return exactly the same status code',
          explanation:
            'Idempotency is about the effect on the server, not identical responses. A first 204 and a later 404 are both consistent with it.',
        },
        {
          id: 'd',
          text: 'The retry is risky: only safe methods such as GET may be retried',
          explanation:
            'Idempotent methods, which include PUT and DELETE as well as the safe methods, can be repeated after a communication failure.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-rest-api-design-q4',
      objective: 'sd-rest-api-design-2',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'A POST request successfully creates a new resource. Which status code and header describe this most precisely?',
      options: [
        {
          id: 'a',
          text: '200 OK with a Content-Length header',
          explanation:
            '200 is a valid success code, but it does not say that a new resource was created or where to find it.',
        },
        {
          id: 'b',
          text: '204 No Content with an ETag header',
          explanation:
            '204 means there is no body to return; it does not signal creation or point to the new resource.',
        },
        {
          id: 'c',
          text: '202 Accepted with a Retry-After header',
          explanation:
            '202 means the request was accepted for processing that has not finished yet, not that the resource now exists.',
        },
        {
          id: 'd',
          text: '201 Created with a Location header',
          explanation:
            'Correct. 201 means a new resource was created, and the Location header identifies it.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-rest-api-design-q5',
      objective: 'sd-rest-api-design-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'What is the difference between 401 Unauthorized and 403 Forbidden?',
      options: [
        {
          id: 'a',
          text: '401 means the resource does not exist; 403 means it was removed',
          explanation:
            'Missing resources are 404, and permanently removed ones can be 410. Neither 401 nor 403 is about existence.',
        },
        {
          id: 'b',
          text: '401 is for read requests; 403 is for write requests',
          explanation:
            'Both codes can apply to any method. They differ in whether the client has proven who it is.',
        },
        {
          id: 'c',
          text: '401 means valid credentials are missing; 403 means access is refused anyway',
          explanation:
            'Correct. 401 asks the client to authenticate; 403 means the server understood the request but will not allow it, even with the credentials given.',
        },
        {
          id: 'd',
          text: '401 is a server error; 403 is a client error',
          explanation:
            'Both are 4xx client errors. Server errors are in the 5xx class.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-rest-api-design-q6',
      objective: 'sd-rest-api-design-2',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'Your API allows each client 100 requests per minute. A client sends its 101st request within the minute. Which response fits best?',
      options: [
        {
          id: 'a',
          text: '429 Too Many Requests, with a Retry-After header',
          explanation:
            'Correct. 429 means the client sent too many requests in a given time, and Retry-After tells it when to try again.',
        },
        {
          id: 'b',
          text: '503 Service Unavailable, with a Retry-After header',
          explanation:
            '503 says the server as a whole is overloaded or down. Here the server is fine; this client exceeded its own limit.',
        },
        {
          id: 'c',
          text: '400 Bad Request, with an error body naming the limit',
          explanation:
            'The request itself is well formed. 400 would tell the client to fix the request, when it only needs to wait.',
        },
        {
          id: 'd',
          text: '403 Forbidden, with an error body naming the limit',
          explanation:
            '403 means the server refuses this client access, which suggests waiting will not help. A rate limit is temporary.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-rest-api-design-q7',
      objective: 'sd-rest-api-design-3',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A feed is paged with ?offset=N&limit=20, newest first. While a user reads page 1, five new posts are added. What happens when they request page 2 with offset=20?',
      options: [
        {
          id: 'a',
          text: 'Page 2 is unaffected, because offsets are fixed when page 1 is served',
          explanation:
            'The server applies the offset to the current data, not to a snapshot taken when page 1 was served.',
        },
        {
          id: 'b',
          text: 'The server rejects the request, because the data changed between pages',
          explanation:
            'Offset pagination has no way to detect that the data changed; it simply skips N rows of whatever is there now.',
        },
        {
          id: 'c',
          text: 'Page 2 contains only the five new posts, followed by an empty page',
          explanation:
            'New posts are at the top, before offset 20. Page 2 still returns 20 items; they are just shifted.',
        },
        {
          id: 'd',
          text: 'The last five posts of page 1 appear again at the top of page 2',
          explanation:
            'Correct. Five inserts push every item down five places, so items 16-20 of the old page 1 are now at positions 21-25. A page token avoids this.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-rest-api-design-q8',
      objective: 'sd-rest-api-design-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'Your public API is at /v1. Which change can you make within v1 without breaking existing clients?',
      options: [
        {
          id: 'a',
          text: 'Rename the response field "total" to "amount" to match other APIs',
          explanation:
            'A rename is a removal plus an addition. Clients reading "total" would stop finding it.',
        },
        {
          id: 'b',
          text: 'Add an optional "currency" field to the order response',
          explanation:
            'Correct. Adding an optional field is backward compatible: well-written clients ignore fields they do not know.',
        },
        {
          id: 'c',
          text: 'Make the optional "notes" request field required on create',
          explanation:
            'Existing clients that omit "notes" would start getting errors, so this breaks them.',
        },
        {
          id: 'd',
          text: 'Change the "id" field type from a number to a string',
          explanation:
            "Changing a field's type breaks clients that parse or store it as a number, even if the values look similar.",
        },
      ],
      answer: 'b',
    },
  ],
  scenario: {
    prompt:
      'You are designing the first public API for a library app. It must let clients: list books (the catalogue will grow to many thousands), see one book, let a member borrow a copy and return it, and let staff add new books. Mobile apps will use the API and some users never update their app. Write down the resources and URIs, the method and success status code for each operation, the main error codes you would return, your pagination approach, and how you would handle a future breaking change.',
    modelAnswer:
      '**Resources.** Books (`/v1/books`, `/v1/books/{id}`) and loans (`/v1/loans`, `/v1/loans/{id}`). Treating a loan as its own resource turns "borrow" and "return" into ordinary operations on data instead of verbs in URLs.\n\n**Operations.**\n- List books: `GET /v1/books?page_size=50&page_token=...` → `200`.\n- One book: `GET /v1/books/{id}` → `200`, or `404` if it does not exist.\n- Borrow: `POST /v1/loans` with the book id → `201 Created` and a `Location` for the new loan. `409 Conflict` if no copy is available. `401` if not logged in.\n- Return: `PATCH /v1/loans/{id}` setting `returnedAt` (or `DELETE /v1/loans/{id}` if loan history is not kept) → `200` or `204`. `403` if the loan belongs to someone else, or `404` to avoid revealing that it exists.\n- Add a book (staff): `POST /v1/books` → `201`; `403` for non-staff; `400` for malformed input.\n- Rate limiting → `429`; server trouble → `503`.\n\n**Pagination.** Page tokens from the first release, because the catalogue grows and adding pagination later would break clients that expect the full list. Tokens are opaque, and an empty `next_page_token` marks the end.\n\n**Versioning.** `/v1` in the path from day one. New optional fields and new resources go into v1. A breaking change, such as restructuring the book\'s author data, goes into `/v2`, which runs alongside v1 until the old app versions have dropped off.\n\nOther designs can be valid: for example `POST /v1/books/{id}:borrow` as a custom method, or offset pagination for a small catalogue that rarely changes. What matters is consistent, method-appropriate operations, accurate codes and a plan for change.',
    checklist: [
      'Names resources as nouns with collection and item URIs',
      'Uses POST for server-assigned creation and never changes data with GET',
      'Returns 201 for creation and distinguishes 400, 401, 403, 404 and 409 correctly',
      'Paginates the growing list from the first version, preferably with page tokens',
      'Puts a major version in the path and keeps compatible changes within it',
    ],
  },
  takeaways: [
    'Design around resources at stable URIs and use the HTTP method whose meaning matches the operation.',
    'Safe methods change nothing; idempotent methods (GET, PUT, DELETE) can be retried, while POST and PATCH in general cannot.',
    'Status codes are signals for clients and infrastructure: 4xx means fix the request, 5xx means the server failed, and 200 with an error body hides both.',
    'Paginate any growing list from the start; opaque page tokens stay correct when data changes, while offsets can skip or repeat items.',
    'Keep compatible changes, such as new optional fields, in the current version and put breaking changes in a new major version.',
  ],
  references: [
    {
      title:
        'RFC 9110: HTTP Semantics (methods, section 9; status codes, section 15)',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc9110.html',
      kind: 'source',
    },
    {
      title: 'RFC 5789: PATCH Method for HTTP',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc5789.html',
      kind: 'source',
    },
    {
      title: 'RFC 6585: Additional HTTP Status Codes (429)',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc6585.html',
      kind: 'source',
    },
    {
      title: 'HTTP response status codes',
      publisher: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status',
      kind: 'source',
    },
    {
      title:
        'Architectural Styles and the Design of Network-based Software Architectures, ch. 5 (REST)',
      publisher: 'Roy T. Fielding, University of California, Irvine',
      url: 'https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm',
      kind: 'source',
    },
    {
      title: 'AIP-158: Pagination',
      publisher: 'Google API Improvement Proposals',
      url: 'https://google.aip.dev/158',
      kind: 'source',
    },
    {
      title: 'AIP-185: API Versioning',
      publisher: 'Google API Improvement Proposals',
      url: 'https://google.aip.dev/185',
      kind: 'source',
    },
    {
      title: 'AIP-180: Backwards compatibility',
      publisher: 'Google API Improvement Proposals',
      url: 'https://google.aip.dev/180',
      kind: 'source',
    },
    {
      title: 'AIP-136: Custom methods',
      publisher: 'Google API Improvement Proposals',
      url: 'https://google.aip.dev/136',
      kind: 'further',
    },
  ],
  reviewedAt: '2026-11-02',
}
