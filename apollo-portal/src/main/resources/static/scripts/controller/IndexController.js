index_module.controller('IndexController', ['$scope', '$window', '$translate', 'toastr', 'AppUtil', 'AppService',
    'UserService', 'FavoriteService','OrganizationService',
    IndexController]);

function IndexController($scope, $window, $translate, toastr, AppUtil, AppService, UserService, FavoriteService,OrganizationService) {

    $scope.userId = '';
    $scope.getUserOrganizations = getUserOrganizations;
    $scope.getUserFavorites = getUserFavorites;
    $scope.goToProjectPage = goToProjectPage;
    $scope.toggleOperationBtn = toggleOperationBtn;
    $scope.toTop = toTop;
    $scope.deleteFavorite = deleteFavorite;

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
        //加载当前登录用户名
        $scope.userId = result.userId;

        $scope.hasMoreCreatedApps = true;
        $scope.createdOrganizationPage = 0;
        $scope.createdOrganizations = [];
        $scope.hasMoreCreatedOrganizations = true;

        $scope.favoritesPage = 0;
        $scope.favorites = [];
        $scope.hasMoreFavorites = true;
        $scope.visitedApps = [];

        initCreateApplicationPermission();
        getUserOrganizations();
        getUserFavorites();
        initUserVisitedApps();
    });
    //根据用户名查询部门列表
    function getUserOrganizations() {
        OrganizationService.find_organization_by_owner($scope.userId, $scope.createdOrganizationPage)
            .then(function (result) {
                $scope.createdOrganizationPage += 1;
                // $scope.hasMoreCreatedOrganizations = result.length == size;
                //如果是管理员，返回结果没有部门，则通过直接查询当前系统中所有的部门
                if (!result || result.length == 0) {
                    OrganizationService.find_organizations().then(function (result) {
                        result.forEach(function (organization) {
                            $scope.createdOrganizations.push(organization);
                        });
                        return;
                    });
                }
                //普通用户就会返回所在部门列表
                result.forEach(function (organization) {
                    $scope.createdOrganizations.push(organization);
                });
            })
    }
    function getUserFavorites() {
        var size = 11;
        FavoriteService.findFavorites($scope.userId, '', $scope.favoritesPage, size)
            .then(function (result) {
                $scope.favoritesPage += 1;
                $scope.hasMoreFavorites = result.length == size;

                if ($scope.favoritesPage == 1) {
                    $("#app-list").removeClass("hidden");
                }
                if (!result || result.length == 0) {
                    return;
                }
                var appIds = [];
                result.forEach(function (favorite) {
                    appIds.push(favorite.appId);
                });
                AppService.find_apps(appIds.join(","))
                    .then(function (apps) {
                        //sort
                        var appIdMapApp = {};
                        apps.forEach(function (app) {
                            appIdMapApp[app.appId] = app;
                        });
                        result.forEach(function (favorite) {
                            var app = appIdMapApp[favorite.appId];
                            if (!app) {
                                return;
                            }
                            app.favoriteId = favorite.id;
                            $scope.favorites.push(app);
                        });

                    });
            })
    }

    function initUserVisitedApps() {
        var VISITED_APPS_STORAGE_KEY = "VisitedAppsV2";
        var visitedAppsObject = JSON.parse(localStorage.getItem(VISITED_APPS_STORAGE_KEY));
        if (!visitedAppsObject) {
            visitedAppsObject = {};
        }

        var userVisitedApps = visitedAppsObject[$scope.userId];
        if (userVisitedApps && userVisitedApps.length > 0) {
            AppService.find_apps(userVisitedApps.join(","))
                .then(function (apps) {
                    //sort
                    var appIdMapApp = {};
                    apps.forEach(function (app) {
                        appIdMapApp[app.appId] = app;
                    });

                    userVisitedApps.forEach(function (appId) {
                        var app = appIdMapApp[appId];
                        if (app) {
                            $scope.visitedApps.push(app);
                        }
                    });
                });
        }

    }
    function goToProjectPage(orgId) {
        $window.location.href = AppUtil.prefixPath() + "/project.html?#/orgid=" + orgId;
    }
    function toggleOperationBtn(app) {
        app.showOperationBtn = !app.showOperationBtn;
    }
    function toTop(favoriteId) {
        FavoriteService.toTop(favoriteId).then(function () {
            toastr.success($translate.instant('Index.Topped'));
            refreshFavorites();

        })
    }
    function deleteFavorite(favoriteId) {
        FavoriteService.deleteFavorite(favoriteId).then(function () {
            toastr.success($translate.instant('Index.CancelledFavorite'));
            refreshFavorites();
        })
    }
    function refreshFavorites() {
        $scope.favoritesPage = 0;
        $scope.favorites = [];
        $scope.hasMoreFavorites = true;

        getUserFavorites();
    }

}
