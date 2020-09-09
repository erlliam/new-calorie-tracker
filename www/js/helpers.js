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

function handleSubmitEvent({ form, callback }) {
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

