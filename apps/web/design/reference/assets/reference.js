// Reference-only state switcher: [data-state-panel="x"] blocks, toggled by
// buttons in .ref .states or by the URL hash (#x) for deep links.
;(function () {
  const panels = [...document.querySelectorAll('[data-state-panel]')]
  const buttons = [...document.querySelectorAll('.ref .states button')]
  if (!panels.length) return

  function show(state) {
    if (!panels.some((p) => p.dataset.statePanel.split(' ').includes(state)))
      state = buttons[0]?.dataset.state
    panels.forEach((p) => {
      p.hidden = !p.dataset.statePanel.split(' ').includes(state)
    })
    buttons.forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.state === state)),
    )
    document.body.dataset.state = state
  }

  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      history.replaceState(null, '', '#' + b.dataset.state)
      show(b.dataset.state)
    }),
  )
  window.addEventListener('hashchange', () => show(location.hash.slice(1)))
  show(location.hash.slice(1))
})()
