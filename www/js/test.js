const DATABASE_NAME = "Calorie Tracker";
let foodExample = { name: "Potato", servingSize: 1, unit: "g", calories: 100 };
let diaryExample = { dateString: "9/11/2020", foodKey: 1, servingSize: 1 };

(async () => {
  deleteDatabase();
  let database = new Database({ name: DATABASE_NAME });
  await database.ready;

  foodDatabaseTest(database);
  diaryDatabaseTest(database);

})();

async function foodDatabaseTest(database) {
  console.log("validFoodObject: " +
    database.food._dataValidator(foodExample));

  await database.food.create(foodExample);
  console.log("Potato created");
  let keyToCheck = 26;

  console.log(`Database key ${keyToCheck} exists: \
${await database.food.exists(keyToCheck)}`);
  console.log(await database.food.exists(1));
}

async function diaryDatabaseTest(database) {
  await database.diary.create(diaryExample);
  await database.diary.create(diaryExample);
  await database.diary.create(diaryExample);
  await database.diary.create(diaryExample);
  await database.diary.remove(3);
  let entries = await database.diary.query({
    dateString: diaryExample.dateString });
  console.log(entries);

  for (entry of entries) {
    await database.diary.edit({
      newDiary: Object.assign({}, diaryExample, { servingSize: 100 }),
      key: 1
    });
  }

  entries = await database.diary.query({
    dateString: diaryExample.dateString });
  console.log(entries);
}
