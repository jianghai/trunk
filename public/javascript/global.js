(function() {
  // var wrapper = document.getElementById('wrapper')
  // var wrapperClass = wrapper.className
  // var apiList = document.getElementById('apiList')
  // var lastActive
  // apiList.addEventListener('click', function(e) {
  //   e.target.className = 'active'
  //   lastActive && lastActive.removeAttribute('class')
  //   lastActive = e.target
  // })
  var doc = document.body
  var fixed = false
  window.addEventListener('scroll', function(e) {
    var scrollTop = doc.scrollTop
    if (scrollTop > 300 && !fixed) {
      doc.className = doc.className.trim() + ' fixed'
      fixed = true
    } 
    if (scrollTop < 300 && fixed) {
      doc.className = doc.className.replace(/\bfixed\b/, '')
      fixed = false
    }
  })
  document.getElementById('toTop').addEventListener('click', function() {
    doc.scrollTop = 0
  })
})()