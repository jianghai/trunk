$(function() {

    var Todo = Trunk.Model.extend({

        toggle: function() {
            this.save({
                done: !this.attr.done
            });
        },

        save: function(attr) {
            this.set(attr);
            todos.save();
        }
    });

    var Todos = Trunk.Models.extend({

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
                return item.attr
            })));
        },

        done: function() {
            return $.grep(this.list, function(n, i) {
                return n.attr.done;
            });
        },

        remaining: function() {
            return $.grep(this.list, function(n, i) {
                return !n.attr.done;
            });
        }
    });

    var todos = new Todos();



    var TodoView = Trunk.View.extend({

        tag: 'li',

        template: vjs($('#item-template').text()),

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

        init: function() {
            this.listen(this.model, 'change', this.render);
        },

        render: function() {
            this.el.toggleClass('done', this.model.attr.done);
            this.el.html(this.template(this.model.attr));
            this.edit = this.el.find('.edit');
            return this.el;
        }
    });



    var AppView = Trunk.View.extend({

        el: $('#todoapp'),

        template: vjs($('#stats-template').text()),
        
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
            this.listen(todos, 'add', this.render);
            this.listen(todos, 'reduce', this.render);
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

    new AppView();
});