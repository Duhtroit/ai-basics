AIM.registerTeach({
  n: 8,
  opening: `<p>Units 3 to 7 return definite answers. A line returns a number, a classifier returns a label, a solver returns an assignment. Real evidence is often incomplete, noisy or expensive to obtain. Unit 8 replaces the definite answer with a probability, and replaces hard rules with conditional influences.</p>
<p>The unit starts with the basic language: events, conditional probability and Bayes rule. It then builds a Bayes net, a graph that stores a joint distribution compactly, and shows how to answer queries by inference. The last concept explains a pattern that surprises almost everyone: two causes of the same effect become dependent once the effect is observed.</p>
<p>The arithmetic is not hard. The discipline is in keeping track of what is conditioned on what. Write the events down, write the condition after the vertical bar, and check that the numbers sum to 1.</p>`,
  concepts: {
    'probability': {
      teach: `<p>Probability puts a number between 0 and 1 on how likely an event is. The probabilities of all mutually exclusive outcomes sum to 1. <code>P(A)</code> is the probability of event A, and <code>P(not A) = 1 - P(A)</code>. A probability of 0 means impossible and 1 means certain, but values in between do not say what will happen on one occasion; they describe the long-run or subjective belief.</p>
<p>A <strong>joint probability</strong> covers two events at once, such as rain and a cancelled match. A <strong>marginal probability</strong> sums the joint over the other variable: <code>P(rain) = P(rain, cancel) + P(rain, no cancel)</code>. The two events may be dependent or independent; the joint table tells you which.</p>
<h4>Where uncertainty comes from</h4>
<p>Some events are genuinely random, such as a coin flip. Others are deterministic but unknown to us, such as whether a patient has a disease before the test. Probability handles both by treating belief as a distribution over possibilities. The alternative is to output a label and hide the confidence. A probability keeps the confidence, which matters when the cost of being wrong depends on how sure you were.</p>
<div class="callout"><b>Reference class</b><p>A 30 percent chance of rain in April is not the same as a 30 percent chance in July. A probability is always relative to a population and a time. State them when they matter.</p></div>
<p>Two events that each have a probability do not determine their joint probability without an assumption about dependence. Rain and a cancelled match are not independent. Assuming independence when it is false is one of the most common errors in applied probability.</p>`,
      work: `<ol class="steps"><li>A test has a 0.2 chance of a positive result when the disease is absent.</li><li>The chance of a negative result in that case is <code>1 - 0.2 = 0.8</code>.</li><li>When the disease is present, the chance of a positive result is 0.99.</li><li>The chance of a negative result in that case is <code>1 - 0.99 = 0.01</code>.</li><li>Each pair sums to 1, which is a quick check that the conditional probabilities are complete.</li></ol>`,
      practice: {
        q: 'A weather model says 40 percent chance of rain on Saturday and 40 percent on Sunday. Can you conclude a 64 percent chance of rain at some point over the weekend?',
        hint: 'The answer depends on whether the two days are independent.',
        answer: `<p>Only if rain on Saturday and rain on Sunday are independent. Under independence, the chance of no rain on both days is <code>0.6 × 0.6 = 0.36</code>, so the chance of rain at some point is 0.64. Weather is positively correlated across days, so the true chance of at least one rainy day is lower than 0.64. The marginal probabilities alone do not determine the joint.</p>`
      },
      bridge: 'A marginal probability ignores information. Conditioning updates it when something is observed.'
    },
    'conditional': {
      teach: `<p>Conditional probability is the probability of A given that B is true: <code>P(A | B) = P(A and B) / P(B)</code>, provided <code>P(B) &gt; 0</code>. Conditioning rescales the world so that B is certain. The numerator keeps the cases where both happen; the denominator divides by the cases where B happens.</p>
<p>The order matters. <code>P(positive test | disease)</code> is not <code>P(disease | positive test)</code>. The first is a property of the test. The second is what the patient wants to know. When the disease is rare, the two can differ by a factor of a hundred.</p>
<h4>Independence</h4>
<p>Two events are independent when conditioning on one does not change the probability of the other: <code>P(A | B) = P(A)</code>, equivalently <code>P(A and B) = P(A) P(B)</code>. Independence is a modelling assumption, not a default. Two tests on the same patient are usually dependent, because they respond to the same underlying condition. Treating them as independent double-counts the evidence.</p>
<h4>Conditioning changes the reference class</h4>
<p>Patients who get tested are not a random sample of the population. They are tested because a clinician suspected something. That selection effect changes the base rate, and a conditional probability computed on a different reference class may not transfer. Always ask what population the denominator describes.</p>
<div class="callout"><b>Conditional is not causal</b><p><code>P(symptom | disease)</code> does not tell you what treating the disease will do to the symptom. Conditional probability describes association within a population, not an intervention.</p></div>`,
      work: `<ol class="steps"><li>1,000 patients. 10 have the disease, and 9 of them test positive.</li><li><code>P(positive | disease) = 9 / 10 = 0.9</code>.</li><li>50 healthy patients also test positive.</li><li>There are <code>9 + 50 = 59</code> positive tests in total.</li><li><code>P(disease | positive) = 9 / 59 ≈ 0.153</code>. The same counts produce 0.9 in one direction and 0.153 in the other.</li></ol>`,
      practice: {
        q: 'In a city, 10 percent of adults have a condition. A symptom is present in 80 percent of people with the condition and 20 percent of people without it. What is P(condition | symptom)?',
        hint: 'Use a population of 1,000 and count the symptom cases in each group.',
        answer: `<p>In 1,000 adults, 100 have the condition and 80 of them have the symptom. Of the 900 without it, 180 have the symptom. So 260 people have the symptom, and 80 of them have the condition: <code>80 / 260 ≈ 0.308</code>. The symptom raises the probability from 0.1 to about 0.31, not to 0.8.</p>`
      },
      bridge: 'Conditioning one way is the likelihood. Bayes rule turns it around into the posterior.'
    },
    'bayes-rule': {
      teach: `<p>Bayes rule turns <code>P(E | H)</code> into <code>P(H | E)</code>: <code>P(H | E) = P(E | H) P(H) / P(E)</code>. The <strong>prior</strong> <code>P(H)</code> is the belief before the evidence. The <strong>likelihood</strong> <code>P(E | H)</code> is how well the hypothesis explains the evidence. The <strong>posterior</strong> <code>P(H | E)</code> is the updated belief. The denominator <code>P(E)</code> is the total probability of the evidence under all hypotheses.</p>
<p>For two hypotheses, the denominator is <code>P(E | H) P(H) + P(E | not H) P(not H)</code>. That sum is where the base rate enters. When the prior is tiny, even a strong test produces mostly false positives, because there are far more healthy people than sick ones.</p>
<h4>Natural frequencies</h4>
<p>Many people find the rule easier with counts. Imagine 100,000 people. If 100 have the disease, a 99 percent sensitive test catches 99. If the test is 95 percent specific, 5 percent of the 99,900 healthy people, or 4,995, test positive. A positive result therefore comes from 99 true cases out of 5,094 positives, about 2 percent. The arithmetic is the same as Bayes rule; the counts make the base rate visible.</p>
<div class="callout"><b>A positive test is not a diagnosis</b><p>The posterior depends on the prior. The same test in a high-risk clinic and in a general screening programme gives different answers from the same sensitivity and specificity.</p></div>
<p>Bayes rule also needs the likelihood to be stable across populations. If the test behaves differently in a new group, the posterior is only as good as that assumption. The rule is exact given its inputs; the inputs are estimates.</p>`,
      work: `<ol class="steps"><li>100,000 people, prevalence 1 in 1,000, so 100 have the disease.</li><li>Sensitivity 0.99 catches 99 of them.</li><li>Specificity 0.95 means 5 percent of the 99,900 healthy people test positive: 4,995 false positives.</li><li>Total positives: <code>99 + 4,995 = 5,094</code>.</li><li><code>P(disease | positive) = 99 / 5,094 ≈ 0.019</code>, about 2 percent.</li></ol>`,
      practice: {
        q: 'A test is 90 percent sensitive and 90 percent specific. Prevalence is 1 percent. What is the chance of disease after a positive test?',
        hint: 'Use 10,000 people: 100 have the disease, 9,900 do not.',
        answer: `<p>Of 10,000 people, 100 have the disease and 90 test positive. Of the 9,900 healthy, 10 percent, or 990, test positive. Total positives are 1,080, so the posterior is <code>90 / 1,080 ≈ 0.083</code>, about 8.3 percent. A positive result raises the chance from 1 percent to about 8 percent, not to 90 percent.</p>`
      },
      bridge: 'One variable and one test is a single application. A Bayes net applies the rule many times over a graph of variables.'
    },
    'bayes-nets': {
      teach: `<p>A Bayes net is a directed acyclic graph. Each node is a variable, each edge is a direct influence, and each node stores a conditional probability table given its parents. The graph encodes independence assumptions that make the joint distribution compact.</p>
<p>The joint probability of a full assignment factorises into a product of local conditionals: <code>P(X₁, ..., Xₙ) = Π P(Xᵢ | parents(Xᵢ))</code>. Instead of a table over every combination of all variables, each node needs a table over its parents only. A sparse graph can represent a distribution with exponentially fewer numbers.</p>
<h4>An example</h4>
<p>Burglary and earthquake are independent roots. Alarm depends on both. John calls depends on the alarm, and Mary calls depends on the alarm. The joint over five binary variables would need 31 independent numbers. The net needs 1 for burglary, 1 for earthquake, 4 for the alarm, 2 for John and 2 for Mary, for 10 numbers. The saving comes from the graph's independence claims.</p>
<h4>d-separation</h4>
<p>Two nodes are independent given a set of observed nodes if every path between them is blocked. A path is blocked by a chain or a fork when the middle node is observed. A path is blocked by a collider when the middle node and all of its descendants are unobserved. Observing a collider opens the path, which is the explaining-away pattern in the next concept. d-separation lets you read independence off the graph instead of computing the joint.</p>
<div class="callout"><b>The graph is an assumption</b><p>A Bayes net is only as good as its structure. A missing edge claims independence that may be false. The compact tables do not fix a wrong graph.</p></div>`,
      work: `<ol class="steps"><li>Burglary has prior 0.001. Earthquake has prior 0.002.</li><li>The alarm table has four rows, one for each combination of burglary and earthquake.</li><li>John calls has two rows, one for alarm true and one for alarm false.</li><li>Mary calls has two rows.</li><li>Total independent numbers: <code>1 + 1 + 4 + 2 + 2 = 10</code>, compared with 31 for a full joint table.</li></ol>`,
      practice: {
        q: 'In the alarm network, are burglary and earthquake independent? Are they independent given that the alarm is true?',
        hint: 'Look at the path between them and the direction of the arrows.',
        answer: `<p>Burglary and earthquake are independent at the roots, because there is no edge between them. Given that the alarm is true, they become dependent: the alarm is a collider, and observing it opens the path. Learning that an earthquake happened makes a burglary less likely, which is explaining away.</p>`
      },
      bridge: 'The graph stores the distribution. Inference answers a query by combining the tables.'
    },
    'bayes-inference': {
      teach: `<p>Inference in a Bayes net computes a posterior for a query variable given evidence. The direct method is enumeration: sum the joint probability over every assignment of the hidden variables that is consistent with the evidence, then normalise by the probability of the evidence.</p>
<div class="derive"><p><code>P(Q | E = e) = Σ_h P(Q, h, e) / P(e)</code></p></div>
<p>The joint comes from multiplying the conditional tables. The sum over hidden assignments is the marginalisation. The denominator is a normalising constant that makes the probabilities sum to 1. For a small network, this is easy to implement and exact.</p>
<h4>The cost</h4>
<p>The number of hidden assignments grows exponentially with the number of hidden variables. Enumeration is practical only for small networks. <strong>Variable elimination</strong> reorders the sums and multiplies factors, which can be far faster on sparse graphs. It still has a worst case exponential in the treewidth of the graph, but it is the standard exact method for moderate networks.</p>
<p>For large networks, exact inference is often infeasible. Approximate methods sample assignments and estimate the posterior from the samples. They trade exactness for scale. The choice depends on the graph, the query and the accuracy the application needs.</p>
<div class="callout"><b>Normalise at the end</b><p>The numerator sums are unnormalised. Divide by the probability of the evidence so the query answers sum to 1. This is also a useful check on the arithmetic.</p></div>`,
      work: `<ol class="steps"><li>Evidence: John calls and Mary calls are both true.</li><li>Hidden variables: burglary and earthquake, four combinations.</li><li>For each combination, multiply the prior, the alarm conditional and the two call conditionals.</li><li>Sum the rows where burglary is true, and the rows where it is false.</li><li>Divide each sum by the total. The result is the posterior for burglary given both calls.</li></ol>`,
      practice: {
        q: 'Why does enumeration become impractical when a network has many hidden variables, and what is one alternative?',
        hint: 'The sum is over every combination of hidden values.',
        answer: `<p>Enumeration sums over every assignment of the hidden variables, and that number doubles with each additional binary variable. Variable elimination reorders the sums and can avoid enumerating combinations that factor apart. Sampling methods estimate the posterior instead of computing it exactly, which scales better but gives an approximation.</p>`
      },
      bridge: 'Inference explains the effect from its causes. Explaining away runs the other way: observing the effect changes the relationship between the causes.'
    },
    'explaining-away': {
      teach: `<p>Explaining away is the pattern where two causes of a common effect become dependent when the effect is observed. In a collider <code>A → C ← B</code>, observing <code>C</code> makes <code>A</code> and <code>B</code> informative about each other. This is the opposite of a chain, where observing the middle node blocks the path.</p>
<p>Suppose a burglary and an earthquake can both set off an alarm. Before the alarm, the two causes are independent. After the alarm sounds, learning that an earthquake occurred makes a burglary less likely, because the earthquake now explains the alarm on its own. The two causes compete to explain the same evidence.</p>
<h4>A numerical example</h4>
<p>Let <code>P(burglary) = 0.001</code> and <code>P(earthquake) = 0.01</code>. The alarm is very likely if either cause is present and unlikely if neither is. After the alarm, the posterior for burglary rises to about 0.046. After also learning that an earthquake occurred, the posterior falls to about 0.001, close to the prior. The earthquake has explained the alarm, so the burglary is no longer needed to account for it.</p>
<div class="callout"><b>Direction matters</b><p>Explaining away happens at a collider. A chain or a fork with the middle observed blocks the path instead. Reversing the arrows can change the independence, so draw the graph before reasoning about it.</p></div>
<p>The pattern matters in diagnosis, fault detection and any model where several causes can produce the same symptom. A model that ignores the collider can double-count evidence, treating two tests as independent when they are both responding to the same underlying condition.</p>`,
      work: `<ol class="steps"><li>Prior: <code>P(burglary) = 0.001</code>, <code>P(earthquake) = 0.01</code>.</li><li>The alarm fires with high probability when at least one cause is present, and with low probability otherwise.</li><li>After the alarm, compute the posterior for burglary. It rises to about 0.046.</li><li>Now condition on an earthquake as well. The earthquake alone can explain the alarm.</li><li>The posterior for burglary falls to about 0.001, close to its prior. The causes are competing.</li></ol>`,
      practice: {
        q: 'A patient has a fever. The prior probability of flu is 10 percent and of a urinary infection is 5 percent. After the fever, the probability of flu rises. Then a urine test confirms an infection. What happens to the probability of flu, and why?',
        hint: 'The infection is another cause of the same symptom.',
        answer: `<p>The probability of flu falls, because the infection now explains the fever. The two causes compete for the same evidence. This is explaining away at a collider. The fall does not mean flu is impossible; it means the evidence no longer favours flu as much.</p>`
      },
      bridge: 'Unit 9 leaves uncertainty and returns to deterministic search, with a state space that is too large to write down.'
    }
  },
  closing: {
    teach: `<p>Probability is a language for uncertainty. Conditional probability rescales a belief when evidence arrives. Bayes rule turns a likelihood into a posterior, and the base rate is part of the answer. A Bayes net stores a joint distribution as a graph of local conditionals, and inference combines those tables into a posterior for a query. Explaining away is the pattern where observing a common effect makes its causes compete.</p>
<p>The practical habits are simple. Write the events and the condition. Use counts when the base rate is easy to lose. Check that the probabilities sum to 1. Draw the graph before claiming independence. Those habits prevent most of the errors that make probabilistic reasoning look harder than it is.</p>`,
    problem: {
      q: 'A disease has prevalence 0.5 percent. A test is 98 percent sensitive and 96 percent specific. A patient tests positive. Compute the approximate posterior, and explain what happens to it if the patient is from a high-risk group with prevalence 10 percent.',
      hint: 'Use 10,000 people for the first calculation.',
      answer: `<p>In 10,000 people, 50 have the disease and 49 test positive. Of the 9,950 healthy, 4 percent, or 398, test positive. Total positives are 447, so the posterior is <code>49 / 447 ≈ 0.11</code>, about 11 percent. At 10 percent prevalence, the same sensitivity and specificity give a much higher posterior, because the prior is larger. The test has not changed; the population has.</p>`
    }
  }
});
