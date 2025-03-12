//*********************function definition*****************
const getColorFromCss = (colorName) => {
  var r = document.querySelector(':root');
  var rs = getComputedStyle(r);
  return rs.getPropertyValue(colorName);
}

const updateProgressBar = (bar1, bar2, label, actNmbr, totalNmbr) => {
  //calculate percentage of repeating
  const rep1Percent = (actNmbr / totalNmbr) * 100;
  const rep2Percent = 100 - rep1Percent;

  bar1.style.width = `${rep1Percent}%`;
  bar2.style.width = `${rep2Percent}%`;
  label.innerText = actNmbr;
};

//preparation of run
const preRun = () => {
  startButton.disabled = true; //to prevent accidental multiple pressing

  let k = 4; //4 sec to start the excercise
  let promise = new Promise(function(resolve) {
    const preInterval = setInterval(() => {
        k--;
        statusLabel.innerText = k;
        playSound(k);
        if(k <= 0){
            clearInterval(preInterval);
            resolve();
        }
    }, 1000);
  });

  return promise;
};

const playSound = (time) => {
  if(time == 0){
    startSound.play();
  }else if(time <= 3){
    countDownSound.play();
  }
}

//running the excerscise timing
const run = async() => {
  switchToRunning();
  startButton.disabled = false; //once running, enable pressing start button again to allow pause etc.


  let promise = new Promise(function(resolve, reject) {
    const interval = setInterval(() => {
      if(state === 'paused'){ //when pause is required
        clearInterval(interval);
        reject();
      }
      if(state2 == 'load'){       //load state
        if(loadActualSec == 0){
          switchToLoad();
        }
        loadActualSec++;
        playSound(loadTotalSec - loadActualSec);
        updateProgressBar(progressLoad1, progressLoad2, progressLoadLabel, loadActualSec, loadTotalSec);
        if(loadActualSec == loadTotalSec && actualNmbrOfRepeat < nmbrOfRepeat -1){
          actualNmbrOfRepeat++;
          updateProgressBar(progressRepeat1, progressRepeat2, progressRepLabel, actualNmbrOfRepeat, nmbrOfRepeat);
          switchToRest();
        } else if(loadActualSec == loadTotalSec && actualNmbrOfRepeat == nmbrOfRepeat -1 ){
          updateProgressBar(progressRepeat1, progressRepeat2, progressRepLabel, actualNmbrOfRepeat + 1, nmbrOfRepeat);
          clearInterval(interval)
          switchToReady();
          resolve();
        }
      } else { //rest state
          if(restActualSec == 0){
            switchToRest();
          }
        restActualSec++;
        playSound(restTotalSec - restActualSec);

        updateProgressBar(progressLoad1, progressLoad2, progressLoadLabel, restActualSec, restTotalSec);
        if(restActualSec == restTotalSec){
          switchToLoad()        
        };
      }  
    }, 1000);
  });

  return promise;
}

//switching states
const switchToLoad = () => {
  state2 = 'load';
  loadActualSec = 0;
  statusLabel.innerText = 'Zátěž';

  switchColors(colorLoad1, colorLoad2);
};

const switchToRest = () => {
  state2 = 'rest';
  restActualSec = 0;
  statusLabel.innerText = 'Odpočinek';
  switchColors(colorLoad2, colorLoad1);
};

const switchToReady = () => {
  state = 'ready';
  loadActualSec = 0;
  actualNmbrOfRepeat = 0;
  updateProgressBar(progressLoad1, progressLoad2, progressLoadLabel, loadActualSec, loadTotalSec);
  updateProgressBar(progressRepeat1, progressRepeat2, progressRepLabel, actualNmbrOfRepeat, nmbrOfRepeat);
  statusLabel.innerText = 'Připraven';
  startButton.textContent = 'Start';
  resetButton.disabled = true;
  resetButton.style.cursor = 'not-allowed';
  switchColors(colorReady1, colorReady2);
}

const switchToRunning = () => {
  state = 'running';
  if(state2 === 'rest'){
    statusLabel.innerText = 'Odpočinek';
    switchColors(colorLoad2, colorLoad1);
  } else {
      statusLabel.innerText = 'Zátěž';
      switchColors(colorLoad1, colorLoad2);
  }
  startButton.textContent = 'Pause';
  resetButton.disabled = true;
  resetButton.style.cursor = 'not-allowed';
  
}

const switchToPaused = () => {
  state = 'paused';
  startButton.textContent = 'Resume';
  resetButton.disabled = false;
  resetButton.style.cursor = 'pointer';
  statusLabel.innerText = 'Pauza';
  switchColors(colorReady2, colorReady1);
}

const switchColors = (bgColor, fgColor) => {
  body.style.background = bgColor;
  progressLoad1.style.background = fgColor;
  progressLoad2.style.background = 'none';
  progressLoad2.style.borderColor = fgColor;
  progressRepeat1.style.background = fgColor;
  progressRepeat2.style.background = 'none';
  progressRepeat2.style.borderColor = fgColor;
}

const reset = () => {
  switchToReady();
}

// ****************data definition*************************
const loadMinInput = document.getElementById("loadMin");
const loadSecInput = document.getElementById("loadSec");
const restMinInput = document.getElementById("restMin");
const restSecInput = document.getElementById("restSec");
const repeatInput = document.getElementById("repeat");

const startButton = document.getElementById("startBtn");
const resetButton = document.getElementById("resetBtn");

const progressLoad1 = document.getElementById("progressLoad1");
const progressLoad2 = document.getElementById("progressLoad2");
const progressLoadLabel = document.getElementById("progressL1");

const progressRepeat1 = document.getElementById("progressRep1");
const progressRepeat2 = document.getElementById("progressRep2");
const progressRepLabel = document.getElementById("progressL2");

const statusLabel = document.querySelector("#statLab");

const startSound = document.querySelector('#startSound');
const countDownSound = document.querySelector('#countDownSound');

const body = document.querySelector("body");

let colorLoad1 = getColorFromCss('--loadColor');
let colorLoad2 = getColorFromCss('--restColor');
let colorReady1 = getColorFromCss('--readyColor');
let colorReady2 = getColorFromCss('--pausedColor');


//status description. Can be ready, running, paused
let state = "ready";
let state2 = "load"; //load/rest status

//variables related to load interval
let loadMin = 0;
let loadSec = 0;
let loadTotalSec = 0;
let loadActualSec = 0;

//variables related to rest interval
let restMin = 0;
let restSec = 0;
let restTotalSec = 0;
let restActualSec = 0;

let nmbrOfRepeat = 0;
let actualNmbrOfRepeat = 0; //actual nmbr of finished repeats

//**************setting Listeners *********************************
resetButton.addEventListener('click', () => {
  //reset();
  switchToReady();
})

startButton.addEventListener("click", () => {
  if(state === 'ready'){ //prepared for run
    //calculate total sec for load and rest interval
    loadTotalSec = loadMinInput.value * 60 + loadSecInput.value;
    restTotalSec = restMinInput.value * 60 + restSecInput.value;
    nmbrOfRepeat = repeatInput.value;
    
    //initial checks
    if(loadTotalSec == 0){
      alert('Čas zatížení musí být větší než 0 sec, jinak si moc nezacvičíš')
      return;
    }
    if(nmbrOfRepeat > 1 && restTotalSec == 0){
      alert('Čas odpočinku mezi zátěžemi musí musí být větší než 0 sec, jinak si moc neodpočineš')
      return;
    }

    preRun()
    .then(() => run())
    .catch(() => {}); //do nothing for catch
  } else if(state === 'paused') { //when paused -> resume run
    run()
    .catch(() => {}); //do nothing for catch
  } else if(state === 'running') {//when running -> pause
    switchToPaused();
  }
});
