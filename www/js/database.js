"use strict";

// XXX refactor
// create/edit/remove functions seem to be identical.
// The only differences are the storeNames used and the
// input validation.
// XXX
// We can call that function objectStoreInputValidation

class Database {
  constructor({ name, version }) {
    this.ready = this._openDatabase({ name: name, version: version });
    this.food = new DatabaseFood(this);
    this.diary = new DatabaseDiary(this);
  }

  _openDatabase({ name, version }) {
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(name, version);

      request.addEventListener("error", (_event) => {
        reject(request.error);
      });

      request.addEventListener("blocked", (_event) => {
        console.warn("indexedDB.open blocked");
      });

      request.addEventListener("success", (_event) => {
        this._connection = request.result;
        resolve();
      });

      request.addEventListener("upgradeneeded", (_event) => {
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

      transaction.addEventListener("error", (_event) => {
        reject(transaction.error);
      });

      transaction.addEventListener("complete", (_event) => {
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
        mode: "readwrite"
      },
      callback
    );
  }

  transactReadOnly({ storeNames }, callback) {
    return this._transact({
        storeNames: storeNames,
        mode: "readonly"
      },
      callback
    );
  }
}

class DatabaseFood {
  constructor(database) {
    this._database = database;
  }

  _dataValidator(data) {
    return data !== undefined &&
      typeof data.name === "string" &&
      numberOverZero(data.servingSize) &&
      numberOverZero(data.calories);
  }

  async create(data) {
    if (!this._dataValidator(data)) {
      throw TypeError("invalid food object");
    }

    await this._database.transactReadWrite({ storeNames: ["food"] },
      (stores) => {
        stores.food.add(data);
      }
    );
  }

  async edit({ key, data }) {
    if (!this._dataValidator(data)) {
      throw TypeError("invalid food object");
    }

    await this._database.transactReadWrite({ storeNames: ["food"] },
      (stores) => {
        stores.food.put(data, key);
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

  async query({ key }) {
    let resolveResult;
    let result = new Promise((resolve) => { resolveResult = resolve; });

    await this._database.transactReadOnly({ storeNames: ["food"] },
      (stores) => {
        let request = stores.food.get(key);

        request.addEventListener("success", (_event) => {
          resolveResult(request.result);
        });
      }
    );
    return await result;
  }

  async search({ query }) {
    let resolveResult;
    let result = new Promise((resolve) => { resolveResult = resolve; });

    await this._database.transactReadOnly({ storeNames: ["food"] },
      (stores) => {
        let index = stores.food.index("name");
        let request = index.getAll(query);

        request.addEventListener("success", (_event) => {
          resolveResult(request.result);
        });
      }
    );

    return await result;
  }

  async exists({ key }) {
    return await this.query({ key: key }) !== undefined;
  }
}

class DatabaseDiary {
  constructor(database) {
    this._database = database;
  }

  async _dataValidator(data) {
    return data !== undefined &&
      validDateString(data.dateString) &&
      numberOverZero(data.servingSize) &&
      await this._database.food.exists(data.foodKey);
  }

  async create(data) {
    if (!(await this._dataValidator(data))) {
      throw TypeError("invalid diary entry");
    }

    await this._database.transactReadWrite({ storeNames: ["diary"] },
      (stores) => {
        stores.diary.add(data);
      }
    );
  }

  async addCalories(data) {
    if (!validDateString(data.dateString) || typeof data.calories !== "number") {
      throw TypeError("invalid calorie entry");
    }

    await this._database.transactReadWrite({ storeNames: ["diary"] },
      (stores) => {
        stores.diary.add(data);
      }
    );
  }

  async edit({ key, data }) {
    if (!(await this._dataValidator(data))) {
      throw TypeError("invalid diary entry");
    }

    await this._database.transactReadWrite({ storeNames: ["diary"] },
      (stores) => {
        stores.diary.put(data, key);
      }
    );
  }

  async remove(key) {
    await this._database.transactReadWrite({ storeNames: ["diary"] },
      (stores) => {
        stores.diary.delete(key);
      }
    );
  }

  async query({ dateString }) {
    if (!validDateString(dateString)) {
      throw TypeError("invalid date string");
    }

    let resolveResult;
    let result = new Promise((resolve) => { resolveResult = resolve; });

    await this._database.transactReadOnly({ storeNames: ["diary"] },
      (stores) => {
        let index = stores.diary.index("dateString");
        let request = index.openCursor(dateString);

        let entriesArray = [];

        request.addEventListener("success", (_event) => {
          let cursor = request.result;
          if (cursor) {
            entriesArray.push({ key: cursor.primaryKey, values: cursor.value });
            cursor.continue();
          } else {
            resolveResult(entriesArray);
          }
        });
      }
    );
    return await result;
  }
}

function deleteDatabase() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.deleteDatabase(DATABASE_NAME);

    request.onerror = (_event) => {
      reject(request.error);
    };

    request.onsuccess = (_event) => {
      resolve();
    };
  });
}
