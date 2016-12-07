'use strict';

app.controller('DridTestCtrl', function($scope,$modal,$log,$timeout) {
    $scope.colArr = [
        {
            field: 'name',
            displayName: '名字',
            width: '10%',
            enableColumnMenu: false,// 是否显示列头部菜单按钮
            enableHiding: false,
            suppressRemoveSort: true,
            enableCellEdit: false // 是否可编辑
        },
        {
            field: "age",
            displayName: '年龄'
        },
        {
            field: "birthday",
            displayName: '生日'
        },
        {
            field: "salary",
            displayName: '薪水'
        }
    ];

    $scope.dataArr = [{id:'1', name: "Moroni", age: 50, birthday: "Oct 28, 1970", salary: "60,000" },
        {id:'2', name: "Tiancum", age: 43, birthday: "Feb 12, 1985", salary: "70,000" },
        {id:'3', name: "Jacob", age: 27, birthday: "Aug 23, 1983", salary: "50,000" },
        { id:'4',name: "Nephi", age: 29, birthday: "May 31, 2010", salary: "40,000" },
        {id:'5', name: "Enos", age: 34, birthday: "Aug 3, 2008", salary: "30,000" },
        {id:'6', name: "Moroni", age: 50, birthday: "Oct 28, 1970", salary: "60,000" },
        { id:'7',name: "Tiancum", age: 43, birthday: "Feb 12, 1985", salary: "70,000" },
        {id:'8', name: "Jacob", age: 27, birthday: "Aug 23, 1983", salary: "40,000" },
        { id:'9',name: "Nephi", age: 29, birthday: "May 31, 2010", salary: "50,000" },
        { id:'10',name: "Enos", age: 34, birthday: "Aug 3, 2008", salary: "30,000" },
        { id:'11',name: "Moroni", age: 50, birthday: "Oct 28, 1970", salary: "60,000" },
        { id:'12',name: "Tiancum", age: 43, birthday: "Feb 12, 1985", salary: "70,000" },
        {id:'13', name: "Jacob", age: 27, birthday: "Aug 23, 1983", salary: "40,000" },
        { id:'14',name: "Nephi", age: 29, birthday: "May 31, 2010", salary: "50,000" },
        {id:'15', name: "Enos", age: 34, birthday: "Aug 3, 2008", salary: "30,000" }];

    $scope.params = {grid: {}, fun: {}};
    $scope.addData = function () {
        $scope.params.grid = {state: "enabled"};
        $scope.params.fun = {name: "添加"};
        var modalInstance = $modal.open({
            backdrop: false,
            templateUrl: 'grid_test_add',
            controller: 'auTCtrl',
            resolve: {
                params: function () {
                    return $scope.params;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $timeout(function(){
                $scope.$apply(function(){
                    $scope.dataArr.push(selectedItem);
                });
            },200);
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    //执行删除
    $scope.delData = function (size) {
        var modalInstance = $modal.open({
            backdrop: false,
            templateUrl: 'grid_test_delete',
            controller: 'delTCtrl',
            size: size,
            resolve: {
                testRow: function () {
                    return $scope.rowItem;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            removeByValue($scope.dataArr, selectedItem);
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.updateData = function (size) {
        if (!$scope.testRow) {
            window.wxc.xcConfirm("请选择要修改的数据！", window.wxc.xcConfirm.typeEnum.error);
            return;
        }
        $scope.params.fun = {name:"修改"};
        $scope.params.grid = $scope.testRow;
        var modalInstance = $modal.open({
            backdrop: false,
            templateUrl: 'resourcePool_update.html',
            controller: 'rpAddCtrl',
            size: size,
            resolve : {
                params: function () {
                    return $scope.params;
                }
            }
        });
    };

    function removeByValue(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]['id'] === val['id']) {
                arr.splice(i, 1);
                $scope.rowItem = null;
                break;
            }
        }
    }

    $scope.callFn = function(item){
        $scope.rowItem = item;
    }
});

//新增修改
app.controller('auTCtrl', ['$scope', '$modalInstance', '$timeout', 'params', function ($scope, $modalInstance, $timeout, params) {
    $scope.fun = params.fun;
    $scope.grid = params.grid;
    $scope.ok = function (isValid) {
        if (!isValid) return;
        $modalInstance.close($scope.grid);
        $scope.addResult($scope.fun.name + "成功！", true);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.addResult = function (msg, flag) {
        $scope.cancel();
        $timeout(function () {
            if (flag) {
                window.wxc.xcConfirm(msg, window.wxc.xcConfirm.typeEnum.success);
            } else {
                window.wxc.xcConfirm(msg, window.wxc.xcConfirm.typeEnum.error);
            }
        }, 1000);
    }
}]);

//删除
app.controller('delTCtrl', ['$scope', '$modalInstance', 'testRow', function ($scope, $modalInstance, testRow) {
    $scope.ok = function () {
        if (!testRow) {
            $("#msgInfo").text("未选择删除的资源！");
            return;
        }
        $modalInstance.close(testRow);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);