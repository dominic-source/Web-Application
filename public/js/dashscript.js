//jshint esversion: 6
(function(){
  const element = document.querySelectorAll(".adjform");
  element.forEach(function(item, index) {
    item.addEventListener("click", function() {
      document.querySelector("body").classList.toggle("reducevisibility");
      document.querySelectorAll(".areYouSureColor")[index].classList.toggle("visible");
    }, false);
  });

  element.forEach(function(item,index) {
    document.querySelectorAll(".no")[index].addEventListener("click", function(event) {
      event.preventDefault();
      document.querySelector("body").classList.remove("reducevisibility");
      document.querySelectorAll(".areYouSureColor")[index].classList.remove("visible");
    });
  });
  const viewMe = document.querySelectorAll(".setProject");
  viewMe.forEach(function(item,index){
    document.querySelectorAll(".try")[index].classList.remove("viewMe");
    item.addEventListener("click",function(event){
      document.querySelectorAll(".try")[index].classList.add("viewMe");
      let unview = document.querySelectorAll(".unView")[index];
      unview.addEventListener("click",function(event){
        unview.classList.add("laterView");
        setTimeout(function(){
          unview.classList.remove("laterView");
        },200);
        document.querySelectorAll(".try")[index].classList.remove("viewMe");
      });
    });
});

}());
