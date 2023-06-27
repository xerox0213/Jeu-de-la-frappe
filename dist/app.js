"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let blocked = true;
let alreadyFetch = false;
let fetchedQuote;
let firstGame = true;
let refSetTimeoutToast;
const timerIndicator = document.querySelector('.timer-indicator');
const timerValue = document.querySelector('.timer-value');
const scoreIndicator = document.querySelector('.score-indicator');
const textarea = document.querySelector('.textarea');
const closeBtn = document.querySelector('.close-btn');
const toast = document.querySelector('.toast-notification');
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
function setReadOnly(state) {
    textarea.readOnly = state;
}
function getReadOnly() {
    return textarea.readOnly;
}
generateQuote();
function generateQuote() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            alreadyFetch = true;
            const response = yield fetch('https://api.quotable.io/quotes/random?limit=1');
            const quote = yield response.json();
            fetchedQuote = quote[0].content;
            displayQuote(fetchedQuote);
            return 'Quote généré';
        }
        catch (error) {
            cancelTimeoutToast();
            refSetTimeoutToast = displayToast();
            return Promise.reject(error);
        }
        finally {
            alreadyFetch = false;
        }
    });
}
function handleTimer(interval) {
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
function displayTimer(value) {
    timerValue.innerText = `Temps : ${value}`;
}
function displayQuote(quote) {
    const contentQuote = document.querySelector('.content-quote');
    contentQuote.innerHTML = '';
    for (let i = 0; i < quote.length; i++) {
        const char = quote[i];
        const spanElement = document.createElement('span');
        spanElement.textContent = char;
        contentQuote.appendChild(spanElement);
    }
}
function displayScore(value) {
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
                }
                else if (textareaValue[i] === fetchedQuote[i]) {
                    currentScore += 5;
                    allSpan[i].classList.add('correct');
                    allSpan[i].classList.remove('wrong');
                }
                else {
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
    let interval = { reference: undefined };
    return (e) => {
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
                }
                else {
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
