class Database {
  constructor({ name, version }) {
    this.ready = this._openDatabase({ name: name, version: version });
    this.food = new DatabaseFood(this);
    this.diary = new DatabaseDiary(this);
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
      "food", { autoIncrement: true });
    foodObjectStore.createIndex("name", "name");

    // XXX
    // Implement diary pages. Decide on the key.
    let diaryObjectStore = connection.createObjectStore(
      "diary", { keyPath: dateString });
  }

  _transact({ storeNames, mode }, callback) {
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

  transactReadWrite({ storeNames }, callback) {
    return this._transact({
      storeNames: storeNames,
      mode: "readwrite" },
      callback
    );
  }

  transactReadOnly({ storeNames }, callback) {
    return this._transact({
      storeNames: storeNames,
      mode: "readonly" },
      callback
    );
  }
}

class DatabaseFood {
  constructor(database) {
    this._database = database;
  }

  async create(food) {
    if (!validFoodObject(food)) {
      return Promise.reject(Error("invalid food object"));
    }

    await this._database.transactReadWrite({ storeNames: ["food"] },
      (stores) => {
        stores.food.add(food);
      }
    );
  }

  async edit({ key, newFood }) {
    if (!validFoodObject(newFood)) {
      return Promise.reject(Error("invalid food object"));
    }

    await this._database.transactReadWrite({ storeNames: ["food"] },
      (stores) => {
        stores.food.put(newFood, key);
      }
    );
  }

  async remove(key) {
    await this._database.transactReadWrite({ storeNames: ["food"] },
      (stores) => {
        stores.food.delete(key);
      }
    );
  }
}

let diaryExample = {
  dateString: "9/11/2020"
  foodKey: 2
}

function validDiary(diary) {
  if (!Date.parse(diary.dateString)) { return false };
  // find foodKey in food objectStore
  // prpoceed
  // XXX
  
}

class DatabaseDiary {
  constructor(database) {
    this._database = database;
  }

  async create(diary) {
    if (!validDiary(diary)) {
      return Promise.reject(Error("invalid food object"));
    }

    await this._database.transactReadWrite({ storeNames: ["food"] },
      (stores) => {
        stores.food.add(food);
      }
    );
  }

  async edit({ key, newFood }) {
    if (!validFoodObject(newFood)) {
      return Promise.reject(Error("invalid food object"));
    }

    await this._database.transactReadWrite({ storeNames: ["food"] },
      (stores) => {
        stores.food.put(newFood, key);
      }
    );
  }

  async remove(key) {
    await this._database.transactReadWrite({ storeNames: ["food"] },
      (stores) => {
        stores.food.delete(key);
      }
    );
  }
}


// XXX rewrite
/*

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

*/
function deleteDatabase() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.deleteDatabase(DATABASE_NAME);

    request.onerror = (event) => {
      reject(request.error);
    };

    request.onsuccess = (event) => {
      resolve();
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

const FOOD_SCHEMA = [ "name", "servingSize", "unit", "calories" ];

function validFoodObject(food) {
  if (!arraysMatchAnyOrder(Object.keys(food), FOOD_SCHEMA) ||
      !convertPropertyToNumber({ object: food, property: "servingSize" }) ||
      !convertPropertyToNumber({ object: food, property: "calories" })) {
    return false;
  }

  return true;
}

