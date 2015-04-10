require.config({
  paths: {
    'jquery': '../../lib/jquery.min',
    'vjs': '../../vjs/vjs',
    'trunk': '../../trunk/trunk',
    'trunk.progress': '../../trunk/plugins/fetch.progress',
    'jquery.extend': '../../jquery.extend/jquery.extend',

    'chart': '../../lib/chart.min',
    'echarts': '../../lib/echarts-all',
    'highcharts': '../../lib/highcharts',
    'd3': '../../lib/d3.min',
    'daterange': '../../daterange/daterange',

    'base': '../../trunk/components/base',
    'highcharts.chart': '../../trunk/components/highcharts.chart',
    'highcharts.pie': '../../trunk/components/highcharts.pie',
    'echarts.line': '../../trunk/components/echarts.line',
    'echarts.pie': '../../trunk/components/echarts.pie',
    'chart.line': '../../trunk/components/chart.line',
    'select': '../../trunk/components/select',
    'multiSelect': '../../trunk/components/multiSelect',
    'dropdown': '../../trunk/components/dropdown',
    'tab': '../../trunk/components/tab',
    'grid': '../../trunk/components/grid',
    'pagination': '../../trunk/components/pagination',
    'search': '../../trunk/components/search',
    'pin': '../../trunk/components/pin',
    'datepicker': '../../trunk/components/datepicker',
    'datepicker2': '../../trunk/components/datepicker2',
    'dialog': '../../trunk/components/dialog',
    'success': '../../trunk/components/success',
    'error': '../../trunk/components/error',
    'confirm': '../../trunk/components/confirm',
    'popover': '../../trunk/components/popover',
    'autocomplete': '../../trunk/components/autocomplete',
  },
  shim: {
    'jquery.extend': ['jquery'],
    daterange: ['jquery'],
    d3: {
      exports: 'd3'
    },
    echarts: {
      exports: 'echarts'
    }
  }
});