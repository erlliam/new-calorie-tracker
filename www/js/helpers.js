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
