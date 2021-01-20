//jshint esversion:6

(function() {
  const password1 = document.getElementById("password1");
  const password2 = document.getElementById("password2");
  const passValue1 = {
    value: ""
  };
  const passValue2 = {
    value: ""
  };
  let submit = {
    bool: true
  };

  let passwordValues = [{
      bool: false,
      value: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    },
    {
      bool: false,
      value: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

    },
    {
      bool: false,
      value: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

    },
    {
      bool: false,
      value: ["#", "$", "%", "*", "?", "_", "!", "@"]
    }
  ];

  password1.addEventListener("input", function(event) {
    passwordValues.forEach(function(item) {
      item.bool = false;
      item.value.forEach(function(itemValue) {
        if (event.target.value.includes(itemValue)) {
          item.bool = true;
        }
      });
    });
    passValue1.value = event.target.value;
  }, false);

  password2.addEventListener("input", function(event) {
    passValue2.value = event.target.value;
    if (passValue1.value === passValue2.value) {
      document.getElementById("noMatch").classList.remove("vis");
      document.getElementById("Match").classList.add("vis");
    } else {
      document.getElementById("Match").classList.remove("vis");
      document.getElementById("noMatch").classList.add("vis");
    }
  }, false);

  const forms = document.querySelector(".needsValidation");
  forms.addEventListener("submit", function(event) {
    submit.bool = true;
    passwordValues.forEach(function(item) {
      if (!item.bool) {
        submit.bool = false;
      }
    });
    if (!(submit.bool && passValue1.value === passValue2.value)) {
      event.preventDefault();
      event.stopPropagation();
      document.getElementById("danger").classList.add("text-info");
      if (!forms.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      forms.classList.add("was-validated");
    }

  }, false);
}());
