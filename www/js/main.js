"use strict";

(async () => {
  const DATABASE_NAME = "Calorie Tracker";

  // ugly?
  let date = new Date(getDateString(new Date()));

  let database = new Database({ name: DATABASE_NAME });
  await database.ready;

  // XXX singleton here?

  let header = new Header({
    date: date,
    dateButton: document.getElementById("diary-date"),
    dateNext: document.getElementById("diary-date-back"),
    datePrevious: document.getElementById("diary-date-forward")
  });

  let overview = new Overview();
  let diary = new Diary({
    container: document.getElementById("diary"),
    database: database,
    date: date
  });
  let diaryOptions = new DiaryOptions({ database: database, date: date });
  //initializeDiaryOptions(database, date);

  // XXX test
  // let food = {"foodKey":3,"name":"Aqua lentils","servingSize":58,"unit":"g","calories":102}
  // let popUp = new PopUp({ database: database, date: date });
  // popUp.addFood(food);
})();
