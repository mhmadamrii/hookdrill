import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  availableModules,
  courseState,
  levelState,
  nextLevelStep,
  nextStep,
  type Answers,
  type Course,
  type LevelCourse,
  type ModuleCourse,
} from '@hookdrill/courses'
import { useSettledSession } from './auth-client'
import { useTRPC } from './trpc'

const EMPTY: never[] = []

/**
 * The signed-in user's assessment results for a course. Results live on the
 * server, so signed-out visitors see every course as new.
 */
export function useCourseResults(course: Course) {
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
  return {
    signedIn: !!session,
    isLoading: isPending || (!!session && query.isPending),
    isError: query.isError,
    results,
    passed,
  }
}

export type CourseResults = ReturnType<typeof useCourseResults>

/**
 * Progress through a module course. Signed out, the first submodule is open
 * to read and quizzes ask for a sign-in.
 */
export function useCourseProgress(course: ModuleCourse) {
  const base = useCourseResults(course)
  const states = useMemo(
    () => courseState(course, base.passed),
    [course, base.passed],
  )
  return {
    ...base,
    states,
    next: nextStep(states),
    done: states.reduce((n, m) => n + m.passed, 0),
    total: states.reduce((n, m) => n + m.total, 0),
  }
}

/** Progress through a level course, unlocked by prerequisites. */
export function useLevelProgress(course: LevelCourse) {
  const base = useCourseResults(course)
  const levels = useMemo(
    () => levelState(course, base.passed),
    [course, base.passed],
  )
  return {
    ...base,
    levels,
    next: nextLevelStep(levels),
    done: levels.reduce((n, l) => n + l.passed, 0),
    total: levels.reduce((n, l) => n + l.total, 0),
  }
}

export type LevelProgress = ReturnType<typeof useLevelProgress>

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
export function courseSteps(course: ModuleCourse): Step[] {
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

/** Passed and total assessments, for cards and badges, in either format. */
export function useCourseSummary(course: Course) {
  const base = useCourseResults(course)
  const counts = useMemo(() => {
    const parts =
      course.format === 'levels'
        ? levelState(course, base.passed)
        : courseState(course, base.passed)
    return {
      done: parts.reduce((n, p) => n + p.passed, 0),
      total: parts.reduce((n, p) => n + p.total, 0),
    }
  }, [course, base.passed])
  return { signedIn: base.signedIn, ...counts }
}
