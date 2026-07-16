/* Préime — static HTML build.
   Vanilla port of the React app's runtime (App.jsx initInteractions/setupReveal,
   Header menu, CookieConsent). No framework, no build step.
   Keep behaviour in sync with preime-react/src/App.jsx if that changes. */
(function () {
  'use strict'

  var EASE = 'cubic-bezier(.22,1,.36,1)'
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ---------------- page enter / leave transition ----------------
     Mirrors motion.main's initial/animate/exit in the React build. On a static
     site each navigation is a real page load, so we fade out before unloading
     and fade in on arrival. */
  function pageTransitions () {
    var main = document.querySelector('main')
    if (main && !reduced) main.classList.add('page-enter')

    if (reduced) return
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a')
      if (!a) return
      var href = a.getAttribute('href')
      if (!href || href.charAt(0) === '#') return
      if (/^(https?:|mailto:|tel:)/.test(href)) return
      if (a.target && a.target !== '_self') return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      e.preventDefault()
      document.body.classList.add('page-leaving')
      setTimeout(function () { window.location.href = href }, 220)
    })
    // restore on bfcache back-navigation
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) document.body.classList.remove('page-leaving')
    })
  }

  /* ---------------- smooth in-page anchors ---------------- */
  function anchorScroll () {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a')
      if (!a) return
      var href = a.getAttribute('href')
      if (!href || href.charAt(0) !== '#') return
      e.preventDefault()
      var id = href.slice(1)
      if (!id) return
      var t = document.getElementById(id)
      if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    })
  }

  /* ---------------- header: mobile menu + portfolio accordion ---------------- */
  function header () {
    var burger = document.querySelector('.hamburger')
    var menu = document.querySelector('.mobile-menu')
    var overlay = document.querySelector('.menu-overlay')
    var close = document.querySelector('.menu-close')

    function setOpen (v) {
      if (menu) menu.classList.toggle('open', v)
      if (overlay) overlay.classList.toggle('show', v)
      document.body.style.overflow = v ? 'hidden' : ''
    }
    if (burger) burger.addEventListener('click', function () { setOpen(true) })
    if (close) close.addEventListener('click', function () { setOpen(false) })
    if (overlay) overlay.addEventListener('click', function () { setOpen(false) })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false) })

    var acc = document.querySelector('.m-accordion')
    var accBtn = acc && acc.querySelector('.m-acc-toggle')
    if (accBtn) accBtn.addEventListener('click', function () {
      var open = !acc.classList.contains('open')
      acc.classList.toggle('open', open)
      accBtn.setAttribute('aria-expanded', String(open))
    })
  }

  /* ---------------- interactions (ported 1:1 from App.jsx) ---------------- */
  function initInteractions (root) {
    if (!root) return

    root.querySelectorAll('.tabset').forEach(function (set) {
      var btns = set.querySelectorAll('.tabset-btn')
      var pnls = set.querySelectorAll('.tabset-panel')
      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var k = btn.dataset.tab
          btns.forEach(function (b) { b.classList.toggle('active', b === btn) })
          pnls.forEach(function (p) { p.classList.toggle('active', p.dataset.tab === k) })
        })
      })
    })

    var dtabs = root.querySelectorAll('.df-tab')
    var dpanels = root.querySelectorAll('.df-tech-panel')
    dtabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var k = tab.dataset.tech
        dtabs.forEach(function (t) { t.classList.toggle('active', t === tab) })
        dpanels.forEach(function (p) { p.classList.toggle('active', p.dataset.tech === k) })
      })
    })

    root.querySelectorAll('.acc').forEach(function (acc) {
      var items = acc.querySelectorAll('.acc-item')
      items.forEach(function (item) {
        var head = item.querySelector('.acc-head')
        if (!head) return
        head.addEventListener('click', function () {
          var wasOpen = item.classList.contains('open')
          items.forEach(function (i) { i.classList.remove('open') })
          if (!wasOpen) item.classList.add('open')
        })
      })
    })

    root.querySelectorAll('.toggle').forEach(function (t) {
      var bs = t.querySelectorAll('.toggle-btn')
      bs.forEach(function (b) {
        b.addEventListener('click', function () {
          bs.forEach(function (x) { x.classList.toggle('active', x === b) })
        })
      })
    })

    root.querySelectorAll('.ba-tabs').forEach(function (t) {
      var bs = t.querySelectorAll('.ba-tab')
      bs.forEach(function (b) {
        b.addEventListener('click', function () {
          bs.forEach(function (x) { x.classList.toggle('active', x === b) })
        })
      })
    })

    var slider = root.querySelector('#baSlider')
    if (slider) {
      var before = slider.querySelector('#baBefore')
      var handle = slider.querySelector('#baHandle')
      var beforeImg = before && before.querySelector('img')
      var dragging = false
      var syncSize = function () {
        var r = slider.getBoundingClientRect()
        if (beforeImg) {
          beforeImg.style.width = r.width + 'px'
          beforeImg.style.height = r.height + 'px'
          beforeImg.style.objectFit = 'cover'
        }
      }
      syncSize()
      window.addEventListener('resize', syncSize)
      var setPos = function (cx) {
        var r = slider.getBoundingClientRect()
        var x = Math.max(0, Math.min(cx - r.left, r.width))
        var pct = (x / r.width) * 100
        before.style.width = pct + '%'
        handle.style.left = pct + '%'
        slider.style.setProperty('--ba-pct', pct + '%')
      }
      if (handle) {
        // preventDefault stops the browser starting a native image-drag on the
        // slider photos, which would swallow every mousemove after the first.
        handle.addEventListener('mousedown', function (e) { e.preventDefault(); dragging = true })
        handle.addEventListener('touchstart', function () { dragging = true }, { passive: true })
      }
      slider.addEventListener('dragstart', function (e) { e.preventDefault() })
      window.addEventListener('mouseup', function () { dragging = false })
      window.addEventListener('touchend', function () { dragging = false })
      window.addEventListener('mousemove', function (e) { if (dragging) setPos(e.clientX) })
      window.addEventListener('touchmove', function (e) { if (dragging) setPos(e.touches[0].clientX) }, { passive: true })
      slider.addEventListener('click', function (e) {
        if (handle && e.target !== handle && !handle.contains(e.target)) setPos(e.clientX)
      })
    }
  }

  /* ---------------- scroll reveal + grid stagger ---------------- */
  var STAGGER_SELECTORS = [
    '.portfolio-grid', '.dc-bespoke-grid', '.dc-prod-grid', '.blog-grid', '.bl-posts',
    '.bl-cats', '.feature-grid', '.dp-tech-grid', '.dev-feat-grid', '.ra-cards',
    '.scopes-grid', '.df-stats', '.dfw-stats', '.dc-stats5', '.pd-res-stats', '.df-checklist', '.hero-actions'
  ]

  function setupReveal (root) {
    if (!root) return
    var sections = Array.prototype.slice.call(root.querySelectorAll('section')).filter(function (_, i) { return i > 0 })
    sections.forEach(function (el) { el.classList.add('reveal') })

    var grids = []
    root.querySelectorAll(STAGGER_SELECTORS.join(',')).forEach(function (grid) {
      var kids = Array.prototype.slice.call(grid.children)
      if (kids.length < 2) return
      if (!reduced) {
        kids.forEach(function (k) {
          k.style.opacity = '0'
          k.style.transform = 'translateY(22px)'
          k.style.willChange = 'transform, opacity'
        })
      }
      grids.push({ grid: grid, kids: kids, done: false })
    })

    function tick () {
      var vh = window.innerHeight
      sections.forEach(function (el) {
        if (!el.classList.contains('reveal-in') && el.getBoundingClientRect().top < vh * 0.9) {
          el.classList.add('reveal-in')
        }
      })
      grids.forEach(function (g) {
        if (g.done) return
        if (g.grid.getBoundingClientRect().top < vh * 0.85) {
          g.done = true
          g.kids.forEach(function (k, i) {
            if (reduced) { k.style.opacity = ''; k.style.transform = ''; k.style.willChange = ''; return }
            k.style.transition = 'opacity .5s ' + EASE + ' ' + (i * 0.08) + 's, transform .5s ' + EASE + ' ' + (i * 0.08) + 's'
            // next frame so the transition actually runs from the initial state
            requestAnimationFrame(function () {
              k.style.opacity = '1'
              k.style.transform = 'none'
            })
            setTimeout(function () { k.style.willChange = '' }, (i * 0.08 + 0.5) * 1000 + 60)
          })
        }
      })
    }
    tick()
    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
  }

  /* ---------------- forms ---------------- */
  var FORM_ENDPOINT = '' // e.g. 'https://formspree.io/f/xxxxxx'

  function showFormSuccess (form, msg) {
    var card = document.createElement('div')
    card.className = 'form-success'
    card.innerHTML = '<span class="form-success-ico">✓</span><p></p>'
    card.querySelector('p').textContent = msg
    form.replaceWith(card)
  }

  function forms () {
    document.addEventListener('submit', function (e) {
      var form = e.target
      if (!(form instanceof HTMLFormElement)) return
      e.preventDefault()
      var isSearch = !!form.querySelector('input[placeholder*="postcode" i], input[placeholder*="city" i]')
      if (isSearch) {
        var note = form.parentElement.querySelector('.form-note')
        if (!note) {
          note = document.createElement('p')
          note.className = 'form-note'
          form.after(note)
        }
        note.textContent = 'Showing certified Préime providers near you ↓'
        return
      }
      if (form.querySelector('input[type="password"]')) {
        showFormSuccess(form, 'This is a demo portal. Contact us to request provider access.')
        return
      }
      if (FORM_ENDPOINT) {
        try {
          fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        } catch (err) { /* keep the success state either way */ }
      }
      showFormSuccess(form, form.classList.contains('bl-news-form')
        ? "You're subscribed — watch your inbox for Préime updates."
        : 'Thank you! Your message has been sent — our team will be in touch shortly.')
    })
  }

  /* ---------------- cookie consent ---------------- */
  function cookies () {
    var bar = document.querySelector('.cookie-bar')
    if (!bar) return
    var KEY = 'preime-cookie-consent'
    var seen
    try { seen = localStorage.getItem(KEY) } catch (e) { seen = null }
    if (seen) { bar.remove(); return }

    // baked into the HTML hidden; reveal only when there's no stored choice
    requestAnimationFrame(function () { bar.classList.add('cookie-bar-in') })

    function decide (val) {
      try { localStorage.setItem(KEY, val) } catch (e) { /* private mode */ }
      bar.classList.remove('cookie-bar-in')
      setTimeout(function () { bar.remove() }, 400)
    }
    bar.querySelectorAll('[data-cookie]').forEach(function (b) {
      b.addEventListener('click', function () { decide(b.getAttribute('data-cookie')) })
    })
  }

  /* ---------------- boot ---------------- */
  function boot () {
    var main = document.querySelector('main')
    pageTransitions()
    anchorScroll()
    header()
    initInteractions(main)
    setupReveal(main)
    forms()
    cookies()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
