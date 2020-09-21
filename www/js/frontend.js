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

function initializeDiary(database) {
  let addToDiary = document.getElementById("add-to-diary-button");
  let diaryOptions = document.getElementById("diary-options");

  let openRecentFoods = document.getElementById("open-recent-foods");
  let recentFoods = document.getElementById("recent-foods");
  let openFoodSearch = document.getElementById("open-food-search");
  let foodSearch = document.getElementById("food-search");
  let openCreateFood = document.getElementById("open-create-food");
  let createFood = document.getElementById("create-food");
  let openAddCalories = document.getElementById("open-add-calories");
  let addCalories = document.getElementById("add-calories");

  let panelOpen = undefined;

  function close(element) {
    element.classList.toggle("hidden", true);
  }

  function closeOpenPanel() {
    if (panelOpen.tagName === "FORM") {
      panelOpen.reset();
    }
    close(panelOpen);
    panelOpen = undefined;
  }

  // XXX suspicious code
  function buttonOpensPanel({ button, panel }) {
    button.addEventListener("click", (_event) => {
      let hidden = panel.classList.toggle("hidden");

      if (panelOpen !== undefined && panelOpen !== panel) {
        closeOpenPanel();
      }

      if (hidden) {
        panelOpen = undefined;
      } else {
        panelOpen = panel;
      }
    });
  }

  addToDiary.addEventListener("click", (_event) => {
    let diaryOptionsHidden = diaryOptions.classList.toggle("hidden");
    if (diaryOptionsHidden) {
      if (panelOpen !== undefined) {
        closeOpenPanel();
      }
    }
  });

  buttonOpensPanel({ button: openRecentFoods, panel: recentFoods });
  buttonOpensPanel({ button: openFoodSearch, panel: foodSearch });
  buttonOpensPanel({ button: openCreateFood, panel: createFood });
  buttonOpensPanel({ button: openAddCalories, panel: addCalories });

  // Handle recentFoods


  handleSubmitEvent(foodSearch, (values) => {
    console.log(values);
  });

  handleSubmitEvent(createFood, async (values) => {
    try {
      convertPropertyToNumber({ object: values, property: "calories" });
      convertPropertyToNumber({ object: values, property: "servingSize" });
      await database.food.create(values);
      createFood.reset();
      addToDiary.click();
    } catch(error) {
      console.log("Failed to create food.");
    }
  });

  handleSubmitEvent(addCalories, (values) => {
    console.log(values);
  });
}
