angular.module('SharedServices', []).config(function($httpProvider) {
	$httpProvider.responseInterceptors.push('myHttpInterceptor');
	// $httpProvider.defaults.transformRequest.push(spinnerFunction);
})

// register the interceptor as a service, intercepts ALL angular ajax http calls
.factory('myHttpInterceptor', function($q, $rootScope) {
	return function(promise) {
		return promise.then(function(response) {

			// hide the spinner
			$rootScope.$$childTail.loading = false;
			return response;

		}, function(response) {
			// hide the spinner on error too
			$rootScope.$$childTail.loading = false;
			return $q.reject(response);
		});
	};
});

var App = angular.module('App', [ 'SharedServices' ]);

App
		.controller(
				'JMXController',
				[
						'$scope',
						'$http',
						'$timeout',
						function($scope, $http, $timeout) {

							$scope.serverUrl = 'http://localhost:8778';

							$scope.list = function(serverUrl) {
								console.log(serverUrl);

								$http.get(serverUrl + '/jolokia/list').then(
										function(res, status) {
											$scope.jsonData = res.data;
											$scope.calculateMBeans();
										}, $scope.displayError);
							};

							$scope.mbeans = new Array();

							$scope.calculateMBeans = function() {
								var json = $scope.jsonData.value;
								for (variable in json) {
									for (mBeanKey in json[variable]) {
										// alert(json[variable][mBeanKey]);
										var mBean = json[variable][mBeanKey];
										mBean.name = variable + ":" + mBeanKey;
										$scope.mbeans
												.push(json[variable][mBeanKey]);
									}
								}

							};

							$scope.calculateAllAttributesMBean = function(
									serverUrl, mBean) {
								$scope
										.readAllAttributesMbean(
												serverUrl,
												mBean,
												function(response) {
													for (attribute in response.data.value) {
														mBean.attr[attribute].currentValue = response.data.value[attribute];
													}
												});
							};

							$scope.readAttributeMbean = function(serverUrl,
									mBean, attribute, callback) {
								$http.get(
										serverUrl + '/jolokia/read/'
												+ mBean.name + '/' + attribute)
										.then(callback, $scope.displayError);
							};

							$scope.executeOpMbean = function(serverUrl, mBean,
									op, callback) {
								$http
										.get(
												serverUrl
														+ '/jolokia/exec/'
														+ mBean.name
														+ '/'
														+ op
														+ $scope
																.buildArgsString(mBean.op[op].args))
										.then(function(res) {
											if ("error_type" in res.data)
												$scope.displayJMXError(res);
											else
												callback(res, mBean);
											$scope.removeBusy(mBean, op);
										});
								$scope.addBusy(mBean, op);
								
							};

							$scope.buildArgsString = function(args) {
								console.log(args);
								var argsString = '';
								for (key in args) {
									argsString = argsString + '/'
											+ args[key].value;
								}
								return argsString;
							};

							$scope.readAllAttributesMbean = function(serverUrl,
									mBean, callback) {
								$http.get(
										serverUrl + '/jolokia/read/'
												+ mBean.name).then(callback,
										$scope.displayError);
							};

							$scope.displayResult = function(res) {
								alert('Returned Value: ' + res.data.value);
								$scope.readAttribute = res.data.value;
							};

							$scope.addOpResult = function(res, mBean) {
								mBean.op[res.data.request.operation].retValue = res.data.value;
							};
							
							$scope.addBusy = function(mBean, op) {
								mBean.op[op].busy = true;
							};
							
							$scope.removeBusy = function(mBean, op) {
								mBean.op[op].busy = false;
							};


							$scope.displayError = function(data, status,
									headers, config) {
								alert('Error! ' + data);
							};

							$scope.displayJMXError = function(res) {
								alert('Error type: ' + res.data.error_type
										+ '\nError:' + res.data.error);

							};

							$scope.displayAttributesFromMBeanResponse = function(
									res) {
								alert('Returned Values: ' + res.data.value);
							};

						} ]);

$(function(){
    $('a, button').click(function() {
        $(this).toggleClass('active');
    });
});
