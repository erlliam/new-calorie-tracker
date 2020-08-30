const DATABASE_NAME = "Calorie Tracker";
const FOOD_SCHEMA = [ "name", "servingSize", "unit", "calories" ];

function rejectOnRequestOrTransactionError({
  reject,
  request,
  transaction
}) {
  request.onerror = () => { reject(request.error); };
  transaction.onerror = () => { reject(transaction.error); };
}

function resolveOnRequestAndTransactionFulfilled({
  resolve,
  request,
  transaction
}) {
  request.onsuccess = () => {
    transaction.oncomplete = () => {
      resolve();
    };
  };
}

function createFood(databaseConnection, food) {
  if (!arraysMatchAnyOrder(Object.keys(food), FOOD_SCHEMA)) {
    return Promise.reject(Error("food keys don't match schema"));
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

function deleteFood(databaseConnection, key) {
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
