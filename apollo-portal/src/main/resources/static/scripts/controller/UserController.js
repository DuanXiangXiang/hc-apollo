user_module.controller('UserController',
    ['$scope', '$window', '$translate', 'toastr', 'AppUtil', 'UserService', 'PermissionService','OrganizationService',
        UserController]);

function UserController($scope, $window, $translate, toastr, AppUtil, UserService, PermissionService,OrganizationService) {

    $scope.user = {"organizations":[]};
    $scope.user.password = '123456';
    // $scope.UserMange.Email = '';

    //保存所有的部门列表
    $scope.org = [];

    initPermission();
    initOrganization();

    function initPermission() {
        PermissionService.has_root_permission()
        .then(function (result) {
            $scope.isRootUser = result.hasPermission;
        })
    }

    //查询所有的部门
    function initOrganization(){
        OrganizationService.find_organizations().then(function (result) {
            result.forEach(function (item) {
                var org = {};
                org.id = item.orgId;
                org.text = item.orgName + '(' + item.orgId + ')';
                org.name = item.orgName;
                //给所有的部门加上一个selected(选中)字段
                org.selected = false;
                $scope.org.push(org);
            });
        },function (result) {
            toastr.error(AppUtil.errorMsg(result), "load organizations error");
        });
    }


    $scope.createOrUpdateUser = function () {
        //遍历所有的部门，将selected为true的部门加入到$scope.user.organizations中
        $scope.org.forEach(function (o){
            if (o.selected){
                var organization = {};
                organization.orgId = o.id;
                organization.orgName = o.name;
                $scope.user.organizations.push(organization);
                console.log($scope.user.organizations)
            }
        });
        UserService.createOrUpdateUser($scope.user).then(function (result) {
            toastr.success($translate.instant('UserMange.Created'));
        }, function (result) {
            AppUtil.showErrorMsg(result, $translate.instant('UserMange.CreateFailed'));
        });
        $scope.org.forEach(function (organization){
            organization.selected = false;
        });
        $scope.user.email = '';
    }

    //根据输入的用户名去后台查寻用户是否存在，如果存在继续查询他所有的部门，回显到页面上。
    $scope.getUserByName=function (){
        //判断用户是否存在
        UserService.find_user_by_username($scope.user.username).then(function (result){
            if (result.id != -1){  //用户存在
                //查询用户所有的部门
                OrganizationService.find_organization_by_owner($scope.user.username).then(function (result){
                    //将所有的复选框设为false
                    $scope.org.forEach(function (organization){
                        organization.selected = false;
                    })
                    //遍历用户拥有的部门
                    result.forEach(function (item) {
                        //遍历所有的部门
                        $scope.org.forEach(function (organization){
                            if (item.orgId === organization.id){   //判断用户是否属于该部门，是就把这个复选框选中，达到用户数据回显
                                organization.selected = true;
                            }
                        })
                    });
                });
                //回显邮箱，密码默认显示为123456
                $scope.user.email = result.email;
            }
        });
    }
}
