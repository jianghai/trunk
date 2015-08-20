require([
  'Tree'
], function(Tree) {
  
  var tree = new Tree({
    model: {
      url: window.public + 'json/components/tree.json'
    }
  })
  tree.model.fetch()
})