// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module("chatApp", ["firebase", 'ionic']);

app.controller("ChatCtrl", function ($scope, $firebase, $firebaseAuth) {
  $scope.LoginUser = {};
  $scope.authData = {};
  
  var fbref = new Firebase("https://todosagile.firebaseio.com/");
  $scope.authObj = $firebaseAuth(fbref);
  
  $scope.fb_login = function () {
    $scope.authObj.$authWithOAuthPopup("facebook")
    .then(function(authData) {
      $scope.isLogin = true;
      console.log(authData);
      console.log("Logged in as:", authData.facebook.displayName);
      $scope.LoginUser.name = authData.facebook.displayName;
 		$scope.LoginUser.gender = authData.facebook.cachedUserProfile.gender;
      $scope.authData = authData;
    	
    }).catch(function(error) {
      console.error("Authentication failed:", error);
    });
  };
  
  $scope.isLogin = false;
  
  var ref = new Firebase("https://todosagile.firebaseio.com/messages");
  
  var sync = $firebase(ref);
  $scope.messages = sync.$asArray();
  
  $scope.addMessage = function (text) {
    if (!$scope.isLogin) {
      return;
    }
    
    var newMessage = {
      text : text,
      gender: $scope.LoginUser.gender,
      name : $scope.LoginUser.name,
      date: Date.now(),
      picture: $scope.authData.facebook.cachedUserProfile.picture.data.url
    };
    
    $scope.messages.$add(newMessage);
    
    
    $scope.newtext = "";
  };
  
});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
