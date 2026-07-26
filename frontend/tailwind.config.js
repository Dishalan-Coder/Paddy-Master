export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paddy: { 50:'#f0fdf4',100:'#dcfce7',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d',950:'#0a2e18' },
        sidebar: '#1B4332', 'sidebar-hover': '#2D6A4F', 'sidebar-active': '#40916C', accent: '#D4A373'
      },
      fontFamily: { display: ['"DM Sans"','sans-serif'], body: ['"Inter"','sans-serif'] }
    }
  }, plugins: []
};
