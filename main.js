let databaseConnection;
(async () => {
  try {
    databaseConnection = await initializeDatabase();
    console.log("Database initialized.");

    let savedFoodsTable = document.getElementById("saved-foods");
    let savedFoodsBody = savedFoodsTable.querySelector("tbody");

    displayAllFoods(databaseConnection, savedFoodsTable);

  } catch(error) {
    console.error(error);
  }
})();

let createFoodForm = document.forms.namedItem("create-food");
let createFoodStatus = createFoodForm.querySelector("span");

function getFoodFromForm(form) {
  let formData = new FormData(createFoodForm);
  let food = Object.fromEntries(formData.entries());

  food.calories = parseInt(food.calories);
  food.servingSize = parseInt(food.servingSize);

  if (isNaN(food.calories) || isNaN(food.servingSize)) {
    return false;
  }

  return food;
}

createFoodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let food = getFoodFromForm(createFoodForm);

  if (food === false) {
    setTextTimeout(createFoodStatus,
      "Failed to create food.", 2000);
    console.error("Failed to get food from form.");

    return;
  }

  let createFoodPromise = createFood(databaseConnection, food);
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
