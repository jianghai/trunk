require.config({
  baseUrl: '/trunk',
  paths: {
    'jquery': 'lib/jquery.min',
    'highcharts': 'lib/highcharts',
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