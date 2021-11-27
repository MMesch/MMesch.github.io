module.exports = {
  purge: {
    enabled: true,
    content: [
      './tailwind.css',
      './src/**/*.html',
      './src/**/*.vue',
      './src/**/*.jsx',
      './src/**/*.purs']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      scale: {
        '105': '1.05'
      },
      spacing: {
        'colwidth': '60em',
      },
      maxWidth: {
        'colwidth': '50em',
      },
    fontFamily: {
      display: ['Noto', 'sans-serif'],
      sans: ['Noto', 'sans-serif'],
      body: ['Noto', 'sans-serif'],
      mono: ['Source Code Pro'],
    }},
  },
  variants: {
    extend: {
     filter: ['hover', 'focus'],
     hueRotate: ['hover', 'focus'],
     brightness: ['hover', 'focus'],
     dropShadow: ['hover', 'focus'],
     scale: ['active', 'group-hover'],
     cursor: ['hover', 'focus'],
    }
  }
}
