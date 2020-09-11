let date = new Date();
console.log(date.toLocaleDateString());
console.log(date.toLocaleString());
console.log(date.toLocaleTimeString());

(() => {
  const DATABASE_NAME = "Calorie Tracker";

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

  (async () => {
    let database = new Database({ name: DATABASE_NAME });
    await database.ready;

  })();
})();

// await database.food.create(food);
// await database.food.edit({ key: 1, newFood: {
//   name: "edit test",
//   servingSize: 1,
//   unit: "g",
//   calories: 1
// }});

// let promiseArray = [];
// for (let i = 0; i <= 25; i++) {
//   promiseArray.push(database.food.remove(i));
// }

// await Promise.all(promiseArray);
// console.log("All foods deleted.");
