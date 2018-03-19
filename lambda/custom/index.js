'use strict';
const Alexa = require('alexa-sdk');

// Aliases to Image and Text utility functions. These are used for display 
// directives which are rendered on Echo Show and Echo Spot.

const MAKE_TEXT_CONTENT = Alexa.utils.TextUtils.makeTextContent;
const MAKE_IMAGE = Alexa.utils.ImageUtils.makeImage;
const MAKE_RICH_TEXT = Alexa.utils.TextUtils.makeRichText;
const MAKE_PLAIN_TEXT = Alexa.utils.TextUtils.makePlainText;

const IMAGE_PATH = "https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/{0}x{1}/{2}._TTH_.png";
const BACKGROUND_IMAGE_PATH = "https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/{0}x{1}/{2}._TTH_.png"

//=========================================================================================================================================
//TODO: The items below this comment need your attention
//=========================================================================================================================================

// Replace with your app ID (OPTIONAL).  You can find this value at the top of 
// your skill's page on http://developer.amazon.com. Make sure to enclose your 
// value in quotes, like this: 
// const APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
const APP_ID = undefined;

// This function returns a descriptive sentence about your data.  Before a user 
// starts a quiz, they can ask about a specific data element, like "Ohio."  
// The skill will speak the sentence from this function, pulling the data values
// from the appropriate record in your data.
function getSpeechDescription(item)
{
    let sentence = item.StateName + " is the " + item.StatehoodOrder + "th state, admitted to the Union in " + item.StatehoodYear + ".  The capital of " + item.StateName + " is " + item.Capital + ", and the abbreviation for " + item.StateName + " is <break strength='strong'/><say-as interpret-as='spell-out'>" + item.Abbreviation + "</say-as>.  I've added " + item.StateName + " to your Alexa app.  Which other state or capital would you like to know about?";
    return sentence;
}

// We have provided two ways to create your quiz questions.  The default way is 
// to phrase all of your questions like: "What is X of Y?" If this approach 
// doesn't work for your data, take a look at the commented code in this 
// function.  You can write a different question structure for each property of 
// your data.
function getQuestion(counter, property, item)
{
    return "Here is your " + counter + "th question.  What is the " + formatCasing(property) + " of "  + item.StateName + "?";

    /*
    switch(property)
    {
        case "City":
            return "Here is your " + counter + "th question.  In what city do the " + item.League + "'s "  + item.Mascot + " play?";
        break;
        case "Sport":
            return "Here is your " + counter + "th question.  What sport do the " + item.City + " " + item.Mascot + " play?";
        break;
        case "HeadCoach":
            return "Here is your " + counter + "th question.  Who is the head coach of the " + item.City + " " + item.Mascot + "?";
        break;
        default:
            return "Here is your " + counter + "th question.  What is the " + formatCasing(property) + " of the "  + item.Mascot + "?";
        break;
    }
    */
}

// getQuestionWithoutOrdinal returns the question without the ordinal and is 
// used for the echo show.
function getQuestionWithoutOrdinal(property, item)
{
    return "What is the " + formatCasing(property).toLowerCase() + " of "  + item.StateName + "?";
}

// This is the function that returns an answer to your user during the quiz.  
// Much like the "getQuestion" function above, you can use a switch() statement 
// to create different responses for each property in your data.  For example, 
// when this quiz has an answer that includes a state abbreviation, we add some 
// SSML to make sure that Alexa spells that abbreviation out (instead of trying 
// to pronounce it.)
function getAnswer(property, item)
{
    switch(property)
    {
        case "Abbreviation":
            return "The " + formatCasing(property) + " of " + item.StateName + " is <say-as interpret-as='spell-out'>" + item[property] + "</say-as>. ";
        default:
            return "The " + formatCasing(property) + " of " + item.StateName + " is " + item[property] + ". ";
    }
}

// This is a list of positive speechcons that this skill will use when a user 
// gets a correct answer.  For a full list of supported speechcons, 
// go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
const speechConsCorrect = ["Booya", "All righty", "Bam", "Bazinga", "Bingo", "Boom", "Bravo", "Cha Ching", "Cheers", "Dynomite",
"Hip hip hooray", "Hurrah", "Hurray", "Huzzah", "Oh dear.  Just kidding.  Hurray", "Kaboom", "Kaching", "Oh snap", "Phew",
"Righto", "Way to go", "Well done", "Whee", "Woo hoo", "Yay", "Wowza", "Yowsa"];

// This is a list of negative speechcons that this skill will use when a user 
// gets an incorrect answer.  For a full list of supported speechcons, 
// go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
const speechConsWrong = ["Argh", "Aw man", "Blarg", "Blast", "Boo", "Bummer", "Darn", "D'oh", "Dun dun dun", "Eek", "Honk", "Le sigh",
"Mamma mia", "Oh boy", "Oh dear", "Oof", "Ouch", "Ruh roh", "Shucks", "Uh oh", "Wah wah", "Whoops a daisy", "Yikes"];

// This is the welcome message for when a user starts the skill without a 
// specific intent.
const WELCOME_MESSAGE = "Welcome to the India Quiz Game!  You can ask me about any of the fifty states and their capitals, or you can ask me to start a quiz.  What would you like to do?";

// This is the message a user will hear when they start a quiz.
const START_QUIZ_MESSAGE = "OK.  I will ask you 10 questions about the India.";

// This is the message a user will hear when they try to cancel or stop the 
// skill, or when they finish a quiz.
const EXIT_SKILL_MESSAGE = "Thank you for playing India Quiz Game!  Let's play again soon!";

// This is the message a user will hear after they ask (and hear) about a 
// specific data element.
const REPROMPT_SPEECH = "Which other state or capital would you like to know about?";

// This is the message a user will hear when they ask Alexa for help in your 
// skill.
const HELP_MESSAGE = "I know lots of things about India.  You can ask me about a state or a capital, and I'll tell you what I know.  You can also test your knowledge by asking me to start a quiz.  What would you like to do?";


//This is the response a user will receive when they ask about something we 
// weren't expecting.  For example, say "pizza" to your skill when it starts.  
// This is the response you will receive.
function getBadAnswer(item) { 
    return "I'm sorry. " + item + " is not something I know very much about in this skill. " + HELP_MESSAGE; 
}

// This is the message a user will receive after each question of a quiz.  
// It reminds them of their current score.
function getCurrentScore(score, counter) { 
    return "Your current score is " + score + " out of " + counter + ". "; 
}

// This is the message a user will receive after they complete a quiz.  It tells 
// them their final score.
function getFinalScore(score, counter) { 
    return "Your final score is " + score + " out of " + counter + ". "; 
}

// These next four values are for the Alexa cards that are created when a user 
// asks about one of the data elements. This only happens outside of a quiz.

// If you don't want to use cards in your skill, set the USE_CARDS_FLAG to 
// false.  If you set it to true, you will need an image for each item in your 
// data.
const USE_CARDS_FLAG = true;

// This is what your card title will be.  
// For our example, we use the name of the state the user requested.
function getCardTitle(item) { 
    return item.StateName;
}

// This is the small version of the card image.  We use our data as the naming 
// convention for our images so that we can dynamically generate the URL to the 
// image.  The small image should be 720x400 in dimension.
function getSmallImage(item) { 
    return getImage(720, 400, item.Abbreviation);
}

//This is the large version of the card image.  It should be 1200x800 pixels in dimension.
function getLargeImage(item) { 
    return getImage(1200, 800, item.Abbreviation);
}

function getImage(height, width, label) {
    return IMAGE_PATH.replace("{0}", height)
                    .replace("{1}", width)
                    .replace("{2}", label);
}

function getBackgroundImage(label, height = 1024, width = 600) {
    return BACKGROUND_IMAGE_PATH.replace("{0}", height)
                                .replace("{1}", width)
                                .replace("{2}", label);
}

//=========================================================================================================================================
//TODO: Replace this data with your own.
//=========================================================================================================================================
const data = [
                {StateName: "Uttar Pradesh",        Abbreviation: "AL", Capital: "Lucknow",     StatehoodYear: 1919, StatehoodOrder: 22 },
                {StateName: "Punjab",         Abbreviation: "AK", Capital: "Chandigarh",         StatehoodYear: 1959, StatehoodOrder: 49 },
                {StateName: "Uttarakhand",        Abbreviation: "AZ", Capital: "Dehradun",        StatehoodYear: 1912, StatehoodOrder: 48 },
                {StateName: "Madhya Pradesh",       Abbreviation: "AR", Capital: "Bhopal",    StatehoodYear: 1936, StatehoodOrder: 25 },
                {StateName: "Maharashtra",     Abbreviation: "CA", Capital: "Mumbai",     StatehoodYear: 1950, StatehoodOrder: 31 },
                {StateName: "Tamil Nadu",       Abbreviation: "CO", Capital: "Chennao",         StatehoodYear: 1976, StatehoodOrder: 38 },
                {StateName: "Kerala",    Abbreviation: "CT", Capital: "Thiruvananthapuram",       StatehoodYear: 1988, StatehoodOrder: 5 },
                {StateName: "Rajasthan",       Abbreviation: "DE", Capital: "Jaipur",          StatehoodYear: 1987, StatehoodOrder: 1 },
                {StateName: "Gujarat",        Abbreviation: "FL", Capital: "Gandhinagar",    StatehoodYear: 1945, StatehoodOrder: 27 },
                {StateName: "Jharkhand",        Abbreviation: "GA", Capital: "Ranchi",        StatehoodYear: 1988, StatehoodOrder: 4 },
                {StateName: "Sikkim",         Abbreviation: "HI", Capital: "Gangtok",       StatehoodYear: 1959, StatehoodOrder: 50 },
                {StateName: "Arunachal Pradesh",          Abbreviation: "ID", Capital: "Itanagar",          StatehoodYear: 1890, StatehoodOrder: 43 },
                {StateName: "Bihar",       Abbreviation: "IL", Capital: "Patna",    StatehoodYear: 1918, StatehoodOrder: 21 },
                {StateName: "Assam",        Abbreviation: "IN", Capital: "Guwahati",   StatehoodYear: 1916, StatehoodOrder: 19 },
                {StateName: "Chandigarh",           Abbreviation: "IA", Capital: "Chandigarh",     StatehoodYear: 1946, StatehoodOrder: 29 },
                {StateName: "Chattisgarh",         Abbreviation: "KS", Capital: "Raipur",         StatehoodYear: 1961, StatehoodOrder: 34 },
                {StateName: "Delhi",       Abbreviation: "KY", Capital: "Delhi",      StatehoodYear: 1992, StatehoodOrder: 15 },
                {StateName: "Goa",      Abbreviation: "LA", Capital: "Panaji",    StatehoodYear: 1912, StatehoodOrder: 18 },
                {StateName: "Himachal Pradesh",          Abbreviation: "ME", Capital: "Shimla",        StatehoodYear: 1920, StatehoodOrder: 23 },
                {StateName: "Jammu and Kashmir",       Abbreviation: "MD", Capital: "Srinagar",      StatehoodYear: 1988, StatehoodOrder: 7 },
                {StateName: "Karnataka",  Abbreviation: "MA", Capital: "Bengaluru",         StatehoodYear: 1988, StatehoodOrder: 6 },
                {StateName: "Lakshdweep",       Abbreviation: "MI", Capital: "Port Blair",        StatehoodYear: 1937, StatehoodOrder: 26 },
                {StateName: "Manipur",      Abbreviation: "MN", Capital: "Imphal",       StatehoodYear: 1958, StatehoodOrder: 32 },
                {StateName: "Meghalaya",    Abbreviation: "MS", Capital: "Shillong",        StatehoodYear: 1917, StatehoodOrder: 20 },
                {StateName: "Mizoram",       Abbreviation: "MO", Capital: "Aizawl", StatehoodYear: 1921, StatehoodOrder: 24 },
                {StateName: "Nagaland",        Abbreviation: "MT", Capital: "Kohima",         StatehoodYear: 1989, StatehoodOrder: 41 },
                {StateName: "Odisha",       Abbreviation: "NE", Capital: "Bhubaneshwar",        StatehoodYear: 1967, StatehoodOrder: 37 },
                {StateName: "Tripura",         Abbreviation: "NV", Capital: "Agartala",    StatehoodYear: 1964, StatehoodOrder: 36 },
                {StateName: "West Bengal",  Abbreviation: "NH", Capital: "Kolkata",        StatehoodYear: 1988, StatehoodOrder: 9 },
            ];

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const states = {
    START: "_START",
    QUIZ: "_QUIZ"
};

const handlers = {
     "LaunchRequest": function() {
        this.handler.state = states.START;
        this.emitWithState("Start");
     },
    "QuizIntent": function() {
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    "AnswerIntent": function() {
        this.handler.state = states.START;
        this.emitWithState("AnswerIntent");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.handler.state = states.START;
        this.emitWithState("Start");
    }
};

const startHandlers = Alexa.CreateStateHandler(states.START,{
    "Start": function() {
        this.response.speak(WELCOME_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "AnswerIntent": function() {
        let item = getItem(this.event.request.intent.slots);

        if (item && item[Object.getOwnPropertyNames(data[0])[0]] != undefined)
        {
          
            if (USE_CARDS_FLAG)
            {
                let imageObj = {smallImageUrl: getSmallImage(item), largeImageUrl: getLargeImage(item)};

                this.response.speak(getSpeechDescription(item)).listen(REPROMPT_SPEECH);
                this.response.cardRenderer(getCardTitle(item), getTextDescription(item), imageObj);            }
            else
            {
                this.response.speak(getSpeechDescription(item)).listen(REPROMPT_SPEECH);
            }

            // Display code for an Alexa Device with a screen Echo Show|Spot
            // For this we are using Body Template 2 
            // https://developer.amazon.com/docs/custom-skills/display-interface-reference.html#bodytemplate2-for-image-views-and-limited-centered-text
            if (supportsDisplay.call(this)) {
                let builder = new Alexa.templateBuilders['BodyTemplate2Builder']();
                let mainImage = MAKE_IMAGE(getLargeImage(item));
                let title = getCardTitle(item);
                let primaryText = MAKE_RICH_TEXT(getTextDescription(item, "<br/>"));

                builder.setImage(mainImage);
                builder.setTitle(title);
                builder.setTextContent(primaryText, null, null);

                // The back button can be hidden by passing 'hidden'
                // The default is 'visibile'
                builder.setBackButtonBehavior('visible'); 
                let template = builder.build();

                this.response.renderTemplate(template);
            }            
        }
        else
        {
            this.response.speak(getBadAnswer(item)).listen(getBadAnswer(item));
        }

        this.emit(":responseReady");
    },
    "QuizIntent": function() {
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    "AMAZON.PauseIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.StopIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.emitWithState("Start");
    }
});

const quizHandlers = Alexa.CreateStateHandler(states.QUIZ,{
    "Quiz": function() {
        this.attributes["response"] = "";
        this.attributes["counter"] = 0;
        this.attributes["quizscore"] = 0;
        this.emitWithState("AskQuestion");
    },
    "AskQuestion": function() {
        if (this.attributes["counter"] == 0)
        {
            this.attributes["response"] = START_QUIZ_MESSAGE + " ";
        }

        let random = getRandom(0, data.length-1);
        let item = data[random];

        let propertyArray = Object.getOwnPropertyNames(item);
        let property = propertyArray[getRandom(1, propertyArray.length-1)];

        this.attributes["quizitem"] = item;
        this.attributes["quizproperty"] = property;
        this.attributes["counter"]++;

        let question = getQuestion(this.attributes["counter"], property, item);
        let speech = this.attributes["response"] + question;

        this.response.speak(speech).listen(question);

        // Display code for an Alexa Device with a screen Echo Show|Spot
        // For this we are using Body Template 1
        // https://developer.amazon.com/docs/custom-skills/display-interface-reference.html#bodytemplate1-for-simple-text-and-image-views
        if (supportsDisplay.call(this)) {
            // let builder = new Alexa.templateBuilders['BodyTemplate1Builder']();
            let builder = new Alexa.templateBuilders['ListTemplate1Builder']();
            let title = `Question #${this.attributes["counter"]}`;    
            let primaryText = MAKE_RICH_TEXT(getQuestionWithoutOrdinal(property, item));
            
            let itemList = [];

            getAndShuffleMultipleChoiceAnswers(random, item, property).forEach( (x, i) => {
                itemList.push(
                    {  
                        "token": x, 
                        "image": null, 
                        "textContent": MAKE_TEXT_CONTENT(MAKE_PLAIN_TEXT(x), null, null)
                    }
                );
            });

            builder.setTitle(title);
            builder.setToken('QUESTION');
            builder.setListItems(itemList);

            // builder.setTextContent(primaryText, null, null);

            // During the quiz we don't want the back button visibile.
            // We don't want the user to be able to reanswer with the correct
            // answer after they got it wrong.

            builder.setBackgroundImage(MAKE_IMAGE(getBackgroundImage(item.Abbreviation)));
            builder.setBackButtonBehavior('hidden');
            let template = builder.build();

            this.response.renderTemplate(template);
        }                  

        this.emit(':responseReady');
    },
    "AnswerIntent": function() {
        let response = "";
        let speechOutput = "";
        let item = this.attributes["quizitem"];
        let property = this.attributes["quizproperty"];

        let correct = compareSlots(this.event, item[property]);



        if (correct)
        {
            response = getSpeechCon(true);
            this.attributes["quizscore"]++;
        }
        else
        {
            response = getSpeechCon(false);
        }

        response += getAnswer(property, item);

        if (this.attributes["counter"] < 10)
        {
            response += getCurrentScore(this.attributes["quizscore"], this.attributes["counter"]);
            this.attributes["response"] = response;
            this.emitWithState("AskQuestion");
        }
        else
        {
            response += getFinalScore(this.attributes["quizscore"], this.attributes["counter"]);
            speechOutput = response + " " + EXIT_SKILL_MESSAGE;

            this.response.speak(speechOutput);
            
            if (supportsDisplay.call(this)) {
            let builder = new Alexa.templateBuilders['BodyTemplate1Builder']();
            let title = 'Thank you for playing!';    
            let primaryText = MAKE_RICH_TEXT(getFinalScore(this.attributes["quizscore"], this.attributes["counter"]));
            console.log('primary text: ', primaryText);
            builder.setTitle(title);


            builder.setTextContent(primaryText, null, null);

            // During the quiz we don't want the back button visibile.
            // We don't want the user to be able to reanswer with the correct
            // answer after they got it wrong.

            //builder.setBackgroundImage(MAKE_IMAGE(getLargeImage(item)));
            builder.setBackButtonBehavior('hidden');
            let template = builder.build();

            this.response.renderTemplate(template);
            } 
            this.emit(":responseReady");
        }
    },
    "ElementSelected": function() {
        console.log("In ElementSelected Quiz State.");
        this.emitWithState("AnswerIntent");
    },
    "AMAZON.RepeatIntent": function() {
        let question = getQuestion(this.attributes["counter"], this.attributes["quizproperty"], this.attributes["quizitem"]);
        this.response.speak(question).listen(question);
        this.emit(":responseReady");
    },
    "AMAZON.StartOverIntent": function() {
        this.emitWithState("Quiz");
    },
    "AMAZON.StopIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.PauseIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak(EXIT_SKILL_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.emitWithState("AnswerIntent");
    }
});

function compareSlots(event, value)
{

    if (event.request && event.request.token) {
        console.log(JSON.stringify(event.request));
        if (event.request.token.toString().toLowerCase() == value.toString().toLocaleLowerCase()) {
            return true;
        }
            
    } else if (event.request.intent && event.request.intent.slots) {
        let slots = event.request.intent.slots
        for (let slot in slots)
        {
            if (slots[slot].value != undefined)
            {
                if (slots[slot].value.toString().toLowerCase() == value.toString().toLowerCase())
                {
                    return true;
                }
            }
        }
    }

    return false;
}

function getRandom(min, max)
{
    return Math.floor(Math.random() * (max-min+1)+min);
}

function getItem(slots)
{
    let propertyArray = Object.getOwnPropertyNames(data[0]);
    let value;

    for (let slot in slots)
    {
        if (slots[slot].value !== undefined)
        {
            value = slots[slot].value;
            for (let property in propertyArray)
            {
                let item = data.filter(x => x[propertyArray[property]].toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
                if (item.length > 0)
                {
                    return item[0];
                }
            }
        }
    }
    return value;
}

function getAndShuffleMultipleChoiceAnswers(currentIndex, item, property) {
    return shuffle(getMultipleChoiceAnswers(currentIndex, item, property));
}

// This function randomly chooses 3 answers 2 incorrect and 1 correct answer to
// display on the screen using the ListTemplate. It ensures that the list is unique.
function getMultipleChoiceAnswers(currentIndex, item, property) {

    // insert the correct answer first
    let answerList = [item[property]];

    // There's a possibility that we might get duplicate answers
    // 8 states were founded in 1788
    // 4 states were founded in 1889
    // 3 states were founded in 1787 
    // to prevent duplicates we need avoid index collisions and take a sample of
    // 8 + 4 + 1 = 13 answers (it's not 8+4+3 because later we take the unique 
    // we only need the minimum.)
    let count = 0
    let upperBound = 12 

    let seen = new Array();
    seen[currentIndex] = 1;

    while (count < upperBound) {
        let random = getRandom(0, data.length - 1);

        // only add if we haven't seen this index
        if ( seen[random] === undefined ) {
            answerList.push(data[random][property]);
            count++;
        }
    }

    // remove duplicates from the list.
    answerList = answerList.filter((v, i, a) => a.indexOf(v) === i)
    // take the first three items from the list.
    answerList = answerList.slice(0, 3);

    return answerList;
}

// This function takes the contents of an array and randomly shuffles it. 
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while ( 0 !== currentIndex ) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function getSpeechCon(type)
{

    if (type) return "<say-as interpret-as='interjection'>" + speechConsCorrect[getRandom(0, speechConsCorrect.length-1)] + "! </say-as><break strength='strong'/>";
    else return "<say-as interpret-as='interjection'>" + speechConsWrong[getRandom(0, speechConsWrong.length-1)] + " </say-as><break strength='strong'/>";
}

function formatCasing(key)
{
    key = key.split(/(?=[A-Z])/).join(" ");
    return key;
}

function getTextDescription(item, delimiter = "\n")
{
    let text = "";

    for (let key in item)
    {
        text += formatCasing(key) + ": " + item[key] + delimiter;
    }
    return text;
}


// returns true if the skill is running on a device with a display (show|spot)
function supportsDisplay() {
    var hasDisplay =
      this.event.context &&
      this.event.context.System &&
      this.event.context.System.device &&
      this.event.context.System.device.supportedInterfaces &&
      this.event.context.System.device.supportedInterfaces.Display
  
    return hasDisplay;
  }

exports.handler = (event, context) => {
    console.log("event: ", event);
    console.log("context: ", context)
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers, startHandlers, quizHandlers);
    alexa.execute();
};
