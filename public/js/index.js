//jshint esversion:6

// This is where all the content of the blog in html are stored
const blogContent = {
  aproperty: ''
};


// It generates random strings for use in the ID
function genrandstring(len, combination) {
  ans = '';
  for (i = 0; i < len; i++) {
    ans += combination[Math.floor(Math.random() * combination.length)];
  }
  return ans;
}


//The function button is used to both display a preview of the blogcontent and to send the
// html content to the server
function buttons(name, type, blogtopic) {
  document.getElementById(name).addEventListener("click", function() {

    try {
      // changeCommit will update the color of the button
      changeCommit.classList.remove("btn-success");
      changeCommit.classList.add("btn-danger");

      //selects the unorderlist and creates a list and item inside
      const bloglist = document.querySelector("#bloglist");
      const myPara = document.createElement("li");
      const idcont = genrandstring(20, 'abcdefghijklmnopqrstuvwxyz');
      const idcont1 = genrandstring(20, 'abcdefghijklmnopqrstuvwxyz');
      if (type == "img") {
        myPara.innerHTML = `<label for="${idcont}" id= "${idcont+"id"}" class="rt form-control my-3 mr-3 btn-info"><strong>--</strong>${blogtopic}</label>` +
          `<input class="rt form-control my-3 " type="text" id="${idcont}" name="image address" value="" placeholder="image address"><br>` +
          `<input class="rt form-control my-3 " type="text" id="${idcont1}" name="altName" value="" placeholder="alternative name"><br>`;

      } else if (type == "commit") {
        myPara.innerHTML = "";

      } else if (type == "a" || type == "script") {
        myPara.innerHTML = `<label for="${idcont}" id= "${idcont+"id"}" class="rt form-control my-3 mr-3 btn-info"><strong>--</strong>${blogtopic}</label>` +
          `<input class="rt form-control my-3 " type="text" id="${idcont}" name="${type=="a"?"link":"script"} address" value="" placeholder="${type=="a"?"link":"script"} address"><br>` +
          `<input class="rt form-control my-3 " type="text" id="${idcont1}" name="${type=="a"?"link":"script"} name" value="" placeholder="${type=="a"?"link":"script"} name"><br>`;

      } else {
        myPara.innerHTML = `<label for="${idcont}" id= "${idcont+"id"}" class="rt form-control my-3 mr-3 btn-info"><strong>--</strong>${blogtopic}</label>` +
          `<textarea class="rt form-control my-3" name="Content" value="" id="${idcont}" rows="3" cols="80" placeholder="Type the text here"></textarea><br>`;
      }


      //checks for a submit button and if it exist it removes it
      if ((document.querySelector(".submit"))) {
        document.querySelector(".submit").remove();
      }

      //Appends the list into the unorderlist
      bloglist.appendChild(myPara);

      //this will remove any button that is clicked
      document.querySelector("#" + idcont + "id").addEventListener("click", function() {
        myPara.innerHTML = "";
      });

      //creates the paragraph/heading/blockquote or others and adds an event listener
      // then check if its a list and then
      // handles it as list else handles it as everyother html tag

      const input = document.querySelector("#" + idcont);
      if (type == "li") {
        const paragraphlink = document.createElement("ul");
        const list = document.createElement("li");
        input.addEventListener("input", function(e) {
          list.textContent = e.target.value;
          paragraphlink.appendChild(list);
          document.querySelector(".jumbotron").appendChild(paragraphlink);
        });

        input.addEventListener("change", function(e) {
          var order = "";
          order += "<li>" + e.target.value + "</li>";
          blogContent.aproperty += "<ul>" + order + "</ul>";
        });

      } else if (type == "img") {
        const list = document.createElement(type);
        const input2 = document.querySelector("#" + idcont1);

        input.addEventListener("input", function(e) {
          list.setAttribute("src", e.target.value);
          input2.addEventListener("input", function(m) {
            list.setAttribute("alt", m.target.value);
          });
          document.querySelector(".jumbotron").appendChild(list);
        });

        const imgaddr = {
          anchar: ""
        };
        input.addEventListener("change", function(m) {
          imgaddr.anchar = m.target.value;
        });

        input2.addEventListener("change", function(e) {
          blogContent.aproperty += `<img class="imageresized" src="${imgaddr.anchar}" alt="${e.target.value}">`;
        });


      } else if (type == "commit") {

      } else if (type == "a") {
        const list = document.createElement(type);
        const input2 = document.querySelector("#" + idcont1);

        input2.addEventListener("input", function(e) {
          list.textContent = e.target.value;
          input.addEventListener("input", function(m) {
            list.setAttribute("href", m.target.value);
          });
          document.querySelector(".jumbotron").appendChild(list);
        });

        const linkaddr = {
          anchar: ""
        };
        input.addEventListener("change", function(m) {
          linkaddr.anchar += m.target.value;
        });

        input2.addEventListener("change", function(e) {
          blogContent.aproperty += ` <a class="link bold" href="${linkaddr.anchar}"> ${e.target.value}</a>`;
        });

      } else if (type == "script") {
        const list = document.createElement(type);
        const input2 = document.querySelector("#" + idcont1);

          input.addEventListener("input", function(m) {
            list.setAttribute("src", m.target.value);
          });
          document.querySelector(".jumbotron").appendChild(list);

        const linkaddr = {
          anchar: ""
        };
        input.addEventListener("change", function(m) {
          linkaddr.anchar += m.target.value;
        });

        blogContent.aproperty += `<script  src="${linkaddr.anchar}" charset="utf-8"></script>`;
      } else {
        const paragraph = document.createElement(type);
        input.addEventListener("input", function(e) {
          paragraph.textContent = e.target.value;
          document.querySelector(".jumbotron").appendChild(paragraph);
        });
        input.addEventListener("change", function(e) {
          blogContent.aproperty += `<${type}>${e.target.value}</${type}>`;
        });
      }


    } catch (err) {
      console.log(err);
    } finally {
      //This will create the submit button
      const submit = document.createElement("li");
      submit.setAttribute("class", "submit");
      submit.innerHTML = '<input type="submit" class="submit btn-success form-control my-3 " name="submit" value="Post to Blog";">' +
        `<input class="" type="hidden" name="content" value='${blogContent.aproperty}'>`;
      bloglist.appendChild(submit);
      // when the submit button is clicked it will check if the blog has been commited before posting it else it
      //prevent the submission of the form and requires you to commit first
      document.querySelector(".submit").addEventListener("click", function(event) {
        const former = document.querySelector("#pre").classList.contains("btn-danger");
        const latter = document.querySelector("#pre").classList.contains("btn-success");
        if (former) {
          event.preventDefault();
          alert("Please click the red button to send all changes");
        }
      });

    }
  });
}

buttons("ap", "p", "Paragraph");
buttons("hr", "hr", "Horizontal row");
buttons("abr", "abbr", "Abbreviation");
buttons("sp", "span", "Span");
buttons("a", "a", "Links");
buttons("ai", "i", "Italics");
buttons("ae", "em", "Emphasis");
buttons("ab", "strong", "Strong");
buttons("al", "li", "list");
buttons("bq", "blockquote", "Blockquote");
buttons("sr", "script", "script");
buttons("im", "img", "remove image");
buttons("pre", "commit", "commit");



//This changes the value of the commit button to either btn-success when clicked
//or remain unchanged as btn-primary
const changeCommit = document.querySelector("#pre");
changeCommit.addEventListener("click", function() {
  changeCommit.classList.remove("btn-danger");
  changeCommit.classList.add("btn-success");
});
