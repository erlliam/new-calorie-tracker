let savedFoodsData = [
  {
    "foodName": "Potato",
    "foodServingSize": "100",
    "foodCalories": "77",
  },
  {
    "foodName": "Banana",
    "foodServingSize": "100",
    "foodCalories": "89",
  }
];

let savedFoodsTable = document.getElementById("saved-foods");
let savedFoodsBody = savedFoodsTable.querySelector("tbody");
let savedFoodsFooter = savedFoodsTable.querySelector("tfoot");

function displaySavedFood(index, food) {
  let tableRow = document.createElement("tr");
  tableRow.setAttribute("data-food-id", index);

  tableRow.innerHTML = `
    <td>${food.foodName}</td>
    <td>${food.foodServingSize}</td>
    <td>${food.foodCalories}</td>
    <td>
      <button>Add</button>
      <button>Edit</button>
      <button>Delete</button>
    </td>
  `;


  savedFoodsBody.append(tableRow);

  // let foodName = document.createElement("td");
  // foodName.textContent = food.foodName;
  // let foodServingSize = document.createElement("td");
  // foodServingSize.textContent = food.foodServingSize;
  // let foodCalories = document.createElement("td");
  // foodCalories.textContent = food.foodCalories;

  // let foodActions = document.createElement("td");
  // let addButton = document.createElement("button");
  // addButton.textContent = "Add";
  // let editButton = document.createElement("button");
  // editButton.textContent = "Edit";
  // let deleteButton = document.createElement("button");
  // deleteButton.textContent = "Delete";

}

if (savedFoodsData.length > 0) {
  savedFoodsFooter.style.display  = "none";
  
  savedFoodsData.forEach((food, index) => {
    displaySavedFood(index, food);
  });
}
