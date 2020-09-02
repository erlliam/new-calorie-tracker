const DATABASE_NAME = "Calorie Tracker";
const FOOD_SCHEMA = [ "name", "servingSize", "unit", "calories" ];

function rejectOnRequestOrTransactionError({ reject, request, transaction }) {
  request.onerror = () => { reject(request.error); };
  transaction.onerror = () => { reject(transaction.error); };
}

function resolveOnRequestAndTransactionFulfilled({ resolve, request, transaction }) {
  request.onsuccess = () => {
    transaction.oncomplete = () => {
      resolve(request.result);
    };
  };
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

function createFood({ databaseConnection, food }) {
  if (!validFoodObject(food)) {
    return Promise.reject(Error("invalid food object"));
  }

  return new Promise((resolve, reject) => {
    let transaction = databaseConnection.transaction(
      ["food"], "readwrite");
    let request = transaction.objectStore("food").add(food);

    rejectOnRequestOrTransactionError({reject: reject,
      request: request, transaction: transaction });

    resolveOnRequestAndTransactionFulfilled({resolve: resolve,
      request: request, transaction: transaction });
  });
}

function editFood({ databaseConnection, key, food }) {
  if (!validFoodObject(food)) {
    return Promise.reject(Error("invalid food object"));
  }

  return new Promise((resolve, reject) => {
    let transaction = databaseConnection.transaction(
      ["food"], "readwrite");
    let request = transaction.objectStore("food").put(food, key);

    rejectOnRequestOrTransactionError({reject: reject,
      transaction: transaction, request: request });

    resolveOnRequestAndTransactionFulfilled({resolve: resolve,
      request: request, transaction: transaction });
  });
}

function deleteFood({ databaseConnection, key }) {
  return new Promise((resolve, reject) => {
    let transaction = databaseConnection.transaction(
      ["food"], "readwrite");
    let request = transaction.objectStore("food").delete(key);

    rejectOnRequestOrTransactionError({reject: reject,
      transaction: transaction, request: request });

    resolveOnRequestAndTransactionFulfilled({resolve: resolve,
      request: request, transaction: transaction });
  });
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


function initializeDatabase() {
  return new Promise((resolve, reject) => {
    let openRequest = indexedDB.open(DATABASE_NAME, 1);

    openRequest.onerror = (event) => {
      reject(openRequest.error);
    };

    openRequest.onupgradeneeded = (event) => {
      configureDatabase(openRequest.result);
    };

    openRequest.onsuccess = (event) => {
      resolve(openRequest.result);
    };
  });
}

function configureDatabase(databaseConnection) {
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
