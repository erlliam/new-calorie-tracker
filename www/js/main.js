(() => {
  let date = new Date();
  let calorieGoal = 1;

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
