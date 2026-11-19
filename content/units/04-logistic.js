AIM.registerUnit({
  n: 4, hue: 120, short: 'Classification',
  title: 'From a line to a probability',
  weeks: 'Week 4',
  promise: 'Turn a score into a probability, a probability into a decision, and a decision into a cost you can defend.',
  minutes: 32,
  lectures: ['4.1 Logistic regression', '4.2 The forward process of neural networks'],
  concepts: [
    {
      id: 'logistic-model',
      title: 'Logistic regression',
      prereqs: ['linear-model', 'metrics'],
      usecase: 'A tutoring company wants to know whether a student will pass. A linear model predicts 1.3 or -0.4, which are not probabilities. The company needs a number between 0 and 1 that can be read as a chance.',
      metaphor: {
        name: 'The dimmer switch',
        claim: 'A dimmer does not jump from off to on. It bends the response so that small turns near the end change the light little, and turns in the middle change it a lot.',
        mapping: [
          ['the turn', 'linear score z', 'change the inputs'],
          ['the light level', 'probability', 'read the output'],
          ['the curve of the dimmer', 'sigmoid', 'fixed shape']
        ],
        widget: 'sigmoid',
        lab: {
          title: 'Turn the dial',
          tryText: 'Move the score from very negative to very positive. Watch the probability bend between 0 and 1.',
          notice: 'The middle is sensitive and the ends are flat. That shape is the sigmoid.'
        }
      },
      idea: `<p><strong>Logistic regression</strong> keeps the linear score z = w·x + b and passes it through a <strong>sigmoid</strong>. The sigmoid maps any real number to a value between 0 and 1: σ(z) = 1 / (1 + e⁻ᶻ). The output is a probability that the case is positive.</p>
<p>The model is still linear in its parameters. Only the output is transformed. That keeps the gradient simple while giving a probability, which is why the method remains a default for binary classification.</p>
<p>The probability is not the decision. A separate threshold turns it into a label, and the next concepts deal with that choice. Fitting uses log loss rather than squared error, because log loss matches a probability output.</p>`,
      lecture: {
        ref: '4.1',
        source: 'Transcript, Logistic regression',
        text: 'The lecturer motivates the change from regression to classification. "For a yes or no decision, a straight line is not enough. We need an output that can be interpreted as a probability."'
      },
      mechanics: {
        formula: 'P(y = 1 | x) = σ(w·x + b)',
        symbols: [
          ['P(y = 1 | x)', 'the probability of the positive class given the features'],
          ['σ', 'the sigmoid function'],
          ['w', 'the weight vector'],
          ['b', 'the offset'],
          ['x', 'the feature vector']
        ],
        worked: 'A model gives z = 2.0. The sigmoid is 1 / (1 + e⁻²) = 0.88. The case is predicted positive with probability 0.88 at a threshold of 0.5. With z = -1.0 the probability is 0.27, so the same threshold predicts negative.'
      },
      mechanism: {
        widget: 'sigmoid',
        lab: {
          title: 'Move the slope and the offset',
          tryText: 'Change w and b. Watch how the curve steepens and shifts along the score axis.',
          notice: 'The offset moves where the 0.5 crossing sits. The weight sets how sharp the transition is.'
        }
      },
      breaks: 'Logistic regression can only separate classes with a linear boundary in the chosen features. It also assumes the log-odds are linear, which can be wrong. With separable data the weights grow without bound unless regularisation is added.',
      check: [
        {
          q: 'What does the sigmoid do to the linear score?',
          options: ['Rounds it to 0 or 1', 'Maps it between 0 and 1', 'Squares it', 'Removes the offset'],
          answer: 1,
          explain: 'The sigmoid is a smooth curve from 0 to 1, so the output can be read as a probability.'
        },
        {
          q: 'A model outputs 0.73 for a case. What has it given you?',
          options: ['A hard label', 'A probability that the case is positive', 'A residual', 'A loss value'],
          answer: 1,
          explain: 'The output is a probability. Turning it into a label needs a threshold.'
        }
      ],
      connection: {
        prompt: 'Logistic regression reuses which earlier object?',
        a: 'Linear regression', b: 'Logistic regression',
        options: [
          { label: 'The weighted sum, with a different output transform', ok: true },
          { label: 'The squared-error loss', ok: false },
          { label: 'The matrix inverse', ok: false },
          { label: 'The decision tree', ok: false }
        ],
        explain: 'The score z = w·x + b is the same. The sigmoid and the loss change, not the linear core.'
      },
      recap: [
        'Logistic regression turns a linear score into a probability.',
        'The sigmoid keeps the output between 0 and 1.',
        'A probability still needs a threshold to become a decision.'
      ],
      now: 'You can now read a logistic model and explain why the output is a probability, not a label.'
    },
    {
      id: 'decision-boundary',
      title: 'The decision boundary',
      prereqs: ['logistic-model'],
      usecase: 'A bank scores loan applications on income and debt ratio. It needs to see which combinations are approved and which are refused, and how changing the model moves that line.',
      metaphor: {
        name: 'The fence in a field',
        claim: 'Two flocks graze on one field. A fence separates them. The fence can be straight, tilted, or curved, and its position decides which animals end up on which side.',
        mapping: [
          ['the fence', 'decision boundary', 'drag the line'],
          ['an animal', 'a case', 'place a point'],
          ['the side', 'predicted class', 'read the label']
        ],
        widget: 'boundary',
        lab: {
          title: 'Move the fence',
          tryText: 'Drag the line to separate the two groups. Then add a point on the wrong side.',
          notice: 'Every boundary makes some errors. The question is which errors you accept.'
        }
      },
      idea: `<p>The <strong>decision boundary</strong> is the set of inputs where the model is indifferent between classes. For logistic regression with two features it is a straight line, because the model switches class where w·x + b = 0.</p>
<p>The boundary is a property of the model and the threshold together. Rotating the weights rotates the line. Changing the offset shifts it. Changing the threshold moves it too, because the crossing point moves along the probability curve.</p>
<p>A model can fit the training points perfectly and still put the boundary in a place that fails on new data. The boundary is a summary of the learned rule, so it is worth drawing even when there are more than two features.</p>`,
      lecture: {
        ref: '4.1',
        source: 'Transcript, Logistic regression',
        text: 'The lecturer draws two clouds and a separating line. "The model learns where to put this boundary. Points on one side are classified as one class, points on the other side as the other."'
      },
      mechanics: {
        formula: 'w·x + b = 0',
        symbols: [
          ['w', 'the weight vector, normal to the boundary'],
          ['x', 'a point on the boundary'],
          ['b', 'the offset that shifts the boundary']
        ],
        worked: 'With w = (2, -1) and b = -1, the boundary is 2x₁ - x₂ - 1 = 0, or x₂ = 2x₁ - 1. The point (1, 1) gives 2 - 1 - 1 = 0, so it sits exactly on the fence. The point (2, 1) gives 2, which is positive, so it falls on the positive side.'
      },
      mechanism: {
        widget: 'boundary',
        lab: {
          title: 'Rotate and shift the fence',
          tryText: 'Change the two weights and the offset. Watch the line rotate and translate.',
          notice: 'The weights set the angle, the offset sets the distance from the origin.'
        }
      },
      breaks: 'A linear boundary cannot solve exclusive-or or any problem where one class surrounds another. Adding polynomial features can curve the boundary, at the cost of overfitting. And a boundary drawn on two features hides the other dimensions the model actually uses.',
      check: [
        {
          q: 'What does the weight vector control?',
          options: ['The position of the boundary along the origin', 'The orientation of the boundary', 'The number of classes', 'The loss value'],
          answer: 1,
          explain: 'The weights are normal to the boundary, so they set its angle. The offset moves it.'
        },
        {
          q: 'Where does logistic regression switch class at threshold 0.5?',
          options: ['Where the score is 1', 'Where the score is 0', 'Where the probability is 0.5', 'Where the loss is smallest'],
          answer: 2,
          explain: 'The sigmoid equals 0.5 at score 0, so the boundary is the set of points with w·x + b = 0.'
        }
      ],
      connection: {
        prompt: 'The boundary and the threshold both change decisions. How do they differ?',
        a: 'Boundary', b: 'Threshold',
        options: [
          { label: 'The boundary lives in input space, the threshold on the probability', ok: true },
          { label: 'They are the same object', ok: false },
          { label: 'The threshold changes the weights', ok: false },
          { label: 'The boundary is only for regression', ok: false }
        ],
        explain: 'The threshold acts on the model output. The boundary is the image of that threshold back in input space.'
      },
      recap: [
        'The boundary is where the model is indifferent between classes.',
        'Weights set its angle, the offset sets its position.',
        'A linear boundary cannot express every pattern.'
      ],
      now: 'You can now draw the boundary for a two-feature model and explain what moves it.'
    },
    {
      id: 'thresholds',
      title: 'Thresholds and the cost of mistakes',
      prereqs: ['decision-boundary'],
      usecase: 'A triage model scores patients from 0 to 1. The hospital can admit 40 people a night. The threshold decides who gets a bed, and the two mistakes have very different costs.',
      metaphor: {
        name: 'The turnstile',
        claim: 'A turnstile opens above a certain ticket value. Lower the bar and more people enter, including some without valid tickets.',
        mapping: [
          ['the bar height', 'threshold', 'move the slider'],
          ['valid tickets', 'true positives', 'count'],
          ['gate-crashers', 'false positives', 'count']
        ],
        widget: 'threshold-trade',
        lab: {
          title: 'Lower the bar',
          tryText: 'Move the threshold down. Watch recall rise and precision fall.',
          notice: 'You cannot raise both at once with a fixed model. The threshold chooses the mix.'
        }
      },
      idea: `<p>The <strong>threshold</strong> is the probability above which the model predicts positive. It is a decision rule, not a property of the fitted model. Moving it changes precision, recall and the confusion matrix without retraining anything.</p>
<p>Set the threshold from the cost of the two errors. If a missed case is ten times as costly as a false alarm, accept more false alarms. If a false alarm triggers an expensive investigation, demand more evidence.</p>
<p>The best threshold on a validation set is not necessarily the best in deployment. Prevalence changes, and a threshold tuned at one in a hundred becomes wrong at one in ten. Recheck the operating point when the population changes.</p>`,
      lecture: {
        ref: '4.1',
        source: 'Transcript, Logistic regression',
        text: 'The lecturer separates the score from the decision. "The model gives a probability. We still need to decide where to cut it, and that depends on the problem, not on the model."'
      },
      mechanics: {
        formula: 'ŷ = 1 when P(y = 1 | x) ≥ t',
        symbols: [
          ['ŷ', 'the predicted class'],
          ['t', 'the threshold'],
          ['P(y = 1 | x)', 'the model probability']
        ],
        worked: 'With t = 0.5, probabilities 0.7, 0.4 and 0.52 become positive, negative, positive. Lower t to 0.3 and the 0.4 case flips to positive. The model is unchanged. Only the rule changed.'
      },
      mechanism: {
        widget: 'threshold-trade',
        lab: {
          title: 'Set the threshold from a cost ratio',
          tryText: 'Set the cost of a miss relative to a false alarm. The recommended threshold moves with it.',
          notice: 'The threshold is a value judgement written as a number. The model cannot supply it.'
        }
      },
      breaks: 'A single threshold is wrong when costs vary by case: a false alarm on a low-risk patient is cheaper than on a high-risk one. Thresholds also fail when the score is poorly calibrated, because 0.7 may not mean a 70 percent chance. Calibration is a separate property from ranking.',
      check: [
        {
          q: 'Lowering the threshold usually does what?',
          options: ['Raises precision and lowers recall', 'Raises recall and lowers precision', 'Raises both', 'Changes the model weights'],
          answer: 1,
          explain: 'More cases are called positive, so more true positives are found and more false positives appear.'
        },
        {
          q: 'Where should the threshold come from?',
          options: ['Always 0.5', 'The cost of the two error types', 'The training accuracy', 'The number of features'],
          answer: 1,
          explain: 'The threshold encodes the relative cost of a miss and a false alarm. A default of 0.5 is rarely the right choice.'
        }
      ],
      connection: {
        prompt: 'The threshold and the metric are chosen together. Which earlier concept names the trade?',
        a: 'Threshold', b: 'Precision and recall',
        options: [
          { label: 'They move in opposite directions along the score', ok: true },
          { label: 'They are independent', ok: false },
          { label: 'Recall falls as the threshold falls', ok: false },
          { label: 'Precision rises as the threshold falls', ok: false }
        ],
        explain: 'As the threshold falls, recall rises because more positives are caught, and precision falls because more false alarms enter.'
      },
      recap: [
        'The threshold turns probabilities into decisions.',
        'It trades precision against recall without retraining.',
        'Set it from the cost of errors and recheck it when prevalence shifts.'
      ],
      now: 'You can now choose an operating point and justify it with a cost ratio.'
    },
    {
      id: 'log-loss',
      title: 'Log loss: punishing confidence',
      prereqs: ['thresholds'],
      usecase: 'A model says 0.99 that a patient is healthy. The patient is ill. A second model says 0.6 and is also wrong. The first mistake is worse because the model was certain.',
      metaphor: {
        name: 'The penalty meter',
        claim: 'A meter charges little for a cautious wrong answer and a lot for a confident one. The charge grows without limit as confidence approaches certainty.',
        mapping: [
          ['the meter reading', 'log loss', 'read the penalty'],
          ['confidence', 'predicted probability', 'move the slider'],
          ['a wrong answer', 'true label opposite', 'see the charge']
        ],
        widget: 'loss-curve',
        lab: {
          title: 'Charge for confidence',
          tryText: 'Drag the predicted probability for a true positive from 0.99 down to 0.5. Compare the penalty with a confident wrong answer.',
          notice: 'A confident mistake costs far more than a hesitant one. That pressure is the point.'
        }
      },
      idea: `<p><strong>Log loss</strong> is the negative log of the probability the model assigned to the true class. For a positive case it is -log(p). For a negative case it is -log(1 - p). The loss is zero for a confident correct answer and grows without bound as the model becomes confidently wrong.</p>
<p>This shape matches a probability output. Squared error on a probability saturates: once the model is very wrong, the gradient shrinks and learning slows. Log loss keeps pushing, which is why it became the standard for classification.</p>
<p>Log loss rewards calibration, not only ranking. A model that ranks cases correctly but assigns inflated probabilities pays for it.</p>`,
      lecture: {
        ref: '4.1',
        source: 'Transcript, Logistic regression',
        text: 'The lecturer explains why classification uses a different objective from regression. "If the model says 0.99 and is wrong, that should cost much more than saying 0.6 and being wrong."'
      },
      mechanics: {
        formula: 'L = -[y log p + (1 - y) log(1 - p)]',
        symbols: [
          ['L', 'the log loss for one case'],
          ['y', 'the true label, 0 or 1'],
          ['p', 'the predicted probability of the positive class'],
          ['log', 'the natural logarithm']
        ],
        worked: 'For a positive case with p = 0.99, the loss is -log(0.99) = 0.01. With p = 0.5 it is 0.69. With p = 0.01 it is 4.6. The penalty for a confident wrong answer is hundreds of times the penalty for a confident right one.'
      },
      mechanism: {
        widget: 'loss-curve',
        lab: {
          title: 'Compare loss shapes',
          tryText: 'Switch between squared error and log loss on the same probability. Push the prediction toward the wrong end.',
          notice: 'Squared error flattens when the model is badly wrong. Log loss keeps climbing.'
        }
      },
      breaks: 'Log loss is undefined at exactly 0 or 1, so implementations clip probabilities. It also punishes calibration errors that may not matter for a ranking task. And it treats all cases equally, which is wrong when one class carries most of the cost.',
      check: [
        {
          q: 'Which mistake has the larger log loss?',
          options: ['Predicting 0.6 for a positive case', 'Predicting 0.99 for a negative case', 'They are equal', 'Log loss cannot compare them'],
          answer: 1,
          explain: 'The confident wrong answer assigns almost no probability to the truth, so -log(1 - 0.99) is large.'
        },
        {
          q: 'Why not use squared error for a probability output?',
          options: ['It is not differentiable', 'It saturates when the model is confidently wrong', 'It has no minimum', 'It requires a threshold'],
          answer: 1,
          explain: 'The gradient shrinks as the error grows, so learning stalls exactly when the model is most wrong.'
        }
      ],
      connection: {
        prompt: 'Log loss and the confusion matrix measure different things. Which one does training use?',
        a: 'Log loss', b: 'Confusion matrix',
        options: [
          { label: 'Training uses the loss; the matrix describes decisions after a threshold', ok: true },
          { label: 'Training uses the matrix', ok: false },
          { label: 'They are the same', ok: false },
          { label: 'Neither is used in training', ok: false }
        ],
        explain: 'The loss is differentiable and drives the fit. The matrix counts outcomes after a threshold turns probabilities into labels.'
      },
      recap: [
        'Log loss charges by the probability assigned to the truth.',
        'Confident mistakes cost far more than hesitant ones.',
        'It matches probability outputs and rewards calibration.'
      ],
      now: 'You can now explain why a confident wrong probability is expensive and why training uses log loss.'
    }
  ],
  test: [
    {
      q: 'What is the range of the sigmoid?',
      options: ['Any real number', 'Between -1 and 1', 'Between 0 and 1', 'Only 0 or 1'],
      answer: 2,
      explain: 'The sigmoid maps any real score into the interval from 0 to 1.'
    },
    {
      q: 'At threshold 0.5, where is the decision boundary?',
      options: ['Where the probability is 1', 'Where the score is 0', 'Where the loss is 0', 'Where x is 0'],
      answer: 1,
      explain: 'The sigmoid equals 0.5 at score 0, which gives w·x + b = 0.'
    },
    {
      q: 'Lowering the threshold does what to recall?',
      options: ['Raises it', 'Lowers it', 'Leaves it unchanged', 'Makes it undefined'],
      answer: 0,
      explain: 'More cases are called positive, so more true positives are caught.'
    },
    {
      q: 'Which quantity does the threshold change?',
      options: ['The fitted weights', 'The confusion matrix', 'The features', 'The training loss'],
      answer: 1,
      explain: 'The model is unchanged. The counts of errors change because the decision rule changes.'
    },
    {
      q: 'Log loss for a positive case with p = 0.5 is about what?',
      options: ['0.01', '0.69', '1.0', '4.6'],
      answer: 1,
      explain: 'The negative log of 0.5 is about 0.693.'
    },
    {
      q: 'Why does squared error learn slowly on a confidently wrong probability?',
      options: ['The loss is too large', 'The gradient shrinks as the error grows', 'The labels are wrong', 'The sigmoid disappears'],
      answer: 1,
      explain: 'The squared-error gradient saturates, so the push toward the truth becomes small.'
    },
    {
      q: 'A linear boundary cannot separate which pattern?',
      options: ['Two well-separated clouds', 'One class inside the other', 'A tilted split', 'A balanced dataset'],
      answer: 1,
      explain: 'A closed curve is needed when one class surrounds the other. A straight line cannot do it.'
    },
    {
      q: 'A model ranks cases well but assigns 0.99 to almost everything positive. What is the problem?',
      options: ['Poor calibration', 'Poor ranking', 'Too few features', 'Too small a test set'],
      answer: 0,
      explain: 'The ranking can be right while the probabilities are inflated. Calibration is a separate property.'
    }
,
    {
      type: 'numeric',
      q: 'A positive case is predicted with probability 0.9. Using natural logarithms, what is its log loss? Give three decimal places.',
      answer: 0.105,
      tolerance: 0.01,
      explain: 'Log loss is minus the log of the probability assigned to the true class: -ln(0.9) = 0.105.'
    },
    {
      type: 'ordering',
      q: 'Order the forward process for one case.',
      items: [
        'Compute the score w dot x plus b',
        'Pass the score through the sigmoid',
        'Read the probability of the positive class',
        'Compare the probability with the threshold',
        'Assign the label'
      ],
      explain: 'The score becomes a probability, and the threshold turns that probability into a decision.'
    },
    {
      type: 'error',
      q: 'A screening test must miss as few cases as possible. One step in the reasoning is wrong. Which one?',
      steps: [
        'The cost of a missed case is high.',
        'Lower the threshold so more cases are flagged.',
        'This raises recall and usually lowers precision.',
        'Raise the threshold to 0.9 so fewer cases are missed.'
      ],
      answer: 3,
      explain: 'Raising the threshold flags fewer cases, so it lowers recall. Lowering the threshold is what catches more true cases.'
    },
    {
      type: 'short',
      q: 'Why is accuracy a poor metric for a rare disease detector?',
      rubric: [
        'Mentions class imbalance',
        'Mentions the majority-class baseline',
        'Mentions precision, recall or the confusion matrix'
      ],
      model: 'If one in a thousand people has the disease, a detector that always says no is 99.9 percent accurate and useless. Accuracy hides the rare class. Precision, recall and the confusion matrix show how many cases were found and how many false alarms were raised.',
      explain: 'Accuracy mixes both classes into one number, which a rare class barely moves.'
    }
  ],
  connections: [
    {
      prompt: 'Link the object to the space it lives in.',
      a: 'Object', b: 'Space',
      options: [
        { label: 'Decision boundary lives in input space', ok: true },
        { label: 'Threshold lives in input space', ok: false },
        { label: 'Weight lives in probability space', ok: false },
        { label: 'Log loss lives in input space', ok: false }
      ],
      explain: 'The boundary is a set of inputs. The threshold is a point on the probability axis.'
    }
  ],
  pairs: [
    {
      a: 'The sigmoid', b: 'The threshold',
      claim: 'Both are learned parameters of the model.',
      same: false,
      explain: 'The sigmoid is a fixed function. The threshold is a chosen setting, not fitted by the loss.'
    },
    {
      a: 'Log loss', b: 'Squared error',
      claim: 'Both punish a confident wrong prediction.',
      same: true,
      explain: 'Both grow as the predicted probability moves away from the true label. Log loss punishes confidence more sharply.'
    },
    {
      a: 'Precision', b: 'Recall',
      claim: 'Both depend on the chosen threshold.',
      same: true,
      explain: 'Moving the threshold trades false positives against false negatives, so both metrics move.'
    }
  ],
  map: {
    nodes: [
      { id: 'score', label: 'Linear score', x: 14, y: 28 },
      { id: 'sig', label: 'Sigmoid', x: 36, y: 20 },
      { id: 'prob', label: 'Probability', x: 56, y: 30 },
      { id: 'thr', label: 'Threshold', x: 78, y: 22 },
      { id: 'loss', label: 'Log loss', x: 46, y: 66 }
    ],
    edges: [
      ['score', 'sig', 'transforms'],
      ['sig', 'prob', 'outputs'],
      ['prob', 'thr', 'becomes a label'],
      ['loss', 'score', 'trains the weights'],
      ['thr', 'loss', 'does not change it']
    ]
  }
});
