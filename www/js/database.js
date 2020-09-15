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
        let connection = request.result;
        this._createDatabase(connection);
      });
    });
  }

  _createDatabase(connection) {
    let foodObjectStore = connection.createObjectStore(
      "food", { autoIncrement: true });
    foodObjectStore.createIndex("name", "name");

    let diaryObjectStore = connection.createObjectStore(
      "diary", { autoIncrement: true });
    diaryObjectStore.createIndex("dateString", "dateString");
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
      throw Error("invalid food object");
    }

    await this._database.transactReadWrite({ storeNames: ["food"] },
      (stores) => {
        stores.food.add(food);
      }
    );
  }

  async edit({ key, newFood }) {
    if (!validFoodObject(newFood)) {
      throw Error("invalid food object");
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

  async exists(key) {
    let requestPromiseResolve;
    let requestPromise = new Promise((resolve) => {
      requestPromiseResolve = resolve;
    });

    await this._database.transactReadOnly({ storeNames: ["food"] },
      (stores) => {
        let request = stores.food.getKey(key);

        request.addEventListener("success", (event) => {
          requestPromiseResolve(request.result);
        });
      }
    );

    let result = await requestPromise;

    return result !== undefined;
  }
}

// XXX
// Make use of this function in the validDate checker
function validDateString(dateString) {
  return !isNaN(Date.parse(dateString));
}

// XXX refactor
// create/edit/remove functions seem to be identical.
// The only differences are the storeNames used and the
// input validation.
// XXX
// We can call that function objectStoreInputValidation

class DatabaseDiary {
  constructor(database) {
    this._database = database;
  }

  async _dataValidator(data) {
    // dateString: string, foodKey: number, servingSize: number
    let validDateString = !isNaN(Date.parse(data.dateString));

    return validDateString &&
      typeof data.servingSize === "number" &&
      data.servingSize > 0 &&
      await this._database.food.exists(data.foodKey);
  }

  async create(diary) {
    if (!(await this._dataValidator(diary))) {
      throw Error("invalid diary entry");
    }

    await this._database.transactReadWrite({ storeNames: ["diary"] },
      (stores) => {
        stores.diary.add(diary);
      }
    );
  }

  async edit({ key, newFood }) {
  }

  async remove(key) {
  }

  async query({ dateString }) {
    if (!validDateString(dateString)) {
      throw Error("invalid date string");
    }

    let resolveResult;
    let result = new Promise((resolve) => {
      resolveResult = resolve;
    });

    await this._database.transactReadOnly({ storeNames: ["diary"] },
      (stores) => {
        let index = stores.diary.index("dateString");
        let request = index.getAll(dateString);

        request.addEventListener("success", (event) => {
          resolveResult(request.result);
        });
      }
    );

    return await result;
  }
}

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
  return arraysMatchAnyOrder(Object.keys(food), FOOD_SCHEMA) &&
    convertPropertyToNumber({ object: food, property: "servingSize" }) &&
    convertPropertyToNumber({ object: food, property: "calories" });
}
