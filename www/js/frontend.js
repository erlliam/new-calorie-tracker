"use strict";

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

      try {
        await this._parent.database.diary.create({
          dateString: getNumericDateString(this._parent.date),
          foodKey: values.foodKey,
          servingSize: servingsConsumed,
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

  async display(food) {
    this._open(food);
    // XXX
    // perhaps a promise?
    // perhaps we listen for a form submit event once?
    // what if that submit event fails?
  }

  _open(food) {
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
    this._popUpAddFood.display(food);
    // XXX Ideal:
    // this._open();
    // await this._popUpAddFood.display(food);
    // this._close();
  }
}

class Header {
  constructor({ date, dateButton, dateNext, datePrevious }) {
    this._date = date;
    this._dateButton = dateButton;
    this._dateNext = dateNext;
    this._datePrevious = datePrevious;
    this._init();
  }

  _init() {
    this._updateText();
    this._addEventListeners();
  }

  _updateText() {
    this._dateButton.textContent = getDateString(this._date);
  }

  _changeDate(days) {
    let time = this._date.getTime();
    this._date.setTime(time + (days * (1000 * 60 * 60 * 24)));
  }

  _changeDateAndUpdateText(days) {
    this._changeDate(days);
    this._updateText();
  }

  _showCalender() {
    console.warn("Implement header's calender");
  }

  _addEventListeners() {
    this._dateButton.addEventListener("click", (_event) => {
      this._showCalender();
    });

    this._dateNext.addEventListener("click", (_event) => {
      this._changeDateAndUpdateText(-1);
    });

    this._datePrevious.addEventListener("click", (_event) => {
      this._changeDateAndUpdateText(1);
    });
  }
}

class Overview {
  constructor() {
    this._init();
  }

  _init() {
    // XXX finish the overview
    let toggleOverviewOptions = document.getElementById("toggle-overview-options");
    let overviewOptions = undefined;
    console.warn("Implement initializeOverview()");
    // this._addEventListeners();
  }
}

class Diary {
  constructor({ container, database, date }) {
    this._container = container;
    this._database = database;
    this._date = date;
    this._init();
  }

  _init() {
    this._updateDiary();
    this._addEventListeners();
  }

  _addEventListeners() {
    this._container.addEventListener("click", async (event) => {
      if (event.target.tagName !== "TD") return;

      let tableRow = event.target.parentElement;
      if (!tableRow.hasAttribute("data-key")) return;
      let entryKey = parseInt(tableRow.getAttribute("data-key"));
      let entry = await this._database.diary.queryKey({
        key: entryKey });

      console.log(entry);

      // XXX edit diary entries here
      // fetch food information
      // search up the foodId
      // create a diary entry
      // this entry pop up will have pre filled values
      // the user can edit these values
      console.warn("Finish recentFoods eventListener");
    });
  }

  async _updateDiary() {
    let entries = await this._database.diary.query({
      dateString: getNumericDateString(this._date) });
    for (const entry of entries) {
      this._displayEntry(entry);
    }
  }

  async _displayEntry(entry) {
    if (entry.values.type !== "food" && entry.values.type !== "calories") {
      return;
    }

    let food = await this._database.food.query({ key: entry.values.foodKey });
    let foodContainer = document.createElement("tr");
    let foodName = document.createElement("td");
    let foodServingSize = document.createElement("td");
    let foodCalories = document.createElement("td");

    // XXX only chop off decimal numbers
    // if it has decimals in the first place

    let amountConsumed = entry.values.servingSize * food.servingSize;
    let caloriesConsumed = entry.values.servingSize * food.calories;

    if (entry.values.type === "food") {
      foodName.textContent = food.name;
      foodServingSize.textContent = `${
        amountConsumed.toFixed(1)} ${food.unit || ""}`;
      foodCalories.textContent = caloriesConsumed.toFixed(1);
    } else if (entry.values.type === "calories") {
      foodName.textContent = entry.values.note;
      foodServingSize.textContent = "(added\u00A0calories)";
      foodCalories.textContent = entry.values.calories.toFixed(1);
    }

    foodContainer.classList.add("food");
    foodContainer.setAttribute("data-key", entry.key);
    foodContainer.append(foodName, foodServingSize, foodCalories);
    this._container.append(foodContainer);
  }
}

class DiaryOptions {
  constructor() {
    this._container = document.getElementById("diary-options");
    this._openContainer = document.getElementById("toggle-diary-options");
    this._activeChild = null;
    this._init();
  }

  _init() {
    this._addEventListeners();
  }

  _addEventListeners() {
    this._openContainer.addEventListener("click", (_event) => {
      let hidden = this._container.classList.toggle("hidden");
      if (hidden && this._activeChild !== null) {
        this._closeActiveChild();
      }
    });

    this._container.addEventListener("click", (event) => {
      if (!event.target.id.startsWith("toggle-")) return;

      // XXX things are getting a bit magical...
      // the alternative is uglier...
      let childId = event.target.id.substring(7);
      let child = document.getElementById(childId);
      let hidden = child.classList.toggle("hidden");
      if (hidden) {
        this._activeChild = null;
      } else {
        if (this._activeChild !== null) {
          this._closeActiveChild();
        }
        this._activeChild = child;
      }
    });

    // XXX continue here
    // let recentFoods = document.getElementById("");
    // let foodSearch = document.getElementById("");
    // let createFood = document.getElementById("");
    // let addCalories = document.getElementById("");
    // recentFoods.addEventListener("click", X);
    // handleSubmitEvent(foodSearch, X);
    // handleSubmitEvent(createFood, X);
    // handleSubmitEvent(addCalories, X);
  }

  _closeActiveChild() {
    this._activeChild.classList.toggle("hidden", true);
    if (this._activeChild.tagName === "FORM") {
      this._activeChild.reset();
    }
    this._activeChild = null;
  }
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
  }
}
