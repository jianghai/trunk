require.config({
  baseUrl: 'http://192.168.174.133:3000/trunk',
  paths: {
    'jquery': 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min',
    'highcharts': 'https://cdnjs.cloudflare.com/ajax/libs/highcharts/4.1.7/highcharts',
    'trunk': 'trunk',
    'LineColumn': 'components/LineColumn'
  },
  shim: {
    highcharts: {
      deps: ['jquery'],
      exports: 'Highcharts'
    }
  }
});