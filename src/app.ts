type Quote = {
  author: string;
  authorSlug: 'string';
  content: string;
  dateAdded: string;
  dateModified: string;
  length: number;
  tags: string[];
  _id: string;
};
type ArrayOfQuote = Quote[];
type Interval = { reference: number | undefined };

let blocked = true;
let alreadyFetch = false;
let fetchedQuote: string;
let firstGame = true;
let refSetTimeoutToast: undefined | number;

const timerIndicator = document.querySelector('.timer-indicator') as HTMLDivElement;
const timerValue = document.querySelector('.timer-value') as HTMLDivElement;
const scoreIndicator = document.querySelector('.score-indicator') as HTMLDivElement;
const textarea = document.querySelector('.textarea') as HTMLTextAreaElement;
const closeBtn = document.querySelector('.close-btn') as HTMLButtonElement;
const toast = document.querySelector('.toast-notification') as HTMLDivElement;
closeBtn.addEventListener('click', closeToast);

function closeToast() {
  cancelTimeoutToast();
  toast.classList.remove('active');
}

function displayToast() {
  toast.classList.add('active');
  return setTimeout(closeToast, 3000);
}

function cancelTimeoutToast() {
  if (refSetTimeoutToast) {
    clearTimeout(refSetTimeoutToast);
    refSetTimeoutToast = undefined;
  }
}

document.addEventListener('keyup', handleStartGame());
textarea.oninput = compareQuote();

const observer = new MutationObserver(() => {
  if (blocked && !getReadOnly()) {
    setReadOnly(true);
  }
});
observer.observe(textarea, { attributes: true });

function setReadOnly(state: boolean) {
  textarea.readOnly = state;
}

function getReadOnly() {
  return textarea.readOnly;
}

generateQuote();

async function generateQuote() {
  try {
    alreadyFetch = true;
    const response = await fetch('https://api.quotable.io/quotes/random?limit=1');
    const quote: ArrayOfQuote = await response.json();
    fetchedQuote = quote[0].content;
    displayQuote(fetchedQuote);
    return 'Quote généré';
  } catch (error: any) {
    cancelTimeoutToast();
    refSetTimeoutToast = displayToast();
    return Promise.reject(error);
  } finally {
    alreadyFetch = false;
  }
}

function handleTimer(interval: Interval) {
  let valueTimer = 60;
  return () => {
    if (valueTimer === 1) {
      blocked = true;
      setReadOnly(true);
      clearInterval(interval.reference);
      interval.reference = undefined;
      timerIndicator.classList.remove('active');
    }
    valueTimer--;
    displayTimer(valueTimer);
  };
}

function displayTimer(value: number) {
  timerValue.innerText = `Temps : ${value}`;
}

function displayQuote(quote: string) {
  const contentQuote = document.querySelector('.content-quote') as HTMLParagraphElement;
  contentQuote.innerHTML = '';
  for (let i = 0; i < quote.length; i++) {
    const char = quote[i];
    const spanElement = document.createElement('span');
    spanElement.textContent = char;
    contentQuote.appendChild(spanElement);
  }
}

function displayScore(value: number) {
  scoreIndicator.textContent = `Score : ${value}`;
}

function compareQuote() {
  let totalScore = 0;
  let currentScore = 0;
  return () => {
    if (!blocked) {
      currentScore = 0;
      const textareaValue = textarea.value;
      const allSpan = document.querySelectorAll('.content-quote span');
      allSpan.forEach((span) => span.classList.remove('correct', 'wrong'));
      for (let i = 0; i < textareaValue.length; i++) {
        if (i > fetchedQuote.length - 1) {
          break;
        } else if (textareaValue[i] === fetchedQuote[i]) {
          currentScore += 5;
          allSpan[i].classList.add('correct');
          allSpan[i].classList.remove('wrong');
        } else {
          allSpan[i].classList.add('wrong');
          allSpan[i].classList.remove('correct');
        }
      }
      displayScore(totalScore + currentScore);
      if (textareaValue === fetchedQuote) {
        totalScore = currentScore;
        textarea.value = '';
        generateQuote();
      }
    }
  };
}

function handleStartGame() {
  let interval: Interval = { reference: undefined };
  return (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (!alreadyFetch) {
        if (interval.reference) {
          clearInterval(interval.reference);
        }
        if (firstGame && fetchedQuote) {
          firstGame = false;
          blocked = false;
          timerIndicator.classList.add('active');
          setReadOnly(false);
          textarea.focus();
          interval.reference = setInterval(handleTimer(interval), 1000);
        } else {
          generateQuote().then(() => {
            timerIndicator.classList.add('active');
            displayTimer(60);
            displayScore(0);
            textarea.oninput = compareQuote();
            textarea.value = '';
            setReadOnly(false);
            textarea.focus();
            interval.reference = setInterval(handleTimer(interval), 1000);
            blocked = false;
          });
        }
      }
    }
  };
}
