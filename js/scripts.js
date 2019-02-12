 // Initialize Firebase
 var config = {
   apiKey: "AIzaSyB1zkOFxgZpo7mSdY-7A3QYd7PgA25-L8U",
   authDomain: "real-time-door-opener.firebaseapp.com",
   databaseURL: "https://real-time-door-opener.firebaseio.com",
   projectId: "real-time-door-opener",
   storageBucket: "real-time-door-opener.appspot.com",
   messagingSenderId: "971843951010"
 };
 firebase.initializeApp(config);

 // Listen for click on the door button and update doorstatus on firebase
 $("#Open-Sesame").click(function (event) {
   // Disables the ability to keep tapping on button
   $(".tap-blocker").show();

   var uid = firebase.auth().currentUser.uid;

   // Updates doorStatus to true and waits to reset back to false
   firebase.database().ref("users/" + uid).update({
       uid: uid,
       doorStatus: true
     })
     // Trigger a success message if it works and animate door open
     .then(function () {
       console.log("Success! Database updated.");
       $("#Open-Sesame").addClass("door-opened");
       setTimeout(function () {
         firebase.database().ref("users/" + uid).update({
             uid: uid,
             doorStatus: false
           })
           // Close door after timeout
           .then(function () {
             console.log("Success! Database updated.");
             $("#Open-Sesame").removeClass("door-opened");
             $(".tap-blocker").hide();
           })
           //Trigger an error message if it fails
           .catch(function (error) {
             console.log("Whoops, something went wrong " + error);
             $("#Open-Sesame").removeClass("door-opened");
             $(".tap-blocker").hide();
           });
       }, 3000);
     })
     //Trigger an error message if it fails
     .catch(function (error) {
       console.log("Whoops, something went wrong " + error);
     });
 });

 // Run as soon as the page loads
 window.addEventListener("load", function () {
   // Listen for auth state changes
   firebase.auth().onAuthStateChanged(function (user) {
     if (user) {
       console.log("User is logged in");
       showLogoutButton();
       startDatabaseQueries();
     } else {
       console.log("User is logged out");
       showLoginButton();
     }
   });
 });

 function showLoginButton() {
   $("#Login-Button").text("Login/Signup");
   $('#Login-Button').off('click');
   $("#Login-Button").click(function (event) {
     var provider = new firebase.auth.GoogleAuthProvider();
     firebase.auth().signInWithPopup(provider);
     $("#Login-Button").text("Logging in");
   });
 }

 function showLogoutButton() {
   $("#Login-Button").text("Logout");
   $('#Login-Button').off('click');
   $('#Login-Button').click(function (event) {
     firebase.auth().signOut();
     console.log("User was logged out");
   });
 }

 // Starts listening to users firebase database
 function startDatabaseQueries() {
   var uid = firebase.auth().currentUser.uid;
   firebase.database().ref().child("users/" + uid).on("value", function (snapshot) {
     if (snapshot.val() !== null) {
       var ref = firebase.database().ref().child("users/" + uid);
       ref.on("value", function (snapshot) {
           // Get the door status
           if (snapshot.val().doorStatus === undefined || snapshot.val().doorStatus === null || snapshot.val().doorStatus === false) {
             $(".keypad-indicator").removeClass("door-unlocked");
             $(".keypad-indicator").addClass("door-locked");
             $(".door-front").removeClass("opened");
             $(".door-front").addClass("closed");
           } else {
             $(".keypad-indicator").removeClass("door-locked");
             $(".keypad-indicator").addClass("door-unlocked");
             $(".door-front").removeClass("closed");
             $(".door-front").addClass("opened");
           }
         },
         function (error) {
           console.log("Error: " + error);
         }
       );
     }
   });
 }
