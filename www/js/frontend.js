"use strict";

class PanelPopUp {
  constructor(databaseDiary, date) {
    this._databaseDiary = databaseDiary;
    this._date = date;
    this._container = document.getElementById("panel-pop-up");
    this._addFoodForm = document.getElementById("add-food-form");

    this._addEventListeners();
  }

  _addEventListeners() {
    let panelExit = document.getElementById("panel-pop-up-exit");

    this._container.addEventListener("click", (event) => {
      if (event.target !== this._container) {
        return;
      }

      this._panelReject();
    });

    panelExit.addEventListener("click", (_event) => {
      this._panelReject();
    });

    document.addEventListener("keydown", (event) => {
      if (this._container.classList.contains("hidden") ||
          event.code !== "Escape") {
        return;
      }

      this._panelReject();
    });

    handleSubmitEvent(this._addFoodForm, this._addFoodFormEvent);
  }

  async _addFoodFormEvent(values) {
    if (!convertPropertyToNumber({ object: values, property: "servings" }) ||
        !convertPropertyToNumber({ object: values, property: "foodKey" })) {
      this._panelReject();
      return;
    }

    console.log(values);

    let servingsConsumed;
    if (values.servingSize === "default") {
      servingsConsumed = values.servings;
    } else if (values.servingSize === "single") {
      servingsConsumed = values.servings / food.servingSize;
    }

    // let caloriesConsumed = servingsConsumed * food.calories;

    try {
      await this._databaseDiary.create({
        dateString: getNumericDateString(this._date),
        foodKey: food.foodKey,
        servingSize: servingsConsumed
      });
      this._panelResolve();
    } catch(error) {
      this._panelReject();
      throw error;
    }
  }

  _hide() {
    this._container.classList.toggle("hidden", true);
  }

  _show() {
    this._container.classList.toggle("hidden", false);
  }

  _panelReject() {
    this._hide();
    this._promiseReject();
  }

  _panelResolve() {
    this._hide();
    this._promiseResolve();
  }

  _updateFoodPopUpText(food) {
    let foodName = document.getElementById("add-food-name");
    let foodServingSize = document.getElementById("add-food-serving-size");
    let foodServingSizeSingle = document.getElementById("add-food-serving-size-one");
    let foodKey = document.getElementById("add-food-key");

    foodName.textContent = food.name;
    foodServingSize.textContent = `${food.servingSize} ${food.unit}`;
    foodServingSizeSingle.textContent = `1 ${food.unit}`;
    foodKey.setAttribute("value", food.foodKey);
  }

  _showAddFoodPopUp(food) {
    this._updateFoodPopUpText(food);
    this._addFoodForm.classList.toggle("hidden", false);
  }

  addFood(food, promise, promiseResolve, promiseReject) {
    this._promiseReject = promiseReject;
    this._promiseResolve = promiseResolve;

    this._show();
    this._showAddFoodPopUp(food);
  }
}

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
    console.warn("Implement header's calender");
  }

  {
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
}

function initializeOverview() {
  let toggleOverviewOptions = document.getElementById("toggle-overview-options");
  let overviewOptions = undefined;
  console.warn("Implement initializeOverview()");
}

function displayEntryInDocument(diary, entry) {
  let foodContainer = document.createElement("tr");
  let foodName = document.createElement("td");
  let foodServingSize = document.createElement("td");
  let foodCalories = document.createElement("td");

  if (entry.values.hasOwnProperty("note")) {
    foodName.textContent = entry.values.note;
    foodServingSize.textContent = "(added\u00A0calories)";
    foodCalories.textContent = entry.values.calories;
  } else {
    foodName.textContent = entry.values.name;
    foodServingSize.textContent = `${entry.values.servingSize} ${entry.values.unit}`;
    foodCalories.textContent = 0;
    // XXX calculate calories based on servingSize and foodId.
    foodName.textContent = "WTF error man";
  }

  foodContainer.classList.add("food");
  foodContainer.setAttribute("data-id", entry.key);
  foodContainer.append(foodName, foodServingSize, foodCalories);
  diary.append(foodContainer);
}

async function initializeDiary(database, date) {
  let diary = document.getElementById("diary");

  let dateString = getNumericDateString(date);
  let entries = await database.diary.query({ dateString: dateString });
  console.log(entries);
  for (const entry of entries) {
    displayEntryInDocument(diary, entry);
  }

  diary.addEventListener("click", (event) => {
    if (event.target.tagName !== "TD") return;

    let tableRow = event.target.parentElement;
    if (!tableRow.hasAttribute("data-id") ||
        !tableRow.hasAttribute("data-serving-size")) return;

    let values = {
      dateString: getNumericDateString(date),
      foodId: tableRow.getAttribute("data-food-id"),
      servingSize: tableRow.getAttribute("data-serving-size")
    }

    if (!convertPropertyToNumber({ object: values, property: "foodId" }) ||
        !convertPropertyToNumber({ object: values, property: "servingSize" }))
      return;

    // search up the foodId
    // create a diary entry
    // this entry pop up will have pre filled values
    // the user can edit these values

    console.log(values);
    console.warn("Finish recentFoods eventListener");
  });
}

function initializeDiaryOptions(database, date) {
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

  function initializeRecentFoods() {
    console.warn("Implement initializeRecentFoods()");
  }

  {
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

    initializeRecentFoods();

    recentFoods.addEventListener("click", (event) => {
      if (event.target.tagName !== "TD") return;

      let tableRow = event.target.parentElement;
      if (!tableRow.hasAttribute("data-id") ||
          !tableRow.hasAttribute("data-serving-size")) return;

      let values = {
        dateString: getNumericDateString(date),
        foodId: tableRow.getAttribute("data-food-id"),
        servingSize: tableRow.getAttribute("data-serving-size")
      }

      if (!convertPropertyToNumber({ object: values, property: "foodId" }) ||
          !convertPropertyToNumber({ object: values, property: "servingSize" }))
        return;

      // search up the foodId
      // create a diary entry
      // this entry pop up will have pre filled values
      // the user can edit these values

      console.log(values);
      console.warn("Finish recentFoods eventListener");
    });

    handleSubmitEvent(foodSearch, async (values) => {
      // XXX show users the messages in console.log
      let query = values.query;

      try {
        let results = await database.food.search({ query: query });
        foodSearch.reset();
        toggleDiaryOptions.click();
        console.log("Search for:", query, "Results:", results);
        // XXX display this to the DOM?
      } catch(error) {
        console.log("Failed to search for:", query);
        throw error;
      }
    });

    handleSubmitEvent(createFood, async (values) => {
      // XXX show users the messages in console.log
      if (!convertPropertyToNumber({ object: values, property: "calories" }) ||
          !convertPropertyToNumber({ object: values, property: "servingSize" })) {
        console.log("Failed to convert calories/servingSize to number:", values);
        return;
      }

      try {
        await database.food.create(values);
        createFood.reset();
        toggleDiaryOptions.click();
        console.log("Food created:", values);
      } catch(error) {
        console.log("Failed to create food:", values);
        throw error;
      }
    });

    handleSubmitEvent(addCalories, async (values) => {
      // XXX show users the messages in console.log
      if (!convertPropertyToNumber({ object: values, property: "calories" })) {
        console.log("Failed to convert calories to number:", values);
        return;
      }

      values.dateString = getNumericDateString(date);

      try {
        await database.diary.addCalories(values);
        addCalories.reset();
        toggleDiaryOptions.click();
        console.log("Calories added:", values);
      } catch(error) {
        console.log("Failed to add calories:", values);
        throw error;
      }
    });

              let panelPopUp = new PanelPopUp(database.diary, date);

              let promiseResolve;
              let promiseReject;
              let promise = new Promise((resolve, reject) => {
                promiseResolve = resolve;
                promiseReject = reject;
              });

              let food = {"foodKey":3,"name":"Aqua lentils","servingSize":58,"unit":"g","calories":102}

              panelPopUp.addFood(food, promise, promiseResolve, promiseReject);

              promise.then(() => {
                console.log("Resolved ok.");
              });

              promise.catch(() => {
                console.log("Rejected ok");
              });
  }
}
