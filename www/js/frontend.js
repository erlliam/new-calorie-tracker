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

  function changeDateAndUpdateText(days) {
    changeDate(days);
    updateText();
  }

  function showCalender() {
    console.warn("Feature not implemented.");
  }

  updateText();

  diaryDate.addEventListener("click", (_event) => {
    showCalender();
  });

  diaryDateBack.addEventListener("click", (_event) => {
    changeDateAndUpdateText(-1);
  });

  diaryDateForward.addEventListener("click", (_event) => {
    changeDateAndUpdateText(1);
  });
}

function initializeDiary(database, date) {
  let toggleDiaryOptions = document.getElementById("toggle-diary-options");
  let diaryOptions = document.getElementById("diary-options");

  let toggleRecentFoods = document.getElementById("toggle-recent-foods");
  let recentFoods = document.getElementById("recent-foods");
  let toggleFoodSearch = document.getElementById("toggle-food-search");
  let foodSearch = document.getElementById("food-search");
  let toggleCreateFood = document.getElementById("toggle-create-food");
  let createFood = document.getElementById("create-food");
  let toggleAddCalories = document.getElementById("toggle-add-calories");
  let addCalories = document.getElementById("add-calories");

  let openedPanel = null;

  function closeOpenedPanel() {
    openedPanel.classList.toggle("hidden", true);

    if (openedPanel.tagName === "FORM") {
      openedPanel.reset();
    }

    openedPanel = null;
  }

  function togglePanel(button, panel) {
    button.addEventListener("click", (_event) => {
      let isHidden = panel.classList.toggle("hidden");
      if (isHidden) {
        openedPanel = null;
      } else {
        if (openedPanel !== null) {
          closeOpenedPanel();
        }
        openedPanel = panel;
      }
    });
  }

  toggleDiaryOptions.addEventListener("click", (_event) => {
    let isHidden = diaryOptions.classList.toggle("hidden");
    if (isHidden) {
      if (openedPanel !== null) {
        closeOpenedPanel();
      }
    }
  });

  togglePanel(toggleRecentFoods, recentFoods);
  togglePanel(toggleFoodSearch, foodSearch);
  togglePanel(toggleCreateFood, createFood);
  togglePanel(toggleAddCalories, addCalories);
/*
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

  handleSubmitEvent(addCalories, async (values) => {
    try {
      console.log(values);
      convertPropertyToNumber({ object: values, property: "calories" });
      
      let diaryEntry = {
        dateString: "9/11/2020",
        foodKey: 1,
        servingSize: values.calories
      };

      console.log(diaryEntry);


      // await database.food.create(values);

      // createFood.reset();
      // addToDiary.click();
    } catch(error) {
      console.log("Failed to create food.");
    }
  });
*/
}
