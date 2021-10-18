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
      body: ['Noto', 'sans-serif']
    }},
  colors: {
     transparent: 'transparent',
     current: 'currentColor',
     darkblue: '#496DDB',
     paleblue: '#717EC3',
     palered: '#AE8799',
     red: '#C95D63',
     orange: '#EE8434',
     black: '#000000',
     white: '#FFFFFF',
     code: '#333333'
  }
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
