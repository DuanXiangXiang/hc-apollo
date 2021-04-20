project_module.controller('ProjectController', ['$scope', '$window','$location', '$translate', 'toastr', 'AppUtil', 'AppService',
    'UserService', 'FavoriteService','OrganizationService',
    ProjectController]);

function ProjectController($scope, $window, $location,$translate, toastr, AppUtil, AppService, UserService, FavoriteService,OrganizationService) {

    $scope.userId = '';
    //从url中获取部门id
    var urlParams = AppUtil.parseParams($location.$$url);
    $scope.orgId = urlParams.orgid;

    $scope.getUserCreatedApps = getUserCreatedApps;
    $scope.goToCreateAppPage = goToCreateAppPage;

    $scope.goToAppHomePage = goToAppHomePage;


    function initCreateApplicationPermission() {
        AppService.has_create_application_role($scope.userId).then(
            function (value) {
                $scope.hasCreateApplicationPermission = value.hasCreateApplicationPermission;
            },
            function (reason) {
                toastr.warning(AppUtil.errorMsg(reason), $translate.instant('Index.GetCreateAppRoleFailed'));
            }
        )
    }

    UserService.load_user().then(function (result) {
        //获取当前用户名
        $scope.userId = result.userId;

        $scope.createdAppPage = 0;
        $scope.createdApps = [];
        $scope.hasMoreCreatedApps = true;

        initCreateApplicationPermission();
        getUserCreatedApps();

    });

    function getUserCreatedApps() {
        var size = 10;
        AppService.find_app_by_owner($scope.userId,$scope.orgId, $scope.createdAppPage, size)
            .then(function (result) {
                $scope.createdAppPage += 1;
                $scope.hasMoreCreatedApps = result.length == size;

                if ($scope.createdAppPage == 1) {
                    $("#app-list").removeClass("hidden");
                }

                if (!result || result.length == 0) {
                    return;
                }
                result.forEach(function (app) {
                    $scope.createdApps.push(app);
                });

            })
    }

    function goToCreateAppPage(orgId) {
        $window.location.href = AppUtil.prefixPath() + "/app.html?#/orgid="+orgId;
    }

    function goToAppHomePage(appId) {
        $window.location.href = AppUtil.prefixPath() + "/config.html?#/appid=" + appId;
    }

}
