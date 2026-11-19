AIM.registerUnit({
  n: 8, hue: 250, short: 'Probability',
  title: 'Reasoning with uncertainty',
  weeks: 'Week 8',
  promise: 'Update a belief when evidence arrives, then read independence off a graph.',
  minutes: 44,
  lectures: ['8.0 Probability refresher', '8.1 The problem of uncertainty', '8.2 The structure of Bayes nets', '8.3 Inference'],
  concepts: [
    {
      id: 'probability',
      title: 'Why probability',
      prereqs: ['variable-models'],
      usecase: 'A patient tests positive for a rare disease. The test is 99 percent sensitive and 95 percent specific. The patient wants the chance they actually have the disease. Intuition says 99 percent. The correct answer is far lower.',
      metaphor: {
        name: 'The weather forecast',
        claim: 'A forecast says 30 percent chance of rain. It does not mean it will rain 30 percent as hard. It means that in similar conditions, rain occurred three times in ten.',
        mapping: [
          ['a forecast', 'probability estimate', 'read the number'],
          ['similar days', 'repeatable situations', 'imagine many runs'],
          ['rain or no rain', 'event', 'observe the outcome']
        ],
        widget: 'prob-grid',
        lab: {
          title: 'Fill the square',
          tryText: 'Drag the probability from 0 to 1. Watch the area fill.',
          notice: 'Probability is an area. The whole square is 1, and any event is a region inside it.'
        }
      },
      idea: `<p><strong>Probability</strong> is a number between 0 and 1 that measures how likely an event is. The probabilities of all mutually exclusive outcomes sum to 1. A joint probability covers two events at once, such as rain and a cancelled match.</p>
<p>Uncertainty is not a temporary lack of data. Some events are genuinely random, such as a coin flip. Others are deterministic but unknown to us, such as whether a patient has a disease. Probability handles both by treating belief as a distribution over possibilities.</p>
<p>The alternative is to ignore uncertainty and output a label. That is what a classifier does after a threshold. Probability keeps the full picture, which matters when the cost of being wrong depends on how sure you were.</p>`,
      lecture: {
        ref: '8.1',
        source: 'Transcript, The problem of uncertainty',
        text: 'The lecturer motivates the unit with cases where the world does not give a clean answer. "We cannot always know for sure. We need a way to represent how likely something is, and to update that when we see evidence."'
      },
      mechanics: {
        formula: 'P(A) + P(not A) = 1, 0 ≤ P(A) ≤ 1',
        symbols: [
          ['P(A)', 'the probability of event A'],
          ['not A', 'the complement of A'],
          ['1', 'certainty, the total probability']
        ],
        worked: 'A test has a 0.2 chance of a positive result when the disease is absent, so the chance of a negative result in that case is 0.8. If the disease is present, the chance of a positive result is 0.99 and the chance of a negative result is 0.01. Each pair sums to 1.'
      },
      mechanism: {
        widget: 'prob-grid',
        lab: {
          title: 'Two events, four regions',
          tryText: 'Set P(A), P(B) and the overlap. Watch the four regions and the totals.',
          notice: 'The overlap counts in both events. Adding P(A) and P(B) double-counts it unless you subtract.'
        }
      },
      breaks: 'Probabilities depend on the reference class. A 30 percent chance of rain in April is not the same as in July. Two events that each have a probability do not determine their joint probability without an assumption about dependence.',
      check: [
        {
          q: 'What must the probabilities of all mutually exclusive outcomes sum to?',
          options: ['0', '0.5', '1', 'The number of outcomes'],
          answer: 2,
          explain: 'The outcomes cover every possibility, so their total probability is 1.'
        },
        {
          q: 'Why keep a probability instead of a label?',
          options: ['It is faster', 'It preserves how uncertain the model is', 'It removes the need for data', 'It guarantees correctness'],
          answer: 1,
          explain: 'The probability carries confidence. A label throws that away at the threshold.'
        }
      ],
      connection: {
        prompt: 'A probability sits between which earlier outputs?',
        a: 'Probability', b: 'Label versus score',
        options: [
          { label: 'It keeps the score that the label discards', ok: true },
          { label: 'It replaces the label with a path', ok: false },
          { label: 'It is the same as a label', ok: false },
          { label: 'It removes the loss', ok: false }
        ],
        explain: 'A classifier computes a score and then thresholds it. The probability is the score before the decision.'
      },
      recap: [
        'Probability measures belief on a scale from 0 to 1.',
        'All mutually exclusive outcomes sum to 1.',
        'Keeping the probability preserves confidence that a label hides.'
      ],
      now: 'You can now read a probability statement and explain what the number refers to.'
    },
    {
      id: 'conditional',
      title: 'Conditional probability',
      prereqs: ['probability'],
      usecase: 'A model predicts rain with 40 percent chance. Then a barometer drops. The chance of rain given that drop is 70 percent. The new information changed the estimate, and the change is the whole point.',
      metaphor: {
        name: 'The smaller room',
        claim: 'You are told the event happened, so the world shrinks to that region. You now measure inside the smaller room.',
        mapping: [
          ['the whole room', 'sample space', 'start with all cases'],
          ['the part that happened', 'conditioning event', 'restrict to B'],
          ['the overlap', 'joint event', 'measure A and B'],
          ['the new fraction', 'conditional probability', 'divide by P(B)']
        ],
        widget: 'prob-grid',
        lab: {
          title: 'Shrink the world',
          tryText: 'Fix B as given. Watch the square zoom to B and the probability of A change.',
          notice: 'Conditioning removes every case where B is false. The denominator is now the area of B.'
        }
      },
      idea: `<p><strong>Conditional probability</strong> is the probability of A given that B is true: P(A|B) = P(A and B) / P(B). It rescales the world so that B is certain.</p>
<p>Conditioning changes the reference class. The chance of a positive test given the disease is not the chance of the disease given a positive test. Those two numbers can differ by a factor of a hundred when the disease is rare.</p>
<p>Independence means conditioning on B does not change A: P(A|B) = P(A). Many errors in applied work come from assuming independence where it does not hold, such as treating two tests on the same patient as unrelated.</p>`,
      lecture: {
        ref: '8.0',
        source: 'Transcript, Probability theory refresher',
        text: 'The lecturer defines conditional probability on the board and stresses the direction. "P of A given B is not P of B given A. The order matters, and confusing them is a common mistake."'
      },
      mechanics: {
        formula: 'P(A | B) = P(A and B) / P(B)',
        symbols: [
          ['P(A | B)', 'the probability of A given B'],
          ['P(A and B)', 'the probability both happen'],
          ['P(B)', 'the probability of the condition']
        ],
        worked: 'In 1,000 patients, 10 have the disease and 9 of them test positive. Another 50 without the disease also test positive. P(positive | disease) is 9/10 = 0.9. P(disease | positive) is 9/59 = 0.15. The same counts give two very different numbers.'
      },
      mechanism: {
        widget: 'prob-grid',
        lab: {
          title: 'Condition on each event in turn',
          tryText: 'Switch the given event from A to B and compare the conditional probabilities.',
          notice: 'The two conditionals are different fractions of different denominators.'
        }
      },
      breaks: 'Conditioning on a rare event produces unstable estimates, because the denominator is small. Selection effects also change the reference class: patients who get tested are not a random sample. And a conditional probability is not causal. P(symptom | disease) does not tell you what treatment does.',
      check: [
        {
          q: 'Which formula defines P(A | B)?',
          options: ['P(A) P(B)', 'P(A and B) / P(B)', 'P(B) / P(A and B)', 'P(A) + P(B)'],
          answer: 1,
          explain: 'Conditioning restricts the world to B, so the joint probability is divided by the probability of B.'
        },
        {
          q: 'What does independence mean?',
          options: ['P(A and B) = 0', 'P(A | B) = P(A)', 'P(A) = P(B)', 'A and B cannot both happen'],
          answer: 1,
          explain: 'Knowing B gives no information about A, so the conditional equals the unconditional probability.'
        }
      ],
      connection: {
        prompt: 'How does conditioning relate to the earlier idea of a reference class?',
        a: 'Conditioning', b: 'Reference class',
        options: [
          { label: 'It changes the reference class to the cases where B holds', ok: true },
          { label: 'It leaves the reference class unchanged', ok: false },
          { label: 'It removes probability altogether', ok: false },
          { label: 'It makes every event independent', ok: false }
        ],
        explain: 'The denominator is the set of cases where the condition holds, which is a new population.'
      },
      recap: [
        'Conditional probability rescales the world to the condition.',
        'P(A|B) and P(B|A) are different quantities.',
        'Independence means the condition carries no information.'
      ],
      now: 'You can now compute a conditional probability from a table and avoid flipping the direction.'
    },
    {
      id: 'bayes-rule',
      title: 'Bayes rule and the base rate',
      prereqs: ['conditional'],
      usecase: 'A screening test is 99 percent sensitive and 95 percent specific. The disease affects 1 in 1,000 people. A patient tests positive. The chance of disease is about 2 percent, not 99 percent.',
      metaphor: {
        name: 'The library with one shelf',
        claim: 'A witness says the book came from the crime shelf. Most books in the library are elsewhere, so even a reliable witness usually points at the wrong shelf.',
        mapping: [
          ['books on each shelf', 'prior probability', 'set the base rate'],
          ['witness reliability', 'likelihood', 'set sensitivity'],
          ['the shelf after the report', 'posterior', 'compute the update']
        ],
        widget: 'prob-grid',
        lab: {
          title: 'Update a belief',
          tryText: 'Set the base rate low, then raise it. Watch the posterior change while the test stays the same.',
          notice: 'The same positive result means different things in a rare and a common disease.'
        }
      },
      idea: `<p><strong>Bayes rule</strong> turns P(evidence | hypothesis) into P(hypothesis | evidence). It multiplies the <strong>prior</strong> by the likelihood and divides by the probability of the evidence. The result is the <strong>posterior</strong>.</p>
<p>The prior is the base rate before the evidence. When the prior is tiny, even a strong test produces mostly false positives. That is not a flaw in the test. It is arithmetic: there are far more healthy people than sick ones.</p>
<p>The rule is the foundation of the rest of the unit. A network of such tables applies it many times over a graph, and inference is the computation that combines the pieces.</p>`,
      lecture: {
        ref: '8.3',
        source: 'Transcript, Inference',
        text: 'The lecturer works the medical test example and shows that a positive result on a rare disease is usually a false alarm. "The prior matters. If the disease is rare, most positives come from healthy people."'
      },
      mechanics: {
        formula: 'P(H | E) = P(E | H) P(H) / P(E)',
        symbols: [
          ['H', 'the hypothesis, such as disease present'],
          ['E', 'the evidence, such as a positive test'],
          ['P(H)', 'the prior'],
          ['P(E | H)', 'the likelihood'],
          ['P(H | E)', 'the posterior']
        ],
        worked: 'Out of 100,000 people, 100 have the disease. The test catches 99 of them. Of the 99,900 healthy people, 5 percent test positive, which is 4,995 false alarms. A positive result comes from 99 true cases out of 5,094 positives, so the posterior is 0.019, about 2 percent.'
      },
      mechanism: {
        widget: 'prob-grid',
        lab: {
          title: 'The same test in two populations',
          tryText: 'Set prevalence to 0.1 percent, then to 10 percent. Compare the posterior after one positive.',
          notice: 'Sensitivity and specificity did not change. Only the prior did.'
        }
      },
      breaks: 'Bayes rule needs a prior, and a bad prior gives a bad posterior. It also assumes the likelihood is known and stable across populations. In practice both are estimates, so the output is only as good as its inputs.',
      check: [
        {
          q: 'What does the prior represent?',
          options: ['The test result', 'The belief before seeing evidence', 'The final answer', 'The error rate'],
          answer: 1,
          explain: 'The prior is the probability of the hypothesis before the evidence arrives.'
        },
        {
          q: 'Why does a rare disease give mostly false positives?',
          options: ['The test is broken', 'There are far more healthy people than sick ones', 'The sensitivity is too high', 'The posterior is ignored'],
          answer: 1,
          explain: 'A small false-positive rate applied to a huge healthy group can outweigh the true positives from a tiny sick group.'
        }
      ],
      connection: {
        prompt: 'Bayes rule combines which two earlier quantities?',
        a: 'Prior and likelihood', b: 'Posterior',
        options: [
          { label: 'Base rate and test performance', ok: true },
          { label: 'Mean and variance', ok: false },
          { label: 'Precision and recall only', ok: false },
          { label: 'Loss and gradient', ok: false }
        ],
        explain: 'The prior is the base rate, and the likelihood is how the test behaves under each hypothesis.'
      },
      recap: [
        'Bayes rule updates a prior with evidence to give a posterior.',
        'A low base rate makes positive tests mostly false.',
        'The result is only as good as the prior and the likelihood.'
      ],
      now: 'You can now compute a posterior for a test and explain why a rare disease produces false alarms.'
    },
    {
      id: 'bayes-nets',
      title: 'Bayes nets and independence',
      prereqs: ['bayes-rule'],
      usecase: 'An alarm system depends on burglary and an earthquake. Two neighbours may call if they hear the alarm. Modelling all combinations of five variables needs 31 numbers. The graph needs ten.',
      metaphor: {
        name: 'The rumour network',
        claim: 'A rumour starts with one person, spreads to a few, and reaches you through them. Which people you hear from tells you something about the source.',
        mapping: [
          ['a person', 'variable', 'click a node'],
          ['an arrow', 'direct influence', 'follow the edge'],
          ['a blocked path', 'independence', 'test a connection']
        ],
        widget: 'bayes-builder',
        lab: {
          title: 'Build a small network',
          tryText: 'Add edges between variables. Then ask whether two nodes are connected given evidence.',
          notice: 'Some paths carry information and some are blocked. The graph answers the question.'
        }
      },
      idea: `<p>A <strong>Bayes net</strong> is a directed acyclic graph. Each node is a variable, each edge is a direct influence, and each node stores a conditional probability table given its parents. The graph encodes independence assumptions that make the joint distribution compact.</p>
<p><strong>d-separation</strong> reads independence off the graph. Two nodes are independent given a set of observed nodes if every path between them is blocked. A path is blocked by a chain or a fork with an observed middle node, or by a collider whose middle node and descendants are unobserved.</p>
<p>The compact representation is why Bayes nets scale. Instead of a table over every combination, each node needs a table over its parents only. A sparse graph can represent a distribution with exponentially fewer numbers.</p>`,
      lecture: {
        ref: '8.2',
        source: 'Transcript, The structure of Bayes networks',
        text: 'The lecturer builds the alarm network. "Each node depends only on its parents. That is the conditional independence assumption, and it is what makes the network compact."'
      },
      mechanics: {
        formula: 'P(X₁, ..., Xₙ) = Π P(Xᵢ | parents(Xᵢ))',
        symbols: [
          ['P', 'the probability of an assignment'],
          ['Xᵢ', 'a variable in the network'],
          ['parents(Xᵢ)', 'the nodes with edges into Xᵢ'],
          ['Π', 'a product over all nodes']
        ],
        worked: 'Burglary and earthquake are independent roots with priors 0.001 and 0.002. Alarm depends on both, with four conditional probabilities. John calls depends on alarm, and Mary calls depends on alarm. The joint needs 1 + 1 + 4 + 2 + 2 = 10 numbers instead of 31.'
      },
      mechanism: {
        widget: 'bayes-builder',
        lab: {
          title: 'Open and block a path',
          tryText: 'Observe the middle node of a chain and watch the connection disappear. Then observe a collider.',
          notice: 'Observation can create dependence at a collider and remove it at a chain.'
        }
      },
      breaks: 'A Bayes net needs the graph structure, which is often unknown and must be learned or elicited. The compact tables assume the graph is correct. Cycles and feedback cannot be represented directly, and a dense graph loses the savings.',
      check: [
        {
          q: 'What does each node store?',
          options: ['The full joint distribution', 'A conditional table given its parents', 'A single probability', 'A gradient'],
          answer: 1,
          explain: 'Each node stores P(node | parents), and the product of these tables gives the joint distribution.'
        },
        {
          q: 'What does d-separation tell you?',
          options: ['Whether two variables are independent given observations', 'The most likely value', 'The number of edges', 'The prior'],
          answer: 0,
          explain: 'It reads conditional independence off the graph by checking whether every path is blocked.'
        }
      ],
      connection: {
        prompt: 'A Bayes net is built from which earlier rule applied locally?',
        a: 'Graph', b: 'Rule',
        options: [
          { label: 'Bayes rule at each node with its parents', ok: true },
          { label: 'Gradient descent at each node', ok: false },
          { label: 'Information gain at each node', ok: false },
          { label: 'The normal equation at each node', ok: false }
        ],
        explain: 'Each conditional table is a local probability model. Inference combines them with the product rule and Bayes rule.'
      },
      recap: [
        'A Bayes net is a DAG with a conditional table per node.',
        'The graph encodes independence and shrinks the joint distribution.',
        'd-separation answers independence questions from structure and evidence.'
      ],
      now: 'You can now build a small network and decide whether two nodes are independent given evidence.'
    },
    {
      id: 'bayes-inference',
      title: 'Inference in a Bayes net',
      prereqs: ['bayes-nets'],
      usecase: 'The alarm sounds and John calls. What is the chance of a burglary? The network has the tables. Inference combines them into a posterior for the query variable.',
      metaphor: {
        name: 'The evidence ledger',
        claim: 'You list every way the observed evidence could have happened, weight each by its probability, and keep only the cases that match your query.',
        mapping: [
          ['a possible story', 'assignment to all variables', 'enumerate a row'],
          ['how likely the story is', 'joint probability', 'multiply the tables'],
          ['keeping the matching stories', 'sum over the query', 'add them up']
        ],
        widget: 'alarm-infer',
        lab: {
          title: 'Enumerate the stories',
          tryText: 'Fix the evidence, then step through the matching rows. Watch the posterior build up.',
          notice: 'Inference is weighted counting. The tables supply the weights.'
        }
      },
      idea: `<p><strong>Inference by enumeration</strong> computes a posterior by summing the joint probability over all assignments consistent with the evidence. The joint comes from multiplying the conditional tables. The result is normalised by the probability of the evidence.</p>
<p>The method is exact and easy to implement. Its cost grows exponentially with the number of unobserved variables, so it is only practical for small networks. Variable elimination reorders the sums and can be far faster on sparse graphs.</p>
<p>Approximate methods sample instead of summing. They trade exactness for scale, which is the usual choice for large networks and for models with continuous variables.</p>`,
      lecture: {
        ref: '8.3',
        source: 'Transcript, Inference',
        text: 'The lecturer computes a posterior by enumerating the rows of the joint table. "We sum over the hidden variables, and then we normalise so the probabilities add to one."'
      },
      mechanics: {
        formula: 'P(Q | E = e) = Σ P(Q, h, e) / P(e)',
        symbols: [
          ['Q', 'the query variable'],
          ['E', 'the evidence variables'],
          ['h', 'the hidden variables'],
          ['Σ', 'a sum over the hidden assignments'],
          ['P(e)', 'the normalising constant']
        ],
        worked: 'With John calls true and Mary calls true, enumerate the four combinations of burglary and earthquake. Multiply the priors by the alarm and call tables for each row. The burglary rows carry most of the mass, so the posterior for burglary rises well above its 0.001 prior.'
      },
      mechanism: {
        widget: 'alarm-infer',
        lab: {
          title: 'Change the evidence',
          tryText: 'Switch John and Mary between call and no call. Watch the burglary posterior move.',
          notice: 'Two independent calls give more evidence than one. The network combines them through the alarm.'
        }
      },
      breaks: 'Enumeration is exponential in the number of hidden variables. It also needs the full conditional tables, which may be estimated from little data. Exact inference in general Bayesian networks is NP-hard, so approximation is unavoidable at scale.',
      check: [
        {
          q: 'What does enumeration sum over?',
          options: ['The evidence variables', 'The hidden variables', 'The parameters', 'The graph edges'],
          answer: 1,
          explain: 'It sums the joint probability over hidden assignments consistent with the evidence.'
        },
        {
          q: 'Why normalise by P(e)?',
          options: ['To make the posterior sum to 1', 'To remove the prior', 'To speed up the sum', 'To avoid Bayes rule'],
          answer: 0,
          explain: 'Dividing by the probability of the evidence turns the weighted counts into a distribution.'
        }
      ],
      connection: {
        prompt: 'Inference applies which earlier rule across many variables?',
        a: 'Enumeration', b: 'Rule',
        options: [
          { label: 'Bayes rule, once per assignment', ok: true },
          { label: 'The normal equation', ok: false },
          { label: 'Information gain', ok: false },
          { label: 'Gradient descent', ok: false }
        ],
        explain: 'Each row is weighted by the joint, and normalising is Bayes rule in table form.'
      },
      recap: [
        'Exact inference sums the joint over hidden variables.',
        'Normalisation turns the sum into a posterior.',
        'The cost grows exponentially with hidden variables.'
      ],
      now: 'You can now compute a posterior by enumeration for a small network.'
    },
    {
      id: 'explaining-away',
      title: 'Explaining away',
      prereqs: ['bayes-inference'],
      usecase: 'The alarm sounds. That raises the chance of a burglary. Then you learn there was an earthquake. The chance of a burglary falls, because the earthquake explains the alarm on its own.',
      metaphor: {
        name: 'Two excuses for one lateness',
        claim: 'A colleague is late. You suspect traffic. Then they mention a cancelled train. The train explains the lateness, so traffic becomes less likely.',
        mapping: [
          ['being late', 'observed effect', 'see the alarm'],
          ['traffic', 'cause A', 'query burglary'],
          ['cancelled train', 'cause B', 'observe earthquake']
        ],
        widget: 'explaining-away',
        lab: {
          title: 'Add a second explanation',
          tryText: 'Observe the alarm, then observe the earthquake. Watch the burglary belief fall.',
          notice: 'Two causes compete to explain one effect. Evidence for one lowers the need for the other.'
        }
      },
      idea: `<p><strong>Explaining away</strong> is the pattern where two causes of a common effect become dependent when the effect is observed. In a collider A then C then B, observing C makes A and B informative about each other.</p>
<p>This is the opposite of a chain. In a chain A then B then C, observing B blocks the path between A and C. In a collider, observing B or a descendant of B opens the path.</p>
<p>The pattern matters in diagnosis, fault detection and any model where several causes can produce the same symptom. It also explains why a model that ignores the collider can double-count evidence.</p>`,
      lecture: {
        ref: '8.3',
        source: 'Transcript, Inference',
        text: 'The lecturer shows that observing the alarm makes burglary and earthquake dependent. "Once we know the alarm went off, an earthquake makes a burglary less likely, because the earthquake already explains the alarm."'
      },
      mechanics: {
        formula: 'P(B | A, E) < P(B | A) when E also explains A',
        symbols: [
          ['B', 'burglary'],
          ['A', 'alarm'],
          ['E', 'earthquake'],
          ['P(B | A)', 'belief in burglary after the alarm']
        ],
        worked: 'P(burglary) is 0.001. After the alarm, P(burglary | alarm) is about 0.37. After also learning of an earthquake, P(burglary | alarm, earthquake) falls to about 0.003, because the earthquake is now the better explanation for the alarm.'
      },
      mechanism: {
        widget: 'explaining-away',
        lab: {
          title: 'Watch one cause displace the other',
          tryText: 'Toggle the earthquake evidence and compare the burglary posterior at each step.',
          notice: 'The two causes are independent a priori. The shared effect makes them compete.'
        }
      },
      breaks: 'Explaining away depends on the direction of the arrows. Reverse the graph and the pattern changes. It also assumes the causes are a complete set; a missing cause can make the effect look explained when it is not.',
      check: [
        {
          q: 'What graph pattern produces explaining away?',
          options: ['A chain', 'A fork', 'A collider', 'A cycle'],
          answer: 2,
          explain: 'Two causes pointing into one effect form a collider, and observing the effect opens the path between them.'
        },
        {
          q: 'After an earthquake is observed, what happens to the belief in burglary?',
          options: ['It rises', 'It falls', 'It stays the same', 'It becomes certain'],
          answer: 1,
          explain: 'The earthquake explains the alarm, so the burglary is less needed as an explanation.'
        }
      ],
      connection: {
        prompt: 'Explaining away reverses which earlier independence rule?',
        a: 'Chain', b: 'Collider',
        options: [
          { label: 'Observing the middle blocks a chain but opens a collider', ok: true },
          { label: 'Observing the middle always blocks', ok: false },
          { label: 'Observing the middle always opens', ok: false },
          { label: 'Observation never changes independence', ok: false }
        ],
        explain: 'A chain is blocked by its middle node. A collider is opened by its middle node.'
      },
      recap: [
        'Explaining away makes two causes compete once their effect is observed.',
        'It happens at a collider, not at a chain or fork.',
        'Ignoring it can double-count evidence.'
      ],
      now: 'You can now spot a collider and predict whether evidence will unite or separate two causes.'
    }
  ],
  test: [
    {
      q: 'What is the range of a probability?',
      options: ['Any real number', 'Between 0 and 1', 'Between -1 and 1', 'Positive only'],
      answer: 1,
      explain: 'Probability is bounded by 0 and 1 inclusive.'
    },
    {
      q: 'P(A | B) equals what?',
      options: ['P(A) P(B)', 'P(A and B) / P(B)', 'P(B) / P(A)', 'P(A) + P(B) - 1'],
      answer: 1,
      explain: 'Conditioning restricts the sample space to B, so the joint is divided by P(B).'
    },
    {
      q: 'A disease affects 1 in 10,000. A positive test is most likely what?',
      options: ['A true positive', 'A false positive', 'Impossible', 'Certain'],
      answer: 1,
      explain: 'With such a low prior, the large healthy group produces more false positives than the tiny sick group produces true ones.'
    },
    {
      q: 'What does a Bayes net store at each node?',
      options: ['A prior only', 'A conditional table given its parents', 'The full joint table', 'A gradient'],
      answer: 1,
      explain: 'Local conditional tables multiply to give the joint distribution.'
    },
    {
      q: 'What does d-separation determine?',
      options: ['The most likely assignment', 'Conditional independence given evidence', 'The number of parameters', 'The prior'],
      answer: 1,
      explain: 'It checks whether all paths between two nodes are blocked by the evidence.'
    },
    {
      q: 'Enumeration inference costs what in the number of hidden variables?',
      options: ['Linear', 'Quadratic', 'Exponential', 'Constant'],
      answer: 2,
      explain: 'It sums over all hidden assignments, which doubles with each binary variable.'
    },
    {
      q: 'Explaining away occurs at which structure?',
      options: ['Chain', 'Fork', 'Collider', 'Isolated node'],
      answer: 2,
      explain: 'Two causes into one effect form a collider, and observing the effect makes the causes dependent.'
    },
    {
      q: 'Observing the middle node of a chain does what?',
      options: ['Opens the path', 'Blocks the path', 'Reverses the arrows', 'Changes the prior'],
      answer: 1,
      explain: 'Once the middle is known, the ends are independent, so the path is blocked.'
    }
,
    {
      type: 'numeric',
      q: 'A disease affects 1 in 100 people. A test detects 99 percent of cases and falsely flags 5 percent of healthy people. What is the probability of disease given a positive test? Give three decimal places.',
      answer: 0.167,
      tolerance: 0.01,
      explain: 'The joint is 0.01 x 0.99 = 0.0099. The positive evidence is 0.0099 + 0.99 x 0.05 = 0.0594. The posterior is 0.0099 / 0.0594 = 0.167.'
    },
    {
      type: 'ordering',
      q: 'Order the steps of a Bayes rule calculation.',
      items: [
        'Write the prior for the hypothesis',
        'Write the likelihood of the evidence given the hypothesis',
        'Compute the marginal probability of the evidence',
        'Divide the joint by the marginal to get the posterior'
      ],
      explain: 'The posterior is the joint divided by the evidence. The marginal is the normalising constant.'
    },
    {
      type: 'error',
      q: 'A team states how a Bayes net encodes independence. One step is wrong. Which one?',
      steps: [
        'Each node stores a table conditional on its parents.',
        'A collider opens a path when it or one of its descendants is observed.',
        'Observing the middle node of a chain keeps the path open.',
        'd-separation reads independence from the graph.'
      ],
      answer: 2,
      explain: 'Observing the middle node of a chain blocks the path. A collider is the structure that opens when observed.'
    },
    {
      type: 'short',
      q: 'Explain explaining away with a collider.',
      rubric: [
        'Identifies a common effect with two causes',
        'Says the causes are independent before the effect is observed',
        'Explains that observing the effect makes one cause less likely when the other is present'
      ],
      model: 'Two independent causes point at one effect. Before the effect is seen, learning one cause says nothing about the other. Once the effect is observed, finding one cause explains it away, so the other cause becomes less likely.',
      explain: 'The collider is the only structure where observation creates dependence between parents.'
    }
  ],
  connections: [
    {
      prompt: 'Match the structure to the independence behaviour.',
      a: 'Structure', b: 'Behaviour',
      options: [
        { label: 'Chain: observing the middle blocks', ok: true },
        { label: 'Collider: observing the middle blocks', ok: false },
        { label: 'Fork: observing the middle opens', ok: false },
        { label: 'Chain: observing the middle opens', ok: false }
      ],
      explain: 'Chains and forks are blocked by observation. Colliders are opened by it.'
    }
  ],
  pairs: [
    {
      a: 'The prior', b: 'The posterior',
      claim: 'Both are probabilities over the same hypothesis.',
      same: true,
      explain: 'The posterior is the prior updated with evidence. Both describe the same uncertain quantity.'
    },
    {
      a: 'A chain', b: 'A collider',
      claim: 'Both transmit dependence when the middle node is observed.',
      same: false,
      explain: 'Observing the middle of a chain blocks it. Observing a collider opens the path between its parents.'
    },
    {
      a: 'Enumeration', b: 'Variable elimination',
      claim: 'Both compute the same conditional probabilities.',
      same: true,
      explain: 'Both are exact inference. Variable elimination reorders the sums to avoid repeated work.'
    }
  ],
  map: {
    nodes: [
      { id: 'prob', label: 'Probability', x: 12, y: 24 },
      { id: 'cond', label: 'Conditional', x: 32, y: 16 },
      { id: 'bayes', label: 'Bayes rule', x: 52, y: 26 },
      { id: 'net', label: 'Bayes net', x: 74, y: 18 },
      { id: 'infer', label: 'Inference', x: 60, y: 62 },
      { id: 'away', label: 'Explaining away', x: 84, y: 58 }
    ],
    edges: [
      ['prob', 'cond', 'restricts'],
      ['cond', 'bayes', 'updates'],
      ['bayes', 'net', 'applied locally'],
      ['net', 'infer', 'answers queries'],
      ['infer', 'away', 'collider pattern']
    ]
  }
});
