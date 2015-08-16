require.config({
  baseUrl: window.public,
  paths: {
    'jquery': 'lib/jquery.min',
    'highcharts': 'lib/highcharts',
    'Trunk': 'trunk/Trunk',
    'LineColumn': 'trunk/components/LineColumn',
    'Pie': 'trunk/components/Pie',
    'DataList': 'trunk/components/DataList',
    'Pagination': 'trunk/components/Pagination',
    'DataTable': 'trunk/components/DataTable',
    'Search': 'trunk/components/Search',
    'Dialog': 'trunk/components/Dialog',
  },
  shim: {
    highcharts: {
      deps: ['jquery'],
      exports: 'Highcharts'
    }
  }
});