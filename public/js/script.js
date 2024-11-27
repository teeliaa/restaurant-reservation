document.addEventListener("DOMContentLoaded", function () {
    const addDateForm = document.getElementById("add-date-form");
    const dateInput = document.getElementById("new-date");
    const datesContainer = document.getElementById("unavailable-dates-container");

    // 예약 불가능한 날짜 및 시간 슬롯 가져오기
    fetchConfig();

    // 예약 불가능한 날짜 추가 폼 처리
    if (addDateForm) {
        addDateForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const date = dateInput.value;
            if (date) {
                addUnavailableDate(date);
            } else {
                alert("추가할 날짜를 선택하세요.");
            }
        });
    }
});

// 설정 데이터를 서버에서 가져옴
function fetchConfig() {
    fetch("/settings/config")
        .then(response => response.json())
        .then(config => {
            unavailableDates = config.unavailableDates;
            const timeSlots = config.timeSlots;

            // 예약 불가능한 날짜 표시
            renderUnavailableDates();

            // 시간 슬롯 옵션 업데이트
            const timeSelect = document.getElementById("time-select");
            if (timeSelect) {
                updateTimeOptions(timeSelect, timeSlots);
            }
        })
        .catch(error => console.error("Error fetching config:", error));
}

// 예약 불가능한 날짜 렌더링
function renderUnavailableDates() {
    const container = document.getElementById("unavailable-dates-container");
    if (!container) return;

    container.innerHTML = ""; // 기존 내용을 초기화
    unavailableDates.forEach(date => {
        const dateElement = document.createElement("div");
        dateElement.className = "unavailable-date-item";

        const dateText = document.createElement("span");
        dateText.textContent = date;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "삭제";
        deleteButton.className = "btn btn-danger";
        deleteButton.addEventListener("click", () => removeUnavailableDate(date));

        dateElement.appendChild(dateText);
        dateElement.appendChild(deleteButton);
        container.appendChild(dateElement);
    });
}

// 예약 불가능한 날짜 추가
function addUnavailableDate(date) {
    axios.post("/settings/unavailable-dates/add", { date })
        .then(() => {
            unavailableDates.push(date);
            renderUnavailableDates();
        })
        .catch(error => console.error("Error adding unavailable date:", error));
}

// 예약 불가능한 날짜 삭제
function removeUnavailableDate(date) {
    axios.post("/settings/unavailable-dates/remove", { date })
        .then(() => {
            unavailableDates = unavailableDates.filter(d => d !== date);
            renderUnavailableDates();
        })
        .catch(error => console.error("Error removing unavailable date:", error));
}
