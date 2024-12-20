/**
 * UI module
 *
 * Adds listeners to DOM elements, and helpers for updating their state
 */
import * as localeMgr from './localeManager.js';
import {getOptionsForMeasure} from './app.js'
var collectorCollectionName = '';

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className);
  else
    el.className += ' ' + className;
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className);
  else
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className);
  else
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}

function disableButtons() {
  setRunButton(false);
  disable("add-variable");
  disable("remove-variable");
  disable("add-variable-series");
  disable("sample_size");
  disable("repeat");
  disable("reset");
  enable("stop");
}

function enableButtons() {
  setRunButton(true);
  enable("add-variable");
  enable("remove-variable");
  enable("add-variable-series");
  enable("sample_size");
  enable("repeat");
  enable("reset");
  disable("stop");
}

function disable(classNameOrEl) {
  if (typeof classNameOrEl === "string")
    classNameOrEl = document.getElementById(classNameOrEl);
  addClass(classNameOrEl, "disabled");
  if (classNameOrEl.tagName === "INPUT" || classNameOrEl.tagName === "BUTTON") {
    classNameOrEl.setAttribute("disabled", "disabled");
  }
}

function enable(classNameOrEl) {
  if (typeof classNameOrEl === "string")
    classNameOrEl = document.getElementById(classNameOrEl);
  removeClass(classNameOrEl, "disabled");
  if (classNameOrEl.tagName === "INPUT" || classNameOrEl.tagName === "BUTTON") {
    classNameOrEl.removeAttribute("disabled");
  }
}

function setRunButton(showRun) {
  if (showRun) {
    document.getElementById("run").innerHTML = localeMgr.tr("DG.plugin.Sampler.top-bar.run");
  } else {
    document.getElementById("run").innerHTML = localeMgr.tr("DG.plugin.Sampler.top-bar.pause");
  }
}

function setRunButtonMode(enabled) {
  if (enabled) {
    enable("run");
  } else {
    disable("run");
  }
}

// Shows the element if no boolean is passed as the second argument.
// If a bool is passed, this will either show or hide.
function show(el, show) {
  if (show === undefined) {
    show = true;
  }
  if (show) {
    removeClass(el, "hidden");
  } else {
    addClass(el, "hidden");
  }
}

function hide(el) {
  addClass(el, "hidden");
}

function renderVariableControls(device) {
  if (device !== "collector") {
    show(document.getElementById("add-variable"));
    show(document.getElementById("remove-variable"));
    show(document.getElementById("add-variable-series"));
    hide(document.getElementById("select-collection"));
  } else {
    hide(document.getElementById("add-variable"));
    hide(document.getElementById("remove-variable"));
    hide(document.getElementById("add-variable-series"));
    show(document.getElementById("select-collection"));
  }
}

function populateContextsList(caseVariables, view, codapCom, localeMgr) {
  return function (collections) {
    var sel = document.getElementById("select-collection");
    sel.innerHTML = "";
    collections.forEach(function (col) {
      if (col.name !== 'Sampler')
        sel.innerHTML += '<option value="' + col.name + '">' + col.title + "</option>";
    });

    if (!sel.innerHTML) {
      sel.innerHTML += "<option>" +
          localeMgr.tr("DG.plugin.sampler.collector.noDatasets") + "</option>";
      sel.setAttribute("disabled", "disabled");
      return;
    } else {
      sel.removeAttribute("disabled");
    }

    function setVariablesAndRender(vars) {
      // Never append. Always start from scratch
      caseVariables.length = 0;
      caseVariables.push.apply(caseVariables, vars);
      view.render();
    }

    if (sel.childNodes.length === 1) {
      collectorCollectionName = sel.childNodes[0].value;
      codapCom.setCasesFromContext(collectorCollectionName, caseVariables)
        .then(setVariablesAndRender);
      codapCom.logAction('chooseCollection: %@ (auto)', sel.childNodes[0].value);
    } else {
      sel.innerHTML = "<option>Select a data set</option>" + sel.innerHTML;
      setVariablesAndRender([]);  // empty out mixer
      sel.onchange = function(evt) {
        if(evt.target.value) {
          collectorCollectionName = evt.target.value;
          codapCom.setCasesFromContext(collectorCollectionName).then(setVariablesAndRender);
          codapCom.logAction('chooseCollection: %@', evt.target.value);
        }
      };
    }
  };
}

function getCollectorCollectionName() {
  return collectorCollectionName;
}

function toggleDevice(oldDevice, newDevice) {
  removeClass(document.getElementById(oldDevice), "active");
  addClass(document.getElementById(newDevice), "active");
}


function updateSelectOptions() {
  const selectedMeasure = document.getElementById("select-measure").value;
  removeSelectOptions([selectedMeasure]);
  getOptionsForMeasure(selectedMeasure);
}

function removeChildren (node) {
  if (node) {
    [...node.childNodes].forEach(c => c.remove());
  }
};

function removeSelectOptions (measures) {
  measures.forEach((m) => {
    removeChildren(document.getElementById(`${m}-select-attribute`));
    removeChildren(document.getElementById(`${m}-select-operator`));
    removeChildren(document.getElementById(`${m}-select-value`));
    removeChildren(document.getElementById(`${m}-select-attribute-2`));
    removeChildren(document.getElementById(`${m}-select-value-2`));
    removeChildren(document.getElementById(`${m}-select-attribute-pt-1`));
    removeChildren(document.getElementById(`${m}-select-operator-pt-1`));
    removeChildren(document.getElementById(`${m}-select-attribute-pt-1-2`));
    removeChildren(document.getElementById(`${m}-select-value-pt-1`));
    removeChildren(document.getElementById(`${m}-select-attribute-pt-2`));
    removeChildren(document.getElementById(`${m}-select-operator-pt-2`));
    removeChildren(document.getElementById(`${m}-select-attribute-pt-2-2`));
    removeChildren(document.getElementById(`${m}-select-value-pt-2`));
  });
}

function removeAllSelectOptions() {
  const allMeasures = document.getElementById("select-measure").children;
  removeSelectOptions([...allMeasures].map(m => m.id));
}

function viewSampler() {
  addClass(document.getElementById("tab-devices"), "active");
  removeClass(document.getElementById("tab-measures"), "active");
  removeClass(document.getElementById("tab-options"), "active");
  removeClass(document.getElementById("tab-about"), "active");
  show(document.getElementById("sampler"));
  hide(document.getElementById("measures"));
  hide(document.getElementById("options"));
  hide(document.getElementById("about-panel"));
  removeAllSelectOptions();
}

function viewMeasures() {
  removeAllSelectOptions();
  removeClass(document.getElementById("tab-devices"), "active");
  addClass(document.getElementById("tab-measures"), "active");
  removeClass(document.getElementById("tab-options"), "active");
  removeClass(document.getElementById("tab-about"), "active");
  hide(document.getElementById("sampler"));
  show(document.getElementById("measures"));
  hide(document.getElementById("options"));
  hide(document.getElementById("password-failed"));
  hide(document.getElementById("about-panel"));
}

function viewOptions() {
  removeClass(document.getElementById("tab-devices"), "active");
  removeClass(document.getElementById("tab-measures"), "active");
  addClass(document.getElementById("tab-options"), "active");
  removeClass(document.getElementById("tab-about"), "active");
  hide(document.getElementById("sampler"));
  hide(document.getElementById("measures"));
  show(document.getElementById("options"));
  hide(document.getElementById("password-failed"));
  hide(document.getElementById("about-panel"));
  removeAllSelectOptions();
}

function viewAbout() {
  removeClass(document.getElementById("tab-devices"), "active");
  removeClass(document.getElementById("tab-measures"), "active");
  removeClass(document.getElementById("tab-options"), "active");
  addClass(document.getElementById("tab-about"), "active");
  hide(document.getElementById("sampler"));
  hide(document.getElementById("measures"));
  hide(document.getElementById("options"));
  hide(document.getElementById("password-failed"));
  show(document.getElementById("about-panel"));
  removeAllSelectOptions();
}

function hideModel(hidden) {
  document.getElementById("hideModel").checked = hidden;

  var mixerCover = document.getElementById("model-cover");
  var spinnerCover = document.getElementById("spinner-cover");
  var mixerButton = document.getElementById("mixer");
  var spinnerButton = document.getElementById("spinner");
  var collectorButton = document.getElementById("collector");
  var withReplacement = document.getElementById("with-replacement").checked;
  var device = hasClass(mixerButton, "active") ? "mixer" :
      (hasClass(spinnerButton, "active") ? "spinner" : "collector");
  if (hidden) {
    if(device === "mixer") {
      show(mixerCover);
      hide(spinnerCover);
    }
    else {
      show(spinnerCover);
      hide(mixerCover);
    }
    if (!hasClass(mixerButton, "active"))
      disable(mixerButton);
    if (!hasClass(spinnerButton, "active"))
      disable(spinnerButton);
    if (!hasClass(collectorButton, "active"))
      disable(collectorButton);
    show(document.getElementById("password-area"));
  } else {
    hide(mixerCover);
    hide(spinnerCover);
    enable(mixerButton);
    enable(spinnerButton);
    enable(collectorButton);
    hide(document.getElementById("password-area"));
  }
  setReplacement( withReplacement, device, hidden);
}

function lockOptions(lock) {
  var passwordField = document.getElementById("password");
  show(document.getElementById('pass-text-lock'), !lock)
  show(document.getElementById('pass-text-unlock'), lock)
  show(document.getElementById('pass-lock'), !lock)
  show(document.getElementById('pass-unlock'), lock)
  if (lock) {
    passwordField.value = "";
    passwordField.type = "password";
    disable("hide-options");
    disable("hideModel");
    disable("reload-settings");
  } else {
    passwordField.value = "";
    passwordField.type = "text";
    enable("hide-options");
    enable("hideModel");
    enable("reload-settings");
  }
}

function setReplacement(withReplacement, device, hidden) {

  function setReplacementUI( enabled) {
    if( enabled) {
      enable("selection-options");
      enable("with-replacement");
      enable("without-replacement");
    }
    else {
      disable("selection-options");
      disable("with-replacement");
      disable("without-replacement");
    }
  }

  if (device !== "spinner") {
    setReplacementUI( !hidden);
    if (withReplacement) {
      document.getElementById("with-replacement").checked = true;
    } else {
      document.getElementById("without-replacement").checked = true;
    }
  } else {
    document.getElementById("with-replacement").checked = true;
    setReplacementUI( false);
  }
}

function updateUIDeviceName (name) {
  document.getElementById("device_name").value = name;
  if (document.getElementById("select-measure").value) {
    updateSelectOptions();
  }
}

function appendUIHandlers(addVariable, removeVariable, addVariableSeries, runButtonPressed,
          stopButtonPressed, resetButtonPressed, switchState, setSampleSize,
          setNumRuns, setDeviceName, setSpeed, view, setVariableName, setPercentage, setReplacement, setHidden,
          setOrCheckPassword, reloadDefaultSettings, becomeSelected, sendFormulaToCodap,
          setMeasureName, getRunNumber) {
  document.getElementById("add-variable").onclick = addVariable;
  document.getElementById("remove-variable").onclick = removeVariable;
  document.getElementById("add-variable-series").onclick = addVariableSeries;
  document.getElementById("run").onclick = runButtonPressed;
  document.getElementById("stop").onclick = stopButtonPressed;
  document.getElementById("reset").onclick = resetButtonPressed;
  document.getElementById("mixer").onclick = (e) => {
    removeClass(document.getElementById("model"), "spinner");
    switchState(e, "mixer")
  };
  document.getElementById("spinner").onclick = (e) => {
    addClass(document.getElementById("model"), "spinner");
    switchState(e, "spinner");
  };
  document.getElementById("collector").onclick = (e) => {
    removeClass(document.getElementById("model"), "mixer");
    switchState(e, "collector")
  };
  document.getElementById("sample_size").addEventListener('input', function (evt) {
    setSampleSize(this.value);
  });
  document.getElementById("repeat").addEventListener("input", function (evt) {
    setNumRuns(this.value);
  });

  document.getElementById("speed").addEventListener('input', function (evt) {
    var val = (this.value * 1),
        speed = val || 0.5;
    document.getElementById("speed-text").innerHTML = view.getSpeedText(val);
    setSpeed(speed);
  });

  let keyPressed = false;

  document.getElementById("device_name").addEventListener("blur", function (e) {
    setDeviceName(e.target.value);
  });

  document.getElementById("device_name").addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
      this.blur(e);
    }
  });

  document.getElementById("variable-name-change").addEventListener("blur", (e) => {
    document.getElementById("variable-name-change").style.display = "none";
    // don't do anything if blur event was triggered by user pressing 'enter' or 'tab' keys
    if (keyPressed) {
      keyPressed = false;
      return;
    } else {
      setVariableName(e.target);
    }
  });

  document.getElementById("variable-percentage-change").addEventListener("blur", (e) => {
    document.getElementById("variable-percentage-change").style.display = "none";
    if (keyPressed) {
      keyPressed = false;
      return;
    } else {
      setPercentage(null, null, null, e.target);
    }
  });

  document.getElementById("variable-name-change").addEventListener("keydown", (e) => {
    if (e.keyCode === 9) {
      keyPressed = true;
      e.preventDefault();
      setVariableName();
      view.render();
      document.getElementById("variable-name-change").style.display = "none";
      view.showPercentInputForUI(e.target.value);
    }
    if (e.keyCode === 13) {
      keyPressed = true;
      setVariableName();
      view.render();
      return false;
    }
  });

  document.getElementById("variable-percentage-change").addEventListener("keydown", (e) => {
    if (e.keyCode === 9) {
      keyPressed = true;
      e.preventDefault();
      setPercentage();
      view.render();
      document.getElementById("variable-percentage-change").style.display = "none";
      view.showVariableNameInputForUI(e.target.className);
    }
    if (e.keyCode === 13) {
      keyPressed = true;
      setPercentage();
      view.render();
      return false;
    }
  });

  document.getElementById("tab-devices").onclick = viewSampler;
  document.getElementById("tab-options").onclick = viewOptions;
  document.getElementById("tab-measures").onclick = () => {
    viewMeasures();
    // re-populate select options if there is a selected measure
    if (document.getElementById('select-measure').value) {
      getOptionsForMeasure(document.getElementById('select-measure').value);
      // enable add run button if measure is selected and data table exists
      if (getRunNumber() > 0) {
        removeClass(document.getElementById("add-measure"), "disabled");
      }
    }
  };
  document.getElementById("tab-about").onclick = viewAbout;

  document.getElementById("with-replacement").onclick = function(evt) {
    setReplacement(evt.currentTarget.checked);
  };
  document.getElementById("without-replacement").onclick = function(evt) {
    setReplacement(!evt.currentTarget.checked);
  };

  document.getElementById("hideModel").onclick = function(evt) {
    var hidden = evt.currentTarget.checked;
    setHidden(hidden);
    hideModel(hidden);
  };

  var passwordField = document.getElementById("password");
  passwordField.onclick = function(evt) {
    passwordField.value = "";
    passwordField.type = "text";
  };
  document.getElementById("pass-lock").onclick = function() {
    var password = document.getElementById("password").value;
    if (password.length > 0) {
      setOrCheckPassword(password);
    }
  };
  document.getElementById("pass-unlock").onclick = function() {
    var password = document.getElementById("password").value;
    if (password.length > 0) {
      setOrCheckPassword(password);
    }
  };
  document.getElementById("reload-settings").onclick = function() {
    reloadDefaultSettings();
    viewSampler();
  };

  document.querySelector('body').addEventListener('click',
      becomeSelected, {capture:true});

  document.getElementById("select-measure").addEventListener("change", (e) => {
    // find the select formula container for that measure and display it
    const measure = e.target.value;
    if (measure) {

      // only enable add run button if measure is selected and data table exists
      if (getRunNumber() > 0) {
        removeClass(document.getElementById("add-measure"), "disabled");
      }

      const containerId = `${measure}-formula-container`;
      const measureContainer = document.getElementById(containerId);
      removeClass(measureContainer, "hidden");

      // hide any other open measures
      const allMeasureContainers = document.getElementsByClassName("formula");
      const filteredMeasureContainers = [...allMeasureContainers].filter((m) => m.id !== containerId && !m.classList.contains("hidden"));
      filteredMeasureContainers.forEach((m) => addClass(m, "hidden"));

      // also remove select options for other measures
      const allMeasures = document.getElementById("select-measure").children;
      const filteredMeasures = [...allMeasures].map(m => m.id).filter(id => id !== measure && id.length > 0);
      removeSelectOptions(filteredMeasures);

      // add options to select element
      getOptionsForMeasure(measure, measureContainer);
    }
  })

  document.getElementById("add-measure").addEventListener("click", () => {
    const measure = document.getElementById("select-measure").value;
    if (measure === "sum" || measure === "mean" || measure === "median") {
      const selectedOutput = document.getElementById(`${measure}-select-attribute`).value;
      sendFormulaToCodap(measure, {output: selectedOutput});
    } else if (measure === "count" || measure === "percent") {
      const output = document.getElementById(`${measure}-select-attribute`).value;
      const operator = document.getElementById(`${measure}-select-operator`).value;
      const value = document.getElementById(`${measure}-select-value`).value;
      sendFormulaToCodap(measure, {output, operator, value});
    } else if (measure === "conditional_sum" || measure === "conditional_mean" || measure === "conditional_median") {
      const output = document.getElementById(`${measure}-select-attribute`).value;
      const operator = document.getElementById(`${measure}-select-operator`).value;
      const value = document.getElementById(`${measure}-select-value`).value;
      const output2 = document.getElementById(`${measure}-select-attribute-2`).value;
      sendFormulaToCodap(measure, {output, operator, value, output2});
    } else if (measure === "difference_of_means" || measure === "difference_of_medians") {
      const outputPt1 = document.getElementById(`${measure}-select-attribute-pt-1`).value;
      const outputPt12 = document.getElementById(`${measure}-select-attribute-pt-1-2`).value;
      const operatorPt1 = document.getElementById(`${measure}-select-operator-pt-1`).value;
      const valuePt1 = document.getElementById(`${measure}-select-value-pt-1`).value;
      const outputPt2 = document.getElementById(`${measure}-select-attribute-pt-2`).value;
      const outputPt22 = document.getElementById(`${measure}-select-attribute-pt-2-2`).value;
      const operatorPt2 = document.getElementById(`${measure}-select-operator-pt-2`).value;
      const valuePt2 = document.getElementById(`${measure}-select-value-pt-2`).value;
      sendFormulaToCodap(measure, {outputPt1, outputPt12, operatorPt1, valuePt1, outputPt2, outputPt22, operatorPt2, valuePt2});
    }
  });

  document.getElementById("measure-name").addEventListener("input", (e) => {
    setMeasureName(e.target.value);
  })
}

// Sets up the UI elements based on the loaded state of the model
function render(hidden, password, passwordFailed, withReplacement, device) {
  hideModel(hidden);
  var isLocked = !!password;
  lockOptions(isLocked);
  show(document.getElementById("password-failed"), passwordFailed);
  setReplacement(withReplacement, device, hidden);
}

export {
  getCollectorCollectionName,
  appendUIHandlers,
  enableButtons,
  disableButtons,
  enable,
  disable,
  setRunButton,
  toggleDevice,
  renderVariableControls,
  populateContextsList,
  setRunButtonMode,
  render,
  updateUIDeviceName
};
