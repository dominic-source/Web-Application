//jshint esversion:6
const paymentForm = document.getElementById("paymentForm");
paymentForm.addEventListener("submit",payWithPaystack,false);
function payWithPaystack(){
  var handler = PaystackPop.setup({
    key:'pk_live_b57125980bafd6943735be4b8075840c40009872',
    email:document.getElementById("cc-email").value,
    amount:document.getElementById("cc-amount").value*100,
    currency:document.getElementById("cc-currency").value,
    ref: ''+ Math.floor((Math.random()*100000000000) + 7),
    callback:function(response){
      window.location = "localhost:3000/verify_transaction/" + ref;
    },
    onClose:function(){
      alert("Transaction was not completed, window closed.");
    },

  });
  handler.openIframe();
}
