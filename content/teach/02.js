AIM.registerTeach({
  n: 2,
  opening: `<p>Unit 1 gave you the map. Unit 2 gives you the method that all learned models share: choose a shape, fit its parameters to examples, then use the fitted model on cases you have not seen. The last step is the one that decides whether the work was worth anything.</p>
<p>A model that scores 99 percent on the data it was trained on has told you almost nothing. It may have memorised the cases. The central question of this unit is how to measure performance on cases the model has not seen, and how to choose a model that will keep working when the data changes.</p>
<p>Read the concepts in order. The first defines the three stages. The next three are about splitting data and measuring the result. The last three explain why a model fails on new cases and what to do about it. Every later unit assumes this vocabulary: training set, validation set, test set, loss, overfitting and generalisation.</p>`,
  concepts: {
    'three-perspectives': {
      teach: `<p>Supervised learning starts with pairs. Each pair is an input <code>x</code> and an observed label <code>y</code>. For a payroll problem, <code>x</code> might be hours worked and <code>y</code> might be income. The goal is a function that predicts <code>y</code> for a new <code>x</code>.</p>
<p>The function has a chosen shape, written <code>f(x; θ)</code>. The shape is the model family: a straight line, a decision tree, a neural network. The parameters <code>θ</code> are the numbers inside that shape that we do not yet know. For a line, the parameters are the slope and intercept. For a network, they are the weights and biases.</p>
<h4>The three stages</h4>
<p><strong>Model</strong> means choosing the shape. <strong>Learn</strong> means using the training pairs to choose <code>θ</code>. A loss function scores how wrong the current predictions are, and an optimiser searches for parameters that make the loss small. The result is a fitted model, written <code>f(x; θ*)</code>. <strong>Infer</strong> means applying the fitted model to a new input to get a prediction <code>ŷ</code>.</p>
<p>These stages are easy to blur. The model family is fixed before training. The parameters change during training. Inference changes nothing; it only reads the fitted function. If you cannot say which stage a piece of code belongs to, you will have trouble debugging it.</p>
<h4>What makes the problem learnable</h4>
<p>The training pairs must contain information that also applies to new cases. If the future looks nothing like the past, no fitting procedure can help. The labels must also measure what you care about. A hospital that trains on "was this patient readmitted in 30 days" is optimising that label, not "was the treatment good". Those are different targets.</p>
<div class="callout"><b>Prediction is not explanation</b><p>A fitted model can predict well without revealing a causal relationship. A strong correlation between hours and income does not prove that changing hours changes income. Unit 2 is about prediction; causal claims need a different design.</p></div>
<p>The fitted model is only valid inside the problem it was trained for. Hours predict income; hours do not predict tomorrow's weather. Inference on a different population is a new problem, even if the code runs without error.</p>`,
      work: `<ol class="steps"><li><b>Choose the shape.</b> Assume income is a line in hours: <code>ŷ = wx + b</code>.</li><li><b>Collect pairs.</b> Suppose two cases are (1 hour, 300) and (6 hours, 800).</li><li><b>Fit.</b> The slope is the change in income over the change in hours: <code>(800 - 300) / (6 - 1) = 100</code>. The intercept is <code>300 - 100 × 1 = 200</code>.</li><li><b>Infer.</b> For 3.5 hours, <code>ŷ = 100 × 3.5 + 200 = 550</code>.</li><li><b>Interpret.</b> The model says each extra hour is associated with 100 more in income, and the baseline is 200. Those are fitted parameters, not policy claims.</li></ol>`,
      practice: {
        q: 'A team normalises its features, fits a model, and then reports predictions. Which of the three stages does each action belong to?',
        hint: 'Normalisation is usually part of fitting, because the scaler is learned from the training data.',
        answer: `<p>Choosing the model shape is the model stage. Fitting the scaler and the model parameters on the training set is the learning stage. Applying the same scaler and the fitted model to a new case is inference. If the scaler was fitted on all the data, it has leaked information from the test set into learning, which is the next concept's problem.</p>`
      },
      bridge: 'The three stages describe one fit. To know whether it generalises, you need data the fit never saw.'
    },
    'splitting-data': {
      teach: `<p>A model can memorise a case it has seen. To measure generalisation, you need cases it has not seen. The standard split has three parts. The <strong>training set</strong> fits the parameters. The <strong>validation set</strong> chooses settings that the fit does not control, such as the number of polynomial terms, the strength of regularisation, or the number of trees. The <strong>test set</strong> is used once, at the end, to report performance.</p>
<p>The separation matters because every choice you make after seeing a score tends to improve that score. If you tune on the test set, the final number is optimistic. The test set is not a second validation set; it is the one measurement you do not get to repeat.</p>
<h4>Data leakage</h4>
<p>Leakage is any information from outside the training set that reaches the model during fitting or selection. Common forms:</p>
<p>Fitting a scaler on all rows, so the training set knows the test set's mean and spread. Selecting features using the test labels. Including a patient's future records in the training data. Letting near-duplicate rows from the same patient, site or session land in both sets. In each case the model looks better than it will be in use.</p>
<p>The fix is to split first and fit every preprocessing step on the training part only. Group by patient, site or date when rows are not independent. For time series, split by time: train on the past, test on the future. A random split would let the model learn from the future.</p>
<div class="callout"><b>Ask what the model would know</b><p>For each feature, ask whether it would be available at the moment of prediction. If not, it is a leak, even if it is in the dataset.</p></div>
<p>With little data, a single split wastes cases and gives a noisy score. Cross-validation reuses the cases and is the next concept. The test set stays separate in every scheme.</p>`,
      work: `<ol class="steps"><li>Start with 1,000 patients.</li><li>Hold out 200 for the test set. Do not touch them until the end.</li><li>From the remaining 800, use 600 for training and 200 for validation.</li><li>Fit the model on the 600. Choose settings on the 200 validation cases.</li><li>Report the final score on the 200 test cases. If training scores 96 percent, validation 81 percent and test 79 percent, the gap between training and validation is the warning sign.</li></ol>`,
      practice: {
        q: 'A team has 5,000 chest X-rays from 800 patients. They split the images randomly into 80 percent training and 20 percent test and get 0.97 AUC. What is the likely problem and how would you fix it?',
        hint: 'Images from the same patient can be near duplicates.',
        answer: `<p>The split is by image, not by patient, so images from the same patient can appear in both sets. The model may recognise the patient rather than the disease, which inflates the score. Split by patient first, then assign all images from a patient to one side. If the data has several sites, consider holding out a site as well, because the deployment may involve a new scanner or population.</p>`
      },
      bridge: 'A single split is noisy. K-fold cross-validation rotates the held-out block so every case contributes to the estimate.'
    },
    'k-fold': {
      teach: `<p>K-fold cross-validation divides the training data into <code>k</code> blocks called folds. It fits the model <code>k</code> times. Each time, one fold is held out and the other <code>k - 1</code> folds are used for fitting. The held-out scores are averaged. Every case is tested exactly once.</p>
<p>The average is a more stable estimate than a single split, because it does not depend on one lucky or unlucky partition. It also uses the data more efficiently, which matters when labels are expensive. The cost is <code>k</code> times the training time. For a cheap model that is fine. For a large network, it may be too expensive, and a single well-designed validation split is preferable.</p>
<h4>Choosing k</h4>
<p>Five or ten folds are common. Small <code>k</code> means each model trains on less data and the folds are cheaper; large <code>k</code> means each model trains on more data and the estimate is closer to leave-one-out, but the cost rises. Leave-one-out is the extreme: <code>k</code> equals the number of cases. It has low bias and high variance, and it can be expensive.</p>
<p>The test set stays separate in every scheme. Cross-validation estimates performance for model selection; it does not replace the final test.</p>
<h4>Grouped and ordered data</h4>
<p>Random folds leak when cases are grouped. If several scans come from one patient, random folds put some of that patient's scans in training and some in validation. Use grouped folds: keep all of a patient's cases in the same fold. Use stratified folds when one class is rare, so each fold has a similar class balance. For time series, use expanding-window folds: train on the past, validate on the next block, then move the window forward.</p>
<div class="callout"><b>Report the spread</b><p>A mean alone hides instability. Report the fold scores or their standard deviation alongside the mean.</p></div>`,
      work: `<ol class="steps"><li>Use <code>k = 5</code> on 90 scans. Each fold holds 18 scans.</li><li>Train five models, each on the other 72 scans.</li><li>Score each model on its held-out 18. Suppose the scores are 0.74, 0.81, 0.78, 0.76 and 0.79.</li><li>Average: <code>(0.74 + 0.81 + 0.78 + 0.76 + 0.79) / 5 = 0.776</code>.</li><li>Report the mean and the spread, roughly 0.776 plus or minus 0.03. A single split might have reported 0.81 and hidden the variance.</li></ol>`,
      practice: {
        q: 'Why is leave-one-out cross-validation not automatically better than 5-fold, even though it trains on almost all the data each time?',
        hint: 'Think about the variance of the estimate and the cost.',
        answer: `<p>Leave-one-out has low bias because each model sees nearly all the data, but the <code>k</code> training sets are almost identical, so their scores are highly correlated and the average has high variance. It also costs <code>n</code> fits. Five-fold is cheaper and often gives a more stable estimate of the quantity you care about, especially when the model is sensitive to small changes in the training set.</p>`
      },
      bridge: 'A score needs a metric. Accuracy is the default and often the wrong one.'
    },
    'metrics': {
      teach: `<p>A classifier usually outputs a score, not a label. A threshold turns the score into a decision. At threshold 0.5, scores above it are called positive. Moving the threshold changes which errors the model makes, without retraining it.</p>
<p>The <strong>confusion matrix</strong> counts four outcomes: true positives, false positives, true negatives and false negatives. From it come precision and recall. <strong>Precision</strong> is the share of predicted positives that are correct: <code>TP / (TP + FP)</code>. <strong>Recall</strong> is the share of actual positives that were found: <code>TP / (TP + FN)</code>. Accuracy is the share of all cases that were correct: <code>(TP + TN) / total</code>.</p>
<h4>Why accuracy misleads</h4>
<p>Screen 10,000 people for a disease that affects 1 in 100. A model that says "healthy" every time is 99 percent accurate and finds no cases. Accuracy is dominated by the negative class. When classes are imbalanced, precision, recall and the costs of the two errors are more informative.</p>
<p>Choose the metric from the cost of mistakes. A cancer screen tolerates false alarms to avoid misses, so recall matters more. A spam filter tolerates misses to avoid blocking real mail, so precision matters more. F1 combines the two with equal weight, which is itself a choice; it is not a universal score.</p>
<h4>Ranking and calibration</h4>
<p>A model can rank cases well and still assign poor probabilities. ROC curves plot the true positive rate against the false positive rate as the threshold moves. AUC summarises the ranking across all thresholds. A high AUC does not mean the probabilities are calibrated; a model can rank well and say 0.9 when the true rate is 0.6. Calibration matters when the number itself drives a decision, such as a bed allocation or an insurance price.</p>
<div class="callout"><b>Prevalence changes the operating point</b><p>The same model has different precision in a high-risk clinic and in the general population. Recheck the threshold when the population changes.</p></div>`,
      work: `<ol class="steps"><li>10,000 people, 100 with the disease.</li><li>The model flags 180 people. 80 of them have the disease, so <code>TP = 80</code> and <code>FP = 100</code>.</li><li>20 cases are missed, so <code>FN = 20</code>. The remaining 9,820 are true negatives.</li><li>Precision is <code>80 / 180 = 0.44</code>. Recall is <code>80 / 100 = 0.80</code>.</li><li>Accuracy is <code>(80 + 9,820) / 10,000 = 0.99</code>. The accuracy sounds excellent and hides that most positive flags are false.</li></ol>`,
      practice: {
        q: 'A fraud team can review 200 alerts a day. Which metric should guide the threshold, and why is recall alone a bad target?',
        hint: 'The team has a fixed review budget, so false alerts consume capacity.',
        answer: `<p>Precision at the review capacity should guide the threshold, because the team can only act on 200 alerts. Recall alone would encourage flagging almost everything, which would find more fraud but bury the team in false alerts. A useful target is the highest recall achievable while keeping precision high enough that the 200 reviewed alerts are worth the effort.</p>`
      },
      bridge: 'The metric judges the output. The loss tells the optimiser what to minimise during training, and the two need not be the same.'
    },
    'loss-functions': {
      teach: `<p>A loss function turns one prediction error into a number. Training minimises the total loss over the training set. The choice of loss encodes what counts as a bad fit, so it is a modelling decision, not a technical detail.</p>
<p><strong>Mean squared error</strong> squares each residual and averages: <code>MSE = (1/n) Σ (y - ŷ)²</code>. Squaring makes positive and negative errors count the same, and it punishes large errors much more than small ones. <strong>Mean absolute error</strong> averages the absolute residuals: <code>MAE = (1/n) Σ |y - ŷ|</code>. It treats a miss in proportion to its size. A single large outlier dominates MSE and has a smaller effect on MAE.</p>
<h4>Loss for probabilities</h4>
<p>When the output is a probability, log loss is the standard choice: <code>L = -[y log p + (1 - y) log(1 - p)]</code>. It is the negative log of the probability assigned to the true class. A confident correct answer costs almost nothing; a confident wrong answer costs a lot. Squared error on a probability also works, but its gradient shrinks when the model is confidently wrong, so learning slows exactly when it should speed up.</p>
<h4>Loss is not the evaluation metric</h4>
<p>A model can train on log loss and be judged on recall. The training pushes one quantity while the report measures another. That is acceptable when the two are aligned, and dangerous when they are not. If the deployment cares about the cost of false negatives, either choose a loss that reflects that cost or adjust the threshold after training.</p>
<div class="callout"><b>Outliers are a decision</b><p>MSE says large errors are unacceptable. MAE says they are part of the data. Neither is universally right; the cost of the error decides.</p></div>
<p>The loss also needs to be optimisable. A discontinuous count such as the number of mistakes is hard to minimise directly, which is why training uses a smooth surrogate and evaluation uses the real metric.</p>`,
      work: `<ol class="steps"><li>Three residuals: 1, 1 and 10.</li><li>MSE: <code>(1² + 1² + 10²) / 3 = 102 / 3 = 34</code>.</li><li>MAE: <code>(1 + 1 + 10) / 3 = 4</code>.</li><li>The single large error contributes 100 of the 102 squared units, about 98 percent of the MSE. Under MAE it contributes 10 of 12, about 83 percent.</li><li>If a large error is catastrophic, use MSE. If large errors are expected noise, MAE is safer.</li></ol>`,
      practice: {
        q: 'A model predicts probabilities for a rare disease. Why is squared error a poor training loss compared with log loss?',
        hint: 'Consider the gradient when the model is confidently wrong.',
        answer: `<p>Squared error on a probability saturates: when the predicted probability is near 0 for a true positive, the error is near 1 but the gradient with respect to the score is small, so learning slows. Log loss keeps a large gradient for confident mistakes and matches the probabilistic output. It also rewards calibration rather than only ranking.</p>`
      },
      bridge: 'Training loss usually falls as capacity rises. Test error does not, which is overfitting.'
    },
    'overfitting': {
      teach: `<p>Overfitting is a fit that captures noise in the training data rather than the pattern that generalises. The model performs well on the cases it saw and worse on new ones. The gap between training error and validation error is the visible symptom.</p>
<p>Capacity is the flexibility of the model: the degree of a polynomial, the depth of a tree, the number of parameters in a network. As capacity rises, training error usually falls. Validation error falls, reaches a minimum, then rises. The minimum is the capacity that matches the data and the noise. Beyond it, the model is fitting the sample.</p>
<h4>An example</h4>
<p>Eight noisy points from a curve. A straight line has training error 4.1 and test error 4.3. A degree-9 polynomial passes through every point, with training error 0.0 and test error 7.8. The complex model is better on the data it saw and worse on everything else. Validation error chooses the degree, not training error.</p>
<h4>Controls</h4>
<p>More data is the most reliable control, because it gives the model more evidence and reduces the chance of fitting noise. Regularisation penalises large parameters, which limits how sharply the function can bend. L2 regularisation adds the sum of squared weights to the loss; L1 adds the sum of absolute weights and can drive some weights to zero. Early stopping watches validation loss and stops before it turns upward. Simpler models, feature selection and dropout are other controls.</p>
<p>None is free. More data costs money. Stronger regularisation trades training fit for stability. Early stopping depends on a validation set that is large enough to be informative. The goal is not the lowest training loss; it is the best expected performance on new cases.</p>
<div class="callout"><b>Do not tune on the test set</b><p>Every look at the test score is a chance to overfit the test set. Use validation for decisions and the test set once.</p></div>
<p>Overfitting can hide in preprocessing. Selecting features on the full dataset, tuning a scaler on all rows or choosing a threshold on the test set all leak information. The model looks better without changing its capacity.</p>`,
      work: `<ol class="steps"><li>Fit a degree-1 model. Training error 4.1, validation error 4.4.</li><li>Fit a degree-3 model. Training error 2.8, validation error 3.1.</li><li>Fit a degree-9 model. Training error 0.0, validation error 7.8.</li><li>Choose degree 3, the lowest validation error. The degree-9 model has the lowest training error and the worst generalisation.</li><li>Report the chosen model's test error once. Do not go back and try more degrees after seeing it.</li></ol>`,
      practice: {
        q: 'A model has training accuracy 0.99 and validation accuracy 0.72. Name two changes you would try and say why each addresses the gap.',
        hint: 'The gap is variance: the model is fitting the training sample too closely.',
        answer: `<p>Add regularisation to limit the size of the parameters and reduce sensitivity to individual training cases. Get more training data, or use data augmentation, so the model sees more variation and cannot memorise the sample. Either change targets the variance side of the gap. A simpler model or early stopping would also be reasonable.</p>`
      },
      bridge: 'Overfitting is one side of a trade. The other side is a model too simple to represent the pattern. Bias and variance name both.'
    },
    'bias-variance': {
      teach: `<p>Suppose you could draw many training sets from the same population and fit a model to each one. The predictions for a fixed test case would vary across those fits. Their average distance from the truth is <strong>bias</strong>. Their spread around their own average is <strong>variance</strong>. Expected squared error is the sum of bias squared, variance and irreducible noise.</p>
<p><strong>Bias</strong> comes from a model that cannot represent the true pattern. A straight line through a curve is biased: no choice of slope and intercept can follow the bend. <strong>Variance</strong> comes from sensitivity to the particular sample. A high-degree polynomial has high variance: change a few points and the curve moves. The noise term is the part no model can remove.</p>
<h4>The archer</h4>
<p>An archer whose arrows cluster left of the target has high bias and low variance. An archer whose arrows are spread around the target has low bias and high variance. A good model is accurate on average and stable across samples. The analogy is useful because it separates two failures that a single error number hides.</p>
<h4>Reading the errors</h4>
<p>If training and validation errors are both high, the model is too simple or the features are too weak: high bias. If training error is low and validation error is high, the model is too complex: high variance. More data reduces variance without adding bias. More capacity reduces bias and can add variance. Regularisation trades a little bias for less variance.</p>
<div class="callout"><b>Lower bias is not always better</b><p>A model with bias 3 and variance 4 has expected error 13 plus noise. A model with bias 1 and variance 9 has 10 plus noise. The second has lower bias and higher total error.</p></div>
<p>The decomposition assumes squared error and repeated samples from the same distribution. With another loss the algebra changes, but the trade remains. In deployment the distribution can shift, so both terms may grow in ways the training data cannot show.</p>`,
      work: `<ol class="steps"><li>Model A: bias 3, variance 4. Expected squared error is <code>3² + 4 = 13</code>, plus noise.</li><li>Model B: bias 1, variance 9. Expected squared error is <code>1² + 9 = 10</code>, plus noise.</li><li>Model B has lower bias and lower total error here. The comparison depends on the numbers, not on a rule that complex is better.</li><li>If the data size doubles, variance often falls. That can make the higher-capacity model the better choice without changing its bias.</li></ol>`,
      practice: {
        q: 'A model has low training error and high validation error. Is that bias or variance, and what would you change first?',
        hint: 'The model fits the training sample closely but does not transfer.',
        answer: `<p>That is variance. The model is sensitive to the particular training sample. Reduce capacity or add regularisation, and get more data if possible. More data lowers variance without increasing bias, which is why it is often the first thing to try when the gap is large.</p>`
      },
      bridge: 'You can now measure a fit and diagnose it. Unit 3 builds the first model in full: the straight line, fitted exactly and then fitted iteratively.'
    }
  },
  closing: {
    teach: `<p>Every learned model in this course goes through the same cycle: choose a shape, fit parameters on training data, choose settings on validation data, and report once on test data. The cycle is simple. The failures come from leakage, from optimising a loss that does not match the decision, and from confusing training performance with generalisation.</p>
<p>The bias-variance lens gives you a diagnosis. High training and validation error means the model is too weak. Low training and high validation error means it is too flexible. A large gap also points to leakage or a distribution shift, so check the split before adding capacity. The next units make these ideas concrete on lines, probabilities and networks.</p>`,
    problem: {
      q: 'A team reports 0.98 accuracy on a fraud dataset where 1 percent of cases are fraud. They tuned the threshold on the test set and normalised features using all rows. Name three problems with the evaluation and the fix for each.',
      hint: 'Think about the metric, the test set and leakage.',
      answer: `<p>First, accuracy is misleading at 1 percent prevalence; a model that predicts "not fraud" is 99 percent accurate. Report precision, recall and the confusion matrix at the operating threshold. Second, tuning on the test set makes the final score optimistic; tune on a validation set and touch the test set once. Third, fitting the scaler on all rows leaks test information into training; fit it on the training rows only and apply the same values to validation and test.</p>`
    }
  }
});
