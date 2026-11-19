AIM.registerTeach({
  n: 6,
  opening: `<p>A decision tree predicts by asking a short sequence of questions. The path from the root to a leaf is the explanation for a case. That readability is the reason trees are used in medicine, credit and operations, where a person needs to see why a decision was made.</p>
<p>The unit builds a tree in stages. First the structure: nodes, branches and leaves. Then the score that chooses a split, entropy and information gain. Then three algorithms that differ in how they score and split: ID3, C4.5 and CART. The last two concepts combine many trees into an ensemble, which trades readability for stability and accuracy.</p>
<p>Keep the bias-variance lens from Unit 2 nearby. A single deep tree has low bias and high variance. Bagging and boosting are two different attacks on that variance, and they fail in different ways.</p>`,
  concepts: {
    'twenty-questions': {
      teach: `<p>A decision tree asks a sequence of questions about features. Each internal node tests one feature, each branch follows an answer, and each leaf gives a prediction. A case starts at the root and follows the tests until it reaches a leaf. The path is the explanation.</p>
<p>A tree can handle mixed feature types, needs little preprocessing and represents interactions that a linear model misses. A later question can depend on the answers before it, so the effect of one feature can differ across branches. That is a natural way to express rules such as "if income is high, then debt matters; if income is low, employment length matters more".</p>
<h4>Axis-aligned splits</h4>
<p>Most trees split on one feature at a time: <code>x₂ ≤ 5</code>, <code>income &gt; 50</code>. The resulting boundaries are axis-aligned. A diagonal boundary needs many small steps to approximate, which makes trees less efficient than a linear model when the true boundary is a diagonal line. Trees also cannot extrapolate beyond the range of the training labels: a leaf predicts a constant, so a case far outside the training range gets the same leaf value as the nearest training region.</p>
<h4>Instability</h4>
<p>A small change in the data can change the first split, and the whole tree with it. The predictions may stay similar while the tree looks completely different. That instability is high variance, and it is the reason a single tree is rarely the final model when accuracy matters. Bagging and boosting address it later in the unit.</p>
<div class="callout"><b>Read the path, not the picture</b><p>A tree diagram can look authoritative. The explanation for one case is the path it takes, not the whole tree. Check that the path uses features that would be available at prediction time.</p></div>
<p>Depth controls capacity. A tree grown until every leaf is pure will fit the training set perfectly and often generalise poorly. A depth limit, a minimum number of cases per leaf, or pruning after growth are the usual controls.</p>`,
      work: `<ol class="steps"><li>A tree asks <code>income &gt; 50</code> first.</li><li>If yes, it asks <code>debt &lt; 0.3</code>.</li><li>If yes, it predicts approve. If no, it predicts review.</li><li>A case with income 60 and debt 0.2 follows both yes branches and lands on approve.</li><li>A case with income 60 and debt 0.5 takes the second no branch and lands on review. The path is the explanation.</li></ol>`,
      practice: {
        q: 'A tree splits on customer ID and reaches pure leaves. Why is this a bad model even though the training accuracy is perfect?',
        hint: 'What does a customer ID tell you about a new customer?',
        answer: `<p>The ID is unique to each training case, so the tree memorises the labels instead of learning a pattern. A new customer has an ID the tree has never seen, so the split sends them down an arbitrary branch. The feature has no generalisable meaning. Remove it, or reject features with a branch per case.</p>`
      },
      bridge: 'The structure is clear. The hard part is choosing which question to ask first. Entropy gives that choice a score.'
    },
    'entropy': {
      teach: `<p>Entropy measures how mixed a set of labels is. For a set with two classes, <code>H(S) = -p log₂ p - (1 - p) log₂ (1 - p)</code>. When the set is half and half, entropy is 1 bit. When all labels match, entropy is 0. The unit is bits because the logarithm is base 2.</p>
<p>Information gain is the drop in entropy from a split. Compute the parent entropy, then the weighted average of the child entropies, where the weight is the share of cases in each child. Subtract the child average from the parent. A split that creates pure children has high gain; a split that leaves each child as mixed as the parent has zero gain.</p>
<div class="derive"><p><code>H(S) = -Σ p log₂ p</code></p><p><code>gain(S, A) = H(S) - Σ (|Sᵥ| / |S|) H(Sᵥ)</code></p></div>
<h4>Why greed is used</h4>
<p>Finding the best tree is hard. The greedy algorithm evaluates every candidate split at the current node, picks the one with the highest gain, and recurses. Greedy is not optimal: a split with low immediate gain can enable a much better split below. It is fast and works well in practice, which is why it is the standard.</p>
<h4>The bias toward many values</h4>
<p>Information gain favours features with many values. A feature with one value per case produces many small, pure children, which looks like a large gain. A customer ID would win everywhere. C4.5 corrects this with a penalty for the number of branches, which is the next concept.</p>
<div class="callout"><b>Small branches mislead</b><p>A child with two cases can be pure by chance. Require a minimum number of cases per leaf, or use a validation set to prune.</p></div>`,
      work: `<ol class="steps"><li>A set has 6 positive and 6 negative cases. Entropy is <code>1</code> bit.</li><li>Split it into two sets of 6. One has 5 positive and 1 negative; the other has 1 positive and 5 negative.</li><li>Each child has entropy <code>-(5/6)log₂(5/6) - (1/6)log₂(1/6) ≈ 0.650</code> bits.</li><li>The weighted child entropy is <code>0.5 × 0.650 + 0.5 × 0.650 = 0.650</code>.</li><li>The gain is <code>1 - 0.650 = 0.350</code> bits.</li></ol>`,
      practice: {
        q: 'A parent set has entropy 0.9. A split creates two children with entropies 0.2 and 0.8, each holding half the cases. What is the gain?',
        hint: 'Weight the child entropies by their share of cases.',
        answer: `<p>The weighted child entropy is <code>0.5 × 0.2 + 0.5 × 0.8 = 0.5</code>. The gain is <code>0.9 - 0.5 = 0.4</code> bits. The split is useful, but it does not make either child pure.</p>`
      },
      bridge: 'Entropy gives the score. ID3 uses it directly, one split at a time.'
    },
    'id3': {
      teach: `<p>ID3 builds a tree top down. At each node it computes the information gain of every remaining feature, splits on the best one, and recurses on each branch. It stops when a node is pure, when no features remain, or when a depth or size limit is reached.</p>
<p>Categorical features split one branch per value. That makes the tree wide when a feature has many values, and it cannot handle a numeric feature without a threshold. ID3 does not prune. A tree grown until every leaf is pure will overfit, especially when features have many values.</p>
<h4>The recursion</h4>
<p>The algorithm is short enough to state in four lines. If all labels in the set are the same, return a leaf with that label. If no features remain, return a leaf with the majority label. Otherwise, choose the feature with the highest gain, split the set by its values, and recurse on each subset. The recursion depth is the depth of the tree.</p>
<p>Two details matter in practice. First, a feature used at one node is usually removed from the candidate set below it, so the same question is not asked twice on a path. Second, a branch can be empty if a feature value does not appear in the subset; the usual choice is to return the parent's majority label.</p>
<h4>Overfitting and limits</h4>
<p>An unpruned ID3 tree can have a leaf for every training case. That is a perfect fit and a poor model. Limit the depth, require a minimum number of cases per leaf, or prune after growth using a validation set. The limit is a capacity control, the same idea as regularisation in Unit 2.</p>
<div class="callout"><b>ID3 assumes categorical features</b><p>A numeric feature with many distinct values would create a branch per value. C4.5 replaces that with threshold splits.</p></div>`,
      work: `<ol class="steps"><li>At the root, outlook gives gain 0.25, temperature gives 0.03 and humidity gives 0.15.</li><li>Split on outlook, the highest gain.</li><li>For the sunny branch, recompute gain on the six sunny cases only. The best feature there may be humidity, even though it was not best at the root.</li><li>Recurse until a branch is pure or a limit is reached.</li><li>Prune or limit depth using validation error, not training error.</li></ol>`,
      practice: {
        q: 'Why does ID3 prefer a feature with 100 unique values over a feature with 2 values, even when the 2-value feature is more meaningful?',
        hint: 'Think about the purity of the children.',
        answer: `<p>Information gain rewards the reduction in entropy. A feature with 100 values creates many small children, and small children are often pure by chance, so the weighted child entropy is low and the gain looks high. The 2-value feature creates larger, mixed children. The gain is biased toward high-cardinality features; C4.5's gain ratio penalises that.</p>`
      },
      bridge: 'C4.5 keeps the greedy structure and fixes three practical problems: many-valued features, numeric features and overfitting.'
    },
    'c45': {
      teach: `<p>C4.5 extends ID3 with a <strong>gain ratio</strong>: information gain divided by the split information. The split information is the entropy of the branch sizes. A feature with many branches has high split information, so its ratio is smaller than its raw gain. That penalises the customer-ID problem.</p>
<div class="derive"><p><code>split information = -Σ (|Sᵥ| / |S|) log₂ (|Sᵥ| / |S|)</code></p><p><code>gain ratio = gain / split information</code></p></div>
<h4>Numeric features</h4>
<p>C4.5 handles a numeric feature by sorting its values and testing thresholds. For <code>n</code> distinct values there are <code>n - 1</code> candidate split points. It evaluates the gain at each and chooses the best. The threshold becomes a binary question, such as <code>age ≤ 37</code>. A minimum number of cases per side prevents a threshold that isolates one case.</p>
<h4>Missing values and pruning</h4>
<p>When a value is missing, C4.5 sends the case down every branch with a weight proportional to the branch size, or assigns the most common value. Pruning removes subtrees that do not improve validation performance. The usual method is error-based pruning: grow the tree, then replace a subtree with a leaf if the validation error does not increase.</p>
<p>The gain ratio can overcorrect when a feature has very few branches, because the split information is small. Implementations often add a small constant or prefer raw gain when the split information is near zero. The algorithm is a set of practical fixes, not a single clean objective.</p>
<div class="callout"><b>Gain ratio is not a universal winner</b><p>It fixes the many-values bias of ID3 and introduces a bias toward few branches. Compare candidate trees on validation data, not on the split score alone.</p></div>`,
      work: `<ol class="steps"><li>A split on a unique ID has gain 0.9 and split information 3.3, so the ratio is <code>0.9 / 3.3 ≈ 0.27</code>.</li><li>A split on outlook has gain 0.25 and split information 1.0, so the ratio is <code>0.25</code>.</li><li>The ID still edges ahead in this toy example, which is why implementations also reject a feature with one branch per case.</li><li>A numeric feature is sorted and each threshold is scored. The best threshold is kept as a binary split.</li><li>After growth, prune subtrees that do not improve validation error.</li></ol>`,
      practice: {
        q: 'Why can the gain ratio still prefer a nearly unique feature in a small dataset, and what else would you check?',
        hint: 'The split information for a feature with two branches is at most 1 bit.',
        answer: `<p>The ratio divides by split information, which is small for a feature with few branches, so a modest gain can look large. For a nearly unique feature, the split information is large, but a very high gain can still win. Check the number of cases per leaf, require a minimum leaf size, and compare the pruned tree on validation data. A feature that creates one case per leaf is not usable even if its ratio is high.</p>`
      },
      bridge: 'C4.5 allows multiway splits. CART simplifies every split to a yes or no question and handles regression with the same machinery.'
    },
    'cart': {
      teach: `<p>CART builds binary trees. Every split is a yes or no question. A numeric feature becomes a threshold, and a categorical feature becomes a membership test or a series of binary splits. Binary splits make the tree easy to apply and easy to explain: every decision is a comparison.</p>
<p>CART scores classification splits with the <strong>Gini impurity</strong>: <code>Gini = 1 - Σ pᵢ²</code>. It is the probability that two randomly drawn cases from the node have different labels. A pure node has Gini 0. A half-and-half two-class node has Gini 0.5. The algorithm chooses the split with the largest decrease in Gini.</p>
<h4>Regression trees</h4>
<p>For a numeric target, CART predicts the mean of the training labels in each leaf and splits to reduce squared error. The same greedy structure applies: try every candidate threshold, compute the weighted squared error of the children, and choose the split that lowers it most. A regression tree is a piecewise constant function. It cannot extrapolate beyond the range of the training labels.</p>
<h4>Pruning</h4>
<p>Cost-complexity pruning grows a large tree, then removes subtrees that add little accuracy relative to their size. The penalty is tuned on validation data. The result is a smaller tree with better generalisation. The pruning path is a sequence of trees, and cross-validation chooses a point along it.</p>
<div class="callout"><b>Gini versus entropy</b><p>Gini is cheaper to compute and usually ranks splits similarly to entropy. The choice rarely changes the practical result. The bigger decisions are depth, minimum leaf size and pruning.</p></div>`,
      work: `<ol class="steps"><li>A node has 8 positive and 2 negative cases. Gini is <code>1 - (0.8² + 0.2²) = 0.32</code>.</li><li>A split creates one child with 7 positive and 0 negative, and another with 1 positive and 2 negative.</li><li>The first child has Gini 0. The second has Gini <code>1 - (1/3)² - (2/3)² = 0.444</code>.</li><li>The weighted child Gini is <code>0.7 × 0 + 0.3 × 0.444 = 0.133</code>.</li><li>The decrease is <code>0.32 - 0.133 = 0.187</code>. CART keeps the split if it is the largest decrease among candidates.</li></ol>`,
      practice: {
        q: 'Why does a regression tree predict a constant in each leaf, and what consequence does that have for a case far outside the training range?',
        hint: 'The leaf value is the mean of the training labels in that leaf.',
        answer: `<p>The tree partitions the feature space into regions and predicts the mean label in each region, so the prediction is constant within a leaf. A case far outside the training range falls into the nearest region by the split rules and receives that region's mean, even if the true value would continue to grow. The tree cannot extrapolate.</p>`
      },
      bridge: 'A single tree is unstable. Bagging trains many trees on different samples and averages them to reduce variance.'
    },
    'bagging': {
      teach: `<p>Bagging trains many trees on different bootstrap samples and combines their predictions. A bootstrap sample is drawn with replacement from the training set, so some cases appear more than once and some not at all. Each tree sees a different version of the data.</p>
<p>For classification, the ensemble takes a majority vote or averages predicted probabilities. For regression, it averages the predictions. Averaging reduces variance because the errors of trees trained on different samples are partly independent. If every tree made exactly the same error, averaging would not help.</p>
<h4>Random forests</h4>
<p>A random forest adds a second source of diversity. At each split, it considers only a random subset of features. That stops one strong feature from dominating every tree and makes the trees less correlated. The number of features per split is a tuning parameter; a common default is the square root of the number of features for classification.</p>
<p>Random forests also provide an out-of-bag estimate. Each tree is trained on a bootstrap sample, so about a third of the cases are left out. Predict each case using only the trees that did not see it, and average. That gives a validation-like estimate without a separate holdout, though a proper test set is still needed for a final report.</p>
<h4>What bagging cannot do</h4>
<p>Bagging reduces variance, not bias. If every tree underfits, the forest underfits. It also struggles when one feature dominates every split, because the trees stay correlated. The ensemble loses the single tree's readable explanation. Feature importance and partial dependence can summarise it, but they are not the same as a decision path.</p>
<div class="callout"><b>More trees do not overfit</b><p>Adding trees to a bagged ensemble usually lowers variance without raising it. The limit is computation, not overfitting, once the individual trees are fixed.</p></div>`,
      work: `<ol class="steps"><li>Draw five bootstrap samples from the training set.</li><li>Grow one tree on each sample, with a random feature subset at each split.</li><li>Suppose the five trees predict positive, positive, negative, positive and negative.</li><li>The majority vote is positive with three votes.</li><li>A single tree might have been the negative one. Averaging the probabilities gives a softer boundary and a confidence score.</li></ol>`,
      practice: {
        q: 'Why does a random forest usually generalise better than a single decision tree with the same depth?',
        hint: 'Think about variance and correlation between the trees.',
        answer: `<p>Each tree is trained on a different bootstrap sample and a different subset of features, so their errors are partly independent. Averaging cancels some of the variance without adding much bias. A single tree's split can change drastically with a small data change; the ensemble's average is more stable.</p>`
      },
      bridge: 'Bagging builds trees in parallel and averages them. Boosting builds them in sequence, each one focused on the errors the ensemble still makes.'
    },
    'boosting': {
      teach: `<p>Boosting builds trees in sequence. Each new tree is trained on the cases the current ensemble gets wrong, with those cases given more weight. The final prediction is a weighted sum of all the trees. The idea is to combine many weak models into a strong one.</p>
<p>In AdaBoost, each case carries a weight. After a tree is trained, the weights of misclassified cases increase and the weights of correct cases decrease. The next tree is forced to focus on the hard cases. Each tree also gets a weight based on its accuracy, so better trees contribute more to the final vote.</p>
<h4>Gradient boosting</h4>
<p>Gradient boosting frames the same process as fitting each new tree to the negative gradient of the loss. For squared error, the negative gradient is the residual, so each tree fits the errors of the current ensemble. For log loss, it fits a quantity related to the probability error. That makes the method work for regression and classification with the same loop.</p>
<p>The learning rate shrinks each tree's contribution. A small rate needs more trees but often generalises better. Tree depth controls the interaction order: shallow trees add mainly additive effects, deeper trees add interactions. Boosting reduces bias strongly and can reduce variance when the trees are shallow. It is sensitive to noisy labels, because it keeps focusing on cases it cannot fit, and those may be mislabelled.</p>
<div class="callout"><b>Bagging versus boosting</b><p>Bagging averages independent trees to cut variance. Boosting adds trees sequentially to cut bias. Bagging is easier to parallelise; boosting often needs more careful tuning.</p></div>`,
      work: `<ol class="steps"><li>Start with a constant prediction, such as the mean or the log-odds.</li><li>Compute the residual or negative gradient for each case.</li><li>Fit a small tree to those residuals.</li><li>Add the tree's prediction, multiplied by a learning rate, to the ensemble.</li><li>Repeat. Suppose three stumps contribute 0.4, 0.3 and 0.3; a case that two send positive and one sends negative ends at <code>0.4 + 0.3 - 0.3 = 0.4</code>.</li></ol>`,
      practice: {
        q: 'A boosting model fits the training set almost perfectly but validation accuracy is poor. What are two likely causes and two controls?',
        hint: 'Boosting keeps chasing hard cases, including mislabelled ones.',
        answer: `<p>The model may be overfitting noisy or mislabelled cases, or using too many rounds, too deep trees or too high a learning rate. Reduce the number of rounds, lower the learning rate with early stopping, limit tree depth, or clean the labels. Boosting's sequential focus makes it more sensitive to label noise than bagging.</p>`
      },
      bridge: 'Trees answer questions about features. Unit 7 turns to problems where the answer is a complete assignment under hard rules.'
    }
  },
  closing: {
    teach: `<p>A tree is a sequence of feature questions ending in a prediction. Entropy and Gini score a split; ID3, C4.5 and CART differ in how they handle many-valued features, numeric thresholds and pruning. A single tree is readable and unstable. Bagging averages many trees to reduce variance. Boosting adds trees in sequence to reduce bias.</p>
<p>The choice between them follows from the diagnosis. If the single tree overfits, bag it. If it underfits, boost it or grow it deeper. If you need the explanation, keep one tree and accept the instability, or use the ensemble and explain it with feature importance and partial dependence. The next unit leaves feature-based prediction and models problems as variables and constraints.</p>`,
    problem: {
      q: 'A dataset has 12 cases, 6 positive and 6 negative. A split creates two children of 6. One has 5 positive and 1 negative; the other has 1 positive and 5 negative. Compute the parent entropy, the weighted child entropy and the gain.',
      hint: 'Entropy of a 5/1 split is about 0.650 bits.',
      answer: `<p>The parent is half and half, so its entropy is 1 bit. Each child has entropy about 0.650 bits, and each holds half the cases, so the weighted child entropy is 0.650. The gain is <code>1 - 0.650 = 0.350</code> bits. A split that separated the classes perfectly would have gain 1.</p>`
    }
  }
});
