function handleSubmitEvent({ form, callback }) {
  if (form.tagName !== "FORM") {
    throw TypeError("form parameter is not a form.");
  } else if (typeof callback !== "function") {
    throw TypeError("callback parameter is not a function.");
  }

  form.onsubmit = (event) => {
    event.preventDefault();

    let values = Object.fromEntries(new FormData(form).entries());
    callback(values);
  }
}

class HeaderDate {
  constructor({ date, textElement, backButton, forwardButton }) {
    this._date = date;
    this._textElement = textElement;
    this._backButton = backButton;
    this._forwardButton = forwardButton;

    this._init();
  }

  _init() {
    this._updateText();
    this._forwardButton.onclick = () => { this._changeDate(1); };
    this._backButton.onclick = () => { this._changeDate(-1); };
  }

  _updateText() {
    this._textElement.textContent = this._date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  _changeDate(amount) {
    let time = this._date.getTime();
    this._date.setTime(time + amount * (1000 * 60 * 60 * 24));
    this._updateText();
  }
}

(() => {
  let date = new Date();

  let headerDate = new HeaderDate({
    date: date,
    textElement: document.getElementById("diary-date"),
    backButton: document.getElementById("diary-date-back"),
    forwardButton: document.getElementById("diary-date-forward")
  });

  let setCalorieGoalForm = document.getElementById("set-calorie-goal");
  handleSubmitEvent({
    form: setCalorieGoalForm,
    callback: (values) => {
      let calorieGoal = values.calorieGoal;
      // XXX
      console.log("IMPLEMENT ME");
      // set calorieGoal for the diary.
      // calculate calories remaining
    }
  });
})();


/*
let currentlyOpen;

function buttonTogglesElement({ button, element }) {
  button.onclick = () => {
    if (currentlyOpen) {
      if (currentlyOpen === element) {
        element.classList.toggle("hidden");
        currentlyOpen = null;
      } else {
        currentlyOpen.classList.toggle("hidden");
        element.classList.toggle("hidden");
        currentlyOpen = element;
      }
    } else {
      element.classList.toggle("hidden");
      currentlyOpen = element;
    }
  };
}

let previousDayButton = document.getElementById("set-calorie-goal");
let nextDayButton = document.getElementById("set-calorie-goal");

let openCalorieGoalButton = document.getElementById("open-calorie-goal");

let openRecentFoodsButton = document.getElementById("open-recent-foods");
let recentFoodsSection = document.getElementById("recent-foods");

let openFoodSearchButton = document.getElementById("open-food-search");
let foodSearchSection = document.getElementById("food-search");

let openCreateFoodButton = document.getElementById("open-create-food");
let createFoodSection = document.getElementById("create-food");

let openAddCaloriesButton = document.getElementById("open-add-calories");
let addCaloriesSection = document.getElementById("add-calories");

buttonTogglesElement({ button: openRecentFoodsButton, element: recentFoodsSection });
buttonTogglesElement({ button: openFoodSearchButton, element: foodSearchSection });
buttonTogglesElement({ button: openCreateFoodButton, element: createFoodSection });
buttonTogglesElement({ button: openAddCaloriesButton, element: addCaloriesSection });


let databaseConnection;
(async () => {
  try {
    databaseConnection = await initializeDatabase();
    console.log("Database initialized.");

    // let savedFoodsTable = document.getElementById("saved-foods");
    // let savedFoodsBody = savedFoodsTable.querySelector("tbody");
    // displayAllFoods(databaseConnection, savedFoodsTable);
  } catch(error) {
    console.error(error);
  }
})();

let searchFoodForm = document.forms.namedItem("search-food");

searchFoodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let formData = new FormData(searchFoodForm);
  let values = Object.fromEntries(formData.entries());

  let queryPromise = queryFood({ databaseConnection: databaseConnection, query: values.query });
  queryPromise.then((result) => {
    console.log(result);
  });
});

let createFoodForm = document.forms.namedItem("create-food");
let createFoodStatus = createFoodForm.querySelector("span");

createFoodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let formData = new FormData(createFoodForm);
  let food = Object.fromEntries(formData.entries());

  let createFoodPromise = createFood({
    databaseConnection: databaseConnection, food: food
  });

  createFoodPromise.then(() => {
    setTextTimeout(createFoodStatus,
      "Food created.", 2000);
    createFoodForm.reset();
  });

  createFoodPromise.catch((error) => {
    setTextTimeout(createFoodStatus,
      "Failed to create food.", 2000);
    console.error(error);
  });
});
*/
