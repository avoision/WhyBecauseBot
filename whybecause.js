var _             = require('lodash');
var Client        = require('node-rest-client').Client;
var Twit          = require('twit');
var async         = require('async');
var wordFilter    = require('wordfilter');

var t = new Twit({
  consumer_key:         process.env.WHYBECAUSE_TWIT_CONSUMER_KEY,
  consumer_secret:      process.env.WHYBECAUSE_TWIT_CONSUMER_SECRET,
  access_token:         process.env.WHYBECAUSE_TWIT_ACCESS_TOKEN,
  access_token_secret:  process.env.WHYBECAUSE_TWIT_ACCESS_TOKEN_SECRET
});

getPublicTweetWhy = function(cb) {
	console.log('--Why');
	t.get('search/tweets', {q: '\"Why%20is\"', count: 200, result_type: 'recent', lang: 'en'}, function(err, data, response) {
		if (!err) {
			var pattern = /^why\ is/;
			var whyData = {
					allPosts: [],
					parsedQuestions: []
			};
	
			// Loop through all returned statues
			for (var i = 0; i < data.statuses.length; i++) {
				var tweet = data.statuses[i].text.toLowerCase(),
					hasReply = tweet.indexOf('@'), 
					hasHashtag = tweet.indexOf('#'),
					hasLink = tweet.indexOf('http'),
					hasLogical = tweet.indexOf('true love comes with no logical reason');

				// Does the tweet contain offensive words?
				if (!wordFilter.blacklisted(tweet)) {
					// Does the tweet begin with "Why is... "
					if (pattern.test(tweet)) {
						// Does the tweet have a reply, hashtag, or URL?
						if ((hasReply == -1) && (hasHashtag == -1) && (hasLink == -1) && (hasLogical == -1)) {
							whyData.allPosts.push(data.statuses[i].text);
						}
					}
				}
			}

		cb(null, whyData);

	    } else {
			console.log("There was an error getting a public Tweet. Shit is melting DOWN!");
			cb(err, whyData);
		}
	});
};


cleanWhy = function(whyData, cb) {
	console.log('--Clean Why');
	var periodExclamationPattern = /[\.\!]+/;
	var lastCharPattern = /[a-zA-Z]+/;

	for (i = 0; i < whyData.allPosts.length; i++) {
		// console.log("Original: " + currentTweet);
		var currentTweet = whyData.allPosts[i],
			questionMarkPos = currentTweet.indexOf('?'),
			question = '';

		// Do we have a question mark in the tweet?
		if (questionMarkPos > -1) {
			question = currentTweet.substring(0, (questionMarkPos + 1));

			// Is there a space before the question mark? If so, remove it.
			if (question.charAt(question.length-2) == " ") {
				question = question.slice(0, question.length-2) + "?";
			};

		// If not, let's see if we can turn what we have into a question.
		// How do we test for emoticons? Keep this logic?
		// } else {

		// 	// If there are no periods or exclamations in the tweet
		// 	// let's turn it into a question.
		// 	if ((periodExclamationPattern.test(currentTweet)) == false) {

		// 		// Check if last char is a space. If so, remove it.
		// 		if (currentTweet.charAt(currentTweet.length-1) == ' ') {
		// 			currentTweet = currentTweet.substring(0, currentTweet.length - 1);
		// 		}

		// 		// Check if last char is an actual character. If so, keep it and add a ?
		// 		if ((lastCharPattern.test(currentTweet))) {
		// 			question = currentTweet + "?";
		// 		}
		// 	}
		}

		if ((question.length > 0) && (question.length <= 70)) {
			question = "W" + question.slice(1);
			whyData.parsedQuestions.push(question);
		}
	}

	// Do we have at least one viable question?
	if (whyData.parsedQuestions.length > 0) {
		cb(null, whyData);
	} else {
		cb("No questions found! Cancel the party!");
	}
}


getPublicTweetBecause = function(whyData, cb) {
	console.log("--Because");
	t.get('search/tweets', {q: '\"it\'s%20because%20\"', count: 200, result_type: 'recent', lang: 'en'}, function(err, data, response) {
		if (!err) {
			var pattern = /it\'s\ because\ /,
				becauseData = {
					allPosts: [],
					parsedAnswers: []
				};

			// Loop through all returned statues
			for (var i = 0; i < data.statuses.length; i++) {
				var tweet = data.statuses[i].text.toLowerCase(),
					hasReply = tweet.indexOf('@'), 
					hasHashtag = tweet.indexOf('#'),
					hasLink = tweet.indexOf('http');

				// Does the tweet contain offensive words?
				if (!wordFilter.blacklisted(tweet)) {
					// Does the tweet begin with "Why is... "
					if (pattern.test(tweet)) {
						// Does the tweet have a reply, hashtag, or URL?
						if ((hasReply == -1) && (hasHashtag == -1) && (hasLink == -1)) {
							becauseData.allPosts.push(data.statuses[i].text);
						}
					}
				}
			}

		cb(null, whyData, becauseData);

	    } else {
			console.log("There was an error getting a public Tweet. Shit is melting DOWN!");
			cb(err);
		}
	});
};


cleanBecause = function(whyData, becauseData, cb) {
	console.log("--Clean Because");

	var letterEndPattern = /[a-zA-Z]+/;
	var punctuationEndPattern = /[\?\!\.]+/;


	for (i = 0; i < becauseData.allPosts.length; i++) {
		
		var currentTweet = becauseData.allPosts[i],
			becausePos = currentTweet.toLowerCase().indexOf('it\'s because'),
			answer = '';

		answer = "I" + currentTweet.substring(becausePos + 1);

		var lastChar = answer.charAt(answer.length - 1);

		// Check if our answer ends in a letter, or ?!.
		if ((letterEndPattern.test(lastChar)) || punctuationEndPattern.test(lastChar)) {
			if (letterEndPattern.test(lastChar)) {
				answer += ".";
			}
	
			if (answer.length < 70) {
				becauseData.parsedAnswers.push(answer);
			}
		}
	}

	// Do we have at least one viable answer?
	if (becauseData.parsedAnswers.length > 0) {
		cb(null, whyData, becauseData);
	} else {
		cb("No answers found! Cancel the party!");
	}
}


formatQA = function(whyData, becauseData, cb) {
	var totalQuestions = whyData.parsedQuestions.length;
	var totalAnswers = becauseData.parsedAnswers.length;

	var randomQ = Math.floor(Math.random() * totalQuestions);
	var randomA = Math.floor(Math.random() * totalAnswers);

	var question = whyData.parsedQuestions[randomQ];
	var answer = becauseData.parsedAnswers[randomA];

	var QA = question + " " + answer;

    t.post('statuses/update', {status: QA}, function(err, data, response) {
		cb(err, QA);
    });

	// Display Tweet
	console.log('End of Line');
	console.log(whyData.parsedQuestions);
	console.log(becauseData.parsedAnswers);
	console.log(QA);

}


run = function() {
	console.log("========= Starting! =========");

    async.waterfall([
		getPublicTweetWhy,
		cleanWhy,
		getPublicTweetBecause,
		cleanBecause,
		formatQA,
    ],
    function(err, whyData, becauseData, cb) {
		if (err) {
			console.log('There was an error posting to Twitter: ', err);
		}
    });
}


// ===========================
// Cleanup
// ===========================
iReallyReallyWantToDeleteAllTweets = function() {
	t.get('statuses/user_timeline', {screen_name: 'whybecausebot', count: 10}, function(err, data, response) {
		if (!err) {
			var liveTweetsArray = [];
			
			for (i = 0; i < data.length; i++) {
				liveTweetsArray.push(data[i].id_str);
			}

			for (j = 0; j < liveTweetsArray.length; j++) {
				t.post('statuses/destroy/' + liveTweetsArray[j], {id: liveTweetsArray[j]}, function(err, data, response) {
					if (!err) {
						console.log("Deleted!");
					}
				});
			}
		}
	})
}

setInterval(function() {
  try {
    run();
  }
  catch (e) {
    console.log(e);
  }
}, 60000 * 30);