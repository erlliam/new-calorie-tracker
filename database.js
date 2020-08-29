const DATABASE_NAME = "Calorie Tracker";
const FOOD_SCHEMA = [ "name", "servingSize", "unit", "calories" ];
let databaseConnection;

function createFood(food) {
  return new Promise((resolve, reject) => {
    let transaction = databaseConnection.transaction(
      ["food"], "readwrite");
    let foodObjectStore = transaction.objectStore("food");
    let addRequest = foodObjectStore.add(food);

    if (!arraysMatch(Object.keys(food), FOOD_SCHEMA)) {
      reject("Invalid food structure.");
    }

    transaction.onerror = (event) => {
      reject(`Transaction error: ${transaction.error}`);
    };
    addRequest.onerror = (event) => {
      reject(`Add request error: ${addRequest.error}`);
    };

    addRequest.onsuccess = (event) => {
      transaction.oncomplete = (event) => {
        resolve(`${food.name} created`);
      };
    };
  });
}

function printAllFoods() {
  let transaction = databaseConnection.transaction(
    ["food"], "readonly");

  transaction.onerror = (event) => {
    console.error("printAllFoods: Transaction error.");
  };
  transaction.oncomplete = (event) => {
    console.log("printAllFoods: Transaction complete.");
  };

  let foodObjectStore = transaction.objectStore("food");
  let nameIndex = foodObjectStore.index("name");

  let getAllRequest = nameIndex.getAll();
  getAllRequest.onerror = (event) => {
    console.error("printAllFoods: getAllRequest error.");
  };
  getAllRequest.onsuccess = (event) => {
    console.log("printAllFoods: getAllRequest success.");
    console.log(getAllRequest.result);
  };
}

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    let openRequest = indexedDB.open(DATABASE_NAME, 1);

    openRequest.onerror = (event) => {
      reject(openRequest.error);
    };

    openRequest.onupgradeneeded = (event) => {
      createDatabase(openRequest.result);
    };

    openRequest.onsuccess = (event) => {
      resolve(openRequest.result);
    };
  });
}

function createDatabase(databaseConnection) {
  let foodObjectStore = databaseConnection.createObjectStore(
    "food", { "autoIncrement": true });

  foodObjectStore.createIndex("name", "name");
}

function deleteDatabase() {
  return new Promise((resolve, reject) => {
    let openRequest = indexedDB.deleteDatabase(DATABASE_NAME);

    openRequest.onerror = (event) => {
      reject(openRequest.error);
    };

    openRequest.onsuccess = (event) => {
      resolve(openRequest.result);
    };
  });
}

// XXX Bad name.
function arraysMatch(arrayOne, arrayTwo) {
  if (arrayOne.length !== arrayTwo.length) { return false; }

  for (let i = 0; i < arrayOne.length; i++) {
    if (!arrayTwo.includes(arrayOne[i])) { return false; }
  }

  return true;
}
