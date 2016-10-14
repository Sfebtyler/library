angular.module('routes',['ngRoute'])
.config(['$routeProvider', function($routeProvider){
    $routeProvider

    .when('/books', {
    templateUrl: 'templates/pages/books/index.html'
    })
    .when('/books/:bookid', {
    templateUrl: 'templates/pages/books/detail.html'
    })
    .when('/login', {
    templateUrl: 'templates/pages/login.html'
    })
    .when('/', {
    redirectTo: '/login'
    })


}]);