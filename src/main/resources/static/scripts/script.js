var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = String(today.getFullYear());
var hours = String(today.getHours()).padStart(2, '0');
var minutes = String(today.getMinutes()).padStart(2, '0');
var time = hours + ':' + minutes;
today = yyyy + '-' + mm + '-' + dd;


var login = new Vue({
    el: '#login',
    data: {
        users: '',
        name: '',
        team: '',
        selected: '',
    },
    mounted() {
        refreshUsers();
    },
    methods: {
        login: function (e) {
            if (this.name && this.team) {
                this.name = this.name.toLowerCase();
                var present = false;
                for (u = 0; u < this.users.length; u++) {
                    console.log(this.users[u].name, this.users[u].team, this.users[0].id);
                    if (this.name === this.users[u].name && this.team === this.users[u].team) {
                        this.selected = this.users[u];
                        present = true;
                    }
                }
                if (present == false) {
                    createUser(this.name, this.team);
                    console.log(this.users[0].name, this.users[0].team);
                }
            }
            e.preventDefault();
        }
    }
})

var vm = new Vue({
    el: '#table',
    data: {
        tasks: '',
        recentTasks: '',
        users: '',
        colors: ['#00FF7F', '#3BCA6D', '#77945C', '#B25F4A', '#ED2938', '#ED2938'],
        category: 'begin',
        order: 'desc',
        orderDesc: true,
        thSelected: {},
        search: '',
    },
    mounted() {
        this.thSelected = {
            "begin": true,
            "ticket": false,
            "operator": false,
            "team": false,
            "description": false,
            "end": false,
            "mark": false,
        }
        refreshTasks(this.category, this.order);
        refreshUsers();
    },
    methods: {
        editTask: function (index) {
            input.visible = 'block';
            input.ticket = this.tasks[index].ticket;
            input.description = this.tasks[index].description;
            input.begin = this.tasks[index].begin.slice(0, this.tasks[index].begin.indexOf(','));
            input.btime = this.tasks[index].begin.slice(this.tasks[index].begin.indexOf(',') + 2,);
            input.mark = this.tasks[index].mark;
            input.operator = this.tasks[index].operator;
            input.team = this.tasks[index].team;
            if (this.tasks[index].end != 'offen') {
                input.end = this.tasks[index].end.slice(0, this.tasks[index].end.indexOf(','));
                input.etime = this.tasks[index].end.slice(this.tasks[index].end.indexOf(',') + 2,);
            }
            input.intentIsUpdate = true;
            input.id = this.tasks[index].id;
            window.location.href = "/web/edit.html#inputform";
        },
        formatOperator: function (index) {
            var result = '';
            try {
                for (var a = 0; a < this.tasks[index].operators.length; a++) {
                    var token = this.tasks[index].operators[a].token;
                    if (a == (this.tasks[index].operators.length - 1)) {
                        result += token;
                    } else {
                        result += (token + '/');
                    }
                }
                return result;

            } catch (e) {
                return null;
            }
        },
        toggleOrder: function (th) {
            for (var key in this.thSelected) {
                if (th === key) {
                    this.thSelected[key] = true;
                    this.category = key;
                } else {
                    this.thSelected[key] = false;
                }
            }
            this.orderDesc = !this.orderDesc;
            if (this.orderDesc) {
                this.order = "desc";
            } else {
                this.order = "asc";
            }
            refreshTasks(this.category, this.order);
        },
        handleSearch: function () {
            var term = this.search.replace(/[-_~]/g, '').toLowerCase();
            console.log(term);
            for (var t = 0; t < this.tasks.length; t++) {
                if (term == t.ticket.replace(/[-_~]/g, '').toLowerCase()) {
                    this.category = 'ticket';
                    this.order = 'asc';
                    window.location.href = "/web/edit.html#" + t.id;
                    console.log("/web/edit.html#" + t.id);
                    return;
                }
            }
        },
        openCreateTask: function () {
            input.intentIsUpdate = false;
            input.visible = 'block';
        }
    }
});

var input = new Vue({
    el: '#inputform',
    data: function () {
        return inputInit();
    },
    methods: {
        checkForm: function (e) {
            if (this.intentIsUpdate) {
                if (this.ticket && this.description && this.begin && this.end && this.mark && this.operator && this.team) {
                    updateTask(this.id);
                    this.resetData();
                    window.location.href = "/web/edit.html";
                }
            } else {
                if (this.ticket && this.description && this.begin && this.operator && this.team) {
                    var array = this.operator.toLowerCase().split(',');
                    var absent = [];
                    var present;
                    for (var a = 0; a < array.length; a++) {
                        var op = array[a].trim();
                        present = false;
                        for (var u = 0; u < vm.users.length; u++) {
                            if (op === vm.users[u].name) {
                                present = true;
                            }
                        }
                        if (present == false) {
                            absent.push(op);
                        }
                    }
                    if (this.missing.length === 0) {
                        for (var n = 0; n < absent.length; n++) {
                            this.missing.push({"name": absent[n]});
                        }
                        console.log(this.missing);
                    }
                    if (absent.length === 0 || this.checkForTokens()) {
                        console.log(this.checkForTokens());
                        for (var i = 0; i < this.missing.length; i++) {
                            createUser(this.missing[i].name, this.missing[i].token);
                        }
                        createTask(this.ticket, this.description, this.begin, this.btime, this.operator, this.team);
                        this.resetData();
                        window.location.href = "/web/edit.html";
                    }
                }
            }
            //this.resetData();
            //window.location.href = "/web/edit.html";
            e.preventDefault();
        },
        resetData: function () {
            Object.assign(this.$data, inputInit());
        },
        close: function () {
            this.visible = 'none';
            this.resetData();
        },
        checkForTokens: function () {
            try {
                var noToken = [];
                console.log("Token: '" + this.missing[0].token + "'");
                for (var i = 0; i < this.missing.length; i++) {
                    if (!this.missing[i].token) {
                        noToken.push('x');
                    }
                }
                if (noToken.length === 0) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        },
        confirmDeleteTask: function (id) {
            confirmDeleteTask(id)
        },
    },
    mounted() {
        refreshUsers();
    }
})

function refreshTasks(category, order) {
    axios
        .get('/api/order/tasks/' + category + '/' + order)
        .then(function (response) {
            vm.tasks = response.data;
            vm.recentTasks = vm.tasks.slice(0, 5);
        })
        .catch(error => console.error(error));
}

function refreshUsers() {
    axios
        .get('/api/users')
        .then(function (response) {
            vm.users = response.data;
            login.users = response.data;
        })
        .catch(error => console.error(error));
}

function createTask(ticket, description, begin, btime, operator, team) {
    axios
        .post("/api/tasks", {
            ticket: ticket,
            description: description,
            begin: (begin + ', ' + btime),
            operator: operator.toLowerCase(),
            team: team,
        })
        .then(function (response) {
            refreshTasks(vm.category, vm.order);
        })
}

function createUser(name, token) {
    axios
        .post("/api/users", {
            name: name,
            token: token
        })
        .then(function (response) {
            console.log(response)
            refreshUsers();
        })
}

function deleteTask(id) {
    axios
        .delete("/api/tasks/" + id)
        .then(function (response) {
            console.log(response);
            refreshTasks(vm.category, vm.order);
        });
}

function confirmDeleteTask(id) {
    var result = confirm("Möchtest Du diesen Supportfall (ID:" + id + ") wirklich löschen?");
    if (result === true) {
        input.resetData();
        deleteTask(id);
    }
}

function updateTask(id) {
    axios
        .put("/api/tasks/" + input.id, {
            ticket: input.ticket,
            description: input.description,
            begin: input.begin + ', ' + input.btime,
            end: input.end + ', ' + input.etime,
            mark: input.mark,
            operator: input.operator.toLowerCase(),
            team: input.team
        })
        .then(function (response) {
            refreshTasks(vm.category, vm.order);
        })
}

function inputInit() {
    return {
        ticket: '',
        description: '',
        begin: today,
        btime: time,
        end: today,
        etime: time,
        mark: 0,
        operator: '',
        team: '',
        intentIsUpdate: false,
        id: 0,
        visible: 'none',
        missing: [],
    }
}