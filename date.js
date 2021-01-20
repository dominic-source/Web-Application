//jshint esversion:6
exports.getDate = function(){
var options = {month:"long",day:"numeric",year:"numeric"};
var now = new Date();
var day = now.toLocaleDateString("en-us",options);
return day;
};
