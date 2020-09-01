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
