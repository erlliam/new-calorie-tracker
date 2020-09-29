function setTextTimeout(element, text, delay) {
  element.textContent = text;
  window.setTimeout(() => {
    element.textContent = null;
  }, delay);
}

// XXX Bad name.
function arraysMatchAnyOrder(arrayOne, arrayTwo) {
  if (arrayOne.length !== arrayTwo.length) { return false; }

  for (let i = 0; i < arrayOne.length; i++) {
    if (!arrayTwo.includes(arrayOne[i])) { return false; }
  }

  return true;
}

function handleSubmitEvent(form, callback) {
  if (form.tagName !== "FORM") {
    throw TypeError("form parameter is not a form.");
  } else if (typeof callback !== "function") {
    throw TypeError("callback parameter is not a function.");
  }

  form.onsubmit = (event) => {
    event.preventDefault();

    let values = Object.fromEntries(new FormData(form).entries());
    callback(values);
  }
}

function validDateString(dateString) {
  return !isNaN(Date.parse(dateString));
}

function getDateString(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
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

function numberOverZero(number) {
  return typeof number === "number" && number > 0;
}
