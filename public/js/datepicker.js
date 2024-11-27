document.addEventListener("DOMContentLoaded", function () {
  const datepickerElement = document.getElementById("date");
    const unavailableDatesContainer = document.getElementById("unavailable-dates-container");
  
    if (datepickerElement) {
      $(datepickerElement).datepicker({
        dateFormat: "yy-mm-dd",
        beforeShowDay: function (date) {
          const dateString = $.datepicker.formatDate("yy-mm-dd", date);
          return unavailableDates.includes(dateString) ? [false] : [true];
        },
        minDate: 0,
      });
    }
  
    // 예약 불가 날짜 추가
    document.getElementById("add-date-button")?.addEventListener("click", function () {
      const date = document.getElementById("new-date").value;

      const formattedDate = new Date(date).toISOString().split("T")[0];

      axios.post("/admin/settings/unavailable-dates/add", { date: formattedDate })
        .then(response => {
          unavailableDates = response.data.unavailableDates.map(d => 
            new Date(d).toISOString().split("T")[0]
          );
          updateUnavailableDatesUI(unavailableDates);
        })
        .catch(error => console.error(error));
    });
  
    // 예약 불가 날짜 삭제
    unavailableDatesContainer?.addEventListener("click", function (e) {
      if (e.target.classList.contains("remove-date-button")) {
        const date = e.target.dataset.date;

        fetch("/admin/settings/unavailable-dates/remove", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ date }),
      })
          .then((response) => response.json())
          .then((data) => {
              if (data.unavailableDates) {
                  updateUnavailableDatesUI(data.unavailableDates);
              }
          })
          .catch((error) => console.error("Error:", error));
      }
    });
  
    function updateUnavailableDatesUI(dates) {
      unavailableDatesContainer.innerHTML = "";
        dates.forEach((date) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${date}</td>
                <td>
                    <button class="btn btn-danger remove-date-button" data-date="${date}">삭제</button>
                </td>
            `;
            unavailableDatesContainer.appendChild(row);
        });
    }
  });
  