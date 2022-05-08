module.exports = {
  content: [
      './tailwind.css',
      './src/**/*.html',
      './src/**/*.vue',
      './src/**/*.jsx',
      './src/**/*.purs'],
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
  }
}
