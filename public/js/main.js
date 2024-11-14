//admin setting
const axios = require("axios");

let Slot1;
let Slot2;
let maxSeat;

function setMaxSeat(){
    axios
        .get("/config-doc")
        .then(config => {
            console.log(config);
        maxSeat = config.data[0].maxSeat;
        console.log(maxSeat);
        })
        .catch(err=> {
            console.log(err);
        });
}

function set_Slot1(){
    axios
        .get("/config-doc")
        .then(config => {
            console.log(config.data[0].Slot1)

        Slot1=config.data[0].Slot1
        document.getElementById("first-slot-li").querySelector("span").innerHTML = Slot1;
        })
        .catch(err=>{
            console.log(err);
        });
}

function set_Slot2(){
    axios
        .get("/config-doc")
        .then(config => {
            console.log(config.data[0].Slot2)

        Slot2=config.data[0].Slot2
        document.getElementById("second-slot-li").querySelector("span").innerHTML = Slot2;
        })
        .catch(err=>{
            console.log(err);
        });
}

function countSeat_Slot1(){
    var date = document.getElementById("datepicker").ariaValueMax;
    axios
        .get("/get-list-of-bookings?date=" + date)
        .then(bookings => {
            let Seats1Booked = 0;
            document.getElementById("first-slot-li").querySelector("p").innerHTML = maxSeat + " 자리 남았습니다";
            bookings.data.forEach(booking => {
                console.log(bookings);

                if(booking.time == Slot1){
                    Seats1Booked += booking.people;
                    let Seats1Left = maxSeat - Seats1Booked;

                    const firstSlotParagraph = document.getElementById("first-slot-li").querySelector("p");

                    if(Seats1Left>0){
                        firstSlotParagraph.innerHTML=Seats1Left+" 자리 남았습니다";
                    } else{
                        firstSlotParagraph.innerHTML="예약이 마감되었습니다"
                    }
                }
            });
        })
        .catch(err=> {
            console.log(err);
        });
}

function countSeat_Slot2() {
    var date = document.getElementById("datepicker").querySelector.value; 
    axios
        .get("/get-list-of-bookings?date=" + date) 
        .then(bookings => {
            let Seats2Booked = 0;
            const secondSlotParagraph = document.getElementById("second-slot-li").querySelector("p");

            secondSlotParagraph.innerHTML = maxSeat + " 자리 남았습니다"; 

            bookings.data.forEach(booking => {    
                if (booking.time == Slot2) {
                    Seats2Booked += booking.people; 
                    let Seats2Left = maxSeat - Seats2Booked; 

                    if (Seats2Left > 0) {
                        secondSlotParagraph.innerHTML = Seats2Left + " 자리 남았습니다";
                    } else {
                        secondSlotParagraph.innerHTML = "예약이 마감되었습니다";
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
        });
}

document.getElementById("first-slot-li").addEventListener("click", () => {
    document.querySelector("#time-select span").innerHTML = Slot1; 
    document.getElementById("time").setAttribute("value", Slot1); 
});

document.getElementById("second-slot-li").addEventListener("click", () => {
    document.querySelector("#time-select span").innerHTML = Slot2; 
    document.getElementById("time").setAttribute("value", Slot2); 
});

function changeMaxPeopleInput() {  
    var date = document.getElementById("datepicker").value;
    var time = document.getElementById("time").value;
    var seatsBooked = 0;

    axios
        .get("/list-of-bookings-per-date-and-time?date=" + date + "&time=" + time) 
        .then(bookings => {
            bookings.data.forEach(booking => {
                seatsBooked += booking.people;
            });
            console.log(seatsBooked);
            var seatsLeft = maxSeat - seatsBooked;

            const peopleInput = document.getElementById("people");
            peopleInput.setAttribute("max", seatsLeft);
            peopleInput.setAttribute("min", 0);

            peopleInput.value = "";
        })
        .catch(err => {
            console.log(err);
        });
}

document.getElementById("people").addEventListener("click", changeMaxPeopleInput);

function resetForm() {
    document.getElementById("datepicker").value = "";
    document.getElementById("people").value = "";
    document.getElementById("time").value = "";
}