// classifier.js

function categorizeTokens(item, category, tokens) {
  const tokenlist = item.tokens;
  let k;
  for (k = 0; k < tokenlist.length; k++) {
    var token = tokenlist[k];
    if (!tokens[token]) {
      tokens[token] = {};
    }
    if (!tokens[token][category]) {
      tokens[token][category] = 1;
    } else {
      tokens[token][category] = 1 + tokens[token][category];
    }
  }
}

function trainCategory(category, items, tokens) {
  let j;
  for (j = 0; j < items.length; j++) {
    const item = items[j];
    // for each token in the data item, increment the token:category counter
    categorizeTokens(item, category, tokens);
  }  
}

function calculateProbabilities(category, classifier) {
  /*
  * This results in something like the following:
  * probabilities : {
  *   category1: {
  *     token1: 0.97,
  *     token2: 0.63, ...
  *   },
  *   category2: { ...
  * }
  */
  const { tokens, categoryCounts, probabilities } = classifier;
  let k;
  for (k in tokens) {
    if (tokens.hasOwnProperty(k)) {
      const count = tokens[k][category] || 0;
      const total = categoryCounts[category];
      const percentage = count / total;
      if (!probabilities[category]) {
        probabilities[category] = {};
      }
      probabilities[category][k] = percentage;
    }
  }  
}

function trainCategories (categories, classifier) {
  var categoriesLabels = Object.keys(categories);
  var i = 0, j = 0, k = 0, category = "";
  // Iterate over each category in the training set
  for (i = 0; i < categoriesLabels.length; i++) {
    category = categoriesLabels[i];
    var items = categories[category];
    classifier.categoryCounts[category] = items.length;
    // Iterate over each data item in the category
    trainCategory(category, items, classifier.tokens);
  }
  // After counting occurences of tokens, calculate probabilities.
  for (i = 0; i < categoriesLabels.length; i++) {
    category = categoriesLabels[i];
    calculateProbabilities(category, classifier);
  }
}

function compareCategories(a, b) {
  if (a.probability > b.probability) {
    return -1;
  }
  if (a.probability < b.probability) {
    return 1;
  }
  return 0;
}

class Classifier {
  constructor (options) {
    options = options || {};
    this.applyInverse = options.applyInverse || false;
    this.probabilityThreshold = options.probabilityThreshold || 0.5;
    this.defaultCategory = options.defaultCategory || null;
    this.tokens = {};
    this.categoryCounts = {};
    this.probabilities = {};
  }

  train (trainingSet) {
    trainCategories(trainingSet.categories, this);
  }

  validate (testSet) {
    let total = 0;
    let correctGuesses = 0;
    let wrongGuesses = 0;
    let wrongCategories = {};
    let wrongItems = [];
    const categories = testSet.categories;
    let category;
    for (category in categories) {
      validateCategory.call(this, category)
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
              wrongCategories[result.category] = (wrongCategories[result.category]) ? wrongCategories[result.category]++ : 1;
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
  }

  classify (item) {
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
}

class DataSet {
  constructor() {
    this.categories = {};
  }

  add (categoryLabel, items) {
    var originalItems = this.categories[categoryLabel] ||  [];
    this.categories[categoryLabel] = originalItems.concat(items);
  }
}

class Document {
  constructor(id, tokens) {
    if (!id) {
      throw new Error('Document(id, tokens) requires an id string');
    }
    this.id = id;
    this.tokens = tokens || [];  
  }

  add (token) {
    if (Array.isArray(token)) { // array of tokens
      for (var i = 0; i < token.length; i++) {
        this.add(token[i]);
      }
      return;
    }
    if (typeof token === 'string' && this.tokens.indexOf(token) === -1) {
        this.tokens.push(token);
    }
  }
}

exports.Classifier = Classifier;
exports.DataSet    = DataSet;
exports.Document   = Document;
