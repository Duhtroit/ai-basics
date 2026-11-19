AIM.registerUnit({
  n: 11, hue: 345, short: 'Logic',
  title: 'From facts to proofs',
  weeks: 'Week 11',
  promise: 'Write sentences in a formal language, say what makes them true, and derive new ones you were never told.',
  minutes: 40,
  lectures: ['11.1 Syntax', '11.2 Semantics and knowledge base', '11.3 Logic inference'],
  concepts: [
    {
      id: 'syntax',
      title: 'Syntax: the shape of a sentence',
      prereqs: ['logic-models'],
      usecase: 'A rules engine must read policies written by lawyers and turn them into something a program can check. The first step is a grammar that says which strings are valid formulas.',
      metaphor: {
        name: 'The grammar of a language',
        claim: 'A sentence can be grammatical and still be false. Grammar tells you the shape, not the truth.',
        mapping: [
          ['a word', 'atomic proposition', 'type a symbol'],
          ['a grammatical sentence', 'well-formed formula', 'build an expression'],
          ['a syntax error', 'ill-formed string', 'see the parse fail']
        ],
        widget: 'truth-table',
        lab: {
          title: 'Build a formula',
          tryText: 'Combine propositions with and, or and not. Watch which strings the grammar accepts.',
          notice: 'The grammar accepts shapes, not meanings. Truth comes later.'
        }
      },
      idea: `<p><strong>Syntax</strong> defines the symbols of a language and the rules for combining them. In propositional logic the symbols are propositions such as R for rain, plus the connectives and, or, not and implies. A well-formed formula follows the grammar.</p>
<p>Ambiguity is a syntax problem. "Rain or snow and wind" can group two ways. Parentheses or a precedence rule fix the grouping. A parser turns a string into a tree that records the grouping.</p>
<p>Syntax alone cannot tell you whether a sentence is true. It can only tell you whether the sentence is legal. The next concept supplies the meaning.</p>`,
      lecture: {
        ref: '11.1',
        source: 'Transcript, Syntax',
        text: 'The lecturer introduces propositions and connectives, then builds formulas from them. "The syntax tells us which strings are legal sentences. It does not yet tell us what they mean."'
      },
      mechanics: {
        formula: 'F ::= P | not F | (F and F) | (F or F) | (F implies F)',
        symbols: [
          ['F', 'a formula'],
          ['P', 'an atomic proposition'],
          ['and, or, not, implies', 'the connectives'],
          ['::=', 'is defined as']
        ],
        worked: 'With P for rain and Q for wind, the string "P and Q" is well formed. The string "and P" is not, because a connective needs a left operand. The string "P Q" is not, because two propositions in a row have no connective.'
      },
      mechanism: {
        widget: 'truth-table',
        lab: {
          title: 'Parse before you evaluate',
          tryText: 'Type a formula with and without parentheses. See how the parse tree changes the result.',
          notice: 'Two readings of the same words can produce different truth values.'
        }
      },
      breaks: 'Propositional syntax cannot express objects, relations or quantities. "Every student passed" needs predicates and quantifiers, which is first-order logic. Even there, natural language maps to formulas in more than one way, and the translation is a source of error.',
      check: [
        {
          q: 'What does syntax define?',
          options: ['Which sentences are true', 'Which strings are well formed', 'The probability of a sentence', 'The cost of inference'],
          answer: 1,
          explain: 'Syntax is about form. Truth is a matter of semantics.'
        },
        {
          q: 'Why does "P Q" fail to parse?',
          options: ['P is false', 'Two propositions need a connective between them', 'Q is undefined', 'Parentheses are missing'],
          answer: 1,
          explain: 'The grammar requires a connective between two formulas.'
        }
      ],
      connection: {
        prompt: 'A logic model from unit 1 needs which two layers?',
        a: 'Language', b: 'Layers',
        options: [
          { label: 'Syntax for form and semantics for truth', ok: true },
          { label: 'A parser and a gradient', ok: false },
          { label: 'A prior and a posterior', ok: false },
          { label: 'A frontier and a goal', ok: false }
        ],
        explain: 'The formal language needs a grammar and a meaning. Inference then operates on the pair.'
      },
      recap: [
        'Syntax defines symbols and the rules for combining them.',
        'A well-formed formula can still be false.',
        'Grouping matters, and parentheses or precedence settle it.'
      ],
      now: 'You can now read a formula grammar and tell a well-formed string from an illegal one.'
    },
    {
      id: 'semantics',
      title: 'Semantics: when a sentence is true',
      prereqs: ['syntax'],
      usecase: 'A policy says "if approved and not expired then valid". A reviewer asks whether a specific payment is valid. Answering requires assigning truth values to the parts and evaluating the whole.',
      metaphor: {
        name: 'The courtroom',
        claim: 'Each fact is either established or not. The judge combines the facts using the rules and reads a verdict.',
        mapping: [
          ['a fact', 'truth assignment', 'set true or false'],
          ['a rule', 'connective', 'apply the operator'],
          ['the verdict', 'truth value of the formula', 'read the result']
        ],
        widget: 'truth-table',
        lab: {
          title: 'Evaluate under an assignment',
          tryText: 'Set each proposition true or false. Watch the formula light up.',
          notice: 'The formula is true in some assignments and false in others. A tautology is true in all of them.'
        }
      },
      idea: `<p><strong>Semantics</strong> assigns truth values to formulas given a truth assignment for the atomic propositions. "And" is true only when both parts are true. "Or" is true when at least one is. "Not" flips the value. "Implies" is false only when the premise is true and the conclusion false.</p>
<p>A formula is satisfiable when some assignment makes it true, and valid when every assignment does. Two formulas are equivalent when they have the same value under every assignment.</p>
<p>Truth tables enumerate every assignment, so they decide these questions directly. The cost doubles with each proposition, which is why larger problems need inference rules instead of enumeration.</p>`,
      lecture: {
        ref: '11.2',
        source: 'Transcript, Semantics and knowledge base',
        text: 'The lecturer defines each connective with a truth table and stresses the material conditional. "Implies is false only in one case: when the premise is true and the conclusion is false."'
      },
      mechanics: {
        formula: 'A implies B is false only when A is true and B is false',
        symbols: [
          ['A', 'the premise'],
          ['B', 'the conclusion'],
          ['implies', 'the material conditional']
        ],
        worked: 'A payment is approved, so A is true. It is expired, so B is false. The formula A implies B is false. If the payment were not approved, the formula would be true regardless of B, which surprises people but follows the truth table.'
      },
      mechanism: {
        widget: 'truth-table',
        lab: {
          title: 'Find the counterexample',
          tryText: 'Build a formula and look for the row where it is false. That row is the counterexample.',
          notice: 'A single false row is enough to disprove a claim of validity.'
        }
      },
      breaks: 'Material implication is not causation. "If it rains, the match is cancelled" is true whenever it does not rain, which is not how people read the sentence. Natural language conditionals carry more than truth values, and translating them into logic loses that.',
      check: [
        {
          q: 'When is A implies B false?',
          options: ['When A is false', 'When B is false', 'When A is true and B is false', 'Never'],
          answer: 2,
          explain: 'The material conditional fails only when a true premise leads to a false conclusion.'
        },
        {
          q: 'What is a valid formula?',
          options: ['A formula that is true under every assignment', 'A formula that is true under one assignment', 'A formula with no connectives', 'A formula that is short'],
          answer: 0,
          explain: 'Validity means truth in all assignments, not merely satisfiability in one.'
        }
      ],
      connection: {
        prompt: 'A truth table decides validity. What does it enumerate?',
        a: 'Truth table', b: 'Rows',
        options: [
          { label: 'Every assignment of truth values to the propositions', ok: true },
          { label: 'Every possible formula', ok: false },
          { label: 'Every inference rule', ok: false },
          { label: 'Every knowledge base', ok: false }
        ],
        explain: 'Each row is one assignment. The formula is valid when every row is true.'
      },
      recap: [
        'Semantics gives truth values to formulas under an assignment.',
        'Implies is false only when the premise is true and the conclusion false.',
        'Validity means true in every row of the truth table.'
      ],
      now: 'You can now evaluate a formula under an assignment and spot a counterexample.'
    },
    {
      id: 'knowledge-bases',
      title: 'Knowledge bases and entailment',
      prereqs: ['semantics'],
      usecase: 'A compliance system has 400 rules and 10,000 facts. It must answer whether a particular payment is allowed, and it must justify the answer with the rules it used.',
      metaphor: {
        name: 'The notebook and the query',
        claim: 'A detective writes facts and rules in a notebook, then asks a question. An answer counts only if every consistent reading of the notebook makes it true.',
        mapping: [
          ['a page of facts', 'knowledge base', 'add sentences'],
          ['a question', 'query', 'ask'],
          ['a certain answer', 'entailment', 'derive or refute']
        ],
        widget: 'kb-sunday',
        lab: {
          title: 'Ask the notebook',
          tryText: 'Add facts and rules, then query a sentence. Remove a rule and ask again.',
          notice: 'The answer changes when the knowledge changes, not when the question changes.'
        }
      },
      idea: `<p>A <strong>knowledge base</strong> is a set of sentences in a formal language. <strong>Entailment</strong> means that a sentence is true in every situation where the knowledge base is true, written KB entails α. Entailment is a semantic notion, independent of any algorithm.</p>
<p>Inference is the mechanical process that derives entailed sentences. A sound procedure produces only entailed sentences. A complete procedure can produce every entailed sentence. Soundness and completeness are properties of the procedure, not of the knowledge base.</p>
<p>The knowledge base can be inconsistent, in which case it entails every sentence. That is not useful, and it is why consistency checks matter. A single contradiction collapses the logic.</p>`,
      lecture: {
        ref: '11.2',
        source: 'Transcript, Semantics and knowledge base',
        text: 'The lecturer writes facts into the knowledge base and asks what follows. "The system can derive facts that were never explicitly told to it. That is the difference between a knowledge base and a database."'
      },
      mechanics: {
        formula: 'KB entails α when every model of KB is a model of α',
        symbols: [
          ['KB', 'the set of sentences'],
          ['α', 'the query sentence'],
          ['model', 'an assignment that makes a sentence true'],
          ['entails', 'true in every model of the KB']
        ],
        worked: 'KB contains Sunday and Sunday implies Burger. A model must make both true, so Burger is true in every model. KB entails Burger. If KB also contained not Burger, no model would exist and the KB would be inconsistent.'
      },
      mechanism: {
        widget: 'kb-sunday',
        lab: {
          title: 'Add a contradiction',
          tryText: 'Add not Burger to a KB that entails Burger. Watch what happens to the query.',
          notice: 'An inconsistent KB entails everything, which makes it useless as a decision procedure.'
        }
      },
      breaks: 'Entailment is expensive to decide in general. First-order logic is only semi-decidable, so a procedure may run forever on a non-entailed query. The knowledge base is also only as good as the sentences a person wrote into it.',
      check: [
        {
          q: 'What does KB entails α mean?',
          options: ['α is in the KB', 'α is true in every model of the KB', 'α is probable', 'α is short'],
          answer: 1,
          explain: 'Entailment is about all models, not about syntactic membership.'
        },
        {
          q: 'What happens when a knowledge base is inconsistent?',
          options: ['It entails nothing', 'It entails every sentence', 'It becomes probabilistic', 'It loses its syntax'],
          answer: 1,
          explain: 'No model satisfies an inconsistent KB, so the definition of entailment is vacuous and everything follows.'
        }
      ],
      connection: {
        prompt: 'Entailment and inference are different. Which is the algorithm?',
        a: 'Entailment', b: 'Inference',
        options: [
          { label: 'Entailment is the relation, inference is the procedure', ok: true },
          { label: 'Inference is the relation', ok: false },
          { label: 'Both are procedures', ok: false },
          { label: 'Both are relations', ok: false }
        ],
        explain: 'Entailment is a semantic fact. Inference is a mechanical process that should match it.'
      },
      recap: [
        'A knowledge base is a set of formal sentences.',
        'Entailment is truth in every model of the KB.',
        'An inconsistent KB entails everything.'
      ],
      now: 'You can now distinguish entailment from inference and explain why consistency matters.'
    },
    {
      id: 'resolution',
      title: 'Resolution: proof by contradiction',
      prereqs: ['knowledge-bases'],
      usecase: 'A proof engine must show that a payment is not allowed. It assumes the opposite, derives a contradiction with the rules, and concludes that the assumption was false.',
      metaphor: {
        name: 'Two witnesses who cannot both be right',
        claim: 'One witness says the car was red. Another says it was not red. Together they contradict, so at least one statement must be false.',
        mapping: [
          ['a statement', 'clause', 'add a clause'],
          ['a contradiction', 'empty clause', 'resolve two clauses'],
          ['the assumption', 'negated query', 'add the negation']
        ],
        widget: 'resolution',
        lab: {
          title: 'Resolve to the empty clause',
          tryText: 'Pick two clauses with opposite literals. Resolve them and watch the formula simplify.',
          notice: 'The empty clause is the contradiction. Finding it proves the negated query is false.'
        }
      },
      idea: `<p><strong>Resolution</strong> is an inference rule for clauses, which are disjunctions of literals. Two clauses that contain a literal and its negation can be combined, removing that literal and keeping the rest. The result is a logical consequence of the pair.</p>
<p>To prove KB entails α, add the negation of α to the KB and derive the empty clause. The empty clause is false, so the negated query cannot hold, which means the query is entailed. This is proof by refutation.</p>
<p>Resolution is sound and complete for propositional logic when the clauses are saturated. It is the basis of logic programming and of modern SAT solvers, which add clever search and heuristics to the same rule.</p>`,
      lecture: {
        ref: '11.3',
        source: 'Transcript, Logic inference',
        text: 'The lecturer applies resolution to a small set of clauses. "We add the negation of what we want to prove, and if we derive a contradiction, the original sentence must be true."'
      },
      mechanics: {
        formula: '(A or B), (not A or C) resolves to (B or C)',
        symbols: [
          ['A, B, C', 'literals'],
          ['or', 'disjunction inside a clause'],
          ['resolve', 'cancel A and not A'],
          ['empty clause', 'the contradiction']
        ],
        worked: 'Clauses (Rain or Snow) and (not Rain or Wet). Resolving on Rain gives (Snow or Wet). If another clause gives (not Snow) and another gives (not Wet), resolving again produces the empty clause, which proves the set is inconsistent.'
      },
      mechanism: {
        widget: 'resolution',
        lab: {
          title: 'Choose the resolving pair',
          tryText: 'Select two clauses that share a complementary literal. Resolve and add the result.',
          notice: 'A poor choice adds clauses without progress. A good choice moves toward the empty clause.'
        }
      },
      breaks: 'Resolution can generate many redundant clauses, and the search space grows quickly. Propositional resolution does not handle quantifiers directly; first-order resolution needs unification. The procedure can also fail to terminate on some first-order problems.',
      check: [
        {
          q: 'What does resolving (A or B) with (not A or C) produce?',
          options: ['(A or C)', '(B or C)', '(A and B)', 'The empty clause'],
          answer: 1,
          explain: 'The complementary pair A and not A cancels, leaving B or C.'
        },
        {
          q: 'Why add the negation of the query?',
          options: ['To make the proof shorter', 'To derive a contradiction, which proves the query', 'To remove the query from the KB', 'To compute a probability'],
          answer: 1,
          explain: 'Proof by refutation shows the negation is inconsistent with the KB.'
        }
      ],
      connection: {
        prompt: 'Resolution proves entailment. Which earlier definition does it use?',
        a: 'Resolution', b: 'Entailment',
        options: [
          { label: 'Truth in every model, shown by refuting the negation', ok: true },
          { label: 'The probability of the query', ok: false },
          { label: 'The shortest path to the query', ok: false },
          { label: 'The information gain of a clause', ok: false }
        ],
        explain: 'If the negation has no model with the KB, the query holds in every model.'
      },
      recap: [
        'Resolution cancels complementary literals between clauses.',
        'Proof by refutation adds the negated query and seeks the empty clause.',
        'The rule is sound and complete for propositional logic.'
      ],
      now: 'You can now resolve two clauses and explain why the empty clause ends a proof.'
    },
    {
      id: 'chaining',
      title: 'Forward and backward chaining',
      prereqs: ['resolution'],
      usecase: 'A diagnostic system has symptoms arriving as facts and needs to conclude a cause. A planning system has a goal and needs to find the facts that support it. The two directions suit different questions.',
      metaphor: {
        name: 'Data first or goal first',
        claim: 'A detective can start from the evidence and see what it implies, or start from a suspect and look for evidence that would convict.',
        mapping: [
          ['the evidence', 'known facts', 'add facts'],
          ['the rule', 'implication', 'fire the rule'],
          ['the suspect', 'query', 'work backward']
        ],
        widget: 'chaining',
        lab: {
          title: 'Run the rules in both directions',
          tryText: 'Switch from forward to backward chaining and compare the rules that fire.',
          notice: 'Forward chaining derives everything it can. Backward chaining only asks what the goal needs.'
        }
      },
      idea: `<p><strong>Forward chaining</strong> starts from known facts and fires every rule whose premises are satisfied. It repeats until no new facts appear. It is data driven and derives all consequences, which suits monitoring and alerting.</p>
<p><strong>Backward chaining</strong> starts from a query and works through the rules that could conclude it, recursively proving their premises. It is goal driven and ignores irrelevant facts, which suits diagnosis and question answering.</p>
<p>Both are sound for definite clauses, rules with a single positive conclusion. Forward chaining is complete for the facts it can derive. Backward chaining avoids the work of deriving facts nobody asked about.</p>`,
      lecture: {
        ref: '11.3',
        source: 'Transcript, Logic inference',
        text: 'The lecturer contrasts the two directions. "Forward chaining goes from the facts to the conclusions. Backward chaining starts from the query and looks for the facts that support it."'
      },
      mechanics: {
        formula: 'forward: facts then rules; backward: query then premises',
        symbols: [
          ['facts', 'sentences known to be true'],
          ['rules', 'implications with a single conclusion'],
          ['query', 'the sentence to prove']
        ],
        worked: 'Rules: Sunday implies Burger, Burger implies Happy. Facts: Sunday. Forward chaining adds Burger, then Happy. Backward chaining for Happy looks for a rule concluding Happy, finds Burger implies Happy, then queries Burger, finds Sunday implies Burger, then finds Sunday in the facts.'
      },
      mechanism: {
        widget: 'chaining',
        lab: {
          title: 'Watch which rules fire',
          tryText: 'Add an irrelevant fact and run forward chaining, then backward. Compare the work.',
          notice: 'Forward chaining processes the irrelevant fact. Backward chaining never touches it.'
        }
      },
      breaks: 'Forward chaining can derive a huge number of irrelevant facts on a large rule set. Backward chaining can repeat the same subgoal many times without memoisation. Both need a way to handle negation and uncertainty, which definite clauses do not provide.',
      check: [
        {
          q: 'Which direction starts from the query?',
          options: ['Forward chaining', 'Backward chaining', 'Resolution', 'Truth tables'],
          answer: 1,
          explain: 'Backward chaining works from the goal toward the facts that support it.'
        },
        {
          q: 'When is forward chaining a good fit?',
          options: ['When facts arrive and all consequences matter', 'When only one query matters', 'When there are no rules', 'When the KB is inconsistent'],
          answer: 0,
          explain: 'It is data driven, so it suits monitoring where new facts keep arriving.'
        }
      ],
      connection: {
        prompt: 'Backward chaining resembles which earlier search?',
        a: 'Backward chaining', b: 'Search direction',
        options: [
          { label: 'Goal-directed search from the query', ok: true },
          { label: 'Breadth-first search from the start', ok: false },
          { label: 'Gradient descent', ok: false },
          { label: 'A truth table', ok: false }
        ],
        explain: 'It works backward from the goal, expanding only the subgoals the query needs.'
      },
      recap: [
        'Forward chaining is data driven and derives all consequences.',
        'Backward chaining is goal driven and proves one query.',
        'Both suit definite clauses and differ in what work they avoid.'
      ],
      now: 'You can now choose a chaining direction from the shape of the task.'
    }
  ],
  test: [
    {
      q: 'What does syntax define?',
      options: ['Truth', 'Well-formed strings', 'Probability', 'Cost'],
      answer: 1,
      explain: 'Syntax is the grammar of legal sentences.'
    },
    {
      q: 'When is A implies B false?',
      options: ['A false, B false', 'A false, B true', 'A true, B false', 'A true, B true'],
      answer: 2,
      explain: 'The material conditional fails only when a true premise has a false conclusion.'
    },
    {
      q: 'A valid formula is true under which assignments?',
      options: ['One', 'Some', 'All', 'None'],
      answer: 2,
      explain: 'Validity means truth in every row of the truth table.'
    },
    {
      q: 'What does KB entails α mean?',
      options: ['α is stored in KB', 'α is true in every model of KB', 'α is likely', 'α is well formed'],
      answer: 1,
      explain: 'Entailment is a semantic relation over all models.'
    },
    {
      q: 'An inconsistent KB entails what?',
      options: ['Nothing', 'Every sentence', 'Only its own sentences', 'Only false sentences'],
      answer: 1,
      explain: 'With no models, the entailment condition holds vacuously for every sentence.'
    },
    {
      q: 'Resolving (A or B) with (not A or C) gives what?',
      options: ['A or B or C', 'B or C', 'B and C', 'Empty clause'],
      answer: 1,
      explain: 'The complementary literal A cancels, leaving the union of the rest.'
    },
    {
      q: 'Which chaining direction starts from facts?',
      options: ['Forward', 'Backward', 'Neither', 'Both'],
      answer: 0,
      explain: 'Forward chaining fires rules whose premises are already known.'
    },
    {
      q: 'Which method proves a query by deriving a contradiction?',
      options: ['Forward chaining', 'Backward chaining', 'Resolution', 'Enumeration'],
      answer: 2,
      explain: 'Resolution adds the negated query and looks for the empty clause.'
    }
,
    {
      type: 'numeric',
      q: 'How many rows does a truth table need for 3 proposition symbols?',
      answer: 8,
      tolerance: 0.001,
      explain: 'Each symbol can be true or false, so 3 symbols give 2 to the power 3 = 8 assignments.'
    },
    {
      type: 'ordering',
      q: 'Order the steps of a resolution proof.',
      items: [
        'Negate the query',
        'Convert the knowledge base and the negated query to clauses',
        'Resolve pairs of clauses that contain complementary literals',
        'Add the resolvents to the clause set',
        'Derive the empty clause to prove the query'
      ],
      explain: 'Resolution proves entailment by refutation. The empty clause is the contradiction.'
    },
    {
      type: 'error',
      q: 'A student applies resolution. One step is wrong. Which one?',
      steps: [
        'Write the knowledge base in conjunctive normal form.',
        'Negate the query and add its clauses.',
        'Resolve (A or B) with (not A or C) to get (A or C).',
        'An empty clause means a contradiction, so the query follows.'
      ],
      answer: 2,
      explain: 'The resolvent is B or C. The literal A cancels, and the remaining literals are combined.'
    },
    {
      type: 'short',
      q: 'Why does an inconsistent knowledge base entail every sentence?',
      rubric: [
        'Says an inconsistent knowledge base has no models',
        'Explains that entailment requires truth in every model',
        'Notes that the condition holds vacuously'
      ],
      model: 'Entailment means the sentence is true in every model of the knowledge base. An inconsistent knowledge base has no models at all, so the condition is met for any sentence, including its opposite.',
      explain: 'With no models, there is nothing that could make the sentence false.'
    }
  ],
  connections: [
    {
      prompt: 'Match the layer to its question.',
      a: 'Layer', b: 'Question',
      options: [
        { label: 'Syntax: is this string legal?', ok: true },
        { label: 'Semantics: is this string legal?', ok: false },
        { label: 'Entailment: is this string short?', ok: false },
        { label: 'Resolution: is this sentence probable?', ok: false }
      ],
      explain: 'Syntax checks form, semantics checks truth, entailment checks consequence, and resolution derives it.'
    }
  ],
  pairs: [
    {
      a: 'Syntax', b: 'Semantics',
      claim: 'Both describe the meaning of a sentence in a model.',
      same: false,
      explain: 'Syntax says which strings are well formed. Semantics assigns truth in a model.'
    },
    {
      a: 'Forward chaining', b: 'Backward chaining',
      claim: 'Both apply modus ponens over a knowledge base.',
      same: true,
      explain: 'They run in opposite directions over the same rules. Both use modus ponens at each step.'
    },
    {
      a: 'Validity', b: 'Entailment',
      claim: 'Both can be checked by looking at every model.',
      same: true,
      explain: 'A valid sentence is true in every model. Entailment checks every model of the knowledge base.'
    }
  ],
  map: {
    nodes: [
      { id: 'syntax', label: 'Syntax', x: 12, y: 24 },
      { id: 'sem', label: 'Semantics', x: 32, y: 16 },
      { id: 'kb', label: 'Knowledge base', x: 54, y: 26 },
      { id: 'entail', label: 'Entailment', x: 76, y: 18 },
      { id: 'res', label: 'Resolution', x: 62, y: 62 },
      { id: 'chain', label: 'Chaining', x: 84, y: 60 }
    ],
    edges: [
      ['syntax', 'sem', 'gives meaning to'],
      ['sem', 'kb', 'sentences in'],
      ['kb', 'entail', 'supports'],
      ['entail', 'res', 'proved by'],
      ['entail', 'chain', 'proved by']
    ]
  }
});
