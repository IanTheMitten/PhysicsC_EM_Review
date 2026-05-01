/* ============================================================
   AP Physics C E&M — Glassmorphism Study Guide
   app.js — All JavaScript in one file
   ============================================================ */
(function () {
  'use strict';

  /* --------------------------------------------------
     StateManager — localStorage backed
     -------------------------------------------------- */
  const STORAGE_THEME = 'ap-em-theme';
  const STORAGE_PROGRESS = 'ap-em-progress';

  const StateManager = {
    getDarkMode() {
      return localStorage.getItem(STORAGE_THEME) === 'dark';
    },
    setDarkMode(dark) {
      localStorage.setItem(STORAGE_THEME, dark ? 'dark' : 'light');
    },
    getProgress(unitId) {
      try {
        const data = JSON.parse(localStorage.getItem(STORAGE_PROGRESS) || '{}');
        return new Set(data[unitId] || []);
      } catch { return new Set(); }
    },
    setProgress(unitId, sections) {
      try {
        const data = JSON.parse(localStorage.getItem(STORAGE_PROGRESS) || '{}');
        data[unitId] = [...sections];
        localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(data));
      } catch { /* quota exceeded — silently ignore */ }
    },
    toggleSection(unitId, sectionId) {
      const sections = this.getProgress(unitId);
      if (sections.has(sectionId)) sections.delete(sectionId);
      else sections.add(sectionId);
      this.setProgress(unitId, sections);
      return sections;
    },
    getProgressPercent(unitId, totalSections) {
      if (!totalSections) return 0;
      return Math.round((this.getProgress(unitId).size / totalSections) * 100);
    }
  };

  /* --------------------------------------------------
     Unit page config
     -------------------------------------------------- */
  const UNIT_PAGES = [
    { id: 'unit1', file: 'unit1-electrostatics.html', num: 1, label: 'Electrostatics', weight: '15-25%' },
    { id: 'unit2', file: 'unit2-circuits.html', num: 2, label: 'Circuits', weight: '17-23%' },
    { id: 'unit3', file: 'unit3-magnetism.html', num: 3, label: 'Magnetism', weight: '17-23%' },
    { id: 'unit4', file: 'unit4-electromagnetism.html', num: 4, label: 'EM Induction', weight: '14-20%' },
    { id: 'unit5', file: 'unit5-maxwell.html', num: 5, label: 'Maxwell', weight: '14-17%' }
  ];

  const PRACTICE_PAGES = [
    { id: 'practice1', file: 'practice/practice-unit1.html', label: 'Practice 1: Electrostatics', unitKey: 'unit1' },
    { id: 'practice2', file: 'practice/practice-unit2.html', label: 'Practice 2: Circuits', unitKey: 'unit2' },
    { id: 'practice3', file: 'practice/practice-unit3.html', label: 'Practice 3: Magnetism', unitKey: 'unit3' },
    { id: 'practice4', file: 'practice/practice-unit4.html', label: 'Practice 4: EM Induction', unitKey: 'unit4' },
    { id: 'practice5', file: 'practice/practice-unit5.html', label: 'Practice 5: Maxwell', unitKey: 'unit5' }
  ];

  function getCurrentPageFile() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  }

  function getCurrentUnitId() {
    const file = getCurrentPageFile();
    for (const u of UNIT_PAGES) {
      if (u.file === file) return u.id;
    }
    return null;
  }

  /* --------------------------------------------------
     DarkModeController
     -------------------------------------------------- */
  const DarkModeController = {
    init() {
      const dark = StateManager.getDarkMode();
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      this._updateButton(dark);
    },
    toggle() {
      const current = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = !current;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      StateManager.setDarkMode(next);
      this._updateButton(next);
    },
    _updateButton(dark) {
      const btn = document.querySelector('.theme-toggle');
      if (btn) btn.textContent = dark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    }
  };

  /* --------------------------------------------------
     NavController
     -------------------------------------------------- */
  const NavController = {
    init() {
      this._highlightActive();
      this._bindClicks();
    },
    _highlightActive() {
      const current = getCurrentPageFile();
      document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        // Check both direct match and practice page match (since practice links use relative paths)
        const practiceFile = href && href.split('/').pop();
        link.classList.toggle('active', href === current || practiceFile === current || href === 'practice/' + current);
      });
    },
    _bindClicks() {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
          const href = this.getAttribute('href');
          if (href) window.location.href = href;
        });
      });
    },
    goToUnit(num) {
      if (num === 0) { window.location.href = 'index.html'; return; }
      const u = UNIT_PAGES[num - 1];
      if (u) window.location.href = u.file;
    },
    goNext() {
      const current = getCurrentUnitId();
      if (!current) { window.location.href = UNIT_PAGES[0].file; return; }
      const idx = UNIT_PAGES.findIndex(u => u.id === current);
      if (idx < UNIT_PAGES.length - 1) window.location.href = UNIT_PAGES[idx + 1].file;
    },
    goPrev() {
      const current = getCurrentUnitId();
      if (!current) return;
      const idx = UNIT_PAGES.findIndex(u => u.id === current);
      if (idx > 0) window.location.href = UNIT_PAGES[idx - 1].file;
      else window.location.href = 'index.html';
    }
  };

  /* --------------------------------------------------
     SidebarController — builds TOC & scroll spy
     -------------------------------------------------- */
  const SidebarController = {
    init() {
      const toc = document.querySelector('.sidebar-toc');
      if (!toc) return;
      const headings = document.querySelectorAll('.content-section[id]');
      headings.forEach(section => {
        const h2 = section.querySelector('h2');
        if (!h2) return;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + section.id;
        a.textContent = h2.textContent;
        a.addEventListener('click', function (e) {
          e.preventDefault();
          section.scrollIntoView({ behavior: 'smooth' });
        });
        li.appendChild(a);
        toc.appendChild(li);
      });
      this._observe();
    },
    _observe() {
      const links = document.querySelectorAll('.sidebar-toc a');
      if (!links.length) return;
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            links.forEach(l => l.classList.remove('active'));
            const active = document.querySelector('.sidebar-toc a[href="#' + entry.target.id + '"]');
            if (active) active.classList.add('active');
          }
        }
      }, { rootMargin: '-80px 0px -70% 0px' });
      document.querySelectorAll('.content-section[id]').forEach(s => observer.observe(s));
    }
  };

  /* --------------------------------------------------
     SectionCollapse
     -------------------------------------------------- */
  const SectionCollapse = {
    init() {
      document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', function (e) {
          if (e.target.tagName === 'INPUT') return;
          const section = this.closest('.content-section');
          if (section) section.classList.toggle('collapsed');
        });
      });
    }
  };

  /* --------------------------------------------------
     ProgressCheckboxes
     -------------------------------------------------- */
  const ProgressCheckboxes = {
    init() {
      const unitId = getCurrentUnitId();
      if (!unitId) return;
      const completed = StateManager.getProgress(unitId);
      const checkboxes = document.querySelectorAll('.progress-check');
      checkboxes.forEach(cb => {
        const sectionId = cb.getAttribute('data-section');
        if (completed.has(sectionId)) cb.checked = true;
        cb.addEventListener('change', () => {
          const sections = StateManager.toggleSection(unitId, sectionId);
          this._updateUI(sections, checkboxes);
        });
      });
      this._updateUI(completed, checkboxes);
    },
    _updateUI(sections, checkboxes) {
      const pct = Math.round((sections.size / checkboxes.length) * 100) || 0;
      const fill = document.querySelector('.progress-fill');
      const label = document.querySelector('.progress-label');
      if (fill) fill.style.width = pct + '%';
      if (label) label.textContent = pct + '% Complete';
    }
  };

  /* --------------------------------------------------
     SearchFilter
     -------------------------------------------------- */
  const SearchFilter = {
    init() {
      const input = document.querySelector('.search-input');
      if (!input) return;
      let debounce;
      input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => this._filter(input.value.toLowerCase()), 200);
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { this.value = ''; this.blur(); SearchFilter._filter(''); }
      });
    },
    _filter(query) {
      const sections = document.querySelectorAll('.content-section');
      const practice = document.querySelectorAll('.practice-block, .mcq-question, .practice-frq-block');
      const all = [...sections, ...practice];
      all.forEach(el => {
        const text = el.textContent.toLowerCase();
        const match = !query || text.includes(query);
        el.classList.toggle('hidden', !match);
        if (match && query) el.classList.add('animate-in');
        else el.classList.remove('animate-in');
      });
    }
  };

  /* --------------------------------------------------
     Keyboard shortcuts
     -------------------------------------------------- */
  const KeyboardController = {
    init() {
      document.addEventListener('keydown', e => {
        const tag = document.activeElement.tagName;
        const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement.isContentEditable;

        if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !isInput)) {
          e.preventDefault();
          const search = document.querySelector('.search-input');
          if (search) search.focus();
          return;
        }

        if (isInput) return;

        if (e.key === 't' || e.key === 'T') { e.preventDefault(); DarkModeController.toggle(); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); NavController.goNext(); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); NavController.goPrev(); return; }
        if (e.key === '0' || e.key === 'h' || e.key === 'H') { e.preventDefault(); NavController.goToUnit(0); return; }
        if (e.key >= '1' && e.key <= '5') { e.preventDefault(); NavController.goToUnit(parseInt(e.key)); return; }
      });
    }
  };

  /* --------------------------------------------------
     Mobile menu
     -------------------------------------------------- */
  const MobileMenu = {
    init() {
      const btn = document.querySelector('.mobile-menu-btn');
      const nav = document.querySelector('.nav-links');
      if (!btn || !nav) return;
      btn.addEventListener('click', () => {
        nav.classList.toggle('open');
        btn.textContent = nav.classList.contains('open') ? '\u2715' : '\u2630';
      });
      nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('open');
          btn.textContent = '\u2630';
        });
      });
    }
  };

  /* --------------------------------------------------
     Mobile sidebar
     -------------------------------------------------- */
  const MobileSidebar = {
    init() {
      let backdrop = document.querySelector('.sidebar-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        backdrop.addEventListener('click', () => this._close());
        document.body.appendChild(backdrop);
      }
      const main = document.querySelector('.main-content');
      const sidebar = document.querySelector('.sidebar');
      if (!main || !sidebar) return;
      if (document.body.classList.contains('page-landing')) return;

      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'mobile-menu-btn glass-btn glass-btn--sm';
      toggleBtn.textContent = '\u2630 Contents';
      toggleBtn.style.cssText = 'margin-bottom: 1rem; display: none;';
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        backdrop.classList.add('open');
      });
      main.insertBefore(toggleBtn, main.firstChild);

      const mq = window.matchMedia('(max-width: 768px)');
      mq.addEventListener('change', () => {
        toggleBtn.style.display = mq.matches ? 'inline-flex' : 'none';
      });
      if (mq.matches) toggleBtn.style.display = 'inline-flex';
    },
    _close() {
      const sidebar = document.querySelector('.sidebar');
      const backdrop = document.querySelector('.sidebar-backdrop');
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }
  };

  /* --------------------------------------------------
     Landing page
     -------------------------------------------------- */
  const LandingPage = {
    init() {
      if (!document.body.classList.contains('page-landing')) return;
      UNIT_PAGES.forEach(u => {
        const card = document.querySelector('.unit-card[data-unit="' + u.id + '"]');
        if (!card) return;
        const totalSections = parseInt(card.getAttribute('data-total') || '0');
        const pct = StateManager.getProgressPercent(u.id, totalSections);
        const fill = card.querySelector('.card-progress-fill');
        const text = card.querySelector('.progress-text');
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = pct + '% complete';
      });
    }
  };

  /* --------------------------------------------------
     PracticeController — MCQ + FRQ on practice pages
     -------------------------------------------------- */
  const PRACTICE_STORAGE_KEY = 'ap-em-practice';

  const PracticeController = {
    init() {
      const pageId = this._getCurrentPracticeId();
      if (!pageId) return;

      this.pageId = pageId;
      this.state = this._loadState();

      this._bindMCQButtons();
      this._bindFRQToggles();
      this._bindTabNavigation();
      this._updateScoreboard();
      this._restoreUIState();
    },

    _getCurrentPracticeId() {
      const file = getCurrentPageFile();
      for (const p of PRACTICE_PAGES) {
        const practiceFile = p.file.split('/').pop();
        if (file === practiceFile) return p.id;
      }
      return null;
    },

    _loadState() {
      try {
        const data = JSON.parse(localStorage.getItem(PRACTICE_STORAGE_KEY) || '{}');
        return data[this.pageId] || { mcq: {}, frq: {} };
      } catch { return { mcq: {}, frq: {} }; }
    },

    _saveState() {
      try {
        const data = JSON.parse(localStorage.getItem(PRACTICE_STORAGE_KEY) || '{}');
        data[this.pageId] = this.state;
        localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(data));
      } catch { /* quota exceeded */ }
    },

    /* --- MCQ --- */
    _bindMCQButtons() {
      document.querySelectorAll('.mcq-question').forEach(function (q) {
        const qId = q.getAttribute('data-mcq-id');
        const checkBtn = q.querySelector('.mcq-check-btn');
        const resetBtn = q.querySelector('.mcq-reset-btn');
        const radios = q.querySelectorAll('input[type="radio"]');

        checkBtn.addEventListener('click', function () { PracticeController._checkMCQ(q, qId); });
        resetBtn.addEventListener('click', function () { PracticeController._resetMCQ(q, qId); });

        radios.forEach(function (r) {
          r.addEventListener('change', function () {
            if (!PracticeController.state.mcq[qId]) {
              PracticeController.state.mcq[qId] = { attempted: true, correct: false, revealed: false };
            }
            PracticeController._saveState();
          });
        });
      });
    },

    _checkMCQ(container, qId) {
      const selected = container.querySelector('input[type="radio"]:checked');
      if (!selected) return;

      const chosenValue = selected.value;
      const correctValue = container.getAttribute('data-correct');
      const isCorrect = chosenValue === correctValue;

      container.querySelectorAll('input[type="radio"]').forEach(function (r) { r.disabled = true; });

      container.querySelectorAll('.mcq-option').forEach(function (opt) {
        const input = opt.querySelector('input[type="radio"]');
        if (input.value === correctValue) opt.classList.add('correct');
        else if (input.value === chosenValue && !isCorrect) opt.classList.add('incorrect');
      });

      const correctFeedback = container.querySelector('.mcq-feedback.correct-msg');
      const incorrectFeedback = container.querySelector('.mcq-feedback.incorrect-msg');
      if (correctFeedback) correctFeedback.classList.toggle('show', isCorrect);
      if (incorrectFeedback) incorrectFeedback.classList.toggle('show', !isCorrect);

      this.state.mcq[qId] = {
        attempted: true,
        correct: isCorrect,
        revealed: true,
        lastAnswer: chosenValue
      };
      this._saveState();
      this._updateScoreboard();
    },

    _resetMCQ(container, qId) {
      container.querySelectorAll('input[type="radio"]').forEach(function (r) {
        r.checked = false; r.disabled = false;
      });
      container.querySelectorAll('.mcq-option').forEach(function (opt) {
        opt.classList.remove('correct', 'incorrect');
      });
      container.querySelectorAll('.mcq-feedback').forEach(function (fb) {
        fb.classList.remove('show');
      });
    },

    /* --- FRQ --- */
    _bindFRQToggles() {
      document.querySelectorAll('.practice-frq-block details.solution').forEach(function (details) {
        const block = details.closest('.practice-frq-block');
        const frqId = block ? block.getAttribute('data-frq-id') : null;
        if (!frqId) return;

        details.addEventListener('toggle', function () {
          if (details.open) {
            if (!PracticeController.state.frq[frqId]) {
              PracticeController.state.frq[frqId] = { revealed: false };
            }
            PracticeController.state.frq[frqId].revealed = true;
            PracticeController._saveState();
            PracticeController._updateScoreboard();

            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
              MathJax.typesetPromise([details.querySelector('.solution-content')]);
            }
          }
        });
      });
    },

    /* --- Tab navigation --- */
    _bindTabNavigation() {
      document.querySelectorAll('.practice-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          var target = tab.getAttribute('data-target');

          document.querySelectorAll('.practice-tab').forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');

          if (target === 'section-all') {
            document.querySelectorAll('.practice-section').forEach(function (s) { s.classList.remove('hidden'); });
          } else {
            document.querySelectorAll('.practice-section').forEach(function (s) { s.classList.add('hidden'); });
            var targetSection = document.getElementById(target);
            if (targetSection) targetSection.classList.remove('hidden');
          }
        });
      });
    },

    /* --- Scoreboard --- */
    _updateScoreboard() {
      var attempted = 0, correct = 0, frqRevealed = 0;
      Object.values(this.state.mcq).forEach(function (e) {
        if (e.attempted) attempted++;
        if (e.correct) correct++;
      });
      Object.values(this.state.frq).forEach(function (e) {
        if (e.revealed) frqRevealed++;
      });

      var attemptedEl = document.querySelector('.score-attempted');
      var correctEl = document.querySelector('.score-correct');
      var frqEl = document.querySelector('.score-frq');
      if (attemptedEl) attemptedEl.textContent = attempted;
      if (correctEl) correctEl.textContent = correct;
      if (frqEl) frqEl.textContent = frqRevealed;
    },

    /* --- Restore UI from saved state --- */
    _restoreUIState() {
      var self = this;
      Object.entries(this.state.mcq).forEach(function (entry) {
        var qId = entry[0], entryData = entry[1];
        if (!entryData.revealed) return;
        var container = document.querySelector('.mcq-question[data-mcq-id="' + qId + '"]');
        if (!container) return;

        container.querySelectorAll('input[type="radio"]').forEach(function (r) {
          r.disabled = true;
          if (r.value === entryData.lastAnswer) r.checked = true;
        });

        var correctValue = container.getAttribute('data-correct');
        container.querySelectorAll('.mcq-option').forEach(function (opt) {
          var input = opt.querySelector('input[type="radio"]');
          if (input.value === correctValue) opt.classList.add('correct');
          else if (input.value === entryData.lastAnswer && !entryData.correct) opt.classList.add('incorrect');
        });

        if (entryData.correct) {
          var fb = container.querySelector('.mcq-feedback.correct-msg');
          if (fb) fb.classList.add('show');
        } else {
          var fb2 = container.querySelector('.mcq-feedback.incorrect-msg');
          if (fb2) fb2.classList.add('show');
        }
      });

      Object.entries(this.state.frq).forEach(function (entry) {
        var frqId = entry[0], entryData = entry[1];
        if (!entryData.revealed) return;
        var block = document.querySelector('.practice-frq-block[data-frq-id="' + frqId + '"]');
        if (block) {
          var details = block.querySelector('details.solution');
          if (details) details.open = true;
        }
      });
    }
  };

  /* --------------------------------------------------
     Bootstrap
     -------------------------------------------------- */
  function init() {
    DarkModeController.init();
    NavController.init();
    KeyboardController.init();
    MobileMenu.init();

    if (document.body.classList.contains('page-landing')) {
      LandingPage.init();
    } else if (document.body.classList.contains('page-practice')) {
      PracticeController.init();
      MobileSidebar.init();
    } else {
      SidebarController.init();
      SectionCollapse.init();
      ProgressCheckboxes.init();
      MobileSidebar.init();
    }
    SearchFilter.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();