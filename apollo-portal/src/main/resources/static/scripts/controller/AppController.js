app_module.controller('CreateAppController',
    ['$scope', '$window', '$location','$translate', 'toastr', 'AppService', 'AppUtil', 'OrganizationService', 'SystemRoleService', 'UserService','PermissionService',
        createAppController]);

function createAppController($scope, $window,$location, $translate, toastr, AppService, AppUtil, OrganizationService, SystemRoleService, UserService,PermissionService) {
    //从URL中获取部门id
    var urlParams = AppUtil.parseParams($location.$$url);
    $scope.orgId = urlParams.orgid;

    $scope.app = {};
    $scope.submitBtnDisabled = false;
    PermissionService.has_root_permission().then(function (result) {
        $scope.hasRootPermission = result.hasPermission;
    })
    $scope.create = create;

    init();

    function init() {
        initOrganization();
        initSystemRole();
    }

    function initOrganization() {
        OrganizationService.find_organizations().then(function (result) {
            result.forEach(function (item) {
                if ($scope.orgId == item.orgId){
                    $scope.app.orgName = item.orgName;
                }
            });
        });
    }

    function initSystemRole() {
        SystemRoleService.has_open_manage_app_master_role_limit().then(
            function (value) {
                $scope.isOpenManageAppMasterRoleLimit = value.isManageAppMasterPermissionEnabled;
                UserService.load_user().then(
                    function (value1) {
                        $scope.currentUser = value1;
                    },
                    function (reason) {
                        toastr.error(AppUtil.errorMsg(reason), "load current user info failed");
                    })
            },
            function (reason) {
                toastr.error(AppUtil.errorMsg(reason), "init system role of manageAppMaster failed");
            }
        );

    }

    function create() {
        $scope.submitBtnDisabled = true;

        $scope.app.orgId = $scope.orgId;

        // owner
        var owner = $('.ownerSelector').select2('data')[0];
        if ($scope.isOpenManageAppMasterRoleLimit) {
            owner = { id: $scope.currentUser.userId };
        }
        if (!owner) {
            toastr.warning($translate.instant('Common.PleaseChooseOwner'));
            $scope.submitBtnDisabled = false;
            return;
        }
        $scope.app.ownerName = owner.id;

        //admins
        $scope.app.admins = [];
        var admins = $(".adminSelector").select2('data');
        if ($scope.isOpenManageAppMasterRoleLimit) {
            admins = [{ id: $scope.currentUser.userId }];
        }
        if (admins) {
            admins.forEach(function (admin) {
                $scope.app.admins.push(admin.id);
            })
        }

        AppService.create($scope.app).then(function (result) {
            toastr.success($translate.instant('Common.Created'));
            setInterval(function () {
                $scope.submitBtnDisabled = false;
                $window.location.href = AppUtil.prefixPath() + '/config.html?#appid=' + result.appId;
            }, 1000);
        }, function (result) {
            $scope.submitBtnDisabled = false;
            toastr.error(AppUtil.errorMsg(result), $translate.instant('Common.CreateFailed'));
        });
    }


    $(".J_ownerSelectorPanel").on("select2:select", ".ownerSelector", selectEventHandler);
    var $adminSelectorPanel = $(".J_adminSelectorPanel");
    $adminSelectorPanel.on("select2:select", ".adminSelector", selectEventHandler);
    $adminSelectorPanel.on("select2:unselect", ".adminSelector", selectEventHandler);

    function selectEventHandler() {
        $('.J_owner').remove();

        var owner = $('.ownerSelector').select2('data')[0];

        if (owner) {
            $(".adminSelector").parent().find(".select2-selection__rendered").prepend(
                '<li class="select2-selection__choice J_owner">'
                + _.escape(owner.text) + '</li>')
        }
    }
}
