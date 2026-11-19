AIM.registerTeach({
  n: 11,
  opening: `<p>Logic gives a model a different kind of answer. It does not return a label learned from examples. It derives a sentence from stated facts and rules, and the derivation can be checked. That property is why logic is used where an answer must be justified: compliance, configuration, diagnosis and mathematics.</p>
<p>The unit builds the language first. Syntax says which strings are legal. Semantics says when a legal string is true. A knowledge base is a set of true sentences, and entailment is the relation between a knowledge base and a sentence that must be true whenever the base is. Resolution and chaining are two ways to compute that relation.</p>
<p>The arithmetic of truth tables is small. The hard parts are translation and search: turning a real rule into a formula, and finding a proof without enumerating every possibility.</p>`,
  concepts: {
    'syntax': {
      teach: `<p>Syntax defines the symbols of a language and the rules for combining them. In propositional logic the symbols are atomic propositions such as <code>R</code> for rain, plus the connectives and, or, not and implies. A <strong>well-formed formula</strong> is a string built by the grammar.</p>
<div class="derive"><p><code>F ::= P | not F | (F and F) | (F or F) | (F implies F)</code></p></div>
<p>The vertical bar means "or" in the grammar, not in the logic. The rule says a formula is an atom, a negation, or two formulas joined by a binary connective in parentheses. Parentheses remove ambiguity. Without them, "rain or snow and wind" can group two ways.</p>
<h4>Parse trees</h4>
<p>A parser turns a string into a tree that records the grouping. The leaves are atoms, and the internal nodes are connectives. The tree is the formula's structure. Two strings with the same tree mean the same thing; two strings with different trees can mean different things. Precedence rules, such as not before and before or, let you omit some parentheses, but the tree is still the meaning.</p>
<p>Syntax alone cannot tell you whether a sentence is true. It can only tell you whether it is legal. "Rain and snow" is well formed; whether it is true depends on the weather. The next concept supplies the meaning.</p>
<div class="callout"><b>Well formed is not true</b><p>A formula can be grammatically perfect and false. Do not confuse the grammar with the semantics.</p></div>
<p>Propositional syntax cannot express objects, relations or quantities. "Every student passed" needs predicates and quantifiers, which is first-order logic. This unit stays with propositions and mentions first-order only where the ideas extend.</p>`,
      work: `<ol class="steps"><li>Let <code>P</code> mean rain and <code>Q</code> mean wind.</li><li>"P and Q" is well formed: two atoms joined by a binary connective.</li><li>"and P" is not well formed: the connective has no left operand.</li><li>"P Q" is not well formed: two atoms in a row have no connective.</li><li>"not (P and Q)" is well formed: the negation applies to a parenthesised formula.</li></ol>`,
      practice: {
        q: 'Is "P implies Q or R" well formed without parentheses? What does the answer depend on?',
        hint: 'A precedence rule can resolve the grouping.',
        answer: `<p>It is well formed if the grammar includes a precedence rule, such as "implies" binding looser than "or". Without a precedence rule, the string is ambiguous and the grammar should require parentheses. The truth of the formula depends on the grouping, so the parse tree matters.</p>`
      },
      bridge: 'The sentence is legal. Semantics assigns it a truth value under an interpretation.'
    },
    'semantics': {
      teach: `<p>Semantics assigns truth values to formulas given a truth assignment for the atomic propositions. A truth assignment is a row that says which atoms are true. A truth table lists every assignment and the value of the formula under it.</p>
<p>The connectives have fixed meanings. <code>A and B</code> is true only when both are true. <code>A or B</code> is true when at least one is true. <code>not A</code> flips the value. <code>A implies B</code> is false only when A is true and B is false. That last row surprises people: a false premise makes the implication true, regardless of the conclusion.</p>
<h4>Three properties</h4>
<p>A formula is <strong>satisfiable</strong> when some assignment makes it true. It is <strong>valid</strong> when every assignment makes it true. Two formulas are <strong>equivalent</strong> when they have the same value under every assignment. Truth tables decide all three directly. The cost doubles with each proposition, which is why larger problems use inference rules instead of enumeration.</p>
<p>Material implication is not causation. "If it rains, the match is cancelled" is true whenever it does not rain, which is not how people read the sentence. Natural language conditionals carry more than truth values. Translating them into logic loses that extra meaning, and the loss is a common source of modelling error.</p>
<div class="callout"><b>Check the false-premise row</b><p>If A is false, A implies B is true. That is the definition, not a claim that B is true.</p></div>`,
      work: `<ol class="steps"><li>A payment is approved, so <code>A</code> is true.</li><li>It is expired, so <code>B</code> is false.</li><li><code>A implies B</code> is false, because the premise is true and the conclusion is false.</li><li>If the payment were not approved, <code>A</code> would be false and the implication would be true regardless of <code>B</code>.</li><li>The truth table has four rows; only the row with A true and B false makes the implication false.</li></ol>`,
      practice: {
        q: 'How many rows does a truth table for three propositions have? How many for ten, and why does that matter?',
        hint: 'Each proposition doubles the rows, so count 2, 4, 8 for one, two and three propositions.',
        answer: `<p>Three propositions give <code>2³ = 8</code> rows. Ten give <code>2¹⁰ = 1,024</code> rows. The table grows exponentially, so enumeration becomes impractical for large formulas. That is why inference rules and restricted languages are used instead of full truth tables.</p>`
      },
      bridge: 'Semantics defines truth. A knowledge base is a set of sentences assumed true, and entailment is truth in every model of the base.'
    },
    'knowledge-bases': {
      teach: `<p>A knowledge base is a set of sentences in a formal language. Entailment means that a sentence is true in every situation where the knowledge base is true, written <code>KB entails α</code>. Entailment is a semantic notion, independent of any algorithm.</p>
<p>A <strong>model</strong> is an assignment of truth values that makes a sentence true. The knowledge base entails α when every model of the KB is also a model of α. This definition is the foundation of the unit. It says nothing about how to find the answer; that is inference.</p>
<h4>Soundness and completeness</h4>
<p>An inference procedure is <strong>sound</strong> if it derives only entailed sentences. It is <strong>complete</strong> if it can derive every entailed sentence. Soundness protects against wrong answers; completeness protects against missed answers. The properties belong to the procedure, not to the knowledge base.</p>
<h4>Inconsistency</h4>
<p>A knowledge base is inconsistent when it has no model. In classical logic, an inconsistent KB entails every sentence, because there is no model in which the premise is true and the conclusion false. That is not useful, and it is why consistency checks matter. A single contradiction collapses the logic.</p>
<div class="callout"><b>Entailment is not derivation</b><p>Entailment is a relation between sentences and models. Derivation is a procedure. A sound and complete procedure makes the two coincide, but they are different concepts.</p></div>`,
      work: `<ol class="steps"><li>KB contains <code>Sunday</code> and <code>Sunday implies Burger</code>.</li><li>A model must make both true. If Sunday is true, the implication forces Burger true.</li><li>Every model of the KB makes Burger true, so the KB entails Burger.</li><li>If the KB also contained <code>not Burger</code>, no model would exist and the KB would be inconsistent.</li><li>An inconsistent KB entails every sentence, including <code>not Burger</code> and <code>Burger</code>.</li></ol>`,
      practice: {
        q: 'A KB contains "all approved payments are logged" and "payment 91 is approved". Does it entail "payment 91 is logged"? What about "payment 91 is valid"?',
        hint: 'The conclusion must hold in every model of the KB. Ask whether a model could make it false.',
        answer: `<p>It entails that payment 91 is logged, by applying the rule to the fact. It does not entail that payment 91 is valid, because no sentence in the KB mentions validity. Entailment is not plausible inference; the conclusion must hold in every model of the KB.</p>`
      },
      bridge: 'Entailment is the target. Resolution is a sound and complete procedure for finding it in propositional logic.'
    },
    'resolution': {
      teach: `<p>Resolution works on clauses. A <strong>clause</strong> is a disjunction of literals, such as <code>(A or B or not C)</code>. A literal is an atom or its negation. Any propositional formula can be converted to conjunctive normal form, a conjunction of clauses, so resolution is a general procedure.</p>
<p>The resolution rule takes two clauses that contain a literal and its negation, removes that pair, and keeps the rest. For example, <code>(A or B)</code> and <code>(not A or C)</code> resolve to <code>(B or C)</code>. The result is a logical consequence of the two clauses.</p>
<h4>Proof by refutation</h4>
<p>To prove <code>KB entails α</code>, add <code>not α</code> to the KB and derive the empty clause. The empty clause is false, so the set with <code>not α</code> has no model. That means every model of the KB makes α true, which is exactly entailment. This is proof by contradiction.</p>
<p>Resolution is sound and complete for propositional logic when the clauses are saturated: every possible resolution has been performed. A practical prover uses strategies to avoid generating every clause, because the search space grows quickly. Unit propagation, set-of-support and ordering heuristics are common.</p>
<div class="callout"><b>Convert to clausal form first</b><p>Resolution applies to clauses, not arbitrary formulas. Eliminate implications, push negations inward, distribute or, and collect the clauses before you start.</p></div>
<p>First-order resolution adds quantifiers and unification, which matches variables to terms so that complementary literals align. The same refutation idea applies, but the procedure is only semi-decidable: it may run forever on a non-entailed query.</p>`,
      work: `<ol class="steps"><li>Clauses: <code>(Rain or Snow)</code> and <code>(not Rain or Wet)</code>.</li><li>Resolve on Rain: remove Rain and not Rain, keep <code>(Snow or Wet)</code>.</li><li>Suppose another clause gives <code>not Snow</code> and another gives <code>not Wet</code>.</li><li>Resolve <code>(Snow or Wet)</code> with <code>not Snow</code> to get <code>Wet</code>, then with <code>not Wet</code> to get the empty clause.</li><li>The empty clause proves the set is inconsistent. If the negated query led here, the query is entailed.</li></ol>`,
      practice: {
        q: 'Why does proving a query by resolution require adding its negation to the knowledge base?',
        hint: 'The empty clause is a contradiction. That contradiction is what refutes the negated query.',
        answer: `<p>Resolution proves entailment by refutation. If the KB plus the negated query is inconsistent, then the negated query cannot be true in any model of the KB, so the query is true in every model. Deriving the empty clause is the formal contradiction that establishes this.</p>`
      },
      bridge: 'Resolution is a general proof rule. Chaining uses a restricted rule set and runs in a direction, which is often more efficient.'
    },
    'chaining': {
      teach: `<p>Chaining works with definite clauses: rules that have a conjunction of positive premises and a single positive conclusion, such as <code>Sunday implies Burger</code>. A set of definite clauses is a Horn theory, and it supports two natural directions of inference.</p>
<p><strong>Forward chaining</strong> starts from known facts and fires every rule whose premises are satisfied. It adds the conclusions to the known facts and repeats until no new fact appears. It is data driven and derives all consequences. That suits monitoring and alerting, where new facts arrive and the system must update what follows.</p>
<p><strong>Backward chaining</strong> starts from a query and works through the rules that could conclude it, recursively proving their premises. It is goal driven and ignores facts that are irrelevant to the query. That suits diagnosis and question answering, where the system needs one answer rather than every consequence.</p>
<h4>Efficiency</h4>
<p>Forward chaining can derive a huge number of irrelevant facts. Backward chaining can repeat the same subgoal many times without memoisation. Both are sound for definite clauses. Forward chaining is complete for the facts it can derive; backward chaining is complete for queries that have a finite proof, if the search is systematic.</p>
<div class="callout"><b>Direction follows the question</b><p>If new facts arrive and you need all consequences, go forward. If you have a query and need its support, go backward.</p></div>
<p>First-order chaining adds variables and unification: a rule such as "all students pass" can match a specific student by binding the variable. The direction and the trade-offs remain the same.</p>`,
      work: `<ol class="steps"><li>Rules: Sunday implies Burger; Burger implies Happy. Fact: Sunday.</li><li>Forward: Sunday fires the first rule, adding Burger. Burger fires the second, adding Happy.</li><li>Backward for Happy: find a rule concluding Happy, which is Burger implies Happy.</li><li>Query Burger: find Sunday implies Burger, then query Sunday, which is a fact.</li><li>The proof is Sunday, then Burger, then Happy. Forward derived every consequence; backward touched only the chain that supports Happy.</li></ol>`,
      practice: {
        q: 'A system monitors a factory and must raise an alert whenever a combination of sensor readings implies a fault. Forward or backward chaining, and why?',
        hint: 'New facts arrive continuously and all consequences matter.',
        answer: `<p>Forward chaining, because the system is data driven: sensor facts arrive, and the system must derive every consequence that could trigger an alert. Backward chaining would need a query for each possible fault and would repeatedly search the rules, which is a poor fit for continuous monitoring.</p>`
      },
      bridge: 'You have reached the end of the course. The final section connects the families and prepares you for the exam.'
    }
  },
  closing: {
    teach: `<p>Logic separates three questions. Syntax asks whether a sentence is legal. Semantics asks whether it is true under an interpretation. Inference asks what follows from a knowledge base. Entailment is the semantic target; resolution and chaining are procedures that try to reach it.</p>
<p>Resolution is general and works by refutation. Chaining is restricted to definite clauses and runs forward from facts or backward from a query. Both are sound, and their completeness depends on the procedure and the language. The practical difficulty is usually translation: turning a real rule into a formula without losing meaning or introducing inconsistency.</p>`,
    problem: {
      q: 'A knowledge base contains: "if approved and not expired then valid"; "approved"; "not expired". Prove "valid" by resolution, and say whether forward chaining would also derive it.',
      hint: 'Turn the rule into clauses, negate the query, and resolve.',
      answer: `<p>The rule becomes <code>(not approved or expired or valid)</code>. The facts are <code>approved</code> and <code>not expired</code>. Negate the query: <code>not valid</code>. Resolve the rule with <code>approved</code> to get <code>(expired or valid)</code>. Resolve with <code>not expired</code> to get <code>valid</code>. Resolve with <code>not valid</code> to get the empty clause. Forward chaining would also derive valid: both premises are facts, so the rule fires.</p>`
    }
  }
});
