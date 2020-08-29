(async () => {
  try {
    databaseConnection = await initializeDatabase();
    console.log("Database initialized.");

    // let potato = { "name": "Potato", "servingSize": 100, "unit": "g", "calories": 77 };
    // let banana = { "name": "Banana", "servingSize": 100, "unit": "g", "calories": 89 };
    // createFood(potato);
    // createFood(banana);

    printAllFoods(databaseConnection);
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

  let createFoodPromise = createFood(food);
  createFoodPromise.then(() => {
    createFoodForm.reset();

    setTextTimeout(createFoodStatus,
      "Food created.", 2000);
  });

  createFoodPromise.catch((error) => {
    setTextTimeout(createFoodStatus,
      "Failed to create food.", 2000);
    console.error(error);
  });
});

let savedFoodsTable = document.getElementById("saved-foods");
let savedFoodsBody = savedFoodsTable.querySelector("tbody");

function setTextTimeout(element, text, delay) {
  element.textContent = text;
  window.setTimeout(() => {
    element.textContent = null;
  }, delay);
}
