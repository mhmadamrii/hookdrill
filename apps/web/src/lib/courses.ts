import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  availableModules,
  courseState,
  nextStep,
  type Answers,
  type Course,
} from '@hookdrill/courses'
import { useSettledSession } from './auth-client'
import { useTRPC } from './trpc'

const EMPTY: never[] = []

/**
 * Where the signed-in user is in a course. Results live on the server, so
 * signed-out visitors see the course as new: the first submodule is open to
 * read, and quizzes ask them to sign in.
 */
export function useCourseProgress(course: Course) {
  const { session, isPending } = useSettledSession()
  const trpc = useTRPC()
  const query = useQuery({
    ...trpc.courses.progress.queryOptions({ course: course.slug }),
    enabled: !!session && course.status === 'available',
  })
  const rows = query.data ?? EMPTY
  const results = useMemo(
    () => new Map(rows.map((r) => [r.assessment, r])),
    [rows],
  )
  const passed = useMemo(
    () => new Set(rows.filter((r) => r.passed).map((r) => r.assessment)),
    [rows],
  )
  const states = useMemo(() => courseState(course, passed), [course, passed])
  const done = states.reduce((n, m) => n + m.passed, 0)
  const total = states.reduce((n, m) => n + m.total, 0)
  return {
    signedIn: !!session,
    isLoading: isPending || (!!session && query.isPending),
    isError: query.isError,
    results,
    passed,
    states,
    next: nextStep(states),
    done,
    total,
  }
}

export type CourseProgress = ReturnType<typeof useCourseProgress>

export function useSubmitAssessment(course: Course) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.courses.submit.mutationOptions(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: trpc.courses.progress.queryKey({ course: course.slug }),
      }),
  })
}

export type { Answers }

export type Step =
  | { kind: 'lesson'; slug: string; title: string }
  | { kind: 'exam'; slug: string; title: string }

/** Every lesson and exam in course order, for previous/next links. */
export function courseSteps(course: Course): Step[] {
  return availableModules(course).flatMap((m) =>
    m.submodules.flatMap((s): Step[] => [
      ...s.lessons.map((l) => ({
        kind: 'lesson' as const,
        slug: l.slug,
        title: l.title,
      })),
      { kind: 'exam', slug: s.slug, title: `${s.title} exam` },
    ]),
  )
}
