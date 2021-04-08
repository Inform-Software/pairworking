var login = new Vue({
    el: '#login',
    data: {
        users: '',
        name: '',
        token: '',
        selected: '',
    },
    mounted() {
        refreshUsers();
    },
    methods:{
        login: function (e) {
            if (this.name && this.token) {
                this.name = this.name.toLowerCase();
                var present = false;
                for (var u = 0; u < this.users.length; u++) {
                    if (this.name === this.users[u].name && this.token === this.users[u].token) {
                        this.selected = this.users[u];
                        setCookie("name", this.name);
                        present = true;
                    }
                }
                if (present == false) {
                    var r = confirm("Der Benutzer ist noch nicht registriert. Neuen Benutzer erstellen?");
                    if (r) {
                        createUser(this.name, this.token);
                        setCookie("name", this.name);
                        refreshUsers();
                    }
                }
            }
            e.preventDefault();
        },
        checkToken: function (e) {
            for (var u = 0; u < this.users.length; u++) {
                if (this.name === this.users[u].name) {
                    this.token = this.users[u].token;
                }
            }
        }
    }
})

function refreshUsers () {
    axios
        .get('/api/users')
        .then(function (response) {
            login.users = response.data;
        })
        .catch(error => console.error(error));
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