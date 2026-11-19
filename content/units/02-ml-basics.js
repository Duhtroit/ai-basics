AIM.registerUnit({
  n: 2, hue: 60, short: 'ML basics',
  title: 'How a model learns, and how you know it did',
  weeks: 'Week 2',
  promise: 'Build the loop that turns data into a model, then the tests that stop you fooling yourself.',
  minutes: 46,
  lectures: ['2.1 Three perspectives', '2.2 K-fold cross validation', '2.3 Evaluation metrics', '2.4 Loss functions', '2.5 Overfitting, bias and variance', '2.6 Research case'],
  concepts: [
    {
      id: 'three-perspectives',
      title: 'Model, learn, infer',
      prereqs: ['four-questions'],
      usecase: 'You have twenty people, each with working hours and income. You want to predict the income of someone new from their hours. The task is small, but it contains every part of a machine learning project.',
      metaphor: {
        name: 'The bakery',
        claim: 'A recipe says what to make. Baking turns ingredients into a cake. Selling slices is what the shop does with the result.',
        mapping: [
          ['the recipe', 'model', 'choose a shape'],
          ['baking and tasting', 'learning', 'adjust until it fits'],
          ['selling a slice', 'inference', 'predict for a new customer']
        ],
        widget: 'perspective-flow',
        lab: {
          title: 'Follow one order through the bakery',
          tryText: 'Step through recipe, bake and sell. Notice where data enters and where it leaves.',
          notice: 'The recipe does not change when a customer arrives. Only the input changes.'
        }
      },
      idea: `<p>Every supervised model has three parts. The <strong>model</strong> is a function with a chosen shape, written f(x; θ). The input x is a vector of <strong>features</strong>, such as hours worked. The output is the <strong>label</strong>, such as income. The parameters θ are the numbers the model does not yet know.</p>
<p><strong>Learning</strong> uses a <strong>training set</strong> of input and label pairs to choose θ. An optimisation algorithm searches for values that make the model's predictions close to the labels. The result is a fitted model, often written with θ* to mark the chosen values.</p>
<p><strong>Inference</strong> applies the fitted model to a new input. The new input must come from the same problem: hours worked predict income, not tomorrow's weather. The output is a prediction, written ŷ to distinguish it from a observed label y.</p>`,
      lecture: {
        ref: '2.1',
        source: 'Transcript, Three perspectives',
        text: 'The lecturer walks through the income example. "At this stage we have the shape of the solution, but we do not know the exact value for these parameters. We know we should use a linear model to solve the problem. Then we use the data to automatically adjust the parameters."'
      },
      mechanics: {
        formula: 'f(x; θ) fitted to pairs (x, y), then ŷ = f(x_new; θ*)',
        symbols: [
          ['f', 'the model mapping from input to output'],
          ['x', 'the feature vector for one case'],
          ['y', 'the observed label'],
          ['ŷ', 'the predicted value'],
          ['θ', 'the parameters before training'],
          ['θ*', 'the parameters chosen by learning']
        ],
        worked: 'Hours 1 and 6 appear with incomes 300 and 800. Assume y = w x + b. The pair of equations gives w = 100 and b = 200. The fitted model is y = 100x + 200. For a new person with 3.5 hours, inference gives 550.'
      },
      mechanism: {
        widget: 'perspective-flow',
        lab: {
          title: 'Watch the parameters move',
          tryText: 'Change the data and the model shape, then run learning. See which parameter values the fit settles on.',
          notice: 'The same three stages apply to every supervised method in this course. Only the shape of f changes.'
        }
      },
      breaks: 'The three stages assume the features at inference look like the features at training. If the world shifts, the fitted parameters are stale. The model also assumes the label you measured is the label you care about, which is often false in medicine and hiring.',
      check: [
        {
          q: 'Which stage chooses the parameter values?',
          options: ['Model', 'Learning', 'Inference', 'Evaluation'],
          answer: 1,
          explain: 'Learning fits θ from data. Modelling chooses the shape of f, and inference applies the fitted model.'
        },
        {
          q: 'A model trained on hours and income is used to predict tomorrow\'s temperature. What is the error?',
          options: ['The learning rate is too high', 'The new input is outside the problem domain', 'The model has too few parameters', 'The labels are noisy'],
          answer: 1,
          explain: 'The fitted function describes one relationship. Applying it to an unrelated input gives numbers with no meaning.'
        }
      ],
      connection: {
        prompt: 'Which earlier idea does the model in this loop belong to?',
        a: 'f(x; θ)', b: 'Paradigm family',
        options: [
          { label: 'A reflex model, because it maps input to output', ok: true },
          { label: 'A state model, because it plans', ok: false },
          { label: 'A logic model, because it proves', ok: false },
          { label: 'A constraint model, because it assigns', ok: false }
        ],
        explain: 'A supervised model is a reflex model with adjustable parameters. The learning loop is what sets those parameters.'
      },
      recap: [
        'Model is the shape, learning chooses the parameters, inference uses them.',
        'Features go in, labels supervise training, predictions come out.',
        'Inference only makes sense inside the problem domain.'
      ],
      now: 'You can now separate the three stages of a supervised project and say what each one produces.'
    },
    {
      id: 'splitting-data',
      title: 'Training, validation and test sets',
      prereqs: ['three-perspectives'],
      usecase: 'A hospital reports that its sepsis model is 94 percent accurate. A reviewer asks how the model was tested. The answer decides whether the number means anything.',
      metaphor: {
        name: 'Rehearsal and opening night',
        claim: 'A theatre troupe rehearses on one set of scenes, adjusts, then performs scenes the audience has not seen. Rehearsing the opening scene until it is perfect teaches the lines, not the play.',
        mapping: [
          ['rehearsal scenes', 'training set', 'fit the model'],
          ['dress rehearsal', 'validation set', 'tune choices'],
          ['opening night', 'test set', 'report the score once']
        ],
        widget: 'split-conveyor',
        lab: {
          title: 'Send cases down three lanes',
          tryText: 'Drag the share of data between training, validation and test. Then look at the score that gets reported.',
          notice: 'The test lane must stay sealed until the end. Every peek makes the final number optimistic.'
        }
      },
      idea: `<p>A model that has seen a case can memorise it. To measure <strong>generalisation</strong>, you need cases the model has not seen. The standard split is three sets. The <strong>training set</strong> fits the parameters. The <strong>validation set</strong> chooses settings the fit does not control, such as the number of polynomial terms or the strength of regularisation. The <strong>test set</strong> is used once, at the end, to report performance.</p>
<p><strong>Data leakage</strong> happens when information from outside the training set reaches the model. Normalising with the mean of the full dataset, selecting features on the test set, or including a patient's future records all leak. The model looks better than it will be in use.</p>
<p>With little data, a single split wastes cases. Cross-validation reuses them, which the next concept covers.</p>`,
      lecture: {
        ref: '2.1',
        source: 'Transcript, Three perspectives',
        text: '"After training, we can apply this model to a new data set. Remember, we should apply the model to the same question, but a new data set." The lecturer then warns that evaluation on the training cases measures memory, not learning.'
      },
      mechanics: {
        formula: 'n_train + n_val + n_test = n, with n_test held out',
        symbols: [
          ['n', 'the number of labelled cases'],
          ['n_train', 'cases used to fit parameters'],
          ['n_val', 'cases used to choose settings'],
          ['n_test', 'cases used once for the final score']
        ],
        worked: 'A dataset has 1,000 patients. Use 600 for training, 200 for validation and 200 for test. A model scores 96 percent on training, 81 percent on validation and 79 percent on test. The gap between training and validation is the signal that the model is memorising. The test score is the one you report.'
      },
      mechanism: {
        widget: 'split-conveyor',
        lab: {
          title: 'Find the leak',
          tryText: 'Run the pipeline with scaling fitted before the split, then after. Compare the reported score with the true score.',
          notice: 'The leak does not change the model. It changes the number you believe about the model.'
        }
      },
      breaks: 'A random split is wrong for time series, where the future must not inform the past. It is also wrong when one patient contributes several rows, because near-duplicates land in both sets. Group by patient, site or date before splitting.',
      check: [
        {
          q: 'Which set should be used to choose the number of polynomial terms?',
          options: ['Training', 'Validation', 'Test', 'All three'],
          answer: 1,
          explain: 'Choosing a setting is a decision, so it needs data the fit did not see. The test set stays sealed until the final report.'
        },
        {
          q: 'A model scores 99 percent on training and 62 percent on test. What is the most likely explanation?',
          options: ['The test set is too small', 'The model memorised the training cases', 'The learning rate was too low', 'The labels are balanced'],
          answer: 1,
          explain: 'The large gap points to overfitting. The model fits details of the training set that do not generalise.'
        }
      ],
      connection: {
        prompt: 'How does the validation set relate to the training set?',
        a: 'Training set', b: 'Validation set',
        options: [
          { label: 'It is held out from fitting but used for choices', ok: true },
          { label: 'It is a copy of the training set', ok: false },
          { label: 'It is used to fit the parameters', ok: false },
          { label: 'It is never used', ok: false }
        ],
        explain: 'Validation data is not used to fit parameters, but it does guide model selection. That is why it cannot also serve as the test set.'
      },
      recap: [
        'Train fits, validation chooses, test reports once.',
        'Leakage makes the score optimistic without changing the model.',
        'Split by group or time when rows are not independent.'
      ],
      now: 'You can now design a split and name the leaks that would invalidate it.'
    },
    {
      id: 'k-fold',
      title: 'K-fold cross-validation',
      prereqs: ['splitting-data'],
      usecase: 'A lab has 90 labelled scans and needs to compare three models. A single 60/20/20 split leaves 18 test scans, and the ranking flips when the split changes.',
      metaphor: {
        name: 'Five study groups',
        claim: 'Five friends prepare for an exam. Each week one friend writes the practice questions while the other four study. Everyone gets tested on material they did not write.',
        mapping: [
          ['the four studying', 'training folds', 'fit the model'],
          ['the one writing', 'held-out fold', 'score the model'],
          ['rotating the writer', 'folds', 'repeat k times']
        ],
        widget: 'kfold',
        lab: {
          title: 'Rotate who sits out',
          tryText: 'Step through five rounds. Each round holds out one block and trains on the rest.',
          notice: 'Every case is used for training four times and for testing once.'
        }
      },
      idea: `<p><strong>Cross-validation</strong> splits the data into k blocks called folds. It trains k times. Each time, one fold is held out and the other k minus one folds are used for fitting. The held-out scores are averaged.</p>
<p>The average is a more stable estimate than a single split, because every case contributes to exactly one test score. It also uses the data more efficiently, which matters when labels are expensive.</p>
<p>The cost is k times the training time. For a cheap model that is fine. For a large network it may be too expensive, and a single well-designed validation split is preferable. The test set stays separate in every scheme.</p>`,
      lecture: {
        ref: '2.2',
        source: 'Transcript, K-fold cross validation',
        text: 'The lecturer presents cross-validation as the way to tune parameters without cheating. "We want to use the data to choose the model, but we cannot evaluate on the same data we used to choose."'
      },
      mechanics: {
        formula: 'score = (1/k) Σ score_i on fold i',
        symbols: [
          ['k', 'the number of folds'],
          ['score_i', 'the score when fold i is held out'],
          ['Σ', 'a sum over the k folds']
        ],
        worked: 'With k = 5 and 90 scans, each fold holds 18 scans. The five scores are 0.74, 0.81, 0.78, 0.76 and 0.79. The mean is 0.776 and the spread is about 0.03. Report the mean and the spread, not a single split result.'
      },
      mechanism: {
        widget: 'kfold',
        lab: {
          title: 'Change k and watch the estimate',
          tryText: 'Set k to 3, 5 and 10. Compare the mean score and the spread across folds.',
          notice: 'Larger k gives each model more training data, but costs more time and produces correlated scores.'
        }
      },
      breaks: 'Random folds leak when cases are grouped: scans from one patient can land in both training and test. Use grouped or stratified folds. Time series needs expanding-window folds, where training always precedes testing. Cross-validation also cannot rescue a dataset that is too small to represent the deployment population.',
      check: [
        {
          q: 'What does each fold serve as during cross-validation?',
          options: ['A training set only', 'A held-out test fold exactly once', 'A copy of the test set', 'A validation set for the final report'],
          answer: 1,
          explain: 'Each fold is held out once while the others train. Averaging the held-out scores gives the estimate.'
        },
        {
          q: 'Why can random k-fold fail on medical scans?',
          options: ['The model is too large', 'Scans from the same patient can appear in training and test', 'k is always too small', 'The labels are continuous'],
          answer: 1,
          explain: 'Near-duplicate records leak identity information. Grouping by patient before splitting prevents it.'
        }
      ],
      connection: {
        prompt: 'Cross-validation changes the split, not the model. What is it estimating?',
        a: 'k-fold average', b: 'Quantity estimated',
        options: [
          { label: 'Generalisation performance', ok: true },
          { label: 'Training loss', ok: false },
          { label: 'The number of parameters', ok: false },
          { label: 'The best learning rate', ok: false }
        ],
        explain: 'The average estimates how the modelling procedure performs on unseen cases, not how well one fitted model scored.'
      },
      recap: [
        'K-fold rotates the held-out block and averages the scores.',
        'It gives a more stable estimate and uses every case.',
        'Group or order the data before splitting when cases are related.'
      ],
      now: 'You can now choose k, read the spread, and explain what the average estimates.'
    },
    {
      id: 'metrics',
      title: 'Accuracy is not enough',
      prereqs: ['k-fold'],
      usecase: 'A hospital screens 10,000 people for a rare disease. One in a hundred has it. A model that says "healthy" every time is 99 percent accurate and useless.',
      metaphor: {
        name: 'The smoke alarm',
        claim: 'An alarm can ring when there is no fire, stay silent when there is one, or get it right. Each failure costs something different.',
        mapping: [
          ['smoke', 'actual positive', 'check the label'],
          ['alarm', 'predicted positive', 'read the decision'],
          ['false alarm', 'false positive', 'count the cost'],
          ['missed fire', 'false negative', 'count the cost']
        ],
        widget: 'confusion',
        lab: {
          title: 'Read the four boxes',
          tryText: 'Move the threshold and watch true positives, false positives, true negatives and false negatives change.',
          notice: 'Every threshold trades one kind of error for the other. Accuracy hides that trade.'
        }
      },
      idea: `<p>A classifier with a score output needs a <strong>threshold</strong> to become a decision. At threshold 0.5, scores above it are called positive. Moving the threshold changes the errors.</p>
<p>The <strong>confusion matrix</strong> counts four outcomes: true positives, false positives, true negatives and false negatives. From it come <strong>precision</strong>, the share of predicted positives that are correct, and <strong>recall</strong>, the share of actual positives that were found. <strong>Accuracy</strong> is the share of all cases that were correct, and it is misleading when classes are imbalanced.</p>
<p>Choose the metric from the cost of errors. A cancer screen tolerates false alarms to avoid misses, so recall matters more. A spam filter tolerates misses to avoid blocking real mail, so precision matters more.</p>`,
      lecture: {
        ref: '2.3',
        source: 'Transcript, Evaluation metrics',
        text: 'The lecturer warns that wrong metrics invalidate entire studies. "If they use the wrong metrics or fail to validate their data properly, the entire paper is built on wrong information."'
      },
      mechanics: {
        formula: 'precision = TP / (TP + FP), recall = TP / (TP + FN)',
        symbols: [
          ['TP', 'positive cases correctly called positive'],
          ['FP', 'negative cases wrongly called positive'],
          ['FN', 'positive cases wrongly called negative'],
          ['TN', 'negative cases correctly called negative']
        ],
        worked: 'Of 10,000 people, 100 have the disease. The model flags 180 people, and 80 of them are genuinely ill. TP = 80, FP = 100, FN = 20. Precision is 80/180 = 0.44. Recall is 80/100 = 0.80. Accuracy is 9,880/10,000 = 0.988, which sounds excellent and says almost nothing.'
      },
      mechanism: {
        widget: 'confusion',
        lab: {
          title: 'Move the operating point',
          tryText: 'Slide the threshold across the score distribution. Watch precision and recall move in opposite directions.',
          notice: 'The model did not change. Only the cost of its two mistakes did.'
        }
      },
      breaks: 'Precision and recall ignore what happens to the many true negatives, which can matter in retrieval. A single number such as F1 weighs them equally, and equal weighting is a choice. Metrics also depend on prevalence: the same model looks better in a high-risk clinic than in the general population.',
      check: [
        {
          q: 'A model flags 50 cases. 40 are true positives and 10 are false positives. What is precision?',
          options: ['0.2', '0.4', '0.8', '0.9'],
          answer: 2,
          explain: 'Precision is 40 / 50 = 0.8. It measures how many flagged cases were real.'
        },
        {
          q: 'Why is 99 percent accuracy a poor summary for a rare disease?',
          options: ['Accuracy is always wrong', 'Predicting the majority class alone reaches 99 percent', 'The dataset is too small', 'Recall cannot be computed'],
          answer: 1,
          explain: 'With 1 percent prevalence, a constant negative prediction scores 99 percent. Precision and recall expose the failure.'
        }
      ],
      connection: {
        prompt: 'Which earlier choice does the threshold depend on?',
        a: 'Threshold', b: 'Cost of errors',
        options: [
          { label: 'The relative cost of a miss and a false alarm', ok: true },
          { label: 'The number of features', ok: false },
          { label: 'The learning rate', ok: false },
          { label: 'The training set size', ok: false }
        ],
        explain: 'The threshold encodes a value judgement. A missed cancer and a false alarm do not cost the same.'
      },
      recap: [
        'A threshold turns scores into decisions and chooses which errors you make.',
        'Precision and recall describe the two error types.',
        'Accuracy misleads under class imbalance.'
      ],
      now: 'You can now pick a metric from the cost of errors and defend the choice.'
    },
    {
      id: 'loss-functions',
      title: 'Loss functions: define wrong',
      prereqs: ['metrics'],
      usecase: 'Two models predict house prices. One is off by 10,000 on every house. The other is perfect on most houses and off by 200,000 on a few. Which is worse depends on what the error costs.',
      metaphor: {
        name: 'Scoring a dart throw',
        claim: 'A referee can score the distance from the bullseye, the squared distance, or the distance to the nearest ring. Each rule rewards different throws.',
        mapping: [
          ['distance from centre', 'residual', 'measure one error'],
          ['the scoring rule', 'loss function', 'choose the penalty'],
          ['total score', 'training loss', 'compare models']
        ],
        widget: 'loss-curve',
        lab: {
          title: 'Change the penalty, change the winner',
          tryText: 'Switch between absolute, squared and logistic penalties on the same errors.',
          notice: 'The data is fixed. The loss decides which mistake the model works hardest to avoid.'
        }
      },
      idea: `<p>A <strong>loss function</strong> turns one prediction error into a number, and training minimises the total. The choice encodes what you care about. <strong>Mean squared error</strong> squares each error, so a few large misses dominate. Mean absolute error treats all misses in proportion to size. <strong>Log loss</strong> punishes confident wrong probabilities.</p>
<p>Loss is not the same as the evaluation metric. A model can train on log loss and be judged on recall. When the two disagree, the training pushes in one direction while the report measures another.</p>
<p>For classification, the loss should match the output. A probability wants log loss. A hard label wants a margin or a cross-entropy variant. Squared error on a probability works, but it saturates and learns slowly when the model is confidently wrong.</p>`,
      lecture: {
        ref: '2.4',
        source: 'Transcript, Loss functions for optimization',
        text: 'The lecturer frames the loss as the definition of a good fit. "We need a way to measure how wrong the model is. Then the optimisation algorithm can reduce that number."'
      },
      mechanics: {
        formula: 'MSE = (1/n) Σ (y - ŷ)²',
        symbols: [
          ['n', 'the number of cases'],
          ['y', 'the observed value'],
          ['ŷ', 'the predicted value'],
          ['Σ', 'a sum over the cases']
        ],
        worked: 'Errors of 1, 1 and 10. MSE is (1 + 1 + 100) / 3 = 34. MAE is (1 + 1 + 10) / 3 = 4. The single large error contributes 98 percent of the MSE. If large errors are unacceptable, MSE is the right pressure. If they are outliers to ignore, MAE is safer.'
      },
      mechanism: {
        widget: 'loss-curve',
        lab: {
          title: 'See which error dominates',
          tryText: 'Drag one residual far from the others. Compare its share of the total under each loss.',
          notice: 'Squared loss turns a 10 into 100. That is why one bad case can pull a whole fit.'
        }
      },
      breaks: 'MSE is sensitive to outliers and to the scale of the output. Log loss punishes confident mistakes without bound and can dominate a batch. A loss that is easy to optimise may not be the quantity you care about, which is why evaluation stays separate.',
      check: [
        {
          q: 'Which loss makes a single large error dominate the total?',
          options: ['Mean absolute error', 'Mean squared error', 'Accuracy', 'Recall'],
          answer: 1,
          explain: 'Squaring grows faster than the error. A residual of 10 contributes 100 to the sum.'
        },
        {
          q: 'Why train on log loss for a probability output?',
          options: ['It is the only differentiable loss', 'It penalises confident wrong probabilities strongly', 'It always improves accuracy', 'It ignores outliers'],
          answer: 1,
          explain: 'Log loss grows sharply as a predicted probability approaches zero for a true positive, which pushes the model away from confident mistakes.'
        }
      ],
      connection: {
        prompt: 'How is loss different from the metric you report?',
        a: 'Loss', b: 'Metric',
        options: [
          { label: 'Loss is optimised, the metric is judged', ok: true },
          { label: 'They are always the same number', ok: false },
          { label: 'The metric is used in training', ok: false },
          { label: 'Loss is only for classification', ok: false }
        ],
        explain: 'Training minimises the loss. Reporting measures what the application cares about. They can differ, and that gap is worth checking.'
      },
      recap: [
        'The loss defines what counts as a bad fit.',
        'Squared error amplifies large misses; absolute error does not.',
        'Log loss matches probability outputs and punishes confident mistakes.'
      ],
      now: 'You can now choose a loss from the cost of errors and say how it differs from the reported metric.'
    },
    {
      id: 'overfitting',
      title: 'Overfitting: memorising the answers',
      prereqs: ['loss-functions'],
      usecase: 'A student fits a curve through eight noisy measurements. With a high-degree polynomial the curve passes through every point. It also swings wildly between them, and its predictions on new points are worse than a straight line.',
      metaphor: {
        name: 'Memorising past papers',
        claim: 'A student who memorises the answers to last year\'s exam scores 100 percent on that paper and fails a new one. Learning the subject would transfer.',
        mapping: [
          ['past papers', 'training set', 'fit the model'],
          ['memorised answers', 'high-capacity fit', 'add complexity'],
          ['a new paper', 'test set', 'measure transfer']
        ],
        widget: 'overfit',
        lab: {
          title: 'Bend the curve through every dot',
          tryText: 'Raise the degree of the polynomial. Watch the training error fall and the test error rise.',
          notice: 'The model gets better on the cases it has seen and worse on the cases it has not.'
        }
      },
      idea: `<p><strong>Overfitting</strong> is a fit that captures noise in the training data rather than the pattern that generalises. Training error keeps falling as capacity rises. Test error falls, reaches a minimum, then rises.</p>
<p>Capacity is the flexibility of the model: the degree of a polynomial, the depth of a tree, the number of parameters in a network. More capacity can fit more patterns and more noise. The right amount depends on the data size and the noise level.</p>
<p>The practical defences are more data, a validation set to stop training, regularisation that penalises large parameters, and simpler models. None of them is free: more data costs money, and stronger regularisation trades training fit for stability.</p>`,
      lecture: {
        ref: '2.5',
        source: 'Transcript, Overfitting, bias and variance',
        text: 'The lecturer contrasts a model that captures the trend with one that follows every fluctuation. "It fits the training data very well, but on new data it performs badly. That is overfitting."'
      },
      mechanics: {
        formula: 'E_test = E_train + gap(capacity, n)',
        symbols: [
          ['E_test', 'error on unseen cases'],
          ['E_train', 'error on training cases'],
          ['capacity', 'flexibility of the model'],
          ['n', 'the number of training cases']
        ],
        worked: 'A degree-1 fit has training error 4.1 and test error 4.3. A degree-9 fit has training error 0.0 and test error 7.8. The second model is better on the data it saw and worse on everything else. Validation error picks the degree, not training error.'
      },
      mechanism: {
        widget: 'overfit',
        lab: {
          title: 'Find the sweet spot',
          tryText: 'Add noise, then change the degree. Watch the validation curve and the shape of the fit together.',
          notice: 'The best degree is where validation error bottoms out, which is rarely the degree with the lowest training error.'
        }
      },
      breaks: 'A model can overfit the validation set too, if you try enough settings. That is why the test set exists. Overfitting also hides in preprocessing choices, such as feature selection run on the full dataset. And with very little data, even a simple model can overfit.',
      check: [
        {
          q: 'Which pattern shows overfitting?',
          options: ['Training error high, test error high', 'Training error low, test error high', 'Training error high, test error low', 'Both errors fall together'],
          answer: 1,
          explain: 'The gap between low training error and high test error is the signature. The model has learned the training cases too specifically.'
        },
        {
          q: 'Which action is least likely to reduce overfitting?',
          options: ['Collect more data', 'Increase polynomial degree', 'Add regularisation', 'Stop training earlier'],
          answer: 1,
          explain: 'More degree means more capacity, which usually increases overfitting. The other three reduce it.'
        }
      ],
      connection: {
        prompt: 'Overfitting and data splitting are two halves of the same problem. What does the split give you?',
        a: 'Overfitting', b: 'Validation split',
        options: [
          { label: 'A way to detect it before the test set', ok: true },
          { label: 'A way to remove it', ok: false },
          { label: 'More training data', ok: false },
          { label: 'A lower learning rate', ok: false }
        ],
        explain: 'The validation split measures the gap while you still have choices left. The test set only reports after those choices are frozen.'
      },
      recap: [
        'Overfitting fits noise and loses generalisation.',
        'Training error falls while test error can rise.',
        'Validation error, more data and regularisation are the controls.'
      ],
      now: 'You can now diagnose overfitting from a training and validation gap.'
    },
    {
      id: 'bias-variance',
      title: 'Bias, variance and the archer',
      prereqs: ['overfitting'],
      usecase: 'A research group fits a complex model to 40 patients and reports a strong result. A second group repeats the study with 40 new patients and the effect disappears. The first model was fitting the sample, not the population.',
      metaphor: {
        name: 'The archer',
        claim: 'An archer can aim consistently at the wrong spot, scatter shots around the right spot, or do both. Accuracy needs a good aim and a steady hand.',
        mapping: [
          ['distance from the bullseye', 'bias', 'change the model family'],
          ['spread of shots', 'variance', 'add data or simplify'],
          ['the bullseye', 'true value', 'measure on new data']
        ],
        widget: 'bias-variance',
        lab: {
          title: 'Aim and steadiness',
          tryText: 'Move the aim away from centre, then increase the spread. Watch the shot pattern and the total error.',
          notice: 'Total error has two parts. Fixing one can make the other worse.'
        }
      },
      idea: `<p><strong>Bias</strong> is error from a model that cannot represent the true pattern. A straight line through a curve is biased. <strong>Variance</strong> is error from sensitivity to the particular training sample. A high-degree polynomial has high variance: change a few points and the curve moves.</p>
<p>Expected squared error decomposes into bias squared plus variance plus irreducible noise. Simple models tend to have high bias and low variance. Complex models trade the other way. The best capacity balances the two for the data you have.</p>
<p>The practical reading: if training and validation errors are both high, the model is too simple. If training error is low and validation error is high, the model is too complex. More data reduces variance without adding bias.</p>`,
      lecture: {
        ref: '2.6',
        source: 'Transcript, Summary using a real research case',
        text: 'The lecturer uses a published case where a flexible model found a pattern in a small sample. "The model was confident, but the pattern did not exist in the population. This is why we care about bias and variance, not only training error."'
      },
      mechanics: {
        formula: 'E[(y - ŷ)²] = bias² + variance + σ²',
        symbols: [
          ['E', 'the expectation over training sets'],
          ['y', 'the true value'],
          ['ŷ', 'the prediction'],
          ['bias', 'average gap between prediction and truth'],
          ['variance', 'spread of predictions across samples'],
          ['σ²', 'noise that no model can remove']
        ],
        worked: 'A model has bias 3 and variance 4. Expected squared error is 9 + 4 + noise. A second model has bias 1 and variance 9. Its expected error is 1 + 9 + noise. The first model is better despite the larger bias. Lower bias alone is not the goal.'
      },
      mechanism: {
        widget: 'bias-variance',
        lab: {
          title: 'Watch the two errors trade',
          tryText: 'Increase model complexity and watch bias fall while variance rises. Find the minimum of the total.',
          notice: 'The best model is not the one with the lowest bias. It is the one with the lowest total.'
        }
      },
      breaks: 'The decomposition assumes squared error and repeated samples from the same distribution. With a different loss, the trade still exists but the algebra changes. In deployment the distribution shifts, so both terms can grow in ways the training data cannot show.',
      check: [
        {
          q: 'A model has low training error and high validation error. Which term dominates?',
          options: ['Bias', 'Variance', 'Irreducible noise', 'None'],
          answer: 1,
          explain: 'Sensitivity to the training sample shows up as a gap between training and validation. That is variance.'
        },
        {
          q: 'What does adding more data usually reduce?',
          options: ['Bias', 'Variance', 'Irreducible noise', 'The number of features'],
          answer: 1,
          explain: 'More cases stabilise the fit across samples. They do not fix a model family that cannot represent the pattern.'
        }
      ],
      connection: {
        prompt: 'Which earlier defence against overfitting attacks variance directly?',
        a: 'Overfitting', b: 'Regularisation',
        options: [
          { label: 'It shrinks parameters and reduces variance', ok: true },
          { label: 'It increases bias only', ok: false },
          { label: 'It adds training data', ok: false },
          { label: 'It changes the test set', ok: false }
        ],
        explain: 'Regularisation constrains the fit, which lowers variance and raises bias. The strength controls the trade.'
      },
      recap: [
        'Bias is a model family that cannot fit the pattern.',
        'Variance is sensitivity to the particular sample.',
        'Total error trades one against the other, and more data lowers variance.'
      ],
      now: 'You can now read a learning curve and say whether the model needs more capacity or more data.'
    }
  ],
  test: [
    {
      q: 'Which stage applies a fitted model to a new case?',
      options: ['Modelling', 'Learning', 'Inference', 'Validation'],
      answer: 2,
      explain: 'Inference uses the chosen parameters on a new input.'
    },
    {
      q: 'What is the validation set for?',
      options: ['Fitting parameters', 'Choosing settings', 'Reporting the final score', 'Storing labels'],
      answer: 1,
      explain: 'Validation data guides choices such as model complexity. The test set reports the final score.'
    },
    {
      q: 'In 5-fold cross-validation, how often is each case used for training?',
      options: ['Once', 'Twice', 'Four times', 'Five times'],
      answer: 2,
      explain: 'Each case sits out one fold and trains in the other four.'
    },
    {
      q: 'A model has 120 true positives, 30 false positives and 50 false negatives. What is recall?',
      options: ['0.71', '0.8', '0.6', '0.24'],
      answer: 0,
      explain: 'Recall is 120 / (120 + 50) = 0.706.'
    },
    {
      q: 'Which loss is most sensitive to one large outlier?',
      options: ['Mean absolute error', 'Mean squared error', 'Accuracy', 'Precision'],
      answer: 1,
      explain: 'Squaring makes a large residual dominate the total.'
    },
    {
      q: 'Training error 0.01, validation error 0.42. What should you try first?',
      options: ['A more complex model', 'A simpler model or more data', 'A higher learning rate', 'A larger test set'],
      answer: 1,
      explain: 'The gap points to variance. Simplifying or adding data reduces it.'
    },
    {
      q: 'Which term does more training data reduce?',
      options: ['Bias', 'Variance', 'Irreducible noise', 'Label noise'],
      answer: 1,
      explain: 'More cases stabilise the estimate across samples.'
    },
    {
      q: 'A model normalises features using the mean of the full dataset before splitting. What is the problem?',
      options: ['It is slower', 'Test information leaks into training', 'It increases bias', 'It reduces variance'],
      answer: 1,
      explain: 'The mean carries information from the test rows. Fit the scaler on training data only.'
    }
,
    {
      type: 'numeric',
      q: 'A classifier finds 40 true positives and misses 10 positive cases. It produces no false positives. What is its recall as a decimal?',
      answer: 0.8,
      tolerance: 0.005,
      explain: 'Recall is true positives divided by all positives: 40 / (40 + 10) = 0.8.'
    },
    {
      type: 'ordering',
      q: 'Order the steps of an honest evaluation.',
      items: [
        'Split the rows into training, validation and test sets',
        'Fit the scaler on the training rows',
        'Fit the model on the training rows',
        'Choose settings on the validation rows',
        'Report the score on the test rows'
      ],
      explain: 'The test rows stay untouched until the end. Scalers and settings are chosen without them.'
    },
    {
      type: 'error',
      q: 'A team evaluates a model on tabular data. One step is wrong. Which one?',
      steps: [
        'Split the rows into training and test sets.',
        'Fit the scaler on the combined training and test rows.',
        'Fit the model on the training rows only.',
        'Report the score on the test rows.'
      ],
      answer: 1,
      explain: 'Fitting the scaler on all rows lets test statistics into training. That is leakage. Fit the scaler on the training rows and reuse its numbers.'
    },
    {
      type: 'short',
      q: 'Why does a low training error not prove that a model will generalise?',
      rubric: [
        'Names overfitting or memorisation',
        'Mentions performance on held-out data',
        'Mentions noise or model capacity'
      ],
      model: 'A flexible model can fit the training rows including their noise, so the training error falls while the error on new rows rises. Generalisation is measured on data the model did not see, which is why a validation or test score is required.',
      explain: 'Training error measures fit to the sample. Generalisation is a claim about unseen cases.'
    }
  ],
  connections: [
    {
      prompt: 'Link the stage to the object it produces.',
      a: 'Stage', b: 'Product',
      options: [
        { label: 'Learning produces parameter values', ok: true },
        { label: 'Inference produces training labels', ok: false },
        { label: 'Modelling produces test scores', ok: false },
        { label: 'Validation produces parameters', ok: false }
      ],
      explain: 'Learning returns θ*. Inference returns ŷ. Modelling returns the shape of f.'
    },
    {
      prompt: 'Bias and variance pull in opposite directions. Which pair is correct?',
      a: 'Model change', b: 'Effect',
      options: [
        { label: 'More capacity lowers bias and raises variance', ok: true },
        { label: 'More capacity raises bias and lowers variance', ok: false },
        { label: 'More data raises variance', ok: false },
        { label: 'Regularisation lowers bias', ok: false }
      ],
      explain: 'Capacity buys fit at the cost of stability. Regularisation buys stability at the cost of fit.'
    }
  ],
  pairs: [
    {
      a: 'The validation set', b: 'The test set',
      claim: 'Both are used to choose model settings.',
      same: false,
      explain: 'Settings are chosen on validation data. The test set is held back for the final report.'
    },
    {
      a: 'Bias', b: 'Variance',
      claim: 'Both fall as the model becomes more complex.',
      same: false,
      explain: 'More capacity usually lowers bias and raises variance. That trade-off is the point.'
    },
    {
      a: 'k-fold cross-validation', b: 'A single train and test split',
      claim: 'Both estimate generalisation using held-out cases.',
      same: true,
      explain: 'Cross-validation repeats the held-out idea k times and averages the scores.'
    }
  ],
  map: {
    nodes: [
      { id: 'model', label: 'Model', x: 12, y: 24 },
      { id: 'split', label: 'Split', x: 34, y: 18 },
      { id: 'cv', label: 'Cross-validation', x: 54, y: 26 },
      { id: 'metric', label: 'Metric', x: 80, y: 18 },
      { id: 'loss', label: 'Loss', x: 48, y: 58 },
      { id: 'over', label: 'Overfitting', x: 76, y: 60 }
    ],
    edges: [
      ['model', 'split', 'needs unseen data'],
      ['split', 'cv', 'reuses folds'],
      ['metric', 'over', 'detects the gap'],
      ['loss', 'model', 'trains the parameters'],
      ['over', 'cv', 'validation catches it']
    ]
  }
});
