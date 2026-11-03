-- Practice rating was added after people had already solved problems in the
-- browser. Credit those solves once: rating = sum of points of solved problems.
INSERT INTO "user_stats" ("user_id", "rating", "last_rating_at")
SELECT p."user_id", SUM(c."points"), MAX(p."public_passed_at")
FROM "progress" p
JOIN "challenges" c ON c."id" = p."challenge_id"
WHERE p."public_passed_at" IS NOT NULL
GROUP BY p."user_id"
ON CONFLICT ("user_id") DO UPDATE
SET "rating" = EXCLUDED."rating", "last_rating_at" = EXCLUDED."last_rating_at";
