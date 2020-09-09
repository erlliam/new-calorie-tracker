class HeaderDate {
  constructor({ date, textElement, backButton, forwardButton }) {
    this._date = date;
    this._textElement = textElement;
    this._backButton = backButton;
    this._forwardButton = forwardButton;

    this._init();
  }

  _init() {
    this._updateText();
    this._forwardButton.onclick = () => { this._changeDate(1); };
    this._backButton.onclick = () => { this._changeDate(-1); };
  }

  _updateText() {
    this._textElement.textContent = this._date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  _changeDate(amount) {
    let time = this._date.getTime();
    this._date.setTime(time + amount * (1000 * 60 * 60 * 24));
    this._updateText();
  }
}

class AddToDiaryButtons {
  constructor({ cssClass, elementButtonArray }) {
    this._currentlyToggled = null;
    this._cssClass = cssClass

    for (let elementButton of elementButtonArray) {
      elementButton.button.onclick = () => {
        this._onclick({
          element: elementButton.element,
          button: elementButton.button
        });
      };
    }
  }

  _open(element) {
    element.classList.toggle(this._cssClass);
    // XXX decide on desired behavior
    // window.scrollTo(0, element.offsetTop);
    this._currentlyToggled = element;
  }

  _close() {
    this._currentlyToggled.classList.toggle(this._cssClass);
    this._currentlyToggled = null;
    
  };

  _onclick({ button, element }) {
    if (this._currentlyToggled === null) {
      this._open(element);
    } else {
      if (this._currentlyToggled === element) {
        this._close()
      } else {
        this._close();
        this._open(element);
      }
    }
  }
}

