const DATABASE_NAME = "Calorie Tracker";
const FOOD_SCHEMA = [ "name", "servingSize", "unit", "calories" ];

class Database {
  constructor({ name, version }) {
    this.ready = this._openDatabase({ name: name, version: version });
    // this.food = new DatabaseFood(this._connection);
    // this.diary = new DatabaseDiary(this._connection);
  }

  _openDatabase({ name, version }) {
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(name, version);

      request.addEventListener("error", (event) => {
        reject(request.error);
      });

      request.addEventListener("blocked", (event) => {
        console.warn("indexedDB.open blocked");
      });

      request.addEventListener("success", (event) => {
        this._connection = request.result;
        resolve();
      });

      request.addEventListener("upgradeneeded", (event) => {
        let connection = request.result
        this._createDatabase(connection);
      });
    });
  }

  _createDatabase(connection) {
    let foodObjectStore = connection.createObjectStore(
      "food", { "autoIncrement": true });
    foodObjectStore.createIndex("name", "name");

    // XXX
    // Implement diary pages. Decide on the key.
    let diaryObjectStore = connection.createObjectStore(
      "diary", { "autoIncrement": true });
  }

  _transact({ storeNames, mode, callback }) {
    return new Promise((resolve, reject) => {
      let transaction = this._connection.transaction(
        storeNames, mode);

      transaction.addEventListener("error", (event) => {
        reject(event.target.error);
      });

      transaction.addEventListener("complete", (event) => {
        resolve();
      });

      let stores = {};
      for (let storeName of storeNames) {
        stores[storeName] = transaction.objectStore(storeName);
      }

      callback(stores);
    });
  }

  async createFood(food) {
    if (!validFoodObject(food)) {
      return Promise.reject(Error("invalid food object"));
    }

    await this._transact({
      storeNames: ["food"], mode: "readwrite", callback: (stores) => {
        stores.food.add(food);
      }
    });
  }

  async editFood({ key, newFood }) {
    if (!validFoodObject(newFood)) {
      return Promise.reject(Error("invalid food object"));
    }

    await this._transact({
      storeNames: ["food"], mode: "readwrite", callback: (stores) => {
        stores.food.put(newFood, key);
      }
    });
  }

  async deleteFood(key) {
    await this._transact({
      storeNames: ["food"], mode: "readwrite", callback: (stores) => {
        stores.food.delete(key);
      }
    });
  }
}

(async () => {
  let database = new Database({ name: DATABASE_NAME });
  await database.ready;

  let food = { name: "create test", servingSize: 1, unit: "g", calories: 1 };
  
  await database.createFood(food);
  await database.editFood({ key: 1, newFood: {
    name: "edit test",
    servingSize: 1,
    unit: "g",
    calories: 1
  }});

  let promiseArray = [];
  for (let i = 0; i <= 9; i++) {
    promiseArray.push(database.deleteFood(i));
  }

  await Promise.all(promiseArray);
  console.log("All foods deleted.");
})();

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

function convertPropertyToNumber({ object, property }) {
  let value = object[property];
  if (typeof value === "number") return true;

  let number = Number(value);
  if (isNaN(number)) return false;

  object[property] = number;
  return true;
}

function validFoodObject(food) {
  if (!arraysMatchAnyOrder(Object.keys(food), FOOD_SCHEMA) ||
      !convertPropertyToNumber({ object: food, property: "servingSize" }) ||
      !convertPropertyToNumber({ object: food, property: "calories" })) {
    return false;
  }

  return true;
}

// XXX should I use a cursor here?
// perhaps we are better off doing two requests?
function queryFood({ databaseConnection, query }) {
  return new Promise((resolve, reject) => {
    let transaction = databaseConnection.transaction(
      ["food"], "readonly");
    let index = transaction.objectStore("food").index("name");
    let request = index.openCursor(query);

    rejectOnRequestOrTransactionError({reject: reject,
      transaction: transaction, request: request });

    let array = [];

    request.onsuccess = () => {
      let cursor = request.result;
      if (cursor) {
        array.push({
          primaryKey: cursor.primaryKey,
          value: cursor.value
        });

        cursor.continue();
      } else {
        transaction.oncomplete = () => { resolve(array); };
      }
    };
  });
}

function getFoodsInRange({ databaseConnection, startingKey, count }) {
  return new Promise((resolve, reject) => {
    let transaction = databaseConnection.transaction(
      ["food"], "readonly");
    let request = transaction.objectStore("food").openCursor(
      IDBKeyRange.lowerBound(startingKey));

    rejectOnRequestOrTransactionError({reject: reject,
      transaction: transaction, request: request });

    let array = [];
    let index = 0;

    request.onsuccess = () => {
      let cursor = request.result;
      if (cursor && index < count) {
        index += 1;
        array.push({
          primaryKey: cursor.primaryKey,
          value: cursor.value
        });

        cursor.continue();
      } else {
        transaction.oncomplete = () => { resolve(array); };
      }
    };
  });
}

function displayAllFoods(databaseConnection, table) {
  let tableBody = table.querySelector("tbody");
  let transaction = databaseConnection.transaction(
    ["food"], "readonly");
  let foodObjectStore = transaction.objectStore("food");

  let cursorRequest = foodObjectStore.openCursor();
  cursorRequest.onsuccess = (event) => {
    let cursor = cursorRequest.result;
    if (cursor) {
      let row = document.createElement("tr");
      row.setAttribute("data-id", cursor.primaryKey);

      let tdName = document.createElement("td");
      tdName.textContent = cursor.value.name;

      let tdServingSize = document.createElement("td");
      tdServingSize.textContent =
        `${cursor.value.servingSize} ${cursor.value.unit}`;

      let tdCalories = document.createElement("td");
      tdCalories.textContent = cursor.value.calories;
      
      let tdButtons = document.createElement("td");
      tdButtons.innerHTML =
        `<button>Add to diary</button>
        <button>Edit</button>
        <button>Delete</button>`;

      row.appendChild(tdName);
      row.appendChild(tdServingSize);
      row.appendChild(tdCalories);
      row.appendChild(tdButtons);
      tableBody.appendChild(row);

      cursor.continue();
    }
  };
}
