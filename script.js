var app = angular.module('musciApp', ["ngRoute","firebase","youtube-embed"]); 

app.config(function($routeProvider) {
	$routeProvider.when('/', {
		controller: 'mainCtrl',
		templateUrl: 'templates/home.html',
		resolve: {

     		"currentAuth": function($firebaseAuth) {
       		return $firebaseAuth().$requireSignIn();
     		}
   		}
	}).when('/login', {
		controller: 'loginCtrl',
		templateUrl: 'templates/login.html'
	}).when('/signup', {
		controller: 'signupCtrl',
		templateUrl: 'templates/signup.html'
	})                                      
});

app.controller('mainCtrl', function($scope, $http, $firebaseArray, $firebaseObject, $firebaseAuth, $location) {

	//Function to add new track:
	$scope.addSCTrack = function(myName,Id) {
		var ref = firebase.database().ref().child("tracks").child("SoundCloud");
		$scope.tracks= $firebaseArray(ref);
	    $scope.tracks.$add({
	    	name: myName,
	    	id: Id,
	    	type: "SC"
	    });
  	};

  	//Function to add Youtube track:
  	$scope.addYTTrack = function(myName,Id) {
		var ref = firebase.database().ref().child("tracks").child("Youtube");
		$scope.tracks= $firebaseArray(ref);
	    $scope.tracks.$add({
	    	name: myName,
	    	id: Id,
	    	type: "YT"
	    });
  	};
	
  	//Creating the dropdown menu items:                            
	$scope.menu = [];
	$scope.playMenu= [];

	var scRef = firebase.database().ref().child("tracks").child("SoundCloud");
	$scope.scMenus= $firebaseArray(scRef);

	$scope.scMenus.$loaded().then(function(data) {
		$scope.menu.push({"playlist": $scope.scMenus});
	});

	var ytRef = firebase.database().ref().child("tracks").child("Youtube");
	$scope.ytMenus = $firebaseArray(ytRef);

	$scope.ytMenus.$loaded().then(function(data) {
		$scope.menu.push({"playlist": $scope.ytMenus});

		for (var i=0;i<$scope.menu.length;i++) {
			for (var j=0; j<$scope.menu[i].playlist.length;j++) {
				var song= {name:$scope.menu[i].playlist[j].name, id:$scope.menu[i].playlist[j].id, type:$scope.menu[i].playlist[j].type}; 
				$scope.playMenu.push(song);
			}
		}

		console.log($scope.playMenu);

	});	


	// $scope.menus = $scope.ytMenus;
	// $scope.menus.push($scope.scMenus);
	
  	//Function to select track, triggered by ng-click:
	$scope.playTrack = function() {
		SC.initialize({
		  client_id: 'eb60efff116075efdaa769b3eec7a5f8'
		});

		if ($scope.tracktype==="SC") {
			SC.stream('/tracks/'+$scope.currentID).then(function(player){
			  console.log(player);
			  $scope.currentPlayer = player;
			});
		} 
		else if ($scope.tracktype==="YT") {
			$scope.anotherGoodOne = 'https://www.youtube.com/watch?v='+$scope.currentID;
			$scope.currentPlayer= false;
		} 

	}

	$scope.assignID = function(p) {
		console.log(p.id);
		$scope.currentID= p.id;
		$scope.trackid = p.name;
		$scope.tracktype= p.type;
		$scope.playTrack();
		console.log("type "+p.type);
	}

	//Function to control track: (play, pause, stop)
	$scope.pausePlayer = function() {
		if ($scope.tracktype==="YT") $scope.bestPlayer.pauseVideo();
		if ($scope.tracktype==="SC") $scope.currentPlayer.pause();
	} 

	$scope.stopPlayer = function() {
		if ($scope.tracktype==="YT") $scope.bestPlayer.stopVideo();
		if ($scope.tracktype==="SC") {
			$scope.currentPlayer.pause();
			$scope.currentPlayer.seek(0);
		}
	}

	$scope.startPlayer = function() {
		if ($scope.tracktype==="YT") $scope.bestPlayer.playVideo();
		if ($scope.tracktype==="SC") {
			$scope.currentPlayer.play();
		}

	}

	$scope.refreshDB = function() {
		console.log($scope.newURL.substring(32));
		$scope.addYTTrack($scope.newTrackName, $scope.newURL.substring(32));
	}

	//sign out f(x)
	$scope.authObj = $firebaseAuth();

	$scope.signOut= function(){
    	$scope.authObj.$signOut();
    	$location.path("/login")
    };

	// Use the below to add new track: 
	// $scope.addSCTrack("misty","244261890");
	// $scope.addSCTrack("river","128905480");

	//Auto play Function:
	// $scope.$on('youtube.player.ended', function ($event, player) {
	// 	bestPlayer.playVideo();
	// });
 
});

app.controller('loginCtrl', function($scope, $routeParams, $firebaseObject, $firebaseAuth) {
    $scope.authObj = $firebaseAuth();

    $scope.login = function() {
        console.log($scope.email);
        console.log($scope.password);

        $scope.authObj.$signInWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            window.location.assign('http://localhost:8000/#/');

        }).catch(function(error) {
             console.error("Authentication failed:", error);
        })

    }
});
app.controller('signupCtrl', function($scope, $routeParams, $firebaseObject, $firebaseAuth) {
    $scope.authObj = $firebaseAuth();

    $scope.signUp = function() {
        console.log($scope.name);
        console.log($scope.email);
        console.log($scope.password);

        $scope.authObj.$createUserWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
            console.log("Created account:", firebaseUser.uid);
            window.location.assign('http://localhost:8000/#/');

        }).catch(function(error) {
             console.error("Authentication failed:", error);
        })

    }
});


//TO-DOS: 
//1. Sometimes Youtube track does not load properly. 
//2.  Display all songs in Firebase database in a playlist (CSS work, make it pretty) 
// The firebase function is already set up. Use function to add track infos. 
//6.  Fix bug of multiple loaded songs playing at once

//Future goals: 
//6.  Figure out how to add songs to database based on URL (String manipulation, to be able to recognize that the 
//URL belongs to a specific API)
//7.  How to do chrome extension 
//8.  How to drag and drop songs 
//9.  Make a log-in page 
//10. change trackid to an object that we can add to, and thus access them through that. we can then fix many other functions through that



