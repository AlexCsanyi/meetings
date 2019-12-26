const selectElement = element => document.querySelector(element);

const header = selectElement("header");
const main = selectElement("main");

selectElement(".hamburger").addEventListener("click", () => {
  header.classList.toggle("click");
  main.classList.toggle("click");
});

// close sidebar when clicking outside of it
window.onclick = (event) => {
    if(event.target.matches('.click')) {
        if(header.classList.contains('click')) {
            header.classList.remove('click')
            main.classList.remove('click')
        }
    }
}