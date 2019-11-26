document.addEventListener("DOMContentLoaded", function() {
  var elems = document.querySelectorAll(".collapsible");
  var instances = M.Collapsible.init(elems);
});

function getData() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:5000/api", true);
  xhr.onload = function() {
    let res = JSON.parse(this.response);
    if (document.querySelectorAll(".collapsible").length) {
      res.data.forEach(function(item, index) {
        let li = document.createElement("li");
        let header = document.createElement("div");
        header.classList.add("collapsible-header");
        header.textContent = item.title;
        let body = document.createElement("div");
        body.classList.add("collapsible-body");
        body.textContent = item.id;
        li.appendChild(header);
        li.appendChild(body);
        document.querySelector(".collapsible").appendChild(li);
      });
    }
  };
  xhr.send();
}

getData();

if (document.forms.length) {
  window.document
    .querySelectorAll("form")[0]
    .addEventListener("submit", function(e) {
      e.preventDefault();
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:5000/api", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function() {
        console.log(this.response);
      };
      xhr.send(
        JSON.stringify({
          title: e.target[0].value
        })
      );
    });
}
