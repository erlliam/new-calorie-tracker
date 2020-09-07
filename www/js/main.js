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

class AddToDiaryButtons {
  constructor({ cssClass, elementButtonArray }) {
    this._currentlyToggled = null;
    this._cssClass = cssClass

    for (let elementButton of elementButtonArray) {
      elementButton.button.onclick = () => {
        this._onclick({
          element: elementButton.element,
          button: elementButton.button
        });
      };
    }
  }

  _open(element) {
    element.classList.toggle(this._cssClass);
    this._currentlyToggled = element;
  }

  _close() {
    this._currentlyToggled.classList.toggle(this._cssClass);
    this._currentlyToggled = null;
    
  };

  _onclick({ button, element }) {
    if (this._currentlyToggled === null) {
      this._open(element);
    } else {
      if (this._currentlyToggled === element) {
        this._close()
      } else {
        this._close();
        this._open(element);
      }
    }
  }
}

(() => {
  let date = new Date();

  new HeaderDate({
    date: date,
    textElement: document.getElementById("diary-date"),
    backButton: document.getElementById("diary-date-back"),
    forwardButton: document.getElementById("diary-date-forward")
  });

  handleSubmitEvent({
    form: document.getElementById("set-calorie-goal"),
    callback: (values) => {
      let calorieGoal = values.calorieGoal;
      // XXX
      console.log("IMPLEMENT ME");
    }
  });

  new AddToDiaryButtons({
    cssClass: "hidden",
    elementButtonArray: [
      {
        element: document.getElementById("recent-foods"),
        button: document.getElementById("open-recent-foods"),
      },
      {
        element: document.getElementById("food-search"),
        button: document.getElementById("open-food-search"),
      },
      {
        element: document.getElementById("create-food"),
        button: document.getElementById("open-create-food"),
      },
      {
        element: document.getElementById("add-calories"),
        button: document.getElementById("open-add-calories"),
      }
    ]
  });
})();
/*
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
