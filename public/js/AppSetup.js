// Setup app. Must be included before all controllers
var app = angular.module('app', ['ngMaterial', 'ngMessages'] ); // Include app dependency on ngMaterial and error messages, see https://material.angularjs.org/latest/demo/input and https://angular-translate.github.io/docs/#/guide/02_getting-started

// Define theme
app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('blue-grey');
  $mdThemingProvider.enableBrowserColor();
});

// Allow video sources http://stackoverflow.com/a/31313621
app.filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);
