/**
 * Created by zonebond on 16/4/7.
 */

    var mapping     = [],
        holders_exp = /\/(?!:http|https)*\:[A-Za-z0-9\._-]+/g;

    angular
        .module('FakeHttpBackend', [])
        .value('fakeMapping', {
            scheme: function (exp, cb) {
                exp = exp.replace('?', '\\?');
                var role_exp_cc;
                for (var regular in cb) {
                    var role_exp;
                    if (regular.trim()) {
                        var roles                         = regular.split(','),
                            role, holder, value, role_exp = exp;
                        while (roles.length) {
                            role   = roles.shift().split(':');
                            holder = role[0].trim().replace(/^@/, ':');
                            value  = role[1].trim() || null;

                            role_exp_cc = new RegExp(holder + '(?!\W\w)');

                            if (value === '*') {
                                role_exp = role_exp.replace(role_exp_cc, "[A-Za-z0-9\._-]+");
                            } else if (value === '+') {
                                role_exp = role_exp.replace(role_exp_cc, "[^\?]+");
                            }else if(value === null){
                                role_exp = role_exp.replace(role_exp_cc, "");
                            }else {
                                role_exp = role_exp.replace(role_exp_cc, value);
                            }
                        }

                        role_exp = role_exp.replace(holders_exp, '');
                        mapping.push({reg_exp: new RegExp(role_exp + '($)'), cb: cb[regular]});
                    }
                    else {
                        role_exp = exp.replace(holders_exp, '');
                        mapping.push({reg_exp: new RegExp(role_exp + '($)'), cb: cb[regular]});
                    }
                }
            },
            match : function (exp) {
                var i, len = mapping.length;
                for (i = 0; i < len; i++) {
                    if (mapping[i].reg_exp.test(exp)) {
                        return mapping[i].cb;
                    }
                }
                return null;
            }
        })
        .factory('$fakeBackend', ['$injector', '$q', '$log', 'fakeMapping', function ($injector, $q, $log, fakeMapping) {

            $log.info('FakeBackend Working right now!');
            var $http;
            return {
                filter: function (response) {
                    var config = response.config,
                        url    = config.url,
                        mapper = fakeMapping.match(url);

                    if (mapper) {
                        var deferred = $q.defer();

                        if (angular.isFunction(mapper)) {
                            mapper.call(this, response.config, deferred);
                        }
                        else {

                            if ($injector.has('$http') && !$http)
                                $http = $injector.get('$http');

                            $http.get(mapper).then(function (res) {
                                deferred.resolve(res);
                            }, function (err) {
                                deferred.resolve(err);
                            });
                        }

                        return deferred.promise;
                    }

                    return $q(response);
                }
            };
        }])
        .factory('fakeBackendInterceptor', ['$log', '$q', '$fakeBackend', function ($log, $q, $fakeBackend) {
            return {
                response     : function (response) {
                    if (response.status === 200 && /json$/.test(response.headers('Content-Type'))) {
                        if (response.data) {
                            $log.info('interceptor :: ' + response.config.url);
                        }
                    }
                    return response;
                },
                responseError: function (response) {
                    if (response.status === 404) {
                        return $fakeBackend.filter(response);
                    }
                    return response;
                }
            };
        }])
        .constant('fbInterceptor', 'fakeBackendInterceptor');

