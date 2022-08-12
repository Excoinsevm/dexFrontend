module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // --------------------------------------------------------------
      // customized style abbreviation naming rules:
      // all colors start with 'c-'
      // -element: 't' - text, 'b' - background, 'r' - outline ring
      //           'pl' - placeholder, 'btn' - button, 'bdr' - border
      // -state:   'h' - hovered, 'f' - focused, 'sel' - selected
      //           'norm' - normal
      textColor: {
        // ------ element text major/minor colors
        'c-major':            'var(--color-major-t)',
        'c-major-h':          'var(--color-major-ht)',
        'c-major2':           'var(--color-major2-t)',
        'c-minor':            'var(--color-minor-t)',
        'c-minor2':           'var(--color-minor2-t)',
        'c-minor3':           'var(--color-minor3-t)',
        'c-heading':          'var(--color-heading-t)',
        'c-heading2':         'var(--color-heading2-t)',

        // ------ nav, drawer
        'c-nav':              'var(--color-nav-t)',
        'c-nav-h':            'var(--color-nav-ht)',
        'c-drawer':           'var(--color-drawer-t)',
        'c-drawer-h':         'var(--color-drawer-ht)',

        // ------ highlight
        'c-hlight':           'var(--color-highlight-t)',

        // ------ button
        'c-btn':              'var(--color-btn-t)',
        'c-btn-muted':        'var(--color-btn-muted-t)',
        'c-btn-muted-h':      'var(--color-btn-muted-ht)',

        // ------ button
        'c-tab':              'var(--color-tab-t)',
        'c-tab-muted':        'var(--color-tab-muted-t)',
        'c-tab-muted-h':      'var(--color-tab-muted-ht)',

        // ------ form
        'c-form':             'var(--color-form-t)',

        // ------ icon
        'c-icon-norm':        'var(--color-icon-norm-t)',
        'c-icon-sel':         'var(--color-icon-sel-t)',

        // ------ makret specific
        'c-bullish':          'var(--color-bullish-t)',
        'c-bearish':          'var(--color-bearish-t)',
        'c-neutral':          'var(--color-neutral-t)',
        'c-bullish-weak':     'var(--color-bullish-weak-t)',
        'c-bearish-weak':     'var(--color-bearish-weak-t)',
      },
      backgroundColor: {
        // ------ element background major/minor colors
        'c-major':            'var(--color-major-b)',
        'c-minor':            'var(--color-minor-b)',
        'c-minor2':           'var(--color-minor2-b)',
        'c-minor3':           'var(--color-minor3-b)',
        'c-minor4':           'var(--color-minor4-b)',
        'c-minor5':           'var(--color-minor5-b)',

        // ------ nav, drawer
        // 'c-nav':              'var(--color-nav-b)',
        'c-drawer':           'var(--color-drawer-b)',
        'c-drawer-h':         'var(--color-drawer-hb)',

        // ------ highlight
        'c-hlight':           'var(--color-highlight-b)',

        // ------ button
        'c-btn':              'var(--color-btn-b)',
        'c-btn-muted':        'var(--color-btn-muted-b)',
        'c-btn-muted-h':      'var(--color-btn-muted-hb)',
        'c-btn-muted-h2':     'var(--color-btn-muted-h2b)',

        // ------ form
        'c-form':             'var(--color-form-b)',

        // ------ market specific
        'c-bullish':          'var(--color-bullish-b)',
        'c-bearish':          'var(--color-bearish-b)',

        'c-btn-bullish':      'var(--color-btn-bullish-b)',
        'c-btn-bearish':      'var(--color-btn-bearish-b)',
      },
      borderColor: {
        'c-major':            'var(--color-major-b)',
        'c-minor':            'var(--color-minor-b)',
        'c-minor2':           'var(--color-minor2-b)',
        'c-minor3':           'var(--color-minor3-b)',
        'c-minor4':           'var(--color-minor4-b)',
        'c-minor5':           'var(--color-minor5-b)',

        'c-strong':           'var(--color-strong-bdr)',
        'c-weak':             'var(--color-weak-bdr)',
        'c-weak2':            'var(--color-weak2-bdr)',
        'c-h':                'var(--color-bdr-h)',
        'c-f':                'var(--color-bdr-f)',
        'c-err':              'var(--color-bdr-err)',

        'c-nav':              'var(--color-nav-bdr)',
        'c-btn':              'var(--color-btn-bdr)',
        'c-btn-disabled':     'var(--color-btn-bdr-disabled)',
      },
      ringColor: {
        'c-r':                'var(--color-bdr-r)',
      },
      placeholderColor: {
        'c-pl':               'var(--color-pl-t)',
      },
      colors: {
        'c-msg':              'var(--color-msg-b)',
        'c-msg-err':          'var(--color-msg-err)',
        'c-gr-f':             'var(--color-bgr-from)',
        'c-gr-t':             'var(--color-bgr-to)',
        'c-btn-gr-f':         'var(--color-btn-bgr-from)',
        'c-btn-gr-t':         'var(--color-btn-bgr-to)',
        'c-btn2-gr-f':        'var(--color-btn2-bgr-from)',
        'c-btn2-gr-t':        'var(--color-btn2-bgr-to)',
      },
      fontSize: {
        '2xs':                '0.7rem',
      },
      backgroudImage: {
        'hero-pattern': "url(https://tailwindcss.com/img/hero-bg-1.svg)",
      },
      animation: {
        popup: "popup 0.3s ease-in-out",
        blob: "blob 30s infinite",
        blob1: "blob1 5s infinite",
      },
      keyframes: {
        popup: {
          "0%": { transform: "scale(0.8)" },
          "50%": { transform: "scale(1.05)", },
          "100%": { transform: "scale(1)", }
        },
        blob: {
          "0%": { transform: "translate(-30rem, 0) scale(1)" },
          "33%": { transform: "translate(100rem, 6rem) scale(1.5)", },
          "66%": { transform: "translate(30rem, 40rem) scale(0.8)", },
          "100%": { transform: "translate(-30rem, 0) scale(1)", }
        },
        blob1: {
          "0%": { transform: "translate(-30rem, 0) scale(1)", },
          "33%": { transform: "translate(100rem, 6rem) scale(1.5)", },
          "66%": { transform: "translate(30rem, 40rem) scale(0.8)", },
          "100%": { transform: "translate(-30rem, 0) scale(1)", }
        }
      },
    }
  },
  plugins: [],
}