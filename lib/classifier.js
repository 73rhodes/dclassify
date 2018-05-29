// classifier.js


function Classifier(options) {
  options = options || {};
  this.applyInverse = options.applyInverse || false;
  this.probabilityThreshold = options.probabilityThreshold || 0.5;
  this.defaultCategory = options.defaultCategory || null;
  this.tokens = {};
  this.categoryCounts = {};
  this.probabilities = {};
}


Classifier.prototype = {
  train: function (trainingSet) {
    var categories = Object.keys(trainingSet.categorizedItems);
    var i = 0, j = 0, k = 0, category = "";
    // Iterate over each category in the training set
    for (i = 0; i < categories.length; i++) {
      category = categories[i];
      var subSet = trainingSet.categorizedItems[category];
      this.categoryCounts[category] = subSet.length;
      // Iterate over each data item in the category
      for (j = 0; j < subSet.length; j++) {
        var item = subSet[j];
        // for each token in the data item, increment the token:category counter
        var tokenlist = item.tokens;
        for (k = 0; k < tokenlist.length; k++) {
          var token = tokenlist[k];
          if (!this.tokens[token]) {
            this.tokens[token] = {};
          }
          if (!this.tokens[token][category]) {
            this.tokens[token][category] = 1;
          } else {
            this.tokens[token][category] = 1 + this.tokens[token][category];
          }
        }
      }
    }
    /* 
    After counting occurences of tokens, calculate probabilities.
    This results in something like the following:
    probabilities : {
      category1: {
        token1: 0.97,
        token2: 0.63, ...
      },
      category2: { ...
    }
    */
    for (i = 0; i < categories.length; i++) {
      category = categories[i];
      for (k in this.tokens) {
        if (this.tokens.hasOwnProperty(k)) {
          var count = this.tokens[k][category] || 0;
          var total = this.categoryCounts[category];
          var percentage = count / total;
          if (!this.probabilities[category]) {
            this.probabilities[category] = {};
          }
          this.probabilities[category][k] = percentage;
        }
      }
    }
  },

  validate: function (testSet) {
    var total = 0;
    var correctGuesses = 0;
    var wrongGuesses = 0;
    var wrongCategories = {};
    var wrongItems = [];
    var categories = testSet.categorizedItems;
    var category;
    for (category in categories) {
      validateCategory(category);
    }

    function validateCategory(category) {
      if (categories.hasOwnProperty(category)) {
        var items = categories[category];
        var item;
        for (item in items) {
          if (items.hasOwnProperty(item)) {
            total += 1;
            item = items[item];
            var result = this.classify(item);
            // if certainty is below probabilityThreshold, go with the default
            if (result.probability <= this.probabilityThreshold) {
              result.category = this.defaultCategory || result.category;
            }
            if (result.category === category) {
              correctGuesses++;
            } else {
              if (!wrongCategories[result.category]) {
                wrongCategories[result.category] = 1;
              } else {
                wrongCategories[result.category]++;
              }
              wrongItems.push(item.id);
              wrongGuesses++;
            }
          }
        }
      }
    }

    return {
      'total': total,
      'correct': correctGuesses,
      'wrong': wrongGuesses,
      'accuracy': (correctGuesses / (correctGuesses + wrongGuesses)),
      'wrongCategories': wrongCategories,
      'wrongItems': wrongItems
    };
  },

  classify: function (item) {
    // for each category
    var category;
    var learnedProbabilities = this.probabilities;
    var itemProbabilities = {};
    var itemTokens = item.tokens;
    for (category in learnedProbabilities) {
      if (learnedProbabilities.hasOwnProperty(category)) {
        itemProbabilities[category] = 1;
        var t;
        var probs = learnedProbabilities[category];
        for (t in probs) {
          // iterate over the tokens
          if (probs.hasOwnProperty(t)) {
            // and take the product of all probabilities
            if (itemTokens.indexOf(t) !== -1) {
              itemProbabilities[category] = itemProbabilities[category] * probs[t];
            } else if (this.applyInverse) {
              itemProbabilities[category] = itemProbabilities[category] * (1 - probs[t]);
            }
          }
        }
      }
    }

    // Pick the highest two probabilities
    function compareCategories(a, b) {
      if (a.probability > b.probability) {
        return -1;
      }
      if (a.probability < b.probability) {
        return 1;
      }
      return 0;
    }

    var categoryScores = [];
    var sumOfProbabilities = 0;
    var k;
    for (k in itemProbabilities) {
      if (itemProbabilities.hasOwnProperty(k)) {
        categoryScores.push({
          category: k,
          probability: itemProbabilities[k]
        });
        sumOfProbabilities += itemProbabilities[k];
      }
    }
    categoryScores = categoryScores.sort(compareCategories);

    var firstPlace = categoryScores[0];
    var secondPlace = categoryScores[1];
    var timesMoreLikely = firstPlace.probability / secondPlace.probability;
    var probability = firstPlace.probability / sumOfProbabilities;

    return ({
      'category': firstPlace.category,
      'probability': probability,
      'timesMoreLikely': timesMoreLikely,
      'secondCategory': secondPlace.category,
      'probabilities': categoryScores
    });
  }
};


function DataSet() {
  this.categorizedItems = {};
}

DataSet.prototype = {
  add: function (label, items) {
    var originalItems = this.categorizedItems[label] ||  [];
    this.categorizedItems[label] = originalItems.concat(items);
  }
};



function Document(id, tokens) {
  if (!id) {
    console.log('Document(id, tokens) requires an id string');
  }
  this.id = id;
  this.tokens = tokens || [];
}

Document.prototype = {
  add: function (token) {
    if (typeof token === 'string') {
      if (this.tokens.indexOf(token) === -1) {
        this.tokens.push(token);
      }
    } else if (typeof token === 'object' && token.length) { // array of tokens
      var i;
      for (i = 0; i < token.length; i++) {
        this.add(token[i]);
      }
    }
  }
};


exports.Classifier = Classifier;
exports.DataSet    = DataSet;
exports.Document   = Document;
