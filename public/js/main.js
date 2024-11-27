let unavailableDates = [];
let timeSlots = [];

document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("booking-form");

    //설정 데이터 가져오고 UI 반영
    fetchConfig();
    if (bookingForm) {
        bookingForm.addEventListener("submit", handleBookingFormSubmit);
    }
});

// 설정 데이터를 서버에서 가져옴
function fetchConfig() {
    fetch("/admin/settings/config")
        .then(response => response.json())
        .then(config => {
            unavailableDates = config.unavailableDates;
            timeSlots = config.timeSlots;

            // Datepicker 초기화
            initializeDatepicker();

            // 시간 슬롯 옵션 업데이트
            const timeSelect = document.getElementById("time");
            if (timeSelect) {
                updateTimeOptions(timeSelect, timeSlots);
            }
        })
        .catch(error => console.error("Error fetching config:", error));
}

// Datepicker 초기화
function initializeDatepicker() {
    const dateInput = document.getElementById("new-date");
    if (!dateInput){
        console.error("Date input not found");
        return;
    }

    $(dateInput).datepicker({
        dateFormat: "yy-mm-dd",
        beforeShowDay: function (date) {
            const dateString = $.datepicker.formatDate("yy-mm-dd", date);
            return unavailableDates.includes(dateString)
                ? [false, "", "예약 불가"] // 예약 불가 날짜는 선택 불가
                : [true, ""];
        },
        minDate: 0, // 오늘 이후 날짜만 선택 가능
    });
    console.log("Datepicker initialized");
}

// 시간 슬롯 옵션 업데이트
function updateTimeOptions(selectElement, timeSlots) {
    selectElement.innerHTML = '<option value="">시간을 선택하세요</option>'; // 기본 옵션 추가
    timeSlots.forEach(slot => {
        const option = document.createElement("option");
        option.value = slot;
        option.textContent = slot;
        selectElement.appendChild(option);
    });
}

// 예약 폼 제출 처리
function handleBookingFormSubmit(event) {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const people = parseInt(document.getElementById("people").value, 10);

    if (!date) {
        alert("예약 날짜를 선택하세요.");
        return;
    }

    if (!time) {
        alert("예약 시간을 선택하세요.");
        return;
    }

    if (!people || people < 1) {
        alert("올바른 인원 수를 입력하세요.");
        return;
    }

    alert("예약이 진행됩니다.");
    document.getElementById("booking-form").submit();
}
