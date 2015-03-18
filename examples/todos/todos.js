$(function() {

  var Todo = Trunk.Model.extend({

    toggle: function() {
      this.save({
        done: !this.data.done
      });
    },

    save: function(data) {
      this.set(data);
      todos.save();
    }
  });

  var todos = new Trunk.Models({

    model: Todo,

    fetch: function() {
      var todos = localStorage.getItem('todos');
      var _this = this;
      $.each(JSON.parse(todos) || [], function() {
        _this.add({
          title: this.title,
          done: this.done
        });
      });
    },

    save: function() {
      localStorage.setItem('todos', JSON.stringify($.map(this.list, function(item) {
        return item.data
      })));
    },

    done: function() {
      return $.grep(this.list, function(n, i) {
        return n.data.done;
      });
    },

    remaining: function() {
      return $.grep(this.list, function(n, i) {
        return !n.data.done;
      });
    }
  });



  var TodoView = Trunk.View.extend({

    tag: 'li',

    template: '#item-template',

    events: {
      'click .toggle': 'toggleDone',
      'click .destroy': 'destroy',
      'dblclick .view': 'edit',
      'blur .edit': 'close',
      'keypress .edit': 'onEnter',
    },

    toggleDone: function() {
      this.model.toggle();
    },

    destroy: function() {
      this.model.remove();
      todos.save();
    },

    edit: function() {
      this.el.addClass('editing');
      this.edit.focus();
    },

    close: function() {
      var value = this.edit.val();
      if (value) {
        this.model.save({
          title: value
        });
        this.el.removeClass('editing');
      } else {
        this.destroy();
      }
    },

    onEnter: function(e) {
      if (e.keyCode === 13) {
        this.close();
      }
    },

    afterRender: function() {
      this.edit = this.$('.edit');
      this.el.toggleClass('done', this.model.data.done);
    },

    init: function() {
      this.listen(this.model, 'change', this.render);
    }
  });



  var app = new Trunk.View({

    el: $('#todoapp'),

    template: vjs($('#stats-template').html()),

    events: {
      'keypress #new-todo': 'onEnter',
      'click #toggle-all': 'toggleAll',
      'click #clear-completed': 'clearAllCompleted'
    },

    init: function() {
      this.todoList = $('#todo-list');
      this.main = $('#main');
      this.toggle = $('#toggle-all');
      this.footer = this.el.find('footer');
      this.listen(todos, 'add', this.addOne);
      this.listen(todos, 'change', this.render);
      todos.fetch();
    },

    onEnter: function(e) {
      if (e.keyCode !== 13 || !e.target.value) return;
      todos.add({
        title: e.target.value,
        done: false
      });
      todos.save();
      e.target.value = '';
    },

    addOne: function(todo) {
      var view = new TodoView({
        model: todo
      });
      this.todoList.append(view.render());
    },

    toggleAll: function() {
      var done = this.toggle[0].checked;
      todos.each(function(todo) {
        todo.set({
          done: done
        });
      });
      todos.save();
    },

    clearAllCompleted: function() {
      $.each(todos.done(), function() {
        this.remove();
      });
      todos.save();
    },

    render: function() {
      var done = todos.done().length;
      var remaining = todos.remaining().length;
      if (todos.list.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.template({
          done: done,
          remaining: remaining
        }));
        this.toggle[0].checked = !remaining;
      } else {
        this.main.hide();
        this.footer.hide();
      }
    }
  });
});