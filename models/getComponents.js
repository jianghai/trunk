var fs = require('fs')
var format = require('dataformat')

module.exports = function() {
  var dir = __dirname + '/../public/trunk/components/'
  var files = fs.readdirSync(dir)
  var components = []
  files.forEach(function(file) {
    var status = fs.statSync(dir + file)
    status.file = file
    file = file.split('.')
    status.filename = file[0].charAt(0).toLowerCase() + file[0].slice(1)
    status.fileFormat = file[1]
    if (!fs.existsSync(__dirname + '/../views/components/components/' + status.filename + '.jade')) {
      status.disabled = true
    }
    components.push(status)
  })
  components.forEach(function(component) {
    component.size = format.size(component.size)
    component.mtime = format.date(component.mtime, 'yyyy-mm-dd hh:ii:ss')
    component.atime = format.date(component.atime, 'yyyy-mm-dd hh:ii:ss')
  })
  return components
}