(function() {
var app = angular.module('library', ['routes'])

app.service('varService', function() {

});

app.factory('authInterceptor', function($location, $q, $window) {
    store = this;
    store.token = $window.localStorage.getItem('Token');

    return {
    request: function(config) {
    config.headers = config.headers || {};

    if (store.token) {
        config.headers.Authorization = 'Token ' + store.token;
    }
    return config;
    }
    };
})

.config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
})



app.controller('BookController', function ($http, $window, $location, varService, $routeParams, $interval, $scope) {

    var store = this;
    store.varService = varService;
    store.$http = $http;
    store.varService.authorname = [];
    store.varService.username = '';
    store.varService.password = '';
    store.varService.login_successfull = false;
    store.varService.error = '';
    store.$interval = $interval;
    store.varService.current_user = '';
    store.varService.availbookslist = [];
    store.varService.searchVal = '';
    store.varService.found = [];
    store.varService.hide = false;
    store.varService.buttontext = 'See Full Book List'

    store.search = function () {
        var val = store.varService.searchVal.toLowerCase()
        var booklength = store.varService.bookslist.length;
        var authorlength = store.varService.authorslist.length;
        var booklist = store.varService.bookslist;
        var authorlist = store.varService.authorslist;
        store.varService.error = '';
        store.varService.found = [];
        if (val.length > 2) {
            for (i = 0; i < booklength; i++) {

                if (booklist[i].title.toLowerCase().match(val)) {
                    store.varService.found.push(booklist[i])
                }
                for (l = 0; l < authorlength; l++) {
                    if (authorlist[l].id == booklist[i].author && authorlist[l].author.toLowerCase().match(val)) {
                        store.varService.found.push(booklist[i])
                    }
                }
            }

            if (store.varService.found.length == 0) {
                store.varService.error = 'None Found';
            } else {
                store.varService.error = '';
            }

        }
    }

    store.showFullBooksList = function () {
        if (store.varService.hide == false) {
            store.varService.hide = true;
            store.varService.buttontext = 'Back'
        } else {
            store.varService.hide = false;
            store.varService.buttontext = 'See Full Book List'
        }
    }

    store.showIfIn = function (book) {
        var length = store.varService.bookslist.length
        var list = store.varService.bookslist;
        var In = "In"
        var Out = "Out"
        for (i = 0; i < length; i++) {
            if (book.id == list[i].id && list[i].check_in == true) {
                return In
            } else if (book.id == list[i].id && list[i].check_in == false) {
                return Out
            }

        }

    }

    store.getAuthorName = function (book) {

        var length = store.varService.authorslist.length
        for (i = 0; i < length; i++) {

            if (store.varService.authorslist[i].id == book.author[0]) {

                return store.varService.authorname[i] = store.varService.authorslist[i].author
            }

        }

    }

    store.checkOut = function (book, user) {
        store.$http.patch('http://127.0.0.1:8000/books/' + book.id + '/', {check_in: false, checked_out_by: user.username})
        .then(function(response) {
            $window.location.reload()
            store.rerouteToBookList()
        })

    }

    store.logout = function() {
        $window.localStorage.removeItem('Token')
        store.rerouteToLogin()

    }

    store.rerouteToBookList = function() {
        getAuthorsList()
        getBooksList()
        getAvailBooksList()
        store.varService.error = '';
        $location.path('books/')
    }

    store.rerouteToBookDetail = function (book) {

        store.$http.get('http://127.0.0.1:8000/books/' + book.id + '/').then(function(response) {
        store.varService.bookdetails = response.data
        })
        $location.path('books/' + book.id + '/')

    }

    store.rerouteToLogin = function() {
        $location.path('login/')
    }

    store.login = function () {
        store.$http.post('http://127.0.0.1:8000/api-token-auth/', {
            username: store.varService.username,
            password: store.varService.password
        })
        .then(function(response) {
        store.varService.login_successfull = true;
        $window.localStorage.setItem('Token', response.data.token)
        store.rerouteToBookList()
        store.getCurrentUser()
        })

        if (store.varService.login_successfull == false) {
            store.varService.error = 'Your Username or Password is incorrect'
            store.$interval(function() {
                store.varService.error = '';
                store.varService.login_successfull = false;
                }, 10000, [1])
        }
    }

    store.getCurrentUser = function () {
        store.$http.get('http://127.0.0.1:8000/users/current_user/')
        .then(function (response) {
            store.varService.current_user = response.data
        })
    }

    getAuthorsList = function () {
    store.$http.get('http://127.0.0.1:8000/authors/').then(function(response) {
        store.varService.authorslist = response.data.results

    })
    }

    getBooksList = function () {

        store.$http.get('http://127.0.0.1:8000/books/').then(function(response) {
            store.varService.bookslist = response.data.results

        })
    }

    getAvailBooksList = function () {

        store.$http.get('http://127.0.0.1:8000/books/available/').then(function(response) {
            store.varService.availbookslist = response.data.results

        })
    }

    store.allowAuthCredentials = function () {
        if ($window.localStorage.getItem('Token')) {
            return
        } else {
            return store.rerouteToLogin();
        }
    }


    getAuthorsList()
    getBooksList()
    getAvailBooksList()
    store.getCurrentUser()



})

})();