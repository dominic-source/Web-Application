//jshint esversion:6
(function(){
document.querySelector(".plus").addEventListener("click", function() {
const good = document.querySelector(".hidden");
const newElement = document.createElement("div");
let idcont1 = genrandstring(20, 'abcdefghijklmnopqrstuvwxyz');
let idcont2 = genrandstring(20, 'abcdefghijklmnopqrstuvwxyz');
let idcont3 = genrandstring(20, 'abcdefghijklmnopqrstuvwxyz');
let idcont4 = genrandstring(20, 'abcdefghijklmnopqrstuvwxyz');

newElement.innerHTML = `<label for="${idcont1}" class=" hide form-control my-3 mr-3 btn-info">Api name</label>` +
 `<input class="form-control my-3" type="text" name="apiNames" value="" id="${idcont1}" placeholder="Api Name" required><br>`+
 `<label for="${idcont2}" class=" hide form-control my-3 mr-3 btn-info">Api image address</label>`+
 `<input class="form-control my-3" type="text" name="apiImageAddresses" value="" id="${idcont2}" placeholder="Api image address" required><br>`+
 `<label for="${idcont3}" class=" hide btn-info my-3 form-control mr-3">Api link address</label>`+
`<input class="form-control my-3" type="text" id="${idcont3}" name="apiAddresses" value="https//:" placeholder="Api Address" required><br>`+
`<label for="${idcont4}" class=" hide btn-info my-3 form-control mr-3">Api company Name</label>`+
`<input class="form-control my-3" type="text" id="${idcont4}" name="apiCompanySupplier" value="" placeholder="Api Company Supplier" required><br><hr style="background-color:#f4f4f4">`;
good.appendChild(newElement);
});

function genrandstring(len, combination) {
  ans = '';
  for (i = 0; i < len; i++) {
    ans += combination[Math.floor(Math.random() * combination.length)];
  }
  return ans;
}
}());
