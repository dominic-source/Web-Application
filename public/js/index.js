//jshint esversion:6
const input = document.getElementById("Pictures");
const preview = document.querySelector(".preview");
input.style.opacity = 0;

input.addEventListener("change", updateImageDisplay);

function updateImageDisplay() {
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }

  const curFiles = input.files;
  if (curFiles.length === 0) {
    const para = document.createElement("p");
    para.textContent = "No files currently selected for upload";
    preview.appendChild(para);
  } else {
    const list = document.createElement("ol");
    preview.appendChild(list);
    for (const file of curFiles) {
      const listItem = document.createElement("li");
      const para = document.createElement("p");
      if (validFileType(file)) {
        para.textContent = `File name ${file.name}, File size ${returnFileSize(file.size)}.`;
        const image = document.createElement("img");
        image.src = URL.createObjectURL(file);

        listItem.appendChild(image);
        listItem.appendChild(para);
      } else {
        para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`;
        listItem.appendChild(para);
      }
      list.appendChild(listItem);
    }
  }
}

const fileTypes = [
  "image/apng",
  "image/jpeg",
  "image/pjpeg",
  "image/png"
];

function validFileType(file) {
  return fileTypes.includes(file.type);
}

function returnFileSize(number) {
  if (number < 1024) {
    return number + "bytes";
  } else if (number > 1024 && number < 1048576) {
    return (number / 1024).toFixed(1) + "KB";
  } else if (number > 1048576) {
    return (number / 1048576).toFixed(1) + "MB";
  }
}


// const addToBlog = document.querySelector(".add");
// addToBlog.addEventListener("click",function(){
//   const lab = document.createElement("label");
//   lab.setAttribute("for","content2");
//   lab.setAttribute("class","form-control my-3 mr-3 btn-info");
//   lab.textContent="Content";
//
//   const textarea = document.createElement("textarea");
//   textarea.setAttribute("class","form-control my-3");
//   textarea.setAttribute("id","content2");
//   textarea.setAttribute("row","8");
//   textarea.setAttribute("cols","80");
//   textarea.setAttribute("placeholder","Type the text here");
//
//   const text = document.createElement("div");
//   text.appendChild(lab);
//   text.appendChild(textarea);
//
// });
