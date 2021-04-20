appService.service('UserService', ['$resource', '$q', 'AppUtil', function ($resource, $q, AppUtil) {
    var user_resource = $resource('', {}, {
        load_user: {
            method: 'GET',
            url: AppUtil.prefixPath() + '/user'
        },
        find_users: {
            method: 'GET',
            url: AppUtil.prefixPath() + '/users'
        },
        create_or_update_user: {
            method: 'POST',
            url: AppUtil.prefixPath() + '/users'
        },
        find_user_by_username: {
            method: 'GET',
            url: AppUtil.prefixPath() + '/users/find_user/by_username'
        }
    });
    return {
        load_user: function () {
            var finished = false;
            var d = $q.defer();
            user_resource.load_user({},
                                    function (result) {
                                        finished = true;
                                        d.resolve(result);
                                    },
                                    function (result) {
                                        finished = true;
                                        d.reject(result);
                                    });
            return d.promise;
        },
        find_users: function (keyword) {
            var d = $q.defer();
            user_resource.find_users({
                                         keyword: keyword
                                     },
                                     function (result) {
                                         d.resolve(result);
                                     },
                                     function (result) {
                                         d.reject(result);
                                     });
            return d.promise;
        },
        createOrUpdateUser: function (user) {
            var d = $q.defer();
            user_resource.create_or_update_user({}, user,
                                     function (result) {
                                         d.resolve(result);
                                     },
                                     function (result) {
                                         d.reject(result);
                                     });
            return d.promise;   
        },
        //模仿上面的模板
        find_user_by_username: function (username){
            var d = $q.defer();
            user_resource.find_user_by_username({
                    username: username
                },
                function (result) {
                    d.resolve(result);
                },
                function (result) {
                    d.reject(result);
                });
            return d.promise;
        }
    }
}]);
