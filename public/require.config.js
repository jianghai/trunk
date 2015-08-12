require.config({
  baseUrl: '/trunk',
  paths: {
    'jquery': '/lib/jquery.min',
    'highcharts': '/lib/highcharts',
    'Trunk': 'Trunk',
    'LineColumn': 'components/LineColumn',
    'Pie': 'components/Pie',
    'DataList': 'components/DataList',
    'Pagination': 'components/Pagination',
    'DataTable': 'components/DataTable',
    'Search': 'components/Search',
    'Dialog': 'components/Dialog',
  },
  shim: {
    highcharts: {
      deps: ['jquery'],
      exports: 'Highcharts'
    }
  }
});