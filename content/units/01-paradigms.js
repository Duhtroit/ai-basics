AIM.registerUnit({
  n: 1, hue: 35, short: 'Paradigms',
  title: 'Four ways to be intelligent',
  weeks: 'Week 1',
  promise: 'Name the question a problem is really asking. That choice decides which family of methods can answer it.',
  minutes: 34,
  lectures: ['0 Welcome', '1.1 AI paradigms', '1.2 Math warmup', '1.3 Python intro'],
  concepts: [
    {
      id: 'four-questions',
      title: 'Four questions, four kinds of model',
      prereqs: [],
      usecase: 'A hospital wants software that reads X-rays, schedules operating theatres and checks whether a treatment plan follows policy. Those are three different problems. No single algorithm does all three well, and the first useful decision is naming the question each one asks.',
      metaphor: {
        name: 'A workshop with four tools',
        claim: 'A hammer, a route map, a jigsaw and a rulebook each answer a different question. Using the wrong one is the most common mistake in applied AI.',
        mapping: [
          ['hammer', 'reflex model', 'recognise and answer'],
          ['route map', 'state-based model', 'choose the next move'],
          ['jigsaw', 'variable-based model', 'assign values that fit'],
          ['rulebook', 'logic model', 'derive what must be true']
        ],
        widget: 'spectrum',
        lab: {
          title: 'One chessboard, four questions',
          tryText: 'Drag the marker from left to right. The board stays still while the question changes.',
          notice: 'The answer changes because the question changes. A model is only good relative to a question.'
        }
      },
      idea: `<p>An artificial intelligence method is a procedure for turning an input into an answer. The answers differ in kind, and so do the methods. The course arranges them on one line, from immediate reaction on the left to explicit reasoning on the right.</p>
<p>On the left sits the <strong>reflex model</strong>. It answers "what is this?" with a fixed computation. In the middle sit <strong>state-based models</strong>, which answer "what do I do next?" by choosing a sequence of actions. Next come <strong>variable-based models</strong>, which answer "does this assignment fit all the rules?" and care about the final configuration rather than the order that produced it. On the right sit <strong>logic models</strong>, which answer "what must be true?" by deriving new facts from stated ones.</p>
<p>Keep one diagnostic question beside each family. Is the answer a label, a path, a complete assignment, or a proof? If you cannot say which, the problem is not yet specified. Language models complicate the line, and the last concept in this unit takes that up.</p>`,
      lecture: {
        ref: '1.1',
        source: 'Transcript, AI paradigms',
        text: 'The lecturer draws the spectrum and asks one question at each stop. "If your question is, what is this? Then you can choose a reflex model. If your question is, what do I do next? Then state-based models. If your question is, does my plan fit? Then a variable-based model. If your question is, what is true? Then logic."'
      },
      mechanics: {
        formula: 'question(q) selects family(F)',
        symbols: [
          ['q', 'the question the task asks, in one sentence'],
          ['F', 'the family of methods that can answer it'],
          ['label', 'a single output value or class'],
          ['path', 'an ordered sequence of actions'],
          ['assignment', 'a value for every item'],
          ['proof', 'a fact derived from stated facts']
        ],
        worked: 'X-ray triage asks "is this image abnormal?", so the answer is a label and the family is reflex. Theatre scheduling asks "which sequence of operations fits the day?", so the answer is a path and the family is state-based. A policy check asks "does this plan violate a rule?", so the answer is a proof and the family is logic.'
      },
      mechanism: {
        widget: 'q-sorter',
        lab: {
          title: 'Sort eight problems by the question they ask',
          tryText: 'Choose a problem, then place it in the family that can answer its question. The checker explains each placement.',
          notice: 'Two problems can mention the same domain and still belong to different families. The question decides.'
        }
      },
      breaks: 'The spectrum is a map, not a law. Real systems combine families: a self-driving car runs a reflex detector, plans a path, and checks traffic rules. A model can also be pushed outside its family and fail without an obvious error, which is why naming the question comes before choosing the method.',
      check: [
        {
          q: 'A system must decide whether a transaction is fraudulent, one transaction at a time, with no memory of previous transactions. Which family fits the question?',
          options: ['A state-based model, because transactions happen in sequence', 'A reflex model, because the answer is a label from a fixed computation', 'A logic model, because fraud is a rule', 'A variable-based model, because many transactions must be consistent'],
          answer: 1,
          explain: 'The required answer is a label for one input, with no path to plan and no global assignment to satisfy. That is the reflex question.'
        },
        {
          q: 'What changes when you move from a state-based model to a variable-based model?',
          options: ['The input becomes an image', 'The output stops being a single value and becomes a complete assignment', 'The model stops using data', 'The answer becomes a probability'],
          answer: 1,
          explain: 'State models return a sequence of actions. Variable models return a full assignment that satisfies constraints, and the order of construction does not matter.'
        }
      ],
      connection: {
        prompt: 'The next four concepts take one family each. Before you read them, which family would you reach for to decide whether a Sudoku grid is solved?',
        a: 'Sudoku grid', b: 'Model family',
        options: [
          { label: 'Reflex: classify the grid', ok: false },
          { label: 'State: search a path of moves', ok: false },
          { label: 'Variable: assign digits under constraints', ok: true },
          { label: 'Logic: prove a theorem', ok: false }
        ],
        explain: 'A solved grid is a complete assignment that satisfies row, column and box rules. The order in which digits were written does not matter.'
      },
      recap: [
        'Four families answer four different questions: label, path, assignment, proof.',
        'Naming the question is the first design decision, before choosing an algorithm.',
        'Real systems combine families, so the spectrum is a map rather than a rule.'
      ],
      now: 'You can now place a new problem on the spectrum and say which question it asks.'
    },
    {
      id: 'reflex-models',
      title: 'Reflex models: answer without thinking',
      prereqs: ['four-questions'],
      usecase: 'A spam filter must label fifty thousand emails a minute. It cannot plan, remember the last email, or reason about the sender. It looks at this message and answers now.',
      metaphor: {
        name: 'The thermostat',
        claim: 'A thermostat feels the temperature, compares it with a set point, and switches the heater. No memory of yesterday, no plan for tomorrow.',
        mapping: [
          ['room temperature', 'input reading', 'read the sensor'],
          ['set point and wiring', 'parameters', 'fixed by design or training'],
          ['heater on or off', 'output label', 'read the decision']
        ],
        widget: 'func-lab',
        lab: {
          title: 'Feel the room, flip the switch',
          tryText: 'Drag the temperature across the dial. Watch the heater turn on and off at the set point.',
          notice: 'The same input always gives the same output. That reliability is the strength and the limit.'
        }
      },
      idea: `<p>A reflex model computes an output directly from an input. The computation is fixed by a set of <strong>parameters</strong>, which training can adjust but the model cannot change at run time. There is no store of past inputs and no search over future actions.</p>
<p>Linear regression and a feed-forward neural network both belong here. So does a decision tree. Their internal complexity differs, yet each maps one input to one output. A deep network that labels an image is still a reflex model in this sense, however many stages it has.</p>
<p>The strength is speed and predictability. The limit appears when the answer depends on what happened before, or on what might happen next. A thermostat cannot plan a route home, and a spam filter cannot negotiate with a mail server.</p>`,
      lecture: {
        ref: '1.1',
        source: 'Transcript, AI paradigms',
        text: 'The lecturer describes the biological neuron: "If you give this neuron a stimulus, it fires immediately. It does not pause to reflect the past, so it does not plan for the future. It is a direct mapping." He then places linear regression and deep networks in the same family.'
      },
      mechanics: {
        formula: 'y = f(x; θ)',
        symbols: [
          ['y', 'the output, a label or a number'],
          ['x', 'the input values for one case'],
          ['f', 'the fixed computation'],
          ['θ', 'the parameters that shape f']
        ],
        worked: 'A thermostat with set point 21 degrees can be written as y = step(21 - x), where x is the temperature and step returns 1 when its argument is positive. At x = 18 the heater is on. At x = 23 it is off. The parameter 21 was chosen once and does not change with the weather.'
      },
      mechanism: {
        widget: 'func-lab',
        lab: {
          title: 'Fit a threshold to the data',
          tryText: 'Move the slope and the offset. Try to separate the two groups with one straight decision.',
          notice: 'A reflex model can only express the shape its parameters allow. No amount of data fixes the wrong shape.'
        }
      },
      breaks: 'A reflex model cannot represent exclusive-or without extra inputs or hidden units, because one straight boundary cannot separate the classes. It also fails when the world changes: a spam filter trained on last year\'s messages drifts. And it cannot answer a question whose answer depends on a sequence.',
      check: [
        {
          q: 'Which property makes a model a reflex model in this course?',
          options: ['It uses a neural network', 'It produces one output directly from one input, with no memory or search', 'It is trained with gradient descent', 'It is accurate'],
          answer: 1,
          explain: 'The family is defined by the shape of the mapping, not by the algorithm used to fit it. One input, one output, no sequence and no planning.'
        },
        {
          q: 'A thermostat is moved to a colder room and still switches at 21 degrees. What does this illustrate?',
          options: ['The parameters are fixed, so the behaviour does not adapt', 'The model has overfitted', 'The model is doing search', 'The model has too many layers'],
          answer: 0,
          explain: 'The set point is a parameter fixed at design time. The model reacts to the input but does not learn from the new room.'
        }
      ],
      connection: {
        prompt: 'The spam filter is fast because it never asks what happens next. What does the next family add?',
        a: 'Reflex model', b: 'State-based model',
        options: [
          { label: 'A sequence of actions and a goal', ok: true },
          { label: 'More parameters', ok: false },
          { label: 'A larger training set', ok: false },
          { label: 'A probability instead of a label', ok: false }
        ],
        explain: 'The next family adds actions, a changing situation, and a goal to reach. The output becomes a path rather than a label.'
      },
      recap: [
        'A reflex model maps one input to one output through a fixed computation.',
        'Parameters shape the mapping but do not change at run time.',
        'It is fast and predictable, and blind to sequence and consequence.'
      ],
      now: 'You can now tell whether a task is reflex-shaped or needs memory of a sequence.'
    },
    {
      id: 'state-models',
      title: 'State models: the sequence matters',
      prereqs: ['reflex-models'],
      usecase: 'A courier robot must cross a building with locked doors, a lift and a charging bay. The useful answer is not a label for the current camera frame. It is a route: which door to open, when to take the lift, when to recharge.',
      metaphor: {
        name: 'A board game',
        claim: 'You sit on a square. You roll, you move, and the square changes. Winning depends on the order of moves, not on one roll.',
        mapping: [
          ['your square', 'state', 'read where you are'],
          ['a legal move', 'action', 'choose a move'],
          ['the new square', 'transition', 'see where it lands'],
          ['the finish square', 'goal', 'check whether you are done']
        ],
        widget: 'maze-step',
        lab: {
          title: 'Step a counter around a maze',
          tryText: 'Use the arrow keys or the step buttons to move the counter. The trail shows where you have been.',
          notice: 'The counter has a position and a set of legal moves. That is all a state needs to be.'
        }
      },
      idea: `<p>A <strong>state</strong> is a snapshot of everything that matters for the next decision. If the state is chosen well, the history before it is irrelevant. A robot that knows its room, its battery and which doors are open does not need the full video of how it got there.</p>
<p>A <strong>state-based model</strong> describes states, actions and <strong>transitions</strong>. Applying an action in a state leads to another state. A path is a sequence of states and actions from a start state to a goal state. The model answers "what do I do next?" rather than "what is this?".</p>
<p>The choice of state is a design decision, and a wrong choice hides information. A courier state that records position but not battery will plan routes it cannot finish. The next units on state spaces and search turn this description into algorithms.</p>`,
      lecture: {
        ref: '9.1',
        source: 'Transcript, State space model',
        text: 'The lecturer introduces search as part of state space models. "In state-based models, we take an input, but now we must output an entire sequence of actions. Why? Because in many AI problems, an agent must choose a sequence of actions to achieve a goal."'
      },
      mechanics: {
        formula: 's0, a1, s1, a2, s2, ..., goal',
        symbols: [
          ['s0', 'the start state'],
          ['a1', 'the first action'],
          ['s1', 'the state reached after a1'],
          ['goal', 'a state that satisfies the goal test']
        ],
        worked: 'A robot at the lobby has three actions: open the door, call the lift, walk to the stairs. Opening the door leads to the corridor, calling the lift leads to a waiting state, walking leads to the stairwell. A path is lobby, open door, corridor, stairs, floor two. The label of the current camera frame would not tell you any of that.'
      },
      mechanism: {
        widget: 'maze-step',
        lab: {
          title: 'Add costs to the same maze',
          tryText: 'Turn on edge costs, then find the cheapest route rather than the shortest. Switch between the two answers.',
          notice: 'The state graph stays the same. The objective changes which path counts as best.'
        }
      },
      breaks: 'State models break when the state is too large to enumerate, when the world is only partly observable, or when other agents act against you. A state that omits something important produces plans that fail in reality. Later units handle scale with search and handle uncertainty with distributions.',
      check: [
        {
          q: 'What makes a state well chosen?',
          options: ['It records every event since the start', 'It records exactly the information needed for future decisions', 'It has as many fields as possible', 'It is a single number'],
          answer: 1,
          explain: 'A good state is sufficient for the next decision and no larger than necessary. Extra history makes the state space bigger without adding useful choices.'
        },
        {
          q: 'Why can a state model not be replaced by a reflex model in the courier task?',
          options: ['The camera image is too large', 'The correct action depends on the current state and the goal, not on one frame alone', 'The robot needs a neural network', 'The task has too many labels'],
          answer: 1,
          explain: 'The route depends on where the robot is, what it has already done and what remains. A single input-output mapping has no place to store that.'
        }
      ],
      connection: {
        prompt: 'A reflex model and a state model both take an input. What does the state model add to the output?',
        a: 'Reflex output', b: 'State output',
        options: [
          { label: 'A sequence of actions', ok: true },
          { label: 'A confidence score', ok: false },
          { label: 'A larger label set', ok: false },
          { label: 'A set of constraints', ok: false }
        ],
        explain: 'The state model returns a path: actions in order. That is why search, not classification, is its natural algorithm.'
      },
      recap: [
        'A state is a sufficient snapshot for the next decision.',
        'States, actions and transitions define a graph of possible experience.',
        'The answer is a path, so the order of actions matters.'
      ],
      now: 'You can now define a state for a task and say why the order of actions matters.'
    },
    {
      id: 'variable-models',
      title: 'Variable models: the finished puzzle',
      prereqs: ['state-models'],
      usecase: 'A university must assign 240 exams to 18 rooms and 40 invigilators. Nobody cares which exam is scheduled first. What matters is that no room is double-booked, no invigilator is in two places, and every exam fits its cohort.',
      metaphor: {
        name: 'Seating guests with grudges',
        claim: 'You have a table plan to fill. Two guests refuse to sit together. The order in which you place people does not matter; the final seating must satisfy every rule.',
        mapping: [
          ['a guest', 'variable', 'assign a seat'],
          ['available seats', 'domain', 'choose from allowed values'],
          ['a grudge', 'constraint', 'keep the pair apart'],
          ['the finished plan', 'assignment', 'check the whole table']
        ],
        widget: 'map-colour',
        lab: {
          title: 'Colour the map, keep neighbours apart',
          tryText: 'Pick a colour, then click a region. Regions that share a border may not share a colour.',
          notice: 'The order of clicks does not matter. Only the final colouring is judged.'
        }
      },
      idea: `<p>A <strong>variable</strong> is something that needs a value: a room, a time slot, a region on a map. Its <strong>domain</strong> is the set of values it may take. A <strong>constraint</strong> rules out some combinations of values across variables.</p>
<p>A <strong>constraint satisfaction problem</strong> asks for an assignment of values to every variable such that all constraints hold. The process of building the assignment is not part of the answer. Two different orders of assignment that end in the same table plan are equally correct.</p>
<p>This is the family behind timetabling, map colouring, Sudoku and many configuration tasks. The hard part is usually modelling: choosing variables, domains and constraints so that the problem is neither under-specified nor impossible. Unit 7 gives the algorithms.</p>`,
      lecture: {
        ref: '1.1',
        source: 'Transcript, AI paradigms',
        text: 'The lecturer uses Sudoku. "Does it matter if I write a number on the top left corner first or the bottom right corner first? No, the order is irrelevant. What matters is that at the end, all the numbers satisfy the rules."'
      },
      mechanics: {
        formula: 'assign v1 ... vn so that every C(v) holds',
        symbols: [
          ['v', 'a variable that needs a value'],
          ['n', 'the number of variables'],
          ['C', 'a constraint over one or more variables'],
          ['assignment', 'a value chosen for every variable']
        ],
        worked: 'Three exams E1, E2 and E3 need rooms from {A, B}. E1 and E2 share students, so they cannot share a room. E1 and E3 share students too. Assign E1 = A, E2 = B, E3 = B. All constraints hold. Assigning E2 first and E1 second would produce the same valid plan, which shows that order is irrelevant.'
      },
      mechanism: {
        widget: 'map-colour',
        lab: {
          title: 'Find the colouring that needs three colours',
          tryText: 'Try to colour the map with two colours, then with three. Watch which regions force the extra colour.',
          notice: 'A constraint can make a value impossible before you try it. That is the seed of constraint propagation.'
        }
      },
      breaks: 'Constraint problems are NP-hard in general, so no algorithm is fast on every instance. A model can also be wrong in a way that looks fine: constraints that are too loose admit invalid plans, and constraints that are too tight make the problem unsolvable. Variables that interact globally, such as a shared budget, are awkward to express.',
      check: [
        {
          q: 'Which feature separates a variable model from a state model?',
          options: ['The input is larger', 'The answer is a complete assignment, and the order of construction is irrelevant', 'The model uses probability', 'The answer is a path'],
          answer: 1,
          explain: 'State models return a path, so order matters. Variable models return an assignment that satisfies constraints, so order does not.'
        },
        {
          q: 'A timetable model allows two exams in the same room at the same time. What is wrong?',
          options: ['The domain is too small', 'A constraint is missing', 'The variables are wrong', 'The search is too slow'],
          answer: 1,
          explain: 'The model permits a combination the real world forbids. The missing constraint, not the algorithm, is the defect.'
        }
      ],
      connection: {
        prompt: 'Sudoku can be solved by search or by constraint reasoning. What does the variable view add?',
        a: 'State search', b: 'Constraint model',
        options: [
          { label: 'A way to prune values that cannot appear in any solution', ok: true },
          { label: 'A shorter path', ok: false },
          { label: 'A learned policy', ok: false },
          { label: 'A probability distribution', ok: false }
        ],
        explain: 'Constraints let you remove impossible values before committing. Search alone would try them and fail later.'
      },
      recap: [
        'Variables, domains and constraints describe a puzzle, not a journey.',
        'A solution is a complete assignment, and construction order does not matter.',
        'Modelling errors, not slow algorithms, cause most bad solutions.'
      ],
      now: 'You can now model a scheduling or puzzle task as variables, domains and constraints.'
    },
    {
      id: 'logic-models',
      title: 'Logic models: prove it',
      prereqs: ['variable-models'],
      usecase: 'A compliance system must decide whether a payment is allowed. The rules are written down: sanctions lists, jurisdiction limits, approval limits. The system must show which rule makes a payment invalid, not guess a label.',
      metaphor: {
        name: 'The detective notebook',
        claim: 'A detective writes known facts on one page and rules on another. A new fact is written only when the rules force it.',
        mapping: [
          ['a known fact', 'axiom in the knowledge base', 'state the fact'],
          ['a rule', 'implication', 'state the rule'],
          ['a deduction', 'entailed sentence', 'derive the new fact'],
          ['a contradiction', 'inconsistency', 'check the case']
        ],
        widget: 'kb-sunday',
        lab: {
          title: 'Two facts, one new truth',
          tryText: 'Add the two facts to the notebook, then ask what follows. Try adding a fact that contradicts them.',
          notice: 'The new fact was never typed in. It follows from the rules and the facts.'
        }
      },
      idea: `<p>A <strong>logic model</strong> stores facts and rules in a formal language and derives new facts by <strong>inference</strong>. The language has a <strong>syntax</strong>, which says which strings are well formed, and a <strong>semantics</strong>, which says what is true in a situation. Inference is the mechanical step from sentences to sentences.</p>
<p>The guarantee is different from the other families. A classifier gives an answer that is probably right. A logic system gives an answer that follows from the premises, or it gives no answer. That is what a compliance check needs: a derivation a human can audit.</p>
<p>The cost is brittleness. Logic needs explicit rules for everything, including the exceptions. Everyday knowledge has too many exceptions to write down, which is why logic systems dominate narrow regulated domains and struggle in open ones.</p>`,
      lecture: {
        ref: '1.1',
        source: 'Transcript, AI paradigms',
        text: '"We tell the system two rules. First, today is Sunday. And then, Sunday is burger day. These are the truths I give the knowledge base, and now they can use these rules to derive new truths. The new truth is today is burger day."'
      },
      mechanics: {
        formula: 'KB entails α when every model of KB is a model of α',
        symbols: [
          ['KB', 'the set of facts and rules'],
          ['α', 'the sentence we want to know'],
          ['model', 'an assignment of truth values that satisfies a sentence'],
          ['entails', 'true in every situation where the KB is true']
        ],
        worked: 'Let the KB contain Sunday and Sunday implies Burger. A model must make both sentences true. In every such model, Burger is true. So the KB entails Burger. If the KB instead contained Sunday and Burger is false, no model would exist, and the KB would be inconsistent.'
      },
      mechanism: {
        widget: 'kb-sunday',
        lab: {
          title: 'Derive the fact, step by step',
          tryText: 'Step through the derivation. Then remove a rule and see which conclusion disappears.',
          notice: 'The conclusion is only as good as the rules. Remove one premise and the guarantee goes with it.'
        }
      },
      breaks: 'Logic models assume the facts are true and the rules are complete. In open domains neither holds. Classical logic also struggles with uncertainty, default assumptions and exceptions, which is why uncertainty gets its own unit. Inference can be expensive: the number of possible models grows exponentially with the number of variables.',
      check: [
        {
          q: 'What does a logic model guarantee that a reflex model does not?',
          options: ['Lower run time', 'The answer follows from the stated facts and rules', 'Better accuracy on images', 'A shorter path'],
          answer: 1,
          explain: 'The guarantee is about justification, not speed. The conclusion is entailed by the knowledge base, which makes it auditable.'
        },
        {
          q: 'The knowledge base says Sunday implies Burger and today is Sunday. What follows?',
          options: ['Today is Burger', 'Nothing follows', 'Sunday is false', 'The knowledge base is inconsistent'],
          answer: 0,
          explain: 'Modus ponens applies: from A and A implies B, derive B. The system never needed the sentence "today is burger day" to be typed in.'
        }
      ],
      connection: {
        prompt: 'Both variable models and logic models check consistency. What is the difference in what they return?',
        a: 'Constraint satisfaction', b: 'Logical entailment',
        options: [
          { label: 'An assignment versus a derived sentence with a proof', ok: true },
          { label: 'A path versus a label', ok: false },
          { label: 'A probability versus a decision', ok: false },
          { label: 'A model versus a dataset', ok: false }
        ],
        explain: 'Constraint solving returns values for variables. Logical inference returns sentences that follow, with a derivation you can inspect.'
      },
      recap: [
        'Logic models store facts and rules, then derive new facts.',
        'The answer is justified by entailment, not by similarity to training data.',
        'Brittleness and the cost of inference limit where the approach applies.'
      ],
      now: 'You can now distinguish a proof from a prediction and say why the difference matters in regulated work.'
    },
    {
      id: 'llms',
      title: 'Where large language models fit',
      prereqs: ['logic-models'],
      usecase: 'A student asks a chat assistant to plan a four-day trip. The assistant produces a route, opening hours and a packing list. It looks like planning, yet the model behind it predicts one token at a time.',
      metaphor: {
        name: 'The improviser who read the library',
        claim: 'An improviser has read every play and can continue any scene. That looks like understanding the plot, but the mechanism is predicting the next line.',
        mapping: [
          ['the scene so far', 'context window', 'type a prompt'],
          ['the next line', 'next token', 'read the completion'],
          ['having read many plays', 'training data', 'no action needed'],
          ['staying in character', 'emergent behaviour', 'test it on a new task']
        ],
        widget: 'llm-debate',
        lab: {
          title: 'Place the model on the spectrum',
          tryText: 'Read both cases, cast a vote, then see where the course puts the model and why.',
          notice: 'The mechanism and the behaviour point to different places. Both statements can be true at once.'
        }
      },
      idea: `<p>A <strong>large language model</strong> is a very large neural network trained to predict the next token in a sequence. Structurally it is a reflex model: one context in, one token out, no explicit state and no search. The same computation repeats until the answer ends.</p>
<p>At scale, that predictor produces behaviour that looks like planning, variable assignment and inference. Ask for a timetable and it returns a consistent one. Ask for a proof and it returns steps that resemble a derivation. The behaviour emerges from statistical structure in the training text, not from a symbolic engine.</p>
<p>The course treats these models as a fifth column in the map. Use them when the task is open and tolerant of error, pair them with a verifier when the answer must be exact, and do not assume the appearance of reasoning is a guarantee of it.</p>`,
      lecture: {
        ref: '1.1',
        source: 'Transcript, AI paradigms',
        text: '"Structurally, they are reflex models. They are massive neural networks. They take an input and generate an output, the next word. However, something incredible happens at scale. If you ask them to plan a trip, they act like a state space model. So should we treat them as a reflex model, or a new paradigm?"'
      },
      mechanics: {
        formula: 'P(next token | previous tokens)',
        symbols: [
          ['P', 'a score between 0 and 1'],
          ['token', 'a word piece or character'],
          ['previous tokens', 'the context the model conditions on']
        ],
        worked: 'Given the context "the cat sat on the", the model assigns a score to every token in its vocabulary. "mat" might get 0.31, "floor" 0.12, "roof" 0.004. Sampling or taking the highest value produces the next token, which is appended to the context and the process repeats.'
      },
      mechanism: {
        widget: 'spectrum',
        lab: {
          title: 'Overlay the model on the four families',
          tryText: 'Switch on the language model layer. Compare where it sits structurally with where its behaviour lands.',
          notice: 'The structural placement is fixed. The behavioural placement depends on the task you give it.'
        }
      },
      breaks: 'The model can produce a confident sentence that is false, because fluency and truth are different objectives. It has no built-in check that a plan is feasible or a proof valid. Long contexts lose detail, and the training cut-off limits what it can know. Pair it with tools, retrieval or a verifier when correctness matters.',
      check: [
        {
          q: 'Why does this course call a large language model a reflex model structurally?',
          options: ['It was trained with gradient descent', 'It maps a context to a next token with a fixed computation and no explicit search', 'It cannot answer questions', 'It has no parameters'],
          answer: 1,
          explain: 'The architecture is feed-forward at inference. It produces one token per pass, with no state machine and no explicit search over plans.'
        },
        {
          q: 'A model writes a valid-looking timetable that double-books a room. Which statement is accurate?',
          options: ['The model performed constraint solving', 'The model produced fluent text that violates a constraint', 'The model is a logic system', 'The model has a bug in its search'],
          answer: 1,
          explain: 'There is no constraint engine inside. The output resembles a timetable because similar text appeared in training, not because the model checked the constraints.'
        }
      ],
      connection: {
        prompt: 'The course suggests pairing a language model with a checker. Which earlier family supplies that checker?',
        a: 'Language model output', b: 'Verification family',
        options: [
          { label: 'Constraint or logic reasoning', ok: true },
          { label: 'A larger language model', ok: false },
          { label: 'A reflex classifier', ok: false },
          { label: 'More training data', ok: false }
        ],
        explain: 'A constraint solver can test feasibility and a logic engine can test entailment. Either gives a guarantee the language model cannot give alone.'
      },
      recap: [
        'A language model predicts the next token from its context.',
        'Structurally it is reflex; behaviourally it can resemble the other families.',
        'Use a verifier when the answer must be exact.'
      ],
      now: 'You can now explain the structural and behavioural readings of a language model without conflating them.'
    }
  ],
  test: [
    {
      q: 'A system labels each incoming support ticket as billing, bug or feature request. Which family does the question belong to?',
      options: ['Reflex', 'State', 'Variable', 'Logic'],
      answer: 0,
      explain: 'The answer is one label per input, with no sequence and no assignment.'
    },
    {
      q: 'Which output is characteristic of a state-based model?',
      options: ['A class label', 'A sequence of actions', 'A truth value', 'A complete assignment'],
      answer: 1,
      explain: 'State models return a path from a start state to a goal.'
    },
    {
      q: 'A Sudoku solver returns a filled grid. Why is the order of filling irrelevant?',
      options: ['Because the grid is small', 'Because only the final assignment must satisfy the constraints', 'Because Sudoku is a reflex task', 'Because the solver uses probability'],
      answer: 1,
      explain: 'Variable models judge the completed assignment, not the construction sequence.'
    },
    {
      q: 'What does a logic model add to a variable model?',
      options: ['A path', 'Sentences derived from facts and rules', 'A probability', 'A training set'],
      answer: 1,
      explain: 'Logic derives new sentences by inference, and the derivation can be checked.'
    },
    {
      q: 'Which statement about large language models matches the course position?',
      options: ['They are logic engines', 'They are reflex models structurally, with emergent behaviour at scale', 'They perform explicit search', 'They solve constraints internally'],
      answer: 1,
      explain: 'They predict the next token, and larger scale produces behaviour that resembles other families.'
    },
    {
      q: 'A robot vacuum records its position, battery and the rooms already cleaned. What is this record called?',
      options: ['A label', 'A state', 'A constraint', 'A proof'],
      answer: 1,
      explain: 'It is the snapshot needed for the next decision, which is the definition of a state.'
    },
    {
      q: 'Which task is a poor fit for a reflex model?',
      options: ['Sorting email into spam and not spam', 'Deciding the next move in a board game', 'Reading a handwritten digit', 'Estimating a house price from features'],
      answer: 1,
      explain: 'The next move depends on the position and the goal, which calls for a state model.'
    },
    {
      q: 'A compliance system must show why a payment is blocked. Which family gives the most useful answer?',
      options: ['A reflex classifier', 'A state model', 'A logic model with a derivation', 'A language model alone'],
      answer: 2,
      explain: 'A derivation names the rule and the facts, which is what an audit needs.'
    }
,
    {
      type: 'numeric',
      q: 'A filter labels 1,000 messages and gets 840 right. It wrongly flags 60 legitimate messages and misses 100 spam messages. What is its accuracy as a decimal?',
      answer: 0.84,
      tolerance: 0.005,
      explain: 'Accuracy is correct labels divided by all cases: 840 / 1000 = 0.84.'
    },
    {
      type: 'ordering',
      q: 'Put the four model families in the order the course introduces them, from the simplest mapping to the richest representation.',
      items: ['Reflex model', 'State model', 'Variable model', 'Logic model'],
      explain: 'The families add capability in that order: a direct mapping, then history, then assignments, then sentences and derivations.'
    },
    {
      type: 'error',
      q: 'A team chooses a model for a delivery route with twelve stops. One step in their reasoning is wrong. Which one?',
      steps: [
        'The task needs a sequence of actions, not one label.',
        'The next action depends on where the van is and which stops remain.',
        'Choose a reflex model, because it maps the current input straight to an output.',
        'Represent the position and the remaining stops as state and search over actions.'
      ],
      answer: 2,
      explain: 'A reflex model has no memory of the route so far. A task whose next action depends on history needs state, not a fixed input-to-output map.'
    },
    {
      type: 'short',
      q: 'When is a logic model a better choice than a reflex model?',
      rubric: [
        'Names a task that needs a justification or derivation',
        'Mentions facts and rules rather than a learned mapping',
        'Explains that the answer must be checkable step by step'
      ],
      model: 'A logic model fits when the answer must come with a reason: a compliance decision, a diagnosis or a proof. Facts and rules are written down, and a derivation shows why the conclusion follows. A reflex model can label faster, but it cannot show its work.',
      explain: 'The distinction is representation and explanation, not accuracy alone.'
    }
  ],
  connections: [
    {
      prompt: 'Match the output to the family before you move on.',
      a: 'Family', b: 'Output',
      options: [
        { label: 'Reflex: a label', ok: true },
        { label: 'State: a complete assignment', ok: false },
        { label: 'Variable: a sequence of actions', ok: false },
        { label: 'Logic: a probability', ok: false }
      ],
      explain: 'Reflex returns a label, state returns a path, variable returns an assignment, and logic returns a derived sentence.'
    }
  ],
  pairs: [
    {
      a: 'A reflex model', b: 'A state model',
      claim: 'Both choose the next action from the current input alone.',
      same: false,
      explain: 'A state model also reads the history recorded in the state. That history is what lets it plan.'
    },
    {
      a: 'A variable model', b: 'A logic model',
      claim: 'Both can represent a Sudoku solution as an assignment of values.',
      same: true,
      explain: 'A logic model adds sentences and derivations, but the solution is still a truth assignment to variables.'
    },
    {
      a: 'A large language model', b: 'A reflex model',
      claim: 'Both map an input to an output without searching over future states.',
      same: true,
      explain: 'The course treats an LLM as a reflex model structurally. Scale changes the behaviour, not the family.'
    }
  ],
  map: {
    nodes: [
      { id: 'reflex', label: 'Reflex', x: 12, y: 30 },
      { id: 'state', label: 'State', x: 38, y: 22 },
      { id: 'variable', label: 'Variable', x: 64, y: 30 },
      { id: 'logic', label: 'Logic', x: 86, y: 22 },
      { id: 'llm', label: 'Language model', x: 50, y: 72 }
    ],
    edges: [
      ['reflex', 'state', 'adds sequence'],
      ['state', 'variable', 'drops order'],
      ['variable', 'logic', 'adds proof'],
      ['reflex', 'llm', 'scales up'],
      ['llm', 'state', 'can plan']
    ]
  }
});
