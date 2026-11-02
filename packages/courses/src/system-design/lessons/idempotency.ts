import type { Lesson } from '../../types'

export const lesson: Lesson = {
  slug: 'idempotency',
  title: 'Idempotency',
  summary:
    'A client that times out cannot know whether its request took effect, so it must be able to retry without doubling the side effect. Idempotent operations, idempotency keys and deduplication make that safe.',
  minutes: 17,
  label: 'foundational',
  objectives: [
    {
      id: 'sd-idempotency-1',
      text: 'tell idempotent operations apart from safe ones, and classify HTTP methods and everyday database writes correctly.',
    },
    {
      id: 'sd-idempotency-2',
      text: 'explain why a timeout leaves the client unsure whether a request took effect, and why retrying a non-idempotent operation can duplicate its side effects.',
    },
    {
      id: 'sd-idempotency-3',
      text: 'design an idempotency-key or deduplication scheme for an API or a queue consumer, covering who makes the key, where it is stored, parameter checks, atomicity and expiry.',
    },
  ],
  concept: [
    {
      heading: 'The retry you cannot avoid',
      blocks: [
        {
          type: 'text',
          md: "A customer taps **Pay**. The app sends `POST /payments`, waits, and the connection times out. Did the payment go through? From the client's side there are three possibilities, and they look identical:\n\n1. The request never reached the server.\n2. The server processed it, and the **response** was lost on the way back.\n3. The server is still working on it.\n\nIf the client gives up, case 1 loses a sale. If it retries, cases 2 and 3 may charge the customer twice. Networks drop packets, servers restart mid-request and load balancers cut slow connections, so this is not a rare edge case: any system that talks over a network will meet it.\n\nThe same problem shows up behind the API. In the Message Queues lesson you met **at-least-once delivery**: if a consumer processes a message but crashes before acknowledging it, the broker delivers it again. Retries and redeliveries are how distributed systems stay reliable. **Idempotency** is what makes them harmless.",
        },
        {
          type: 'note',
          md: 'The rule of thumb: you can only retry blindly what is idempotent. Everything else needs a way for the server to recognise a repeat.',
        },
      ],
    },
    {
      heading: 'Idempotent, safe, and neither',
      blocks: [
        {
          type: 'text',
          md: "HTTP's core specification, [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2), defines two separate properties of request methods:\n\n- A method is **safe** if the client neither requests nor expects any change of state on the server. `GET`, `HEAD`, `OPTIONS` and `TRACE` are safe. Safe means read-only in intent.\n- A method is **idempotent** if sending the same request several times has the same intended effect on the server as sending it once. `PUT`, `DELETE` and all the safe methods are idempotent.\n\nSo every safe method is idempotent, but not the other way round. `DELETE /carts/42` changes state (it is not safe), yet deleting the same cart twice leaves the server in the same state as deleting it once (it is idempotent). `POST` and `PATCH` are not defined as idempotent: `POST /payments` sent twice may create two payments.\n\nTwo details trip people up:\n\n- Idempotency is about the **effect on server state**, not the response. A second `DELETE` may return `404 Not Found` instead of `204`; the method is still idempotent because the end state is the same.\n- The method's label is a promise the **server must keep**. A `PUT` handler that appends a row on every call breaks the promise, and clients that trust it will create duplicates.\n\nRFC 9110 draws the practical conclusion: a client should not automatically retry a request with a non-idempotent method unless it knows the request is idempotent in practice or can tell the original was never applied, and a proxy must not automatically retry non-idempotent requests.\n\nThe same idea applies to database writes. `SET email = 'a@x.io'` is naturally idempotent: run it twice and the row is the same. `SET balance = balance + 50` is not: each run adds another 50.",
        },
        {
          type: 'terms',
          terms: [
            {
              term: 'Idempotent operation',
              definition:
                'An operation whose intended effect on server state is the same whether it runs once or several times with the same input.',
            },
            {
              term: 'Safe method',
              definition:
                'An HTTP method for which the client requests no change of server state, such as GET or HEAD. All safe methods are idempotent.',
            },
            {
              term: 'Idempotency key',
              definition:
                'A unique value the client generates for one logical operation and sends with every attempt, so the server can recognise retries of it.',
            },
            {
              term: 'Deduplication',
              definition:
                'Detecting that a request or message has already been processed, usually by its key or ID, and not applying it again.',
            },
            {
              term: 'At-least-once delivery',
              definition:
                'A delivery guarantee under which every message arrives, but some may arrive more than once.',
            },
          ],
        },
      ],
    },
    {
      heading: 'Idempotency keys and deduplication',
      blocks: [
        {
          type: 'text',
          md: 'When an operation is not naturally idempotent, such as creating a payment, you make it idempotent with an **idempotency key**:\n\n1. The **client** generates a unique key for the logical operation, for example a random UUID, before the first attempt.\n2. It sends the key with the request, often in an `Idempotency-Key` header, and sends the **same key on every retry**.\n3. The server looks the key up. If it has not seen it, it does the work and stores the key together with the result. If it has, it returns the stored result instead of doing the work again.\n\nThe details decide whether this actually works:\n\n- **The client must make the key.** A key the server invents after the request arrives cannot help a client whose response was lost: the client never learned it.\n- **One key per operation, not per attempt.** A fresh key on each retry makes every retry look new.\n- **Store the key and the effect atomically.** Write the key record in the same database transaction as the changes it guards. If the key is saved but the work is not (or the reverse), a crash in between either blocks a legitimate retry or lets a duplicate through.\n- **Check the parameters.** Store a fingerprint of the original request. A retry with the same key but a different amount is a client bug; reject it rather than guess.\n- **Handle concurrent repeats.** If a retry arrives while the first attempt is still running, answer with a conflict error and let the client try again later, rather than running the work twice.\n- **Decide how long keys live.** Keys are kept for a retention window, after which a reused key is treated as a new request. The window must be longer than any client will keep retrying.\n\nQueue consumers use the same idea without a header: each message carries a unique ID, and the consumer records processed IDs in the same transaction as its own writes, skipping any ID it has already seen.',
        },
        {
          type: 'diagram',
          caption:
            'The checkout page sends the same key on every attempt. The API checks and records the key in the same database transaction as the order, and calls the card processor at most once per key.',
          nodes: [
            {
              id: 'client',
              label: 'Checkout page',
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
              id: 'api',
              label: 'Payments API',
              kind: 'service',
              col: 2,
              row: 2,
            },
            {
              id: 'db',
              label: 'Orders DB + key table',
              kind: 'store',
              col: 3,
              row: 1,
            },
            {
              id: 'psp',
              label: 'Card processor',
              kind: 'external',
              col: 3,
              row: 3,
            },
            {
              id: 'queue',
              label: 'Receipt queue',
              kind: 'queue',
              col: 4,
              row: 1,
            },
          ],
          edges: [
            { from: 'client', to: 'lb', label: 'POST + Idempotency-Key' },
            { from: 'lb', to: 'api' },
            { from: 'api', to: 'db', label: 'check, then save key' },
            { from: 'api', to: 'psp', label: 'charge, own key' },
            { from: 'db', to: 'queue', label: 'receipt event', dashed: true },
          ],
        },
        {
          type: 'example',
          title: 'A double tap at checkout',
          md: "A shopper's phone sends `POST /payments` with `Idempotency-Key: 7f3c…` for 40 euros. The server inserts a row `(key=7f3c…, request_hash=…, status=processing)`, charges the card, writes the order, stores the response, and commits. The response is lost in a tunnel.\n\nThe app retries with the **same** key. The server finds the row marked complete, sees the parameters match, and returns the stored response. One charge, one order.\n\nNow suppose a bug makes the app retry with the same key but 400 euros. The fingerprint does not match, so the server returns an error instead of charging 400 euros or pretending the 400-euro charge happened.\n\nAnd if the retry had arrived while the first attempt was still running, the row would still say `processing`, so the server would return a conflict and the app would try again a moment later.",
        },
      ],
    },
    {
      heading: 'Idempotency in real APIs',
      blocks: [
        {
          type: 'text',
          md: '- **Stripe** accepts an `Idempotency-Key` header on its v1 `POST` requests. It saves the status code and body of the first request made with a key once the endpoint starts executing, and returns that saved response on retries, even if it was a `500` error. It compares the parameters of a retry with the original and errors if they differ, suggests random V4 UUIDs as keys, and may prune keys once they are at least 24 hours old, after which a reused key starts a new request. Requests that fail validation, or that conflict with a request still executing, are not saved and can be retried. Stripe tells you not to send keys on `GET` and `DELETE`, because those are idempotent already.\n- **Amazon EC2** uses a caller-supplied `ClientToken` on calls that create resources. AWS\'s account of the design explains why it chose a caller-supplied ID rather than treating identical parameters as duplicates: a caller may legitimately want two identical resources. AWS SDKs and the CLI generate the token and reuse it across retries automatically, and a retry gets back a response with the same meaning as the original instead of an "already exists" error.\n- **PUT to a client-chosen URL** is a naturally idempotent way to create things. If the client picks the ID, `PUT /documents/{id}` sent twice still yields one document.',
        },
      ],
    },
  ],
  application: {
    heading: 'Building it into a real system, and where it stops',
    blocks: [
      {
        type: 'text',
        md: "In a real system idempotency is needed at every hop where something might retry: the mobile app retrying the API, the API retrying a payment provider, a worker processing queue messages.\n\n- **Downstream calls need their own protection.** Your key table makes your database writes idempotent, but an external call such as a card charge cannot join your database transaction. Pass an idempotency key to the provider too (derived from yours, so it is stable across your retries), and record the outcome.\n- **Side effects with no idempotency of their own**, like sending an email, can be made safer by recording what you have sent before or with it, but a crash at the wrong instant can still send twice or not at all. Decide which is worse for that effect.\n- **The key store has a cost.** Every write path now does an extra lookup and insert, and the store grows with traffic until keys expire.\n- **The retention window is a contract.** A retry that arrives after the key expired is treated as new. Clients must stop retrying well within the window.\n- **Keys scope matters.** Scope keys per account or API client so one customer's key cannot collide with another's.\n\nIdempotency does not make a system exactly-once end to end. It makes repeated attempts of the same operation produce one effect, within a window, for the parts of the system that check the key.",
      },
    ],
  },
  misconceptions: [
    {
      claim: 'An idempotent operation has no side effects.',
      correction:
        'That describes a safe operation. DELETE and PUT change state and are idempotent: repeating them leaves the same state as doing them once.',
    },
    {
      claim: 'An idempotent request must return the same response every time.',
      correction:
        'Idempotency is about the effect on server state. A second DELETE may return 404 where the first returned 204. Some APIs, such as Stripe, choose to replay the stored response, but that is a design choice, not the definition.',
    },
    {
      claim:
        'The server can detect duplicates by hashing the request body, so clients need not send a key.',
      correction:
        'Two identical requests may both be intended, such as buying the same item twice. A client-generated key per logical operation tells retries apart from genuine repeats; AWS rejected parameter matching for this reason.',
    },
  ],
  questions: [
    {
      id: 'sd-idempotency-q1',
      objective: 'sd-idempotency-1',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'Which set contains only methods that RFC 9110 defines as idempotent?',
      options: [
        {
          id: 'a',
          text: 'GET, HEAD, POST and PATCH',
          explanation:
            'POST and PATCH are not defined as idempotent. Sending a POST twice may create two resources.',
        },
        {
          id: 'b',
          text: 'GET, HEAD, PUT and DELETE',
          explanation:
            'Correct. The safe methods (GET, HEAD, OPTIONS, TRACE) plus PUT and DELETE are idempotent.',
        },
        {
          id: 'c',
          text: 'GET and HEAD only, since reads alone repeat safely',
          explanation:
            'PUT and DELETE change state but are still idempotent: repeating them leaves the same end state.',
        },
        {
          id: 'd',
          text: 'POST, PUT and DELETE, since they all change state',
          explanation:
            'Changing state is not the test, and POST is not idempotent. The test is whether repeats have the same intended effect as one request.',
        },
      ],
      answer: 'b',
    },
    {
      id: 'sd-idempotency-q2',
      objective: 'sd-idempotency-3',
      kind: 'recall',
      difficulty: 'easy',
      prompt:
        'In an idempotency-key scheme like the one Stripe uses, who creates the key and how is it used?',
      options: [
        {
          id: 'a',
          text: 'The server creates it on arrival and returns it in the response',
          explanation:
            'If the response is lost, the client never learns the key, so it cannot use it to retry. The key must exist before the first attempt.',
        },
        {
          id: 'b',
          text: 'The client creates a fresh key for each attempt it sends',
          explanation:
            'A new key per attempt makes every retry look like a new operation, which defeats deduplication.',
        },
        {
          id: 'c',
          text: 'The load balancer hashes the request body and adds the hash',
          explanation:
            'A body hash cannot tell a retry from a genuine second identical request, such as buying the same item twice.',
        },
        {
          id: 'd',
          text: 'The client creates one key per operation and resends it on retries',
          explanation:
            'Correct. One key per logical operation, reused on every attempt, lets the server recognise retries.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-idempotency-q3',
      objective: 'sd-idempotency-1',
      kind: 'concept',
      difficulty: 'medium',
      prompt: 'Which statement about safe and idempotent methods is correct?',
      options: [
        {
          id: 'a',
          text: 'Every safe method is idempotent, but DELETE is idempotent and not safe',
          explanation:
            'Correct. Safe means no requested state change; idempotent means repeats have the same effect as one. DELETE changes state, and repeating it changes nothing further.',
        },
        {
          id: 'b',
          text: 'Every idempotent method is safe, since repeating it changes nothing',
          explanation:
            'The first call of an idempotent method can change state, as PUT and DELETE do. Only the repeats add nothing.',
        },
        {
          id: 'c',
          text: 'Safe and idempotent are two names for the same HTTP property',
          explanation:
            'They are different properties. PUT and DELETE are idempotent but not safe.',
        },
        {
          id: 'd',
          text: 'A safe method may change state, as long as it does so only once',
          explanation:
            'That mixes up the two. A safe method requests no state change at all.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-idempotency-q4',
      objective: 'sd-idempotency-2',
      kind: 'concept',
      difficulty: 'medium',
      prompt:
        'A client sends `POST /orders` and its request times out with no response. What can the client conclude about the order?',
      options: [
        {
          id: 'a',
          text: 'It was not created, because no response came back',
          explanation:
            'The server may have created the order and the response may have been lost on the way back.',
        },
        {
          id: 'b',
          text: 'It was created, because the request left the client',
          explanation:
            'The request may have been lost before reaching the server, so the order may not exist.',
        },
        {
          id: 'c',
          text: 'Nothing certain: it may exist, not exist, or still be in progress',
          explanation:
            'Correct. A timeout looks the same whether the request was lost, the response was lost, or the server is still working.',
        },
        {
          id: 'd',
          text: 'The server crashed, so a plain retry is guaranteed safe',
          explanation:
            'A timeout does not prove a crash, and even after a crash the order may already have been written. A plain retry could create a second order.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-idempotency-q5',
      objective: 'sd-idempotency-1',
      kind: 'concept',
      difficulty: 'hard',
      prompt: 'Which database write is naturally idempotent?',
      options: [
        {
          id: 'a',
          text: '`UPDATE accounts SET balance = balance + 50 WHERE id = 7`',
          explanation:
            'Each run adds another 50, so two runs leave a different balance than one.',
        },
        {
          id: 'b',
          text: '`INSERT INTO orders (item) VALUES (3)` with an auto-increment id',
          explanation:
            'Each run inserts a new row with a new id, so repeats create duplicate orders.',
        },
        {
          id: 'c',
          text: "`UPDATE users SET email = 'a@x.io' WHERE id = 7`",
          explanation:
            'Correct. It sets an absolute value, so running it twice leaves the same row as running it once.',
        },
        {
          id: 'd',
          text: '`INSERT INTO clicks (user_id, at) VALUES (7, now())`',
          explanation:
            'Each run appends another click row, so repeats inflate the click count.',
        },
      ],
      answer: 'c',
    },
    {
      id: 'sd-idempotency-q6',
      objective: 'sd-idempotency-3',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        "A transfer API saves the request's idempotency key in one step, then moves the money in a separate database transaction. A crash between the two leaves a saved key with no transfer, and the retry is told it already succeeded. What is the right fix?",
      options: [
        {
          id: 'a',
          text: 'Write the key record and the transfer in one database transaction',
          explanation:
            'Correct. If the key and the changes it guards commit together, a crash leaves either both or neither, so a retry is never wrongly skipped or duplicated.',
        },
        {
          id: 'b',
          text: 'Save the key only after the transfer has finished committing',
          explanation:
            'This moves the gap rather than closing it: a crash after the transfer but before the key is saved lets the retry transfer again.',
        },
        {
          id: 'c',
          text: 'Keep keys for longer so retries keep finding the saved key',
          explanation:
            'Retention is not the problem. The retry already finds the key; the key wrongly says the work was done.',
        },
        {
          id: 'd',
          text: 'Make clients wait longer before they send their first retry',
          explanation:
            'Waiting longer does not change what was committed. The key still exists without the transfer.',
        },
      ],
      answer: 'a',
    },
    {
      id: 'sd-idempotency-q7',
      objective: 'sd-idempotency-3',
      kind: 'application',
      difficulty: 'hard',
      prompt:
        'Your payment API receives a request whose idempotency key matches a completed payment of 40 euros, but this request asks for 400 euros. What should the API do?',
      options: [
        {
          id: 'a',
          text: 'Treat it as a new payment and charge the 400 euros',
          explanation:
            'The key says this is a retry of an earlier operation. Charging again breaks the guarantee the key exists to give.',
        },
        {
          id: 'b',
          text: 'Return the stored 40-euro response without any warning',
          explanation:
            'The client would believe a 400-euro payment succeeded. A mismatch signals a bug that should surface, not be hidden.',
        },
        {
          id: 'c',
          text: 'Replace the stored request with the new one and re-run it',
          explanation:
            'This would charge a second time and erase the record of the first charge.',
        },
        {
          id: 'd',
          text: 'Reject it with an error, since the key was reused with new data',
          explanation:
            'Correct. Stripe and AWS both compare parameters and return an error on a mismatch, because a reused key with different data is a client mistake.',
        },
      ],
      answer: 'd',
    },
    {
      id: 'sd-idempotency-q8',
      objective: 'sd-idempotency-2',
      kind: 'application',
      difficulty: 'medium',
      prompt:
        'A consumer reads `order-paid` messages from an at-least-once queue and runs `points = points + 10` for each. A few customers end up with 20 points for one order. What is the most likely cause?',
      options: [
        {
          id: 'a',
          text: 'The producer deliberately published each message twice',
          explanation:
            'Nothing points to that. Even with one publish, at-least-once delivery can redeliver a message.',
        },
        {
          id: 'b',
          text: 'A processed message lost its ack and was redelivered to a non-idempotent handler',
          explanation:
            'Correct. The broker redelivers when it does not see an acknowledgement, and adding 10 again doubles the effect.',
        },
        {
          id: 'c',
          text: 'Messages arrived out of order, and order changes the totals',
          explanation:
            'Adding 10 gives the same total in any order. Reordering cannot turn 10 into 20.',
        },
        {
          id: 'd',
          text: 'A cache served customers a stale copy of their points total',
          explanation:
            'A stale value would show an older, lower total, not a doubled one.',
        },
      ],
      answer: 'b',
    },
  ],
  scenario: {
    prompt:
      'You run a wallet app. `POST /transfers` moves money between two users and is called from mobile apps on unreliable networks; the apps retry on timeout. Each transfer also calls an external bank API to settle it. Support has reported a handful of double transfers. Design the idempotency scheme: who creates keys, what the server stores and when, how it answers retries (including retries with different data and retries that arrive while the first attempt is running), how the external bank call stays single, and how long keys are kept.',
    modelAnswer:
      "**Key creation.** The app creates a random UUID when the user confirms a transfer, saves it locally with the pending transfer, and sends it as `Idempotency-Key` on every attempt. A new key is only made for a new transfer, never for a retry.\n\n**Server storage.** A table `idempotency_keys(user_id, key, request_hash, status, response, created_at)` with a unique constraint on `(user_id, key)`, so keys are scoped per user. On a new key, in **one transaction**: insert the key row with `status = processing` and the hash of the request, write the ledger entries, then store the response and mark it complete. Because the key and the ledger change commit together, a crash leaves both or neither.\n\n**Answering repeats.**\n- Key complete, same hash: return the stored response.\n- Key complete, different hash: return a client error; this is a bug, not a retry.\n- Key still `processing`: return a conflict status so the app retries after a short wait.\n\n**External bank call.** It cannot join my database transaction, so I give it its own protection: send the bank a key derived from mine (for example the transfer ID), if the bank supports idempotent requests, and record the settlement status in my table. A retry that finds the transfer recorded but settlement pending re-sends with the same bank key instead of starting a new settlement. If the bank has no idempotency support, I would query its status for that transfer before re-sending.\n\n**Retention.** Keep keys longer than the app will ever retry (the app should give up and show an error well before). I would start with a window of a day or more, illustrative rather than measured, and check the app's retry policy against it.\n\nOther designs are valid. For example, the app could create the transfer ID itself and use `PUT /transfers/{id}`, which makes creation naturally idempotent. What matters is that a retry can be recognised, the record and effect are atomic, and the external call is protected separately.",
    checklist: [
      'The client creates one key per logical transfer before the first attempt and reuses it on every retry',
      'The key record and the ledger writes commit in the same transaction',
      'Retries with different parameters are rejected, and in-flight repeats get a conflict rather than a second run',
      'The external bank call is protected separately, with its own key or a status check',
      'Keys are scoped per user and kept longer than the client retry window',
    ],
  },
  takeaways: [
    'After a timeout the client cannot tell whether the request was applied, so reliable systems must retry and must make retries harmless.',
    'Idempotent means repeats have the same effect as one request; safe means no state change is requested, so DELETE and PUT are idempotent but not safe.',
    'Non-idempotent operations become retry-safe with a client-generated key per logical operation, reused on every attempt.',
    'Store the key and the effect it guards atomically, reject reused keys with different parameters, and expire keys only after clients stop retrying.',
    'Queue consumers under at-least-once delivery need the same protection: dedupe on message ID or make the write naturally idempotent.',
  ],
  references: [
    {
      title: 'RFC 9110: HTTP Semantics, section 9.2 (Common Method Properties)',
      publisher: 'IETF',
      url: 'https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2',
      kind: 'source',
    },
    {
      title: 'Idempotent requests',
      publisher: 'Stripe API Reference',
      url: 'https://docs.stripe.com/api/idempotent_requests',
      kind: 'source',
    },
    {
      title: 'Making retries safe with idempotent APIs',
      publisher: "Amazon Builders' Library",
      url: 'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/',
      kind: 'source',
    },
  ],
  reviewedAt: '2026-11-02',
}
