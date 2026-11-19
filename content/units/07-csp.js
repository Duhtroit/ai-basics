AIM.registerUnit({
  n: 7, hue: 215, short: 'Constraints',
  title: 'Puzzles with hard rules',
  weeks: 'Week 7',
  promise: 'Model a puzzle as variables and rules, then solve it by search, by propagation, or by rearranging.',
  minutes: 40,
  lectures: ['7.1 Define a CSP', '7.2 Systematic algorithms', '7.3 Local search', '7.4 Optimisation ideas', 'Tutorial 7 backtracking'],
  concepts: [
    {
      id: 'csp',
      title: 'What a constraint problem is',
      prereqs: ['variable-models'],
      usecase: 'A conference has 12 sessions, 5 rooms and 40 speakers. Some speakers cannot attend on certain days. Some sessions must not run at the same time. The organiser needs one schedule that satisfies every rule.',
      metaphor: {
        name: 'The wedding seating chart',
        claim: 'Every guest needs a seat. Two relatives cannot sit together. The hall has a fixed number of chairs per table. Any chart that respects the rules is acceptable.',
        mapping: [
          ['a guest', 'variable', 'assign a seat'],
          ['chairs at a table', 'domain', 'choose a value'],
          ['a family feud', 'constraint', 'check the pair'],
          ['the finished chart', 'solution', 'verify all rules']
        ],
        widget: 'map-colour',
        lab: {
          title: 'Colour the regions',
          tryText: 'Assign a colour to each region. Neighbouring regions may not match.',
          notice: 'A partial chart can already violate a rule. Checking early saves work later.'
        }
      },
      idea: `<p>A <strong>constraint satisfaction problem</strong> has three parts: a set of variables, a domain of values for each, and constraints that rule out combinations. A solution assigns one value to every variable without violating any constraint.</p>
<p>Constraints can be unary, binary or global. A unary constraint restricts one variable, such as a room that seats at most 40. A binary constraint relates two, such as two exams that cannot share a slot. A global constraint covers many, such as all different values in a Sudoku row.</p>
<p>The model decides the difficulty. A formulation with large domains and few constraints has many solutions and is easy to satisfy but hard to optimise. A tight formulation may have no solution at all. Unit 7 is about solving a model that is already written well.</p>`,
      lecture: {
        ref: '7.1',
        source: 'Transcript, Define a CSP',
        text: 'The lecturer defines the three parts on the board. "We have variables, a domain for each variable, and constraints between them. A solution is an assignment that satisfies all the constraints."'
      },
      mechanics: {
        formula: 'solution = assignment of every variable in its domain that satisfies all constraints',
        symbols: [
          ['variable', 'a decision to make'],
          ['domain', 'the allowed values for one variable'],
          ['constraint', 'a rule over one or more variables'],
          ['assignment', 'a value chosen for every variable']
        ],
        worked: 'Three sessions A, B and C need rooms from {R1, R2}. A and B share a speaker, so they cannot run at the same time. A and C share a speaker too. Assign A = R1, B = R2, C = R2. Every constraint holds and every variable has a value. Assign A = R1, B = R1 and the first constraint fails.'
      },
      mechanism: {
        widget: 'map-colour',
        lab: {
          title: 'Try a harder map',
          tryText: 'Switch to the four-region map with three colours. Count how many assignments you try before one works.',
          notice: 'A dead end can be detected before the assignment is complete. That is the opening for propagation.'
        }
      },
      breaks: 'General constraint satisfaction is NP-hard, so every exact algorithm has bad cases. Models can also be wrong: missing constraints allow invalid schedules, and redundant constraints slow the solver. Variables that interact through a shared resource are awkward to express as binary constraints.',
      check: [
        {
          q: 'What is a solution to a constraint problem?',
          options: ['Any partial assignment', 'An assignment of every variable that satisfies all constraints', 'A path from start to goal', 'A probability distribution'],
          answer: 1,
          explain: 'Every variable needs a value, and no constraint may be violated.'
        },
        {
          q: 'Which constraint is global?',
          options: ['Room A seats 40 people', 'Exam A and exam B cannot share a slot', 'All nine digits in a Sudoku row differ', 'A session starts after 9am'],
          answer: 2,
          explain: 'The row rule covers nine variables at once, so it is global rather than binary.'
        }
      ],
      connection: {
        prompt: 'A CSP and a state-space search both explore assignments. What is the difference in the goal?',
        a: 'CSP', b: 'State search',
        options: [
          { label: 'A complete assignment versus a path to a goal state', ok: true },
          { label: 'A path versus a complete assignment', ok: false },
          { label: 'Both return a path', ok: false },
          { label: 'Both return a probability', ok: false }
        ],
        explain: 'The CSP judges the finished assignment. The search judges the sequence of actions that reaches the goal.'
      },
      recap: [
        'A CSP is variables, domains and constraints.',
        'A solution assigns every variable without breaking a rule.',
        'The model, not only the solver, determines how hard the problem is.'
      ],
      now: 'You can now write a small CSP and check whether an assignment solves it.'
    },
    {
      id: 'backtracking',
      title: 'Backtracking: commit, then undo',
      prereqs: ['csp'],
      usecase: 'A Sudoku solver fills one cell at a time. Some choices lead to a contradiction twenty cells later. The solver must notice the dead end and return to the last choice that still has alternatives.',
      metaphor: {
        name: 'Walking a maze with chalk',
        claim: 'You mark the path as you go. At a dead end you walk back to the last junction and take a different turn.',
        mapping: [
          ['a junction', 'variable to assign', 'pick the next cell'],
          ['a corridor', 'value choice', 'try a digit'],
          ['the chalk mark', 'assignment stack', 'undo the last choice'],
          ['a dead end', 'constraint violation', 'backtrack']
        ],
        widget: 'sudoku-step',
        lab: {
          title: 'Fill a small Sudoku',
          tryText: 'Step forward. When a cell has no legal digit, press back and try another.',
          notice: 'Backtracking is depth-first search over assignments. The stack is the path.'
        }
      },
      idea: `<p><strong>Backtracking</strong> assigns variables one at a time. After each assignment it checks the constraints. If a constraint is violated, it undoes the assignment and tries another value. If no value works, it returns to the previous variable.</p>
<p>The algorithm is complete: if a solution exists, it finds one. The cost depends on the order of variables and values, and on how early a violation is detected. Checking constraints as soon as possible prunes large subtrees.</p>
<p>Plain backtracking can be slow on large problems because it rediscovers the same failures. Forward checking and value pruning reduce that by removing impossible values before the search reaches them.</p>`,
      lecture: {
        ref: 'Tutorial 7',
        source: 'Transcript, Solving CSPs using backtracking',
        text: 'The tutor traces a Sudoku solve. "We place a number, check the row, column and box, and if it fails we take it back and try the next number."'
      },
      mechanics: {
        formula: 'assign, check, recurse, undo on failure',
        symbols: [
          ['assign', 'give a variable a value'],
          ['check', 'test the constraints touched by that value'],
          ['recurse', 'move to the next variable'],
          ['undo', 'restore the previous state on failure']
        ],
        worked: 'A row needs digits 1 to 4 and already has 1 and 3. The empty cells can take 2 or 4. Assign 2 to the first. The second then takes 4. If a later constraint rejects 2, the solver undoes it and tries 4, which forces 2 in the second cell.'
      },
      mechanism: {
        widget: 'sudoku-step',
        lab: {
          title: 'Watch the stack grow and shrink',
          tryText: 'Step through a puzzle with a planted contradiction. Pause at each undo.',
          notice: 'Each undo removes one choice. The algorithm never revises a value it has not tried.'
        }
      },
      breaks: 'Backtracking can visit an exponential number of nodes. A poor variable order causes thrashing, where the same conflict is rediscovered many times. It also assumes constraints can be checked cheaply; an expensive check changes the practical cost.',
      check: [
        {
          q: 'What does backtracking do at a dead end?',
          options: ['Restarts from the first variable', 'Undoes the last assignment and tries another value', 'Stops and reports no solution', 'Picks a random value'],
          answer: 1,
          explain: 'It reverses the most recent choice and explores the remaining alternatives.'
        },
        {
          q: 'Why check constraints as early as possible?',
          options: ['To make the code shorter', 'To prune subtrees before they are explored', 'To avoid recursion', 'To remove the need for domains'],
          answer: 1,
          explain: 'An early violation eliminates every completion of that partial assignment, which saves work.'
        }
      ],
      connection: {
        prompt: 'Backtracking is which earlier algorithm applied to assignments?',
        a: 'Backtracking', b: 'Search strategy',
        options: [
          { label: 'Depth-first search', ok: true },
          { label: 'Breadth-first search', ok: false },
          { label: 'Uniform cost search', ok: false },
          { label: 'Gradient descent', ok: false }
        ],
        explain: 'It goes as deep as possible, then backs up. That is depth-first search over a tree of partial assignments.'
      },
      recap: [
        'Backtracking assigns, checks, recurses and undoes.',
        'It is complete but can be exponential.',
        'Early constraint checks prune the search tree.'
      ],
      now: 'You can now trace a backtracking solve and explain why an undo is safe.'
    },
    {
      id: 'propagation',
      title: 'Constraint propagation',
      prereqs: ['backtracking'],
      usecase: 'A Sudoku player writes small candidate digits in each cell. When a 7 is placed, every peer loses 7 as a candidate. Some cells drop to one candidate and fill themselves.',
      metaphor: {
        name: 'Dominoes of elimination',
        claim: 'One tile falls and knocks over its neighbours. One fixed value removes options from every cell that shares a rule with it.',
        mapping: [
          ['the first tile', 'assigned value', 'place a digit'],
          ['a falling neighbour', 'removed candidate', 'cross out a value'],
          ['a tile with one option', 'forced assignment', 'fill it in']
        ],
        widget: 'map-colour',
        lab: {
          title: 'Propagate colours',
          tryText: 'Assign one region, then watch the neighbours lose colours. Continue until a region is forced.',
          notice: 'No search happened. The rules alone produced the value.'
        }
      },
      idea: `<p><strong>Constraint propagation</strong> removes values that cannot appear in any solution. For a binary constraint, if one variable takes a value, every incompatible value disappears from its neighbour's domain. If a domain drops to one value, that value is assigned and the process repeats.</p>
<p>Arc consistency is the standard local rule: for every pair of variables, every remaining value must have at least one compatible value in the other domain. Achieving arc consistency can solve easy puzzles outright and shrinks the search space for hard ones.</p>
<p>Propagation is not complete. It can leave several candidates in every domain while a solution still exists. At that point the solver must guess, which is why propagation is usually paired with backtracking.</p>`,
      lecture: {
        ref: '7.2',
        source: 'Transcript, Systematic algorithms',
        text: 'The lecturer describes removing impossible values before branching. "If a value cannot be part of any solution, we delete it from the domain. Sometimes the whole puzzle solves itself this way."'
      },
      mechanics: {
        formula: 'for each constraint, remove values with no compatible partner',
        symbols: [
          ['constraint', 'a rule between variables'],
          ['compatible', 'a pair of values that satisfies the rule'],
          ['domain', 'the remaining candidate values']
        ],
        worked: 'Region A takes red. Its neighbours B and C cannot take red, so their domains shrink from {red, green, blue} to {green, blue}. If B then takes green, C loses green and becomes {blue}. C is forced without any search.'
      },
      mechanism: {
        widget: 'map-colour',
        lab: {
          title: 'Solve by elimination alone',
          tryText: 'Turn on propagation and pick a starting region. Try to finish without guessing.',
          notice: 'When propagation stalls, the remaining choice is a real branch point.'
        }
      },
      breaks: 'Arc consistency does not detect all inconsistencies. A network can be arc consistent and still have no solution. Stronger consistency costs more per step and may not pay off. Propagation also needs efficient data structures, or the repeated scanning dominates.',
      check: [
        {
          q: 'What does propagation remove from a domain?',
          options: ['Values that are unpopular', 'Values with no compatible partner in a neighbouring domain', 'All but the first value', 'The largest value'],
          answer: 1,
          explain: 'A value that cannot satisfy a constraint with any neighbour cannot appear in a solution.'
        },
        {
          q: 'When does propagation need help from search?',
          options: ['When a domain is empty', 'When every domain still has several candidates', 'When the puzzle is solved', 'When there are no constraints'],
          answer: 1,
          explain: 'Propagation stalls at a state where choices remain. Backtracking then branches.'
        }
      ],
      connection: {
        prompt: 'Propagation and backtracking divide the work. Which does which?',
        a: 'Propagation', b: 'Backtracking',
        options: [
          { label: 'Propagation prunes, backtracking guesses', ok: true },
          { label: 'Propagation guesses, backtracking prunes', ok: false },
          { label: 'Both only prune', ok: false },
          { label: 'Both only guess', ok: false }
        ],
        explain: 'Propagation applies the rules to remove values. Search commits when no rule forces a value.'
      },
      recap: [
        'Propagation deletes values that cannot satisfy a constraint.',
        'A single remaining value is assigned automatically.',
        'It reduces but does not replace search.'
      ],
      now: 'You can now propagate a constraint by hand and recognise when the puzzle stalls.'
    },
    {
      id: 'local-search',
      title: 'Local search: rearrange until it fits',
      prereqs: ['propagation'],
      usecase: 'A hospital must place 500 nurses on shifts. A complete schedule is hard to build from scratch, but an existing schedule can be repaired by swapping a few assignments until no rule is broken.',
      metaphor: {
        name: 'Rearranging chairs',
        claim: 'Start with everyone seated anywhere. Find the guest with the most complaints and move them. Repeat. The room does not need to be built from scratch.',
        mapping: [
          ['a seating plan', 'complete assignment', 'start anywhere'],
          ['complaints', 'violated constraints', 'count conflicts'],
          ['moving one guest', 'change one value', 'make a swap'],
          ['a calm room', 'zero conflicts', 'stop']
        ],
        widget: 'queens',
        lab: {
          title: 'Clear the queens',
          tryText: 'Click a queen column and move it to the row with the fewest attacks. Repeat until zero.',
          notice: 'The board always has one queen per column. Only the rows change.'
        }
      },
      idea: `<p><strong>Local search</strong> starts with a complete but imperfect assignment and repeatedly changes one variable to reduce the number of violated constraints. <strong>Min-conflicts</strong> picks a variable in conflict and assigns the value that minimises conflicts, breaking ties at random.</p>
<p>The method keeps the assignment complete at every step, which suits problems where a good schedule matters more than proving optimality. It handles large instances that backtracking cannot touch, such as million-queens problems.</p>
<p>Local search gives no completeness guarantee. It can stall in a local minimum where every single change makes things worse. Random restarts and sideways moves escape some of those traps, at the cost of time.</p>`,
      lecture: {
        ref: '7.3',
        source: 'Transcript, Local search',
        text: 'The lecturer contrasts local search with systematic search. "We start with a complete assignment and improve it. We do not build the solution from nothing."'
      },
      mechanics: {
        formula: 'pick a conflicted variable, choose the value with fewest conflicts, repeat',
        symbols: [
          ['conflicted variable', 'a variable that breaks at least one constraint'],
          ['value', 'a new assignment for that variable'],
          ['conflicts', 'the number of violated constraints after the change']
        ],
        worked: 'On an 8 by 8 board with one queen per column, place the rows at random. Count attacks. A queen with three attacks moves to a row with one attack. The total falls from 12 to 10. Repeat until zero, or restart if the count stops falling.'
      },
      mechanism: {
        widget: 'queens',
        lab: {
          title: 'Climb down the conflict count',
          tryText: 'Step one move at a time. Watch the conflict count. Restart when it stalls above zero.',
          notice: 'The move always improves or ties. A tie move can escape a plateau.'
        }
      },
      breaks: 'Local search can cycle or stall and cannot prove that no solution exists. It is sensitive to the initial assignment and to the tie-breaking rule. For problems with hard feasibility requirements, a systematic method may be required for the guarantee.',
      check: [
        {
          q: 'What does min-conflicts change at each step?',
          options: ['A random variable to a random value', 'A conflicted variable to its least-conflicting value', 'All variables at once', 'The constraints'],
          answer: 1,
          explain: 'It targets a variable that is currently in conflict and picks the value that reduces conflicts most.'
        },
        {
          q: 'What guarantee does local search lack?',
          options: ['It cannot handle large problems', 'It cannot prove that no solution exists', 'It cannot start from a complete assignment', 'It cannot handle constraints'],
          answer: 1,
          explain: 'It may stop at a local minimum without knowing whether a solution exists elsewhere.'
        }
      ],
      connection: {
        prompt: 'Local search and backtracking both solve CSPs. What is the key difference in the state they hold?',
        a: 'Local search', b: 'Backtracking',
        options: [
          { label: 'A complete assignment versus a partial one', ok: true },
          { label: 'A partial assignment versus a complete one', ok: false },
          { label: 'Both hold partial assignments', ok: false },
          { label: 'Neither holds an assignment', ok: false }
        ],
        explain: 'Local search repairs a full assignment. Backtracking extends a partial one.'
      },
      recap: [
        'Local search repairs a complete assignment one variable at a time.',
        'Min-conflicts targets conflicted variables and reduces the count.',
        'It scales well but gives no completeness guarantee.'
      ],
      now: 'You can now run a min-conflicts repair and explain when it can stall.'
    },
    {
      id: 'csp-modelling',
      title: 'Modelling is the hard part',
      prereqs: ['local-search'],
      usecase: 'A solver returns no schedule for a conference. The organiser discovers the model required every session to be in a different room, including sessions that never overlap. The model was wrong, not the solver.',
      metaphor: {
        name: 'Writing the rules of a game',
        claim: 'A game is only as good as its rules. Leave one out and the players cheat. Add one too many and nobody can move.',
        mapping: [
          ['a game piece', 'variable', 'choose what to model'],
          ['legal squares', 'domain', 'set the options'],
          ['a rule', 'constraint', 'write or remove it'],
          ['a playable game', 'solvable model', 'test a known case']
        ],
        widget: 'map-colour',
        lab: {
          title: 'Add and remove a rule',
          tryText: 'Remove one constraint and find a solution. Add a redundant one and see whether the solution set changes.',
          notice: 'A redundant rule can speed up search or slow it down. A missing rule makes the answer wrong.'
        }
      },
      idea: `<p>Most failures in applied constraint work are modelling failures. Variables may be at the wrong level: assigning each session a room is not enough if time is also a decision. Domains may be too wide, which makes search slow, or too narrow, which removes the real solution.</p>
<p>Redundant constraints can help. Adding a constraint implied by the others can make propagation stronger, because the solver sees the consequence directly. The same constraint can also add overhead, so it needs testing.</p>
<p>Always validate a model on a known solution and a known impossible case. If the model accepts the impossible case, a constraint is missing. If it rejects the known solution, a domain or constraint is too tight.</p>`,
      lecture: {
        ref: '7.4',
        source: 'Transcript, Optimisation ideas summary',
        text: 'The lecturer lists modelling choices as the main lever on solver performance. "The same problem can be easy or impossible depending on how you define the variables and constraints."'
      },
      mechanics: {
        formula: 'choose variables, domains, constraints, then test a known solution',
        symbols: [
          ['variables', 'the decisions to make'],
          ['domains', 'the allowed values for each decision'],
          ['constraints', 'the rules that must hold'],
          ['known solution', 'a case the model must accept']
        ],
        worked: 'A timetable with sessions and rooms but no time variable accepts two sessions in the same room, because the model never represents time. Adding a time variable and an all-different constraint over room and time pairs rejects that case. The solver was never the problem.'
      },
      mechanism: {
        widget: 'map-colour',
        lab: {
          title: 'Break the model on purpose',
          tryText: 'Remove the neighbour constraint and see how many colourings appear. Add it back and compare.',
          notice: 'The solution count changes because the problem changed. The solver did exactly what it was told.'
        }
      },
      breaks: 'A model that is correct can still be unsolvable in practice. Symmetry, such as identical rooms, multiplies equivalent solutions and wastes search. Excessively tight constraints can make a feasible real plan look impossible. Validation on known cases catches both.',
      check: [
        {
          q: 'A model accepts a schedule that double-books a room. What is wrong?',
          options: ['The solver is too slow', 'A constraint is missing', 'The domain is too small', 'The search order is wrong'],
          answer: 1,
          explain: 'The model permits a combination the world forbids. No solver can recover a rule that was never written.'
        },
        {
          q: 'What is a redundant constraint for?',
          options: ['To make the model wrong', 'To strengthen propagation and speed up search', 'To reduce the number of variables', 'To remove symmetry'],
          answer: 1,
          explain: 'A constraint implied by the others can expose consequences earlier, though it costs time to check.'
        }
      ],
      connection: {
        prompt: 'Modelling failures and evaluation failures share a pattern. What is it?',
        a: 'Wrong model', b: 'Symptom',
        options: [
          { label: 'A confident answer that does not hold in the real task', ok: true },
          { label: 'A slow program', ok: false },
          { label: 'A missing dataset', ok: false },
          { label: 'A larger test set', ok: false }
        ],
        explain: 'Both produce numbers or schedules that look valid inside the model and fail outside it.'
      },
      recap: [
        'Variables, domains and constraints are design decisions.',
        'Missing constraints produce invalid answers, tight ones hide valid plans.',
        'Validate the model on a known solution and a known impossible case.'
      ],
      now: 'You can now debug a constraint model before blaming the solver.'
    }
  ],
  test: [
    {
      q: 'What are the three parts of a CSP?',
      options: ['Inputs, weights, outputs', 'Variables, domains, constraints', 'States, actions, rewards', 'Features, labels, loss'],
      answer: 1,
      explain: 'A CSP is defined by its variables, their domains and the constraints between them.'
    },
    {
      q: 'What does backtracking do when no value fits a variable?',
      options: ['Restarts the whole search', 'Undoes the previous assignment and tries another', 'Ignores the constraint', 'Stops immediately'],
      answer: 1,
      explain: 'It returns to the last decision with untried alternatives.'
    },
    {
      q: 'Propagation deletes a value when what is true?',
      options: ['It is rarely used', 'It has no compatible value in a neighbouring domain', 'It is the largest value', 'It appears in the solution'],
      answer: 1,
      explain: 'A value that cannot satisfy a constraint cannot appear in any solution.'
    },
    {
      q: 'What is the main guarantee that local search lacks?',
      options: ['Speed', 'Completeness', 'Memory efficiency', 'The ability to use constraints'],
      answer: 1,
      explain: 'It can stop at a local minimum without proving that no solution exists.'
    },
    {
      q: 'Min-conflicts chooses which variable to change?',
      options: ['A random one', 'One that is currently in conflict', 'The first in the list', 'The one with the largest domain'],
      answer: 1,
      explain: 'It targets a conflicted variable and picks the value with the fewest conflicts.'
    },
    {
      q: 'A model accepts a plan that violates a real rule. What is the cause?',
      options: ['A missing constraint', 'Too many variables', 'A slow solver', 'A small domain'],
      answer: 0,
      explain: 'The model does not encode the rule, so the solver cannot enforce it.'
    },
    {
      q: 'What does arc consistency check?',
      options: ['Every value has a compatible partner in each neighbouring domain', 'Every variable has one value', 'The solution is optimal', 'The search terminates'],
      answer: 0,
      explain: 'Arc consistency removes values with no support across a binary constraint.'
    },
    {
      q: 'A local search plateaus at two conflicts. What is a reasonable next step?',
      options: ['Prove no solution exists', 'Allow a sideways move or restart', 'Remove a constraint', 'Stop and report success'],
      answer: 1,
      explain: 'A tie move or restart can escape a plateau without changing the model.'
    }
,
    {
      type: 'numeric',
      q: 'A CSP has 4 variables, each with a domain of 3 values. Before any constraint is applied, how many complete assignments exist?',
      answer: 81,
      tolerance: 0.001,
      explain: 'Each variable has 3 choices, so the assignments number 3 x 3 x 3 x 3 = 81.'
    },
    {
      type: 'ordering',
      q: 'Order the steps of a backtracking search.',
      items: [
        'Choose an unassigned variable',
        'Try a value from its domain',
        'Check the constraints against the current assignment',
        'Recurse to the next variable',
        'Undo the value if no completion works'
      ],
      explain: 'The undo is what makes the search systematic. It explores an alternative instead of abandoning the branch.'
    },
    {
      type: 'error',
      q: 'A team describes how arc consistency prunes a CSP. One step is wrong. Which one?',
      steps: [
        'For each arc, remove a value from the first variable when it has no compatible value in the second.',
        'Repeat until no domain changes.',
        'Remove the constraint once the domains are consistent.',
        'Keep the constraints and use the reduced domains in search.'
      ],
      answer: 2,
      explain: 'Arc consistency only shrinks domains. The constraints remain, because later assignments can still violate them.'
    },
    {
      type: 'short',
      q: 'Why is local search incomplete on a CSP?',
      rubric: [
        'Mentions plateaus, cycles or local minima',
        'Contrasts it with systematic backtracking',
        'Explains that a solution can be missed even when one exists'
      ],
      model: 'Local search keeps one complete assignment and repairs conflicts. It can cycle, stall on a plateau or settle in a local minimum, so it may never reach a solution that exists. Restarts help in practice but do not make the method complete.',
      explain: 'Completeness is a guarantee. Local search trades that guarantee for speed.'
    }
  ],
  connections: [
    {
      prompt: 'Match the method to the state it holds.',
      a: 'Method', b: 'State',
      options: [
        { label: 'Backtracking: partial assignment', ok: true },
        { label: 'Local search: partial assignment', ok: false },
        { label: 'Backtracking: complete assignment', ok: false },
        { label: 'Propagation: a path of actions', ok: false }
      ],
      explain: 'Backtracking extends a partial assignment. Local search repairs a complete one.'
    }
  ],
  pairs: [
    {
      a: 'Backtracking', b: 'Local search',
      claim: 'Both guarantee finding a solution if one exists.',
      same: false,
      explain: 'Backtracking is systematic and complete. Local search can stall and miss a solution.'
    },
    {
      a: 'Arc consistency', b: 'Backtracking',
      claim: 'Both remove values that cannot appear in any solution.',
      same: false,
      explain: 'Arc consistency removes values with no local support. Backtracking assigns values and undoes them; it does not prune domains in advance.'
    },
    {
      a: 'A CSP variable', b: 'A state in a state space',
      claim: 'Both hold an assignment that later decisions depend on.',
      same: true,
      explain: 'A CSP builds a partial assignment. A state records the decisions made so far.'
    }
  ],
  map: {
    nodes: [
      { id: 'csp', label: 'CSP', x: 12, y: 26 },
      { id: 'back', label: 'Backtracking', x: 34, y: 18 },
      { id: 'prop', label: 'Propagation', x: 56, y: 28 },
      { id: 'local', label: 'Local search', x: 78, y: 20 },
      { id: 'model', label: 'Modelling', x: 44, y: 66 }
    ],
    edges: [
      ['csp', 'back', 'solved by'],
      ['back', 'prop', 'pruned by'],
      ['csp', 'local', 'repaired by'],
      ['model', 'csp', 'defines the rules'],
      ['prop', 'local', 'both cut work']
    ]
  }
});
