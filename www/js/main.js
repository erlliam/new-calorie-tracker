"use strict";

(async () => {
  const DATABASE_NAME = "Calorie Tracker";
  let date = new Date(getDateString(new Date()));
  let database = new Database({ name: DATABASE_NAME });
  await database.ready;

  let popUp = new PopUp({ database: database, date: date });

  let diary = new Diary({
    container: document.getElementById("diary"),
    database: database,
    date: date,
    popUp: popUp
  });

  let overview = new Overview({
    database: database,
    date: date,
    popUp: popUp
  });

  let header = new Header({
    date: date,
    dateButton: document.getElementById("diary-date"),
    dateNext: document.getElementById("diary-date-back"),
    datePrevious: document.getElementById("diary-date-forward"),
    diary: diary,
    overview: overview
  });

  let diaryOptions = new DiaryOptions({
    database: database,
    date: date,
    diary: diary
  });
})();
