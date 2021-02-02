//jshint esversion:6
exports.random = function(){
  let rand = Math.floor(Math.random()*1000);
  return rand;
};

exports.random2 = function(){
  let rand = Math.floor(Math.random()*1000000);
  return rand;
};
