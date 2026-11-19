AIM.registerUnit({
  n: 6, hue: 190, short: 'Trees',
  title: 'Twenty questions, then a forest',
  weeks: 'Week 6',
  promise: 'Split data with the best question, grow a tree, then make many trees disagree on purpose.',
  minutes: 48,
  lectures: ['6.1 Decision tree intro', '6.2 ID3', '6.3 C4.5', '6.4 CART', '6.5 Bagging and boosting'],
  concepts: [
    {
      id: 'twenty-questions',
      title: 'A decision tree is a game of twenty questions',
      prereqs: ['reflex-models', 'splitting-data'],
      usecase: 'A loan officer asks a short series of yes or no questions: income above the threshold, existing debt, late payments. Each answer narrows the case until a decision is reached. The questions form a tree.',
      metaphor: {
        name: 'Twenty questions',
        claim: 'You guess an object by asking questions that split the possibilities. A good question halves the space; a bad one barely narrows it.',
        mapping: [
          ['a yes or no question', 'split on a feature', 'choose a question'],
          ['the answer', 'branch', 'follow the edge'],
          ['your guess', 'leaf label', 'read the prediction']
        ],
        widget: 'twenty-questions',
        lab: {
          title: 'Guess the animal',
          tryText: 'Pick questions from the list. Watch the remaining candidates shrink.',
          notice: 'A question that splits the set evenly removes more uncertainty than one that leaves a large group behind.'
        }
      },
      idea: `<p>A <strong>decision tree</strong> predicts by asking a sequence of questions about features. Each internal node tests one feature, each branch follows one answer, and each leaf gives a prediction. The path from root to leaf is the explanation for that case.</p>
<p>Trees handle mixed feature types, need little preprocessing and produce rules a person can read. A tree can also represent interactions that a linear model misses, because a later question can depend on the answers before it.</p>
<p>The cost is instability. A small change in the data can change the first split, and the whole tree with it. The next concepts choose splits by a score, and the last two reduce that instability by combining trees.</p>`,
      lecture: {
        ref: '6.1',
        source: 'Transcript, Decision tree intro',
        text: 'The lecturer introduces the tree as a sequence of decisions. "At each node we ask a question about one feature. Depending on the answer we go left or right, until we reach a leaf that gives the prediction."'
      },
      mechanics: {
        formula: 'prediction = leaf reached by tests t₁, t₂, ..., tₖ',
        symbols: [
          ['t', 'a test on one feature, such as x₂ ≤ 5'],
          ['k', 'the depth of the path'],
          ['leaf', 'a terminal node with a prediction']
        ],
        worked: 'A tree asks income > 50 first. If yes, it asks debt < 0.3. If yes, it predicts approve. A case with income 60 and debt 0.2 follows both yes branches and lands on approve. A case with income 60 and debt 0.5 takes the second no branch and lands on review.'
      },
      mechanism: {
        widget: 'twenty-questions',
        lab: {
          title: 'Build the question order',
          tryText: 'Reorder the questions. Compare how many candidates remain after two questions.',
          notice: 'Order matters. The best first question is the one that removes the most uncertainty.'
        }
      },
      breaks: 'Deep trees memorise. A tree grown to purity on training data has high variance and poor generalisation. Trees also struggle with smooth relationships, because every split is a step. And an axis-aligned split cannot follow a diagonal boundary without many steps.',
      check: [
        {
          q: 'What does a leaf contain?',
          options: ['A feature test', 'A prediction', 'A gradient', 'A cluster centre'],
          answer: 1,
          explain: 'Internal nodes test features. Leaves return the prediction for cases that reach them.'
        },
        {
          q: 'Why is a decision tree unstable?',
          options: ['It cannot handle numbers', 'A small data change can alter the first split and the whole tree', 'It needs a GPU', 'It has no parameters'],
          answer: 1,
          explain: 'The greedy split depends on the sample. Change a few rows and the structure can change.'
        }
      ],
      connection: {
        prompt: 'A tree predicts from one input with no memory. Which family is it?',
        a: 'Decision tree', b: 'Paradigm',
        options: [
          { label: 'Reflex', ok: true },
          { label: 'State', ok: false },
          { label: 'Variable', ok: false },
          { label: 'Logic', ok: false }
        ],
        explain: 'It is a fixed computation from features to a label. The tree shape is learned, but the mapping is direct.'
      },
      recap: [
        'A tree asks a path of feature questions and returns a leaf prediction.',
        'Paths are readable rules, which is a reason to use trees.',
        'Instability is the main weakness of a single tree.'
      ],
      now: 'You can now read a decision tree as a set of rules and explain why a single tree is unstable.'
    },
    {
      id: 'entropy',
      title: 'Entropy and information gain',
      prereqs: ['twenty-questions'],
      usecase: 'A tree builder must choose the first question from twenty candidate features. Trying every possible tree is impossible. It needs a score for one split that predicts how useful that split will be.',
      metaphor: {
        name: 'Surprise at the answer',
        claim: 'A question whose answer is almost certain tells you little. A question that could go either way tells you a lot.',
        mapping: [
          ['how unsure you are', 'entropy', 'read the impurity'],
          ['how much a question resolves', 'information gain', 'compare before and after'],
          ['the remaining uncertainty', 'weighted child entropy', 'add the branches']
        ],
        widget: 'id3-builder',
        lab: {
          title: 'Pick the question that resolves most',
          tryText: 'Choose a feature to split. Compare the impurity before and after.',
          notice: 'The split that lowers impurity most is the one the greedy algorithm picks.'
        }
      },
      idea: `<p><strong>Entropy</strong> measures impurity in a set of labels. For two classes it is highest when the set is half and half and zero when all labels match. A split replaces one set with child sets, and <strong>information gain</strong> is the parent entropy minus the weighted entropy of the children.</p>
<p>The greedy tree algorithm evaluates every candidate split, picks the one with the highest gain, then recurses on each child. Greedy is not optimal: a split with low immediate gain can enable a much better split below. It is fast and works well in practice.</p>
<p>Information gain favours features with many values, because many small pure children look impressive. C4.5 corrects that with a penalty, which is the next concept.</p>`,
      lecture: {
        ref: '6.2',
        source: 'Transcript, ID3',
        text: 'The lecturer computes entropy before and after a split. "We choose the attribute that gives the largest information gain. That is the attribute that reduces uncertainty the most."'
      },
      mechanics: {
        formula: 'H(S) = -Σ p log₂ p, gain = H(S) - Σ (|Sᵥ|/|S|) H(Sᵥ)',
        symbols: [
          ['H', 'entropy in bits'],
          ['Σ', 'a sum over the classes or the subsets'],
          ['p', 'the fraction of a class in the set'],
          ['S', 'the current set of cases'],
          ['Sᵥ', 'the subset where feature v takes value v'],
          ['|S|', 'the number of cases in S']
        ],
        worked: 'A set has 6 positive and 6 negative cases. Entropy is 1 bit. Split on a feature into two sets of 6, one with 5 positive and 1 negative, the other with 1 positive and 5 negative. Each child has entropy 0.65 bits. Gain is 1 - 0.65 = 0.35 bits.'
      },
      mechanism: {
        widget: 'id3-builder',
        lab: {
          title: 'Compare two candidate splits',
          tryText: 'Split on each feature in turn. Watch the gain and the resulting tree depth.',
          notice: 'The highest gain is not always the split that produces the shallowest final tree.'
        }
      },
      breaks: 'Entropy is undefined for a set of one class only in the limit, where it is zero. The measure is sensitive to sample size: small branches can show misleadingly pure labels. And greedy gain ignores the cost of the test, which matters when one feature is expensive to obtain.',
      check: [
        {
          q: 'When is entropy highest?',
          options: ['When all labels match', 'When the classes are evenly mixed', 'When the set is empty', 'When there are many features'],
          answer: 1,
          explain: 'A fifty-fifty mix is the least predictable, so it has the highest entropy.'
        },
        {
          q: 'What does information gain compare?',
          options: ['Training and test error', 'Parent impurity with weighted child impurity', 'Precision and recall', 'Bias and variance'],
          answer: 1,
          explain: 'Gain is the drop in impurity after the split, weighted by the size of each child.'
        }
      ],
      connection: {
        prompt: 'Information gain chooses splits. Which earlier idea does it depend on?',
        a: 'Split choice', b: 'Label distribution',
        options: [
          { label: 'The class mix in each branch', ok: true },
          { label: 'The learning rate', ok: false },
          { label: 'The feature scale', ok: false },
          { label: 'The test set size', ok: false }
        ],
        explain: 'Impurity is computed from the labels in each child. The feature values only decide how cases are grouped.'
      },
      recap: [
        'Entropy measures how mixed a set of labels is.',
        'Information gain is the impurity drop from a split.',
        'Greedy gain is fast and not guaranteed optimal.'
      ],
      now: 'You can now compute entropy for a two-class set and choose a split by gain.'
    },
    {
      id: 'id3',
      title: 'ID3: grow the tree greedily',
      prereqs: ['entropy'],
      usecase: 'A marketing team wants a readable rule set for who responds to a campaign. They have ten categorical features and a binary outcome. They need a small tree, not a black box.',
      metaphor: {
        name: 'The interviewer',
        claim: 'An interviewer asks the question that divides candidates most cleanly, then repeats the process with each group.',
        mapping: [
          ['the candidate pool', 'current node', 'inspect the cases'],
          ['the best question', 'split by information gain', 'choose the feature'],
          ['a group', 'child node', 'recurse'],
          ['the hire decision', 'leaf', 'read the label']
        ],
        widget: 'id3-builder',
        lab: {
          title: 'Grow ID3 by hand',
          tryText: 'Pick the highest-gain feature at each node. Stop when a branch is pure.',
          notice: 'The tree grows top down. Each split only sees the cases that reached that node.'
        }
      },
      idea: `<p><strong>ID3</strong> builds a tree top down. At each node it computes the information gain of every remaining feature, splits on the best one, and recurses on each branch. It stops when a node is pure, when no features remain, or when a depth limit is reached.</p>
<p>Categorical features split one branch per value. That makes the tree wide when a feature has many values, and it cannot handle a numeric feature without a threshold. C4.5, the next concept, fixes both.</p>
<p>ID3 does not prune. A tree grown until every leaf is pure will overfit, especially when features have many values. The fix is a validation set and a limit on depth or leaf size.</p>`,
      lecture: {
        ref: '6.2',
        source: 'Transcript, ID3',
        text: 'The lecturer works through the algorithm on a small table. "We select the attribute with the highest information gain, make it the root, and then repeat the process for each subset."'
      },
      mechanics: {
        formula: 'split at each node on argmax gain(S, A)',
        symbols: [
          ['S', 'the cases at the node'],
          ['A', 'a candidate feature'],
          ['gain', 'information gain from splitting S on A'],
          ['argmax', 'the feature with the largest gain']
        ],
        worked: 'At the root, outlook gives gain 0.25, temperature gives 0.03 and humidity gives 0.15. The tree splits on outlook. For the sunny branch, the remaining gain is recomputed on the six sunny cases only, which may pick a different feature.'
      },
      mechanism: {
        widget: 'id3-builder',
        lab: {
          title: 'Finish the tree',
          tryText: 'Keep splitting until every leaf is pure. Then turn on a depth limit.',
          notice: 'The unlimited tree fits every training case. The limited tree is smaller and often better on new data.'
        }
      },
      breaks: 'ID3 overfits, cannot handle numeric features directly, and prefers features with many values. It also has no notion of cost, so it may choose an expensive test when a cheap one is nearly as good. Missing values need a separate policy.',
      check: [
        {
          q: 'Which feature does ID3 split on?',
          options: ['The first one in the table', 'The one with the highest information gain', 'The one with the most values', 'A random one'],
          answer: 1,
          explain: 'The greedy choice is the highest gain among the remaining features.'
        },
        {
          q: 'Why does an unpruned ID3 tree overfit?',
          options: ['It uses too few features', 'It grows until leaves are pure, fitting noise', 'It cannot handle categories', 'It uses a validation set'],
          answer: 1,
          explain: 'Purity on training data can be reached by isolating individual cases, which does not generalise.'
        }
      ],
      connection: {
        prompt: 'ID3 uses a greedy rule. Which earlier optimisation idea does that resemble?',
        a: 'Greedy split', b: 'Descent step',
        options: [
          { label: 'Both take the locally best move without a global guarantee', ok: true },
          { label: 'Both compute an exact global optimum', ok: false },
          { label: 'Both require a learning rate', ok: false },
          { label: 'Both use the normal equation', ok: false }
        ],
        explain: 'Greedy splitting and gradient descent both make local improvements. Neither promises the global best.'
      },
      recap: [
        'ID3 splits on the highest-gain feature and recurses.',
        'It handles categorical features and stops at purity or a limit.',
        'Unpruned trees overfit and need a validation limit.'
      ],
      now: 'You can now grow a small ID3 tree by hand and say why it needs pruning.'
    },
    {
      id: 'c45',
      title: 'C4.5 and the gain ratio',
      prereqs: ['id3'],
      usecase: 'A dataset has a customer ID column. Every ID is unique, so splitting on it makes every leaf pure. Information gain loves it and the tree learns nothing useful.',
      metaphor: {
        name: 'The penalty for many branches',
        claim: 'A question with a thousand possible answers shreds the group into tiny pieces. Each piece looks tidy, but the question told you nothing reusable.',
        mapping: [
          ['number of answers', 'split information', 'count the branches'],
          ['tidy-looking pieces', 'high raw gain', 'compute gain'],
          ['the penalty', 'gain ratio', 'divide by split information']
        ],
        widget: 'gini-gain',
        lab: {
          title: 'Catch the ID feature',
          tryText: 'Compare raw gain and gain ratio for a unique ID, a useful feature and a weak feature.',
          notice: 'Raw gain picks the ID. Gain ratio rejects it.'
        }
      },
      idea: `<p><strong>C4.5</strong> extends ID3 with a <strong>gain ratio</strong>: information gain divided by the split information, which grows with the number of branches. A feature with many values pays a penalty, so a unique ID no longer wins.</p>
<p>C4.5 also handles numeric features by sorting values and testing thresholds, tolerates missing values by distributing cases with weights, and prunes the grown tree with a validation set. These changes make it a practical default for small tabular datasets.</p>
<p>The ratio can overcorrect when a feature has very few branches. In practice implementations add a small constant or prefer gain when the split information is near zero.</p>`,
      lecture: {
        ref: '6.3',
        source: 'Transcript, C4.5',
        text: 'The lecturer introduces the gain ratio as the fix for ID3\'s preference for many-valued features. "We divide the gain by the split information, so a feature that creates many small branches is penalised."'
      },
      mechanics: {
        formula: 'gain ratio = gain / split information',
        symbols: [
          ['gain', 'information gain from the split'],
          ['split information', 'entropy of the branch sizes']
        ],
        worked: 'A split on a unique ID has gain 0.9 and split information 3.3, so the ratio is 0.27. A split on outlook has gain 0.25 and split information 1.0, so the ratio is 0.25. The ID still edges ahead here, which is why implementations also reject features with a branch per case.'
      },
      mechanism: {
        widget: 'gini-gain',
        lab: {
          title: 'Tune the penalty',
          tryText: 'Switch between gain and gain ratio. Watch which feature wins for each candidate.',
          notice: 'The ratio fixes one bias and introduces another. Neither score is neutral.'
        }
      },
      breaks: 'Gain ratio can favour features with very few branches, because split information is small. Numeric thresholds still need a minimum leaf size to avoid isolating cases. Pruning helps but does not make a single tree stable.',
      check: [
        {
          q: 'Why does raw information gain favour a unique ID?',
          options: ['It has low entropy', 'Splitting on it makes every branch pure', 'It has few values', 'It is numeric'],
          answer: 1,
          explain: 'Each branch holds one case with one label, so the weighted child entropy is zero and the gain is maximal.'
        },
        {
          q: 'What does the gain ratio divide by?',
          options: ['The number of cases', 'The split information of the branches', 'The depth', 'The number of classes'],
          answer: 1,
          explain: 'Split information grows with the number and balance of branches, which penalises many-valued features.'
        }
      ],
      connection: {
        prompt: 'C4.5 changes how splits are scored. What does the change protect against?',
        a: 'Raw gain', b: 'Failure mode',
        options: [
          { label: 'Choosing features that merely identify cases', ok: true },
          { label: 'Overfitting the test set', ok: false },
          { label: 'Slow training', ok: false },
          { label: 'Missing labels', ok: false }
        ],
        explain: 'A unique identifier yields perfect branches and no general rule. The penalty removes that temptation.'
      },
      recap: [
        'C4.5 adds a branch penalty through the gain ratio.',
        'It handles numeric thresholds, missing values and pruning.',
        'The ratio trades one bias for another.'
      ],
      now: 'You can now explain why a unique ID wins on gain and loses on gain ratio.'
    },
    {
      id: 'cart',
      title: 'CART and Gini impurity',
      prereqs: ['c45'],
      usecase: 'A hospital wants a risk score from mixed numeric and categorical features. The team wants binary splits only, so every decision is a simple yes or no at the bedside.',
      metaphor: {
        name: 'The purity count',
        claim: 'Two jars of marbles. One has only red, the other is mixed. A split is good when the child jars are purer than the parent.',
        mapping: [
          ['a jar', 'node', 'inspect the cases'],
          ['mixed colours', 'Gini impurity', 'compute the score'],
          ['pouring into two jars', 'binary split', 'choose the threshold']
        ],
        widget: 'gini-gain',
        lab: {
          title: 'Binary splits only',
          tryText: 'Pick a threshold for a numeric feature. Compare Gini before and after.',
          notice: 'Gini and entropy usually agree on the ranking. Gini is cheaper because it avoids logarithms.'
        }
      },
      idea: `<p><strong>CART</strong> builds binary trees. Every split is a yes or no question, including splits on numeric features, which become thresholds. It scores candidates with the <strong>Gini impurity</strong>, the probability that two randomly drawn cases from a node have different labels.</p>
<p>Gini is cheaper to compute than entropy and tends to produce similar trees. CART also handles regression by predicting the mean in each leaf and splitting to reduce squared error.</p>
<p>Binary splits make the tree easy to apply and easy to explain. They also let the same algorithm handle numeric and categorical features with one rule: find the split that lowers impurity most.</p>`,
      lecture: {
        ref: '6.4',
        source: 'Transcript, CART',
        text: 'The lecturer contrasts CART with ID3. "CART always makes binary splits, and it can handle both classification and regression by changing the impurity measure."'
      },
      mechanics: {
        formula: 'Gini = 1 - Σ pᵢ², split on the largest decrease',
        symbols: [
          ['pᵢ', 'the fraction of class i in the node'],
          ['Σ', 'a sum over classes'],
          ['decrease', 'parent Gini minus weighted child Gini']
        ],
        worked: 'A node has 8 positive and 2 negative cases. Gini is 1 - (0.8² + 0.2²) = 0.32. A split creates one child with 7 positive and 0 negative and another with 1 positive and 2 negative. Weighted child Gini is 0.7×0 + 0.3×0.44 = 0.13. The decrease is 0.19.'
      },
      mechanism: {
        widget: 'gini-gain',
        lab: {
          title: 'Move the threshold',
          tryText: 'Slide the split point across a numeric feature. Watch Gini fall and rise.',
          notice: 'The best threshold sits where the two classes are most separated along that feature.'
        }
      },
      breaks: 'Gini is biased toward splits with many small branches, though less than raw gain. Single trees remain unstable. Axis-aligned splits approximate diagonal boundaries poorly, and a tree cannot extrapolate beyond the range of the training labels.',
      check: [
        {
          q: 'What split shape does CART use?',
          options: ['One branch per category', 'Binary splits only', 'Three-way splits', 'No splits'],
          answer: 1,
          explain: 'CART converts every candidate, including numeric thresholds, into a yes or no question.'
        },
        {
          q: 'A node is half positive and half negative. What is its Gini impurity?',
          options: ['0', '0.5', '1', '2'],
          answer: 1,
          explain: 'Gini is 1 - (0.5² + 0.5²) = 0.5, the maximum for two classes.'
        }
      ],
      connection: {
        prompt: 'CART and ID3 both grow greedily. What is the main structural difference?',
        a: 'ID3', b: 'CART',
        options: [
          { label: 'Multi-way categorical splits versus binary splits', ok: true },
          { label: 'Regression versus classification only', ok: false },
          { label: 'No pruning versus pruning only', ok: false },
          { label: 'Entropy versus no score', ok: false }
        ],
        explain: 'ID3 branches once per category value. CART always makes a binary split, which also covers numeric thresholds.'
      },
      recap: [
        'CART uses binary splits for classification and regression.',
        'Gini impurity measures the chance of a label mismatch.',
        'Gini is cheaper than entropy and usually ranks splits similarly.'
      ],
      now: 'You can now compute Gini for a node and choose a threshold by impurity decrease.'
    },
    {
      id: 'bagging',
      title: 'Bagging: many unstable trees',
      prereqs: ['cart'],
      usecase: 'A single tree gives a different answer when the training sample changes. A bank needs a risk model that does not swing with every new batch of applications.',
      metaphor: {
        name: 'The expert panel',
        claim: 'One expert can be wrong in a particular direction. Ask many experts who each saw a different sample, then take the majority. Their personal errors cancel.',
        mapping: [
          ['an expert', 'tree', 'train on a sample'],
          ['a different case file', 'bootstrap sample', 'resample the data'],
          ['the majority vote', 'ensemble prediction', 'combine the trees']
        ],
        widget: 'forest-vote',
        lab: {
          title: 'Watch the vote settle',
          tryText: 'Add trees one at a time. Compare the ensemble boundary with a single tree.',
          notice: 'Individual trees disagree at the edges. The vote smooths those disagreements.'
        }
      },
      idea: `<p><strong>Bagging</strong> trains many trees on different bootstrap samples, each drawn with replacement from the training set. It then averages their predictions, or takes a majority vote. A <strong>random forest</strong> adds a second source of diversity by considering only a random subset of features at each split.</p>
<p>Bagging reduces variance without adding much bias. It works because the errors of trees trained on different samples are partly independent, so averaging cancels some of the noise. Correlated trees help less, which is why the feature subset matters.</p>
<p>The cost is interpretability. A forest of 500 trees is not a set of readable rules, though feature importance and partial dependence can summarise it.</p>`,
      lecture: {
        ref: '6.5',
        source: 'Transcript, Bagging and boosting',
        text: 'The lecturer describes bagging as training many models on resampled data and combining their votes. "Each tree sees a different version of the data, so their errors are not the same."'
      },
      mechanics: {
        formula: 'ŷ = majority vote over T trees trained on bootstrap samples',
        symbols: [
          ['ŷ', 'the ensemble prediction'],
          ['T', 'the number of trees'],
          ['bootstrap sample', 'a sample drawn with replacement from the training set']
        ],
        worked: 'Five trees predict positive, positive, negative, positive and negative. The majority is positive with three votes. A single tree might have been the negative one. Averaging probabilities instead of labels gives a softer boundary and a confidence score.'
      },
      mechanism: {
        widget: 'forest-vote',
        lab: {
          title: 'Add trees until the vote stabilises',
          tryText: 'Start with one tree and add more. Watch the boundary stop changing.',
          notice: 'Returns diminish. Most of the variance reduction arrives in the first few dozen trees.'
        }
      },
      breaks: 'Bagging cannot fix bias. If every tree underfits, the forest underfits. It also struggles when one feature dominates every split, because the trees stay correlated. And the ensemble loses the single tree\'s explanation.',
      check: [
        {
          q: 'What does a random forest add to bagging?',
          options: ['More training data', 'A random subset of features at each split', 'A different loss', 'Deeper trees'],
          answer: 1,
          explain: 'The feature subset decorrelates the trees, which makes averaging more effective.'
        },
        {
          q: 'Bagging mainly reduces which term?',
          options: ['Bias', 'Variance', 'Irreducible noise', 'The number of features'],
          answer: 1,
          explain: 'Averaging many unstable trees cancels part of their sample-specific error.'
        }
      ],
      connection: {
        prompt: 'Bagging and boosting both combine trees. What does bagging do differently?',
        a: 'Bagging', b: 'Boosting',
        options: [
          { label: 'Trains trees independently and averages them', ok: true },
          { label: 'Trains trees in sequence on the same sample', ok: false },
          { label: 'Uses no data resampling', ok: false },
          { label: 'Cannot use decision trees', ok: false }
        ],
        explain: 'Bagging is parallel and independent. Boosting is sequential and focuses each new tree on previous errors.'
      },
      recap: [
        'Bagging trains trees on bootstrap samples and combines their votes.',
        'Random forests add feature subsampling to decorrelate the trees.',
        'The ensemble lowers variance and gives up a readable single tree.'
      ],
      now: 'You can now explain why averaging unstable trees improves generalisation.'
    },
    {
      id: 'boosting',
      title: 'Boosting: learn from mistakes',
      prereqs: ['bagging'],
      usecase: 'A model must rank search results with very high accuracy. A single small tree underfits. A sequence of small trees, each focused on the cases the previous ones got wrong, can reach much lower error.',
      metaphor: {
        name: 'The coach who drills mistakes',
        claim: 'A coach watches a practice game, then spends the next session on the plays the team missed. Each session corrects the last one.',
        mapping: [
          ['a practice game', 'weak model', 'train a small tree'],
          ['the plays missed', 'weighted errors', 'raise the weights'],
          ['the next session', 'next model', 'fit the residuals']
        ],
        widget: 'boost-focus',
        lab: {
          title: 'Point the next tree at the errors',
          tryText: 'Add rounds. Watch the weights on misclassified points grow and the boundary bend toward them.',
          notice: 'Each tree is weak. The sequence is strong because every tree targets the current weakness.'
        }
      },
      idea: `<p><strong>Boosting</strong> builds trees in sequence. Each new tree is trained on the cases the current ensemble gets wrong, with those cases given more weight. The final prediction is a weighted sum of all the trees.</p>
<p>Gradient boosting frames this as fitting each new tree to the negative gradient of the loss, which makes the method work for regression and classification. The learning rate shrinks each tree's contribution, which trades speed for stability.</p>
<p>Boosting reduces bias strongly and can also reduce variance when the trees are shallow. It is sensitive to noisy labels, because the algorithm keeps focusing on cases it cannot fit, and those may be mislabelled.</p>`,
      lecture: {
        ref: '6.5',
        source: 'Transcript, Bagging and boosting',
        text: 'The lecturer contrasts boosting with bagging. "In boosting, the models are trained one after another. Each new model pays more attention to the examples the previous ones got wrong."'
      },
      mechanics: {
        formula: 'F(x) = Σ αₜ hₜ(x)',
        symbols: [
          ['F', 'the boosted prediction'],
          ['Σ', 'a sum over the rounds'],
          ['x', 'the input case'],
          ['hₜ', 'the tree at round t'],
          ['αₜ', 'its weight'],
          ['t', 'the round index']
        ],
        worked: 'Three stumps each contribute 0.4, 0.3 and 0.3 to a score. A case that two stumps send positive and one sends negative ends at 0.4 + 0.3 - 0.3 = 0.4, which is positive. Later stumps focus on the cases still wrong after the earlier ones.'
      },
      mechanism: {
        widget: 'boost-focus',
        lab: {
          title: 'Add rounds and watch the focus',
          tryText: 'Step through five rounds. Compare the point weights and the boundary after each.',
          notice: 'The weights concentrate on hard cases. Too many rounds concentrate them on noise.'
        }
      },
      breaks: 'Boosting overfits noisy labels and outliers because it keeps chasing them. It is sequential, so it trains slower than bagging and cannot be parallelised across trees. It also needs careful tuning of depth, rounds and learning rate.',
      check: [
        {
          q: 'How does each new tree in boosting differ from the last?',
          options: ['It is trained on fresh data', 'It focuses on the cases the ensemble gets wrong', 'It is deeper', 'It uses a different label set'],
          answer: 1,
          explain: 'Boosting reweights cases so that later trees pay more attention to current errors.'
        },
        {
          q: 'Why is boosting sensitive to mislabelled cases?',
          options: ['It ignores them', 'It keeps increasing their weight', 'It removes them', 'It averages them away'],
          answer: 1,
          explain: 'A case that cannot be fit keeps attracting attention, so a wrong label can distort the ensemble.'
        }
      ],
      connection: {
        prompt: 'Bagging and boosting reduce different error terms. Which pairing is right?',
        a: 'Method', b: 'Main effect',
        options: [
          { label: 'Bagging reduces variance, boosting reduces bias', ok: true },
          { label: 'Bagging reduces bias, boosting reduces variance', ok: false },
          { label: 'Both only reduce bias', ok: false },
          { label: 'Both only reduce variance', ok: false }
        ],
        explain: 'Averaging independent trees cancels variance. Sequential correction of errors attacks bias.'
      },
      recap: [
        'Boosting trains trees in sequence, each on the current errors.',
        'The ensemble is a weighted sum of weak models.',
        'It cuts bias and is sensitive to noisy labels.'
      ],
      now: 'You can now explain the difference between averaging trees and correcting them in sequence.'
    }
  ],
  test: [
    {
      q: 'What does an internal node of a decision tree contain?',
      options: ['A prediction', 'A feature test', 'A gradient', 'A bootstrap sample'],
      answer: 1,
      explain: 'Internal nodes test features. Leaves hold predictions.'
    },
    {
      q: 'Entropy is zero when which condition holds?',
      options: ['All cases share one label', 'Classes are balanced', 'The set is empty', 'The tree is deep'],
      answer: 0,
      explain: 'No uncertainty remains when every case has the same label.'
    },
    {
      q: 'Information gain is which quantity?',
      options: ['Child entropy minus parent entropy', 'Parent entropy minus weighted child entropy', 'The number of branches', 'The depth of the tree'],
      answer: 1,
      explain: 'Gain is the drop in impurity after the split.'
    },
    {
      q: 'Why does C4.5 use a gain ratio?',
      options: ['To favour features with many values', 'To penalise features with many branches', 'To handle regression', 'To remove pruning'],
      answer: 1,
      explain: 'The ratio divides by split information, which penalises many-valued features such as IDs.'
    },
    {
      q: 'CART splits are always what shape?',
      options: ['One branch per category', 'Binary', 'Three-way', 'Random'],
      answer: 1,
      explain: 'Every CART split is a yes or no question, including numeric thresholds.'
    },
    {
      q: 'Gini impurity for a node with 3 positive and 1 negative case is what?',
      options: ['0.25', '0.375', '0.5', '0.75'],
      answer: 1,
      explain: 'Gini is 1 - (0.75² + 0.25²) = 0.375.'
    },
    {
      q: 'Bagging reduces which error term most directly?',
      options: ['Bias', 'Variance', 'Irreducible noise', 'Label noise'],
      answer: 1,
      explain: 'Averaging trees trained on different samples cancels part of their variance.'
    },
    {
      q: 'Boosting is sensitive to mislabelled cases because it does what?',
      options: ['Ignores them', 'Keeps increasing their weight', 'Removes them from the data', 'Uses them as validation'],
      answer: 1,
      explain: 'The algorithm keeps focusing on cases it cannot fit, including wrong labels.'
    }
,
    {
      type: 'numeric',
      q: 'A node holds 3 positive and 1 negative case. What is its entropy in bits? Give two decimal places.',
      answer: 0.81,
      tolerance: 0.01,
      explain: 'With p = 0.75, entropy is -0.75 log2 0.75 - 0.25 log2 0.25 = 0.811 bits.'
    },
    {
      type: 'ordering',
      q: 'Order the steps of one ID3 split.',
      items: [
        'Compute the entropy of the parent node',
        'For each feature, compute the weighted entropy of its children',
        'Subtract the child entropy from the parent entropy to get the gain',
        'Split on the feature with the highest gain',
        'Recurse on each child'
      ],
      explain: 'Information gain is the drop in entropy. ID3 takes the largest drop at each node.'
    },
    {
      type: 'error',
      q: 'A team describes how CART chooses a split. One step is wrong. Which one?',
      steps: [
        'Sort the values of a numeric feature.',
        'Try each threshold and compute the weighted Gini of the two children.',
        'Keep the threshold with the highest Gini.',
        'Split the node and recurse.'
      ],
      answer: 2,
      explain: 'CART keeps the split with the lowest impurity, not the highest. Lower Gini means purer children.'
    },
    {
      type: 'short',
      q: 'Why does bagging reduce variance rather than bias?',
      rubric: [
        'Mentions training trees on resampled or perturbed data',
        'Mentions averaging their predictions',
        'Explains that the average keeps the same centre and shrinks the spread'
      ],
      model: 'Each bagged tree sees a different sample, so their errors differ. Averaging many trees leaves the average prediction near the same centre, which keeps bias, while the disagreement between trees cancels, which lowers variance.',
      explain: 'Averaging independent errors reduces their spread. It does not correct a systematic miss.'
    }
  ],
  connections: [
    {
      prompt: 'Match the method to the source of its diversity.',
      a: 'Method', b: 'Diversity',
      options: [
        { label: 'Bagging: bootstrap samples', ok: true },
        { label: 'Boosting: bootstrap samples', ok: false },
        { label: 'Bagging: sequential reweighting', ok: false },
        { label: 'Boosting: random feature subsets only', ok: false }
      ],
      explain: 'Bagging varies the sample. Boosting varies the focus through reweighting.'
    },
    {
      prompt: 'Which statement about tree scores is right?',
      a: 'Score', b: 'Behaviour',
      options: [
        { label: 'Gain favours many-valued features, gain ratio penalises them', ok: true },
        { label: 'Gain ratio favours many-valued features', ok: false },
        { label: 'Gini requires logarithms', ok: false },
        { label: 'Entropy is always zero', ok: false }
      ],
      explain: 'Raw gain rewards fragmentation. The ratio divides by split information to counter it.'
    }
  ],
  pairs: [
    {
      a: 'ID3', b: 'CART',
      claim: 'Both can split a numeric feature at a threshold.',
      same: false,
      explain: 'ID3 uses categorical splits. C4.5 adds thresholds, and CART makes every split binary, including numeric ones.'
    },
    {
      a: 'Bagging', b: 'Boosting',
      claim: 'Both combine many trees into one prediction.',
      same: true,
      explain: 'Bagging averages independent trees. Boosting adds trees that correct earlier errors.'
    },
    {
      a: 'Entropy', b: 'Gini impurity',
      claim: 'Both are zero when a node is pure.',
      same: true,
      explain: 'Both measure mix. A node with one label has no mix under either measure.'
    }
  ],
  map: {
    nodes: [
      { id: 'tree', label: 'Tree', x: 12, y: 24 },
      { id: 'entropy', label: 'Entropy', x: 34, y: 16 },
      { id: 'id3', label: 'ID3', x: 52, y: 26 },
      { id: 'cart', label: 'CART', x: 72, y: 18 },
      { id: 'bag', label: 'Bagging', x: 46, y: 64 },
      { id: 'boost', label: 'Boosting', x: 74, y: 62 }
    ],
    edges: [
      ['tree', 'entropy', 'split scored by'],
      ['entropy', 'id3', 'highest gain'],
      ['id3', 'cart', 'binary splits'],
      ['tree', 'bag', 'averaged'],
      ['tree', 'boost', 'corrected in sequence']
    ]
  }
});
