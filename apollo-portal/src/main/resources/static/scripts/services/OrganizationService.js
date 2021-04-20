appService.service("OrganizationService", ['$resource', '$q', 'AppUtil', function ($resource, $q, AppUtil) {
    var organization_source = $resource("", {}, {
        //查询配置中所有部门
        find_organizations: {
            method: 'GET',
            isArray: true,
            url: AppUtil.prefixPath() + '/organizations'
        },
        //通过用户名查询部门列表
        find_organization_by_owner: {
            method: 'GET',
            isArray: true,
            url: AppUtil.prefixPath() + '/organizations/find-organizations/by-username'
        }
    });

    return {
        find_organizations: function () {
            var d = $q.defer();
            organization_source.find_organizations({}, function (result) {
                d.resolve(result);
            }, function (result) {
                d.reject(result);
            });
            return d.promise;
        },

        find_organization_by_owner: function (username){
            var d = $q.defer();
            organization_source.find_organization_by_owner({
                username:username
            }, function (result) {
                d.resolve(result);
            }, function (result) {
                d.reject(result);
            });
            return d.promise;
        }
    }

}]);
