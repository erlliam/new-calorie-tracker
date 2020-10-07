"use strict";

function displayEntryInDocument(diaryContainer, entry) {
  if (entry.values.type !== "food" && entry.values.type !== "calories") {
    return;
  }

  let foodContainer = document.createElement("tr");
  let foodName = document.createElement("td");
  let foodServingSize = document.createElement("td");
  let foodCalories = document.createElement("td");

  if (entry.values.type === "food") {
    console.log("Hey!");
    foodName.textContent = "look up foodKey and get name...";
    foodServingSize.textContent = `${entry.values.servingSize} ${entry.values.unit}`;
    foodCalories.textContent = entry.values.calories;
  } else if (entry.values.type === "calories") {
    foodName.textContent = entry.values.note;
    foodServingSize.textContent = "(added\u00A0calories)";
    foodCalories.textContent = entry.values.calories;
  }

  foodContainer.classList.add("food");
  foodContainer.setAttribute("data-id", entry.key);
  foodContainer.append(foodName, foodServingSize, foodCalories);
  diaryContainer.append(foodContainer);
}

class PopUpAddFood {
  constructor(parent) {
    this._parent = parent;
    this._form = document.getElementById("add-food-form");
    this._init();
  }

  _init() {
    this._addEventListeners();
  }

  _addEventListeners() {
    handleSubmitEvent(this._form, async (values) => {
      convertPropertyToNumber({ object: values, property: "foodKey" });
      convertPropertyToNumber({ object: values, property: "servings" });
      if (!numberOverZero(values.foodKey) ||
          !numberOverZero(values.servings) ||
          (values.servingSize !== "default" &&
          values.servingSize !== "single")) {
        return;
      }

      let food = await this._parent.database.food.query({ key: values.foodKey });
      let servingsConsumed = this._getServingsConsumed(food, values);
      let caloriesConsumed = food.calories * servingsConsumed;

      console.log(servingsConsumed); console.log(caloriesConsumed); console.log(values);

      try {
        await this._parent.database.diary.create({
          dateString: getNumericDateString(this._parent.date),
          foodKey: values.foodKey,
          servingSize: servingsConsumed,
          calories: caloriesConsumed,
          type: "food",
        });
      } catch(error) {
        // XXX revisit here.
        throw error;
      }

      // XXX big smell. Don't let this class handle the
      // other class's shit.
      this._close();
      this._parent.close();
    });
  }

  _getServingsConsumed(food, values) {
    if (values.servingSize === "default") {
      return values.servings;
    } else if (values.servingSize === "single") {
      return values.servings / food.servingSize;
    }
  }

  _setFormValues(food) {
    let foodName = document.getElementById("add-food-name");
    let foodServingSize = document.getElementById("add-food-serving-size");
    let foodServingSizeSingle = document.getElementById("add-food-serving-size-one");
    let foodKey = document.getElementById("add-food-key");
    foodName.textContent = food.name;
    foodServingSize.textContent = `${food.servingSize} ${food.unit}`;
    foodServingSizeSingle.textContent = `1 ${food.unit}`;
    foodKey.setAttribute("value", food.foodKey);
  }

  open(food) {
    this._setFormValues(food);
    this._form.classList.toggle("hidden", false);
  }

  _close() {
    this._form.classList.toggle("hidden", true);
  }
}

class PopUp {
  constructor({ database, date }) {
    this.database = database;
    this.date = date;
    this._container = document.getElementById("panel-pop-up");
    this._closeButton = document.getElementById("panel-pop-up-exit");
    this._popUpAddFood = new PopUpAddFood(this);
    this._init();
  }

  _init() {
    this._addEventListeners();
  }

  _addEventListeners() {
    this._container.addEventListener("click", (event) => {
      if (event.target !== this._container) return;
      this.close();
    });

    this._closeButton.addEventListener("click", (_event) => {
      this.close();
    });

    document.addEventListener("keydown", (event) => {
      if (!this._visible || event.code !== "Escape") return;
      this.close();
    });
  }

  _open() {
    this._container.classList.toggle("hidden", false);
  }

  close() {
    this._container.classList.toggle("hidden", true);
  }

  get _visible() {
    return !this._container.classList.contains("hidden");
  }

  addFood(food) {
    this._open();
    this._popUpAddFood.open(food);
    // XXX Ideal:
    // this._open();
    // await this._popUpAddFood.open(food);
    // this._close();
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

    // XXX test
    let food = {"foodKey":3,"name":"Aqua lentils","servingSize":58,"unit":"g","calories":102}
    let popUp = new PopUp({ database: database, date: date });
    popUp.addFood(food);
  }
}
