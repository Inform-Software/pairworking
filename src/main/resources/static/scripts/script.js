var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = String(today.getFullYear());
var hours = String(today.getHours()).padStart(2, '0');
var minutes = String(today.getMinutes()).padStart(2, '0');
var time = hours + ':' + minutes;
today = yyyy + '-' + mm + '-' + dd;


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
        teams: '',
    },
    watch: {
        search: 'handleSearch'
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
        refreshTeams();
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
            var categories = ["beginn", "ticket", "operator", "team", "description", "end", "mark"];
            if (this.search === '') {
                makeTasksVisible();
            } else {
                loopTasks: for (var i=0; i<this.tasks.length; i++) {
                    for (key in this.tasks[i]) {
                        if (key === "operators") {
                            for (var j=0; j<this.tasks[i].operators.length; j++) {
                                if (this.tasks[i].operators[j].token.toString().indexOf(this.search) !=-1) {
                                    this.tasks[i].visible = true;
                                    continue loopTasks;
                                }
                            }
                        } if (categories.includes(key)) {
                            if (this.tasks[i][key].toString().toLowerCase().indexOf(this.search.toLowerCase())!=-1) {
                                this.tasks[i].visible = true;
                                continue loopTasks;
                            }
                        }
                        this.tasks[i].visible = false;
                    }
                }
            }


        },
        openCreateTask: function () {
            input.intentIsUpdate = false;
            input.visible = 'block';
        },
        editMasterData: function (selection, index) {
            if (selection === 'user') {
                input.mUserName = this.users[index].name;
                input.mUserToken = this.users[index].token;
                input.id = this.users[index].id;
            } else if (selection === 'team') {
                input.mTeamName = this.teams[index].name;
                input.id = this.teams[index].id;
            }
            input.intentIsUpdate = true;
            input.selMasterData = selection;
        },
        openCreateMasterData: function(selection) {
            input.intentIsUpdate = false;
            input.selMasterData = selection;
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
                    var array = this.operator.split(',');
                    var present;
                    for (var a = 0; a < array.length; a++) {
                        var op = array[a].trim();
                        present = false;
                        if (op.includes('.') && op.length > 6) {
                            for (var u = 0; u < vm.users.length; u++) {
                                if (op.toLowerCase() === vm.users[u].name) {
                                    present = true;
                                }
                            }
                            if (present == false && !this.missingNames.includes(op)) {
                                this.missing.push({"name": op});
                                this.missingNames.push(op);
                            }
                        } else {
                            for (var t = 0; t < vm.users.length; t++) {
                                if (op === vm.users[t].token) {
                                    present = true;
                                    this.operator = this.operator.replace(op, vm.users[t].name);
                                }
                            }
                            if (present == false) {
                                this.unknownTokens.push(op);
                            }
                        }
                    }
                    if (this.unknownTokens.length === 0 && (this.missing.length === 0 || this.checkForTokens())) {
                        for (var i = 0; i < this.missing.length; i++) {
                            createUser(this.missing[i].name, this.missing[i].token);
                        }
                        createTask(this.ticket, this.description, this.begin, this.btime, this.operator, this.team);
                        this.resetData();
                        refreshUsers();
                        refreshTasks();
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
        checkMasterForm: function () {
            if (this.selMasterData === 'user') {
                if (this.mUserName && this.mUserToken) {
                    if (this.intentIsUpdate) {
                        updateUser(this.id);
                    } else {
                        createUser(this.mUserName, this.mUserToken);
                    }
                    this.resetData();
                }
            } else if (this.selMasterData === 'team') {
                if (this.mTeamName) {
                    if (this.intentIsUpdate) {
                        updateTeam(this.id);
                    } else {
                        createTeam(this.mTeamName);
                    }
                    this.resetData();
                }
            }
        }
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
            makeTasksVisible();
            vm.search = '';
        })
        .catch(error => console.error(error));
}

function makeTasksVisible () {
    for (var t = 0; t < vm.tasks.length; t++) {
        vm.tasks[t].visible = true;
    }
}

function refreshUsers() {
    axios
        .get('/api/users')
        .then(function (response) {
            vm.users = response.data;
            input.users = response.data;
        })
        .catch(error => console.error(error));
}

function refreshTeams() {
    axios
        .get('/api/teams')
        .then(function (response) {
            vm.teams = response.data;
            input.teams = response.data;
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

function createTeam(name) {
    axios
        .post("/api/teams", {
            name: name
        })
        .then(function (response) {
            console.log(response)
            refreshTeams();
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

function updateUser(id) {
    axios
        .put("/api/users/" + input.id, {
            name: input.mUserName,
            token: input.mUserToken
        })
        .then(function (response) {
            refreshUsers();
        })
}

function updateTeam(id) {
    axios
        .put("/api/teams/" + input.id, {
            name: input.mTeamName
        })
        .then(function (response) {
            refreshTeams();
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
        selMasterData: '',
        id: 0,
        visible: 'none',
        missing: [],
        missingNames: [],
        unknownTokens: [],
        teams: '',
        users: '',
        mUserName: '',
        mUserToken: '',
        mTeamName: '',
    }
}