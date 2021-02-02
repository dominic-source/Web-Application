//jshint esversion: 6
(function() {
  const element = document.querySelectorAll(".adjform");
  element.forEach(function(item, index) {
    item.addEventListener("click", function() {

      let reducevis = document.querySelector("body").classList;
      let vis = document.querySelectorAll(".areYouSureColor");
      //Checks if any exist and then removes it
      if (vis[index].classList.contains("visible")) {
        vis.forEach(function(item, index2) {
          reducevis.remove("reducevisibility");
          vis[index2].classList.remove("visible");
        });
      } else if (!vis[index].classList.contains("visible")) {
        // if it does not exist but other loops are still visible, remove all of them
        vis.forEach(function(item, index2) {
          reducevis.remove("reducevisibility");
          vis[index2].classList.remove("visible");
        });
        // Adds this particular item visibility immediately
        reducevis.add("reducevisibility");
        vis[index].classList.add("visible");
      }


    }, false);
  });

  element.forEach(function(item, index) {
    document.querySelectorAll(".no")[index].addEventListener("click", function(event) {
      event.preventDefault();
      document.querySelector("body").classList.remove("reducevisibility");
      document.querySelectorAll(".areYouSureColor")[index].classList.remove("visible");
    }, false);
  });

  const viewMe = document.querySelectorAll(".setProject");
  viewMe.forEach(function(item, index) {
    let tryMe = document.querySelectorAll(".try")[index];

    item.addEventListener("click", function(event) {
      if (tryMe.classList.contains("viewMe")) {
        viewMe.forEach(function(item, index2) {
          document.querySelectorAll(".try")[index2].classList.remove("viewMe");
        });
      } else if (!tryMe.classList.contains("viewMe")) {
        viewMe.forEach(function(item, index2) {
          document.querySelectorAll(".try")[index2].classList.remove("viewMe");
        });
        tryMe.classList.add("viewMe");
      }
      let unview = document.querySelectorAll(".unView")[index];
      unview.addEventListener("click", function(event) {
        unview.classList.add("laterView");
        setTimeout(function() {
          unview.classList.remove("laterView");
        }, 200);
        tryMe.classList.remove("viewMe");
      });
    }, false);
  });
}());
