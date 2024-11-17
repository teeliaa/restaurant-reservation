let unavailableDates;

function unavailable(date) {
    const dmy = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    if (unavailableDates.includes(dmy)) {
        return [false, "", "Unavailable"];
    } else {
        return [true, ""];
    }
}

// date Picker 설정
document.addEventListener("DOMContentLoaded", function() {
    const datepickerElement = document.getElementById("datepicker");
    if (datepickerElement) {
        $(datepickerElement).datepicker({
            dateFormat: "dd MM yy",
            beforeShowDay: unavailable,
            yearRange: '2024:2024',
            minDate: 0,  // 오늘 날짜부터 표시
            onSelect: () => {
                setMaxSeat();
                countSeat_Slot1();
                countSeat_Slot2();
            },
            showAnim: "toggle"
        });
    }

    // adminDate Picker 설정
    const datepickerAdminElements = document.querySelectorAll(".datepicker-admin");
    datepickerAdminElements.forEach(element => {
        $(element).datepicker({
            dateFormat: "dd MM yy",
            beforeShowDay: unavailable,
            yearRange: '2024:2024',
            minDate: 0,  // 오늘 날짜부터 표시
            onSelect: () => {
                countSeat_Slot1();
                countSeat_Slot2();
            },
            showAnim: "toggle"
        });
    });

    // 비활성화된 날짜 설정 함수 호출
    setUnavailableDates();
});

function setUnavailableDates() {
    axios.get("/unavailable-dates")
        .then(response => {
            unavailableDates = response.data;
            const container = document.getElementById("unavailable-dates-container");
            if (container) {
                unavailableDates.forEach(date => {
                    const dateElement = document.createElement("p");
                    dateElement.textContent = date;
                    container.appendChild(dateElement);
                });
            }
        })
        .catch(error => {
            console.log(error);
        });
}
