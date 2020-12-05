//jshint esversion:6
// let month = [
//   "January","February","March","April","May",
//   "June","July","August","September","October",
//   "November","December"];
exports.getDate = function(){
var options = {month:"long",day:"numeric",year:"numeric"};
var now = new Date();
var day = now.toLocaleDateString("en-us",options);
return day;
};
