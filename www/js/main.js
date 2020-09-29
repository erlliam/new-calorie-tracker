(async () => {
  const DATABASE_NAME = "Calorie Tracker";

  // ugly?
  let date = new Date(getDateString(new Date()));

  let database = new Database({ name: DATABASE_NAME });
  await database.ready;

  initializeHeader(date);
  initializeOverview();
  initializeDiary();
  initializeDiaryOptions(database, date);
})();
