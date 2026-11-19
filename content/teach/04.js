AIM.registerTeach({
  n: 4,
  opening: `<p>A line predicts a number. Many questions need a probability: will this student pass, will this patient deteriorate, is this transaction fraudulent. A probability has to stay between 0 and 1, and a straight line does not. Unit 4 keeps the linear score and changes the output so that it can be read as a chance.</p>
<p>The change is small in notation and large in consequences. The model becomes logistic regression, the loss becomes log loss, and the output needs a threshold before it becomes a decision. Those three pieces are separate: the model produces a probability, the loss fits it, and the threshold chooses an operating point. Confusing them is the most common mistake in applied classification.</p>
<p>Read the concepts in order. The first builds the probability. The second shows what the model's boundary looks like. The third chooses where to put the decision. The fourth explains why the fitting loss punishes confidence so strongly.</p>`,
  concepts: {
    'logistic-model': {
      teach: `<p>Start with the linear score <code>z = w · x + b</code>. It can be any real number. To turn it into a probability, pass it through the <strong>sigmoid</strong>: <code>σ(z) = 1 / (1 + e⁻ᶻ)</code>. The sigmoid is 0.5 at <code>z = 0</code>, approaches 1 as <code>z</code> grows, and approaches 0 as <code>z</code> falls. It never leaves the interval between 0 and 1.</p>
<p>The model is <code>P(y = 1 | x) = σ(w · x + b)</code>. The weights still enter linearly; only the output is transformed. That keeps the gradient simple while giving a probability, which is why logistic regression remains a default for binary classification.</p>
<h4>Odds and log-odds</h4>
<p>The odds of an event are <code>p / (1 - p)</code>. The log-odds are <code>log(p / (1 - p))</code>. In logistic regression, the log-odds are exactly the linear score: <code>log(p / (1 - p)) = w · x + b</code>. This is the cleanest way to read the weights. A one-unit increase in a feature adds its weight to the log-odds, which multiplies the odds by <code>e^w</code>. A weight of 0.7 multiplies the odds by about 2.</p>
<h4>Fitting</h4>
<p>The parameters are chosen by maximum likelihood. For a positive case, the likelihood is the predicted probability; for a negative case, it is one minus that probability. Maximising the product of likelihoods is the same as minimising the sum of negative logs, which is log loss. Unlike least squares, there is no closed-form solution, so fitting uses gradient descent or a Newton-style method.</p>
<p>The gradient for one case is <code>(p - y) x</code>. That is a compact result: the update is proportional to the prediction error times the input. With many cases, sum or average this quantity. Regularisation is common, especially when the classes are separable, because otherwise the weights can grow without bound.</p>
<div class="callout"><b>Probability is not the decision</b><p>The model returns a chance. A separate threshold turns it into a label. Changing the threshold does not retrain the model.</p></div>`,
      work: `<ol class="steps"><li>A fitted model gives <code>z = 2.0</code>.</li><li>Compute <code>e⁻² ≈ 0.135</code>.</li><li><code>σ(2) = 1 / (1 + 0.135) = 0.881</code>.</li><li>At a threshold of 0.5, the case is predicted positive with probability 0.88.</li><li>With <code>z = -1.0</code>, <code>σ(-1) = 0.269</code>, so the same threshold predicts negative.</li></ol>`,
      practice: {
        q: 'A logistic model has a weight of 0.7 on a binary feature. What happens to the predicted odds when the feature turns on, holding the other features fixed?',
        hint: 'The weight adds to the log-odds, so the odds multiply by e raised to that weight.',
        answer: `<p>The log-odds increase by 0.7, so the odds multiply by <code>e^0.7 ≈ 2.01</code>. The probability rises, but by an amount that depends on the starting probability. Near 0.5 a log-odds increase of 0.7 moves the probability substantially; near 0.99 it moves it very little.</p>`
      },
      bridge: 'The model outputs a probability surface. The place where it switches from one class to the other is the decision boundary.'
    },
    'decision-boundary': {
      teach: `<p>The decision boundary is the set of inputs where the model is indifferent between the classes. For logistic regression with threshold 0.5, that is where the probability is 0.5, which happens when the linear score is zero: <code>w · x + b = 0</code>.</p>
<p>With two features, this equation is a straight line. The weight vector <code>w</code> is normal to the line: it points toward the positive class. The offset <code>b</code> shifts the line. Rotating the weights rotates the boundary; changing the offset moves it without rotating it.</p>
<h4>The threshold moves the boundary too</h4>
<p>If the threshold is not 0.5, the boundary is where <code>σ(z) = t</code>. Solving gives <code>z = log(t / (1 - t))</code>. A threshold above 0.5 requires a larger score, so the boundary moves toward the positive class. A threshold below 0.5 moves it toward the negative class. The boundary is therefore a property of the model and the threshold together, not of the weights alone.</p>
<h4>Beyond two features</h4>
<p>With <code>p</code> features, the boundary is a hyperplane of dimension <code>p - 1</code>. You cannot draw it directly beyond three dimensions, but the geometry is the same. A linear boundary cannot solve exclusive-or, or any problem where one class surrounds another. Adding polynomial features can curve the boundary, at the cost of overfitting. A neural network learns its own features and can produce a much more flexible boundary.</p>
<div class="callout"><b>A perfect boundary is not a good model</b><p>A model can separate the training cases perfectly and still put the boundary in a place that fails on new data. The boundary is a summary of the fitted rule, not evidence that the rule generalises.</p></div>`,
      work: `<ol class="steps"><li>Take <code>w = (2, -1)</code> and <code>b = -1</code>.</li><li>The boundary is <code>2x₁ - x₂ - 1 = 0</code>, or <code>x₂ = 2x₁ - 1</code>.</li><li>At <code>(1, 1)</code>: <code>2 - 1 - 1 = 0</code>, so the point lies exactly on the fence.</li><li>At <code>(2, 1)</code>: <code>4 - 1 - 1 = 2</code>, which is positive, so the point falls on the positive side.</li><li>At <code>(0, 2)</code>: <code>0 - 2 - 1 = -3</code>, so the point falls on the negative side.</li></ol>`,
      practice: {
        q: 'A model has a linear boundary. You raise the decision threshold from 0.5 to 0.8. Which way does the boundary move, and does the model change?',
        hint: 'A higher threshold requires a higher score for a positive prediction.',
        answer: `<p>The boundary moves toward the positive class, because a point now needs a larger score to be called positive. The fitted weights and the probability surface do not change. Only the rule that turns a probability into a label changes, so this is a decision change, not a model change.</p>`
      },
      bridge: 'The threshold is a choice, and it should come from the cost of the two errors, not from a default.'
    },
    'thresholds': {
      teach: `<p>The threshold is the probability above which the model predicts positive. It is a decision rule, not a property of the fitted model. Moving it changes the confusion matrix, precision and recall without retraining anything.</p>
<p>Set the threshold from the cost of the two errors. Suppose a missed positive costs <code>C_FN</code> and a false positive costs <code>C_FP</code>. The expected cost of predicting positive for a case with probability <code>p</code> is <code>(1 - p) C_FP</code>. The expected cost of predicting negative is <code>p C_FN</code>. Predict positive when the first is smaller: <code>p C_FP &lt; (1 - p) C_FN</code>, which solves to <code>p &gt; C_FP / (C_FP + C_FN)</code>. If a miss is ten times as costly as a false alarm, the threshold is about 0.09.</p>
<h4>ROC and the operating point</h4>
<p>The ROC curve plots the true positive rate against the false positive rate as the threshold moves. Each point on the curve is one threshold. The area under the curve summarises ranking, but it does not choose a point. The choice depends on the review capacity, the cost of errors and the prevalence in the population where the model will run.</p>
<h4>Calibration and prevalence</h4>
<p>A threshold assumes the probability means what it says. If the model is not calibrated, 0.7 may not correspond to a 70 percent chance. Calibration is separate from ranking: a model can order cases correctly and still assign inflated probabilities. Prevalence also matters. A threshold tuned where 1 in 100 cases is positive can be wrong where 1 in 10 is positive, because the same score corresponds to a different posterior.</p>
<div class="callout"><b>Recheck the operating point</b><p>When the population, the costs or the capacity changes, the best threshold can change even if the model does not.</p></div>`,
      work: `<ol class="steps"><li>Probabilities 0.7, 0.4 and 0.52.</li><li>At threshold 0.5, the labels are positive, negative, positive.</li><li>Lower the threshold to 0.3. The labels become positive, positive, positive.</li><li>The model is unchanged. Only the decision rule moved, and the 0.4 case flipped.</li><li>If a false negative costs four times a false positive, the cost-based threshold is <code>1 / (1 + 4) = 0.2</code>, which is lower again.</li></ol>`,
      practice: {
        q: 'A model is used in a clinic where 20 percent of patients are positive, but the threshold was tuned in a screening program where 2 percent are positive. What do you expect to happen to precision, and why?',
        hint: 'Precision depends on prevalence as well as sensitivity and specificity.',
        answer: `<p>Precision should rise in the clinic, because the prior probability is higher and a positive result is more likely to be a true positive. Recall for a fixed threshold may also change. The threshold should be re-evaluated on data from the clinic, because the operating point that was appropriate at 2 percent prevalence may not match the costs or the capacity at 20 percent.</p>`
      },
      bridge: 'The threshold decides how to act. The loss decides how the probabilities were fitted, and log loss is the loss that matches a probability.'
    },
    'log-loss': {
      teach: `<p>Log loss is the negative log of the probability the model assigned to the true class. For a positive case, <code>L = -log(p)</code>. For a negative case, <code>L = -log(1 - p)</code>. The two can be written together as <code>L = -[y log p + (1 - y) log(1 - p)]</code>.</p>
<p>The shape is the point. A confident correct answer costs almost nothing: <code>-log(0.99) = 0.01</code>. A confident wrong answer costs a lot: <code>-log(0.01) = 4.6</code>. As the predicted probability for the true class approaches zero, the loss grows without bound. The model is punished for being sure and wrong, which is exactly what a probability output should be punished for.</p>
<h4>Where it comes from</h4>
<p>For a Bernoulli variable, the likelihood of the observed label is <code>p</code> when <code>y = 1</code> and <code>1 - p</code> when <code>y = 0</code>. That can be written as <code>pʸ (1 - p)¹⁻ʸ</code>. Taking the negative log gives the loss above. Minimising the sum over cases is maximum likelihood estimation. The gradient with respect to the score is <code>p - y</code>, which is why logistic regression has such a clean update.</p>
<h4>Calibration</h4>
<p>Log loss rewards calibration, not only ranking. A model that ranks cases correctly but assigns inflated probabilities pays for the inflation. Two models can have the same AUC and different log losses; the one with the better-calibrated probabilities has the lower loss. If the decision only uses the ranking, calibration may not matter. If the probability itself drives a decision, it does.</p>
<div class="callout"><b>Numerical clipping</b><p>Log loss is undefined at exactly 0 or 1. Implementations clip probabilities to a small interval, such as <code>[1e-15, 1 - 1e-15]</code>, to keep the logarithm finite.</p></div>
<p>Log loss treats all cases equally. When one class carries most of the cost, weighting the cases or choosing a different threshold is a way to reflect that. The loss and the decision are separate choices.</p>`,
      work: `<ol class="steps"><li>Positive case with <code>p = 0.99</code>: <code>-log(0.99) = 0.010</code>.</li><li>Positive case with <code>p = 0.5</code>: <code>-log(0.5) = 0.693</code>.</li><li>Positive case with <code>p = 0.01</code>: <code>-log(0.01) = 4.605</code>.</li><li>The confident wrong answer costs about 460 times the confident right one.</li><li>For a negative case with <code>p = 0.99</code>, use <code>-log(1 - 0.99) = 4.605</code>. The same confidence in the wrong direction carries the same penalty.</li></ol>`,
      practice: {
        q: 'Two models have the same AUC. Model A outputs probabilities close to 0 and 1; model B outputs probabilities between 0.4 and 0.6. Which is likely to have lower log loss, and why?',
        hint: 'AUC measures ranking; log loss measures the probability assigned to the truth.',
        answer: `<p>The answer depends on the labels and the actual probabilities, but a model that is confidently wrong will be punished severely. If both rank correctly, the better-calibrated model has lower log loss. Model B's cautious probabilities may be better calibrated if the data is noisy; Model A's extremes are only better if they are justified. AUC alone cannot distinguish them.</p>`
      },
      bridge: 'A probability model makes one decision per case. A neural network composes many such decisions into layers.'
    }
  },
  closing: {
    teach: `<p>Logistic regression is a linear score with a sigmoid on the output. The score sets the boundary; the sigmoid turns the score into a probability; log loss fits the probability; the threshold turns it into a decision. Each piece has a separate job, and each can be changed without changing the others.</p>
<p>The same separation appears in every classifier that follows. A neural network will replace the linear score with a deep composition and keep a sigmoid or softmax at the end. The loss will still match the output, and the threshold will still be a decision choice. If you can keep the model, the loss and the decision apart, the more complex models become easier to reason about.</p>`,
    problem: {
      q: 'A model predicts the probability that a loan will default. The bank loses 10,000 on a default it approved and 2,000 on a good loan it rejected. The model is well calibrated. What threshold minimises expected cost, and what would you check before using it?',
      hint: 'Use the cost ratio to derive the threshold.',
      answer: `<p>A false negative is approving a default, which costs 10,000. A false positive is rejecting a good loan, which costs 2,000. Approve when <code>p &lt; 2,000 / (2,000 + 10,000) = 0.167</code>, so reject when the predicted default probability is above about 0.167. Before using it, check that the calibration holds on the bank's population, that the costs are really constant across cases, and that the threshold is applied consistently with any regulatory or fairness constraints.</p>`
    }
  }
});
