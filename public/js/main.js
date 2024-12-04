let unavailableDates = [];
let timeSlots = [];

document.addEventListener("DOMContentLoaded", function () {
    const bookingForm = document.getElementById("booking-form");

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
            console.log("Config loaded:", config);
            unavailableDates = config.unavailableDates;
            timeSlots = config.timeSlots;

            // 예약날짜 업데이트
            initializeDatepicker();

            // 시간슬롯 업데이트
            const timeSelect = document.getElementById("time");
            if (timeSelect) {
                updateTimeOptions(timeSelect, timeSlots);
            }
        })
        .catch(error => console.error("Error fetching config:", error));
}

// Datepicker 초기화
function initializeDatepicker() {
    const dateInput = document.getElementById("date");
    if (!dateInput) return;

    $(dateInput).datepicker({
        dateFormat: "yy-mm-dd",
        beforeShowDay: function (date) {
            const dateString = $.datepicker.formatDate("yy-mm-dd", date);
            return unavailableDates.includes(dateString)
                ? [false, "", "예약 불가"] // Prevent selection of unavailable dates
                : [true, ""];
        },
        minDate: 0, // Allow only dates from today onwards
    });
}

// 시간 슬롯 옵션 업데이트
function updateTimeOptions(selectElement, timeSlots) {
    selectElement.innerHTML = '<option value="">시간을 선택하세요</option>'; // Default option
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

    if (!date || !time || !people) {
        alert("모든 필드를 올바르게 입력하세요.");
        return;
    }

    checkBookingAvailability(date, time, people)
        .then(isAvailable => {
            if (isAvailable) {
                alert("예약이 진행됩니다.");
                document.getElementById("booking-form").submit();
            } else {
                alert("해당 시간대에 예약이 불가능합니다.");
            }
        })
        .catch(error => {
            console.error("Error checking booking availability:", error);
            alert("예약 확인 중 오류가 발생했습니다.");
        });
}

// 예약 가능 여부 확인
function checkBookingAvailability(date, time, people) {
    return fetch("/booking/check-availability", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, time, people }),
    })
        .then(response => response.json())
        .then(data => data.isAvailable);
}
