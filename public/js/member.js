//jshint esversion:6

const trans = document.getElementById("transaction");
trans.addEventListener("change", function(event) {
  let valtran = event.target.value.replace(" ", ".");
  let inn = document.querySelectorAll(".inn");
  for (let i = 0; i < inn.length; i++) {
    inn[i].classList.remove("vis");
  }
  if (event.target.value == "") {
    document.querySelector(".inn.invis").classList.remove("vis");
  } else {
    document.querySelector(".inn.invis." + valtran).classList.add("vis");
  }
});
