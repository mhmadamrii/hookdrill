# Feature: System Design Learning & Assessment Module

## 1. Objective

Build a System Design learning module inside the existing platform.

The platform is primarily focused on React learning and coding challenges. System Design should be a separate learning experience but reuse existing authentication, UI components, user profiles, and progress infrastructure.

The learning experience must be self-paced and require no human mentor.

AI (Gemini API) will evaluate student assessments based on predefined evaluation rubrics.

**Core philosophy:**

- No single mandatory reference architecture.
- Multiple architectural approaches can be valid.
- Evaluate engineering judgment, reasoning, trade-offs, and suitability for requirements.
- AI evaluates submissions using structured criteria.
- Students receive scores and actionable feedback.

## 2. Curriculum

Organize the curriculum into four levels.

### Level 1: System Design Fundamentals

1. Introduction to System Design
2. Client-Server Architecture
3. HTTP, DNS, TCP, and Networking
4. REST API Design
5. SQL vs NoSQL
6. Database Indexing
7. Caching Fundamentals
8. Load Balancing

### Level 2: Scalability

1. Horizontal vs Vertical Scaling
2. Database Replication
3. Database Sharding
4. Message Queues
5. Rate Limiting
6. CDN and Object Storage
7. Cache Strategies
8. Asynchronous Processing

### Level 3: Distributed Systems

1. CAP Theorem
2. Consistency Models
3. Distributed Transactions
4. Event-Driven Architecture
5. Idempotency
6. Fault Tolerance
7. Service Discovery
8. Multi-Region Architecture

### Level 4: Real-World System Design

1. URL Shortener
2. Chat Application (WhatsApp/Slack)
3. Social Media Feed (Instagram/Twitter)
4. Notification System
5. E-commerce System
6. Payment System
7. Video Streaming (YouTube/Netflix)
8. Ride-Sharing System (Uber)

Each level should have:

- Lessons
- Knowledge checks
- Practical exercises
- Final assessments

Students should progress through prerequisites rather than being forced to complete every lesson sequentially.

## 3. Lesson Structure

Every conceptual lesson follows this structure:

1. Introduction
2. Concept explanation
3. Architecture diagrams
4. Real-world examples
5. Knowledge check (5 questions)
6. Practical scenario
7. Lesson summary

Knowledge checks use objectively verifiable questions.

Suggested passing score: 80%.

Practical exercises evaluate reasoning and application.

## 4. System Design Assessment Structure

Each real-world challenge has a structured assessment.

Example: URL Shortener.

Students receive:

- Problem description
- Business requirements
- Expected traffic and scale
- Constraints
- Assessment instructions

Students submit answers through structured input fields.

Required fields:

1. Functional requirements
2. Non-functional requirements
3. Capacity estimation
4. API design
5. Database selection and reasoning
6. High-level architecture
7. Scalability considerations
8. Failure handling
9. Trade-off analysis

Keep the submission interface simple. Do not require an elaborate architecture editor in the initial version.

Support text and structured answers initially. Architecture diagram uploads can be added later.

## 5. AI Assessment Engine

Integrate Gemini API through the backend.

Never expose the Gemini API key to the frontend.

The backend must provide the AI with:

- Challenge description
- Business requirements
- Assessment rubric
- Scoring weights
- Student submission
- Evaluation instructions

The AI must evaluate the submission against the rubric, not compare it literally against a reference architecture.

### Example scoring rubric

| Criterion                   | Weight |
| --------------------------- | -----: |
| Requirements understanding  |     15 |
| Capacity estimation         |     10 |
| Architecture design         |     25 |
| Database design             |     15 |
| Scalability and reliability |     20 |
| Trade-off reasoning         |     15 |
| Total                       |    100 |

Each criterion receives:

- Score
- Strengths
- Weaknesses
- Explanation
- Improvement suggestions

### AI evaluation rules

1. Accept different valid architectural approaches.
2. Never penalize a student simply for choosing a different technology.
3. Evaluate whether decisions satisfy the requirements.
4. Identify missing considerations.
5. Penalize incorrect technical assumptions.
6. Explain why a decision is problematic.
7. Never fabricate requirements or technical facts.
8. Return structured JSON only.
9. Use the same rubric and scoring weights for every submission of the same challenge version.
10. Distinguish factual correctness from subjective architectural preferences.

## 6. AI Response Format

Use structured JSON with server-side schema validation.

Example:

{
"overall_score": 82,
"passed": true,
"summary": "Good architecture with some scalability gaps.",
"evaluations": [
{
"criterion": "architecture_design",
"score": 85,
"weight": 25,
"strengths": [
"Clear separation of responsibilities"
],
"weaknesses": [
"Missing discussion of failure handling"
],
"feedback": "The proposed architecture is appropriate for the given workload."
}
],
"recommendations": [
"Explain database replication",
"Consider cache invalidation strategies"
],
"critical_issues": [],
"confidence": 0.91
}

The example scores and feedback are illustrative.

Validate:

- Required fields
- Score ranges
- Valid JSON
- Total weighted score
- Consistency between score and pass status

Do not trust AI-generated scores without validation.

If the AI response is invalid, retry or return a processing error without consuming the student's submission attempt.

## 7. Submission Rules

Students can submit each final assessment only once.

Workflow:

1. Student opens challenge.
2. Student works on the assessment.
3. Student saves drafts.
4. Student submits final assessment.
5. Backend locks the submission.
6. AI evaluation starts.
7. Evaluation result is stored permanently.
8. Student can view their results and feedback.

Important:

- Unlimited draft editing.
- One final submission per challenge version.
- No resubmission after successful submission.
- API failures must not consume an attempt.
- Prevent duplicate submissions using backend transaction and idempotency controls.
- Store the original submission and evaluation history.

## 8. Student Progress

Track:

- Completed lessons
- Knowledge check scores
- Completed practical exercises
- Assessment scores
- Learning level
- Weak knowledge areas
- Recommended next lessons

Students should see their strengths and weaknesses rather than only an overall score.

Suggested passing threshold: 75/100, with configurable minimum scores for critical criteria.

## 9. UI / UX

Create the following pages:

### A. System Design Dashboard

- Learning progress
- Continue learning
- Curriculum overview
- Available challenges
- Recent assessment results

### B. Curriculum Page

- Four learning levels
- Modules and lessons
- Completion status
- Prerequisites

### C. Lesson Page

- Concept explanation
- Diagrams
- Knowledge checks
- Practical exercises

### D. Challenge Page

- Problem description
- Requirements
- Constraints
- Assessment instructions
- Structured submission form

### E. Assessment Result Page

- Overall score
- Pass/fail status
- Criterion-by-criterion evaluation
- Strengths
- Weaknesses
- AI recommendations
- Recommended lessons

## 10. Technical Requirements

- Reuse the existing application architecture and design system.
- Do not introduce unnecessary dependencies.
- Keep System Design logic separate from React coding challenge logic.
- Integrate Gemini through a backend service.
- Use structured output and schema validation.
- Version curriculum content and evaluation rubrics.
- Store submission, rubric version, model version, and prompt version.
- Keep API keys and evaluation logic server-side.
- Handle AI failures gracefully.
- Make assessment results reproducible and auditable as far as practical.

## 11. Implementation Order

Implement incrementally:

Phase 1: Curriculum data model and dashboard.

Phase 2: Lesson content and knowledge checks.

Phase 3: Design challenge pages and structured submissions.

Phase 4: Gemini evaluation service and rubric engine.

Phase 5: Assessment results and progress tracking.

Phase 6: Testing, error handling, and UX refinement.

Do not implement all phases in one pass.

First inspect the existing repository, identify its framework, architecture, database, authentication, and design conventions.

Then propose an implementation plan before modifying existing code.

Avoid breaking existing React learning functionality.

## 12. Acceptance Criteria

The feature is considered functional when:

- Students can browse the complete curriculum.
- Students can complete lessons and knowledge checks.
- Students can open System Design challenges.
- Students can save drafts.
- Students can submit an assessment once.
- Gemini evaluates submissions against the configured rubric.
- Different valid architectures can receive high scores.
- Invalid AI responses are handled safely.
- Students receive structured feedback.
- Progress is persisted across sessions.
- Existing React coding challenges remain unaffected.
