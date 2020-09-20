function initializeHeader(date) {
  let diaryDate = document.getElementById("diary-date");
  let diaryDateBack = document.getElementById("diary-date-back");
  let diaryDateForward = document.getElementById("diary-date-forward");

  function updateText() {
    diaryDate.textContent = getDateString(date);
  }

  function changeDate(days) {
    let time = date.getTime();
    date.setTime(time + (days * (1000 * 60 * 60 * 24)));
  }

  function changeDateUpdateText(days) {
    changeDate(days);
    updateText();
  }

  updateText();

  diaryDate.addEventListener("click", (_event) => {
    console.warn("Implement a pop-up calender.");
  });
  diaryDateBack.addEventListener("click", (_event) => {
    changeDateUpdateText(-1);
  });
  diaryDateForward.addEventListener("click", (_event) => {
    changeDateUpdateText(1);
  });
}

function initializeDiary() {
  let addToDiary = document.getElementById("add-to-diary-button");
  let diaryOptions = document.getElementById("diary-options");
  let panelOpen = undefined;

  addToDiary.addEventListener("click", (_event) => {
    let diaryOptionsHidden = diaryOptions.classList.toggle("hidden");
    if (diaryOptionsHidden) {
      console.warn("Reset the diary option panels.");
    }
  });


  function buttonOpensPanel({ button, panel }) {
    button.addEventListener("click", (_event) => {
      let hidden = panel.classList.toggle("hidden");

      if (panelOpen !== undefined) {
        panelOpen.classList.toggle("hidden", true);
      }

      if (hidden) {
        panelOpen = undefined;
      } else {
        panelOpen = panel;
      }
    });
  }

  let openRecentFoods = document.getElementById("open-recent-foods");
  let recentFoods = document.getElementById("recent-foods");
  buttonOpensPanel({ button: openRecentFoods, panel: recentFoods });

  let openFoodSearch = document.getElementById("open-food-search");
  let foodSearch = document.getElementById("food-search");
  buttonOpensPanel({ button: openFoodSearch, panel: foodSearch });

  let openCreateFood = document.getElementById("open-create-food");
  let createFood = document.getElementById("create-food");
  buttonOpensPanel({ button: openCreateFood, panel: createFood });

  let openAddCalories = document.getElementById("open-add-calories");
  let addCalories = document.getElementById("add-calories");
  buttonOpensPanel({ button: openAddCalories, panel: addCalories });
}
