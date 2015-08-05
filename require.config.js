require.config({
  baseUrl: '/trunk',
  paths: {
    'jquery': 'lib/jquery.min',
    'highcharts': 'lib/highcharts',
    'Trunk': 'Trunk',
    'LineColumn': 'components/LineColumn',
    'DataList': 'components/DataList',
    'Pagination': 'components/Pagination',
    'DataTable': 'components/DataTable',
  },
  shim: {
    highcharts: {
      deps: ['jquery'],
      exports: 'Highcharts'
    }
  }
});