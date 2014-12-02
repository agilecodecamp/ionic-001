var app = angular.module("chatApp", ["firebase", 'ionic']);

// login service
app.service('FBLogin', function ($firebase, $firebaseAuth) {
  var loginObject = {};
  
  // firebase reference
  loginObject.__firebaseRef = new Firebase('https://todosagile.firebaseio.com/');
  loginObject.__authObject = $firebaseAuth(loginObject.__firebaseRef);
  
  // user object
  loginObject.__initData = function () {
    loginObject.__isLogin = false;
    loginObject.__User = {};
  };
  
  // process user data
  loginObject.__preProcessData = function (authData) {
    loginObject.__User = {};
    loginObject.__User.name = authData.facebook.displayName;
 	  loginObject.__User.gender = authData.facebook.cachedUserProfile.gender;
 	  loginObject.__User.imgSrc = authData.facebook.cachedUserProfile.picture.data.url;
 	  
    loginObject.__isLogin = true;
    loginObject.__authData = authData;
  };
  
  // check is user auth
  loginObject.__authObject.$onAuth(function (authData) {
    if (authData) {
      console.log("Logged in as:", authData.uid);
      loginObject.__preProcessData(authData);
    } else {
      console.log("Logged out");
      loginObject.__initData();
    }
  });
  
  /**
   * public function
   */
  
  // login fb
  loginObject.doLogin = function () {
    loginObject.__authObject.$authWithOAuthPopup("facebook")
    .then(function(authData) {
      loginObject.__preProcessData(authData);
    })
    .catch(function(error) {
      console.error("Authentication failed:", error);
    });
  };
  
  // logout fb
  loginObject.doLogout = function () {
    loginObject.__authObject.$unauth();
  };
  
  // current User
  loginObject.getCurrentUser = function () {
    return loginObject.__User;
  };
  
  // check login
  loginObject.isLogin = function () {
    return loginObject.__isLogin;
  }
  
  return loginObject;
});


app.controller("ChatCtrl", function ($scope, $firebase, $firebaseAuth, FBLogin, $ionicScrollDelegate) {
  
  $scope.login = FBLogin.doLogin;
  $scope.logout = FBLogin.doLogout;
  $scope.isLogin = FBLogin.isLogin;
  $scope.userInfo = FBLogin.getCurrentUser;
  
  // message reference
  var ref = new Firebase("https://todosagile.firebaseio.com/messages");
  ref = ref.limitToLast(50);
  // when new message come, auto scroll to bottom
  ref.on('child_added', function(childSnapshot, prevChildName) {
    $ionicScrollDelegate.scrollBottom();
  });
  var sync = $firebase(ref);
  $scope.messages = sync.$asArray();
  
  $scope.addMessage = function (text) {
    if (!$scope.isLogin) {
      return;
    }
    // new message object
    var newMessage = {
      name : $scope.userInfo().name,
      text : text,
      gender: $scope.userInfo().gender,
      picture: $scope.userInfo().imgSrc,
      date: Date.now()
    };
    // add data to firebase
    $scope.messages.$add(newMessage);
    // clear text
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
