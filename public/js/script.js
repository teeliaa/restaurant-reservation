document.addEventListener("DOMContentLoaded", function() {
    set_Slot1();
    set_Slot2();
    setUnavailableDates();
    resetForm();
    console.log("ready");
});

document.getElementById("time-select").addEventListener("click", function() {
    document.querySelector("#time-select ul").classList.toggle("display");
});

document.getElementById("test").addEventListener("click", function() {
    alert(this.getAttribute("href"));
});


const ctaHero = document.getElementById("cta-hero");
const bookingform = document.querySelector("#booking-section form");

ctaHero.addEventListener("mouseenter", function() {
    bookingform.style.transform = "scale(1.1)";
});

ctaHero.addEventListener("mouseleave", function() {
    bookingform.style.transform = "scale(1)";
});
