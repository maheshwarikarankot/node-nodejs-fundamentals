const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%

const waitTime = 3000;

const timerFinished = () => {
    clearInterval(interval);
    console.log("\n")
    console.log("done");
}

setTimeout(timerFinished, waitTime);

// Drawing the Progress Bar Image
const drawProgressBar = (progress) => {
    const barWidth = 30;
    const filledWidth = Math.floor(progress / 100 * barWidth);
    const emptyWidth = barWidth - filledWidth;
    const progressBar = '█'.repeat(filledWidth) + '▒'.repeat(emptyWidth);
    return `[${progressBar}] ${progress}%`;
}

// Interval Setup
const waitInterval = 100;
let currentTime = 0;
const incTime = () => {
    currentTime += waitInterval;
    const progressPercentage = Math.floor(currentTime / waitTime * 100) ;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Progress: ${drawProgressBar(progressPercentage)}`);
}

const interval = setInterval(incTime, waitInterval);
};

progress();

