const cardContainer = document.querySelector('.card-container')

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
class AudioController{
    #flipSound;
    #backgroundSound;
    #gameOverSound;
    #victorySound;
    #matchSound;
    constructor(){
        this.#flipSound = new Audio('soundeffects/flipsound.mp3');
        this.#backgroundSound = new Audio('soundeffects/gamesound.mp3');
        this.#backgroundSound.currentTime = 0.5 ;
        this.#gameOverSound = new Audio('soundeffects/gameover.mp3');
        this.#backgroundSound.volume = 0.1;
        this.#victorySound = new Audio('soundeffects/victory.mp3');
        this.#matchSound = new Audio('soundeffects/match.mp3');
    }
    flip(){
        if(!this.#flipSound.ended){
            this.#flipSound.pause();
            this.#flipSound.currentTime = 0;
        }
        this.#flipSound.play();
    }
    backgroundStop(){
        this.#backgroundSound.pause()
        this.#backgroundSound.currentTime = 0;
    }
    backgroundPlay(){
        this.#backgroundSound.play();
    }
    gameOver(){
        this.backgroundStop();
        this.#gameOverSound.play();
    }
    victory(){
        this.backgroundStop();
        this.#victorySound.play();
    }
    match(){
        if(!this.#matchSound.ended){
            this.#matchSound.pause();
            this.#matchSound.currentTime = 0;
        }
        this.#matchSound.play();
    }
}

class MemoryGame{
    #cards;
    #audioController;
    #totalTime;
    constructor(totalTime, cardArray){
        this.#cards = cardArray;
        this.#totalTime = totalTime;
        this.timer = document.getElementById('time-remaining');
        this.fliper = document.getElementById('flips');
        this.#audioController = new AudioController();
        this.timer.innerText = this.#totalTime;
        this.fliper.innerText = 0;
    }
    startGame(){
        this.cardToCheck = null;
        this.totalFlips = 0;
        this.timeRemaining = this.#totalTime;
        this.matchedCards = [];
        this.timer.innerText = this.#totalTime;
        this.fliper.innerText = 0;
        this.busy = true;
        this.#audioController.backgroundPlay();
        this.countDown = this.startCountDown();
        this.shuffel();
        this.flipAllCards();
        setTimeout(()=>{
            this.unflipAllCards()
            this.busy = false;
        }, 2000)
    }
    shuffel(){
        for(let i = this.#cards.length-1; i>0; i--){
            const randomIndex = getRandomInt(0, i);
            this.#cards[randomIndex].style.order = i;
            this.#cards[i].style.order = randomIndex;
        }
    }
    unflipCard(card){
        card.classList.remove('visible');
    }
    unflipAllCards(){
        this.#cards.forEach(card=>{
            this.unflipCard(card);
        })
    }
    flipAllCards(){
        this.#cards.forEach(card=>{
            card.classList.add('visible');
        })
    }
    _canFlipCard(card){
        // return true;
        return this.cardToCheck !== card && !this.matchedCards.includes(card) && !this.busy
    }
    flipCard(card){
        if(!this._canFlipCard(card)) return;
        this.#audioController.flip();
        card.classList.add('visible');
        this.totalFlips++;
        this.fliper.innerText = this.totalFlips;

        if(this.cardToCheck){
            this.checkForMatch(card, this.cardToCheck);
            if(this.matchedCards.length === this.#cards.length){
                setTimeout(()=>{
                    this.victory();
                }, 300)
            }
        }
        else{
            this.cardToCheck = card;
        }
    }

    checkForMatch(card1, card2){
        if(this.getCardType(card1) === this.getCardType(card2)){
            this.#audioController.match();
            this.cardMatched(card1, card2);
        }
        else{
            this.cardMismatched(card1, card2)
        }
        this.cardToCheck = null;
    }
    cardMatched(card1, card2){
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
    }

    cardMismatched(card1, card2){
        this.busy = true;
        setTimeout(()=>{
            this.unflipCard(card1);
            this.unflipCard(card2);
            this.busy = false;
        }, 1000);
        
    }
    getCardType(card){
        return card.getElementsByClassName('card-front')[0].src;
    }

    startCountDown(){
        return setInterval(()=>{
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0){
                this.gameOver();
            }
        }, 1000)
    }
    gameOver(){
        clearInterval(this.countDown);
        this.#audioController.gameOver();
        document.getElementById('gameover-text').classList.add('visible');
    }
    victory(){
        clearInterval(this.countDown);
        this.#audioController.victory();
        document.getElementById('you-won-text').classList.add('visible');
    }
}

const cardsArray = Array.from(document.getElementsByClassName('cards'));
const overlaysArray = Array.from(document.getElementsByClassName('overlay-text'));
const game = new MemoryGame(60, cardsArray);

overlaysArray.forEach(overlay=>{
    overlay.addEventListener('click',()=>{
        overlay.classList.remove('visible');
        game.startGame();
    })
})




cardContainer.addEventListener('click', function(e){
    if(!(e.target.classList.contains('card-back') || e.target.classList.contains('card-front'))) return;
    game.flipCard(e.target.closest('.cards'));
})











