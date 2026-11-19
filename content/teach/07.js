AIM.registerTeach({
  n: 7,
  opening: `<p>Some problems are not about predicting a value or finding a route. They are about filling in a table so that every rule holds at once. A timetable, a Sudoku grid and a map colouring all have the same shape: a set of decisions, a set of allowed values, and a set of rules that rule out combinations.</p>
<p>Unit 7 teaches four ways to solve that shape. Backtracking commits to values and undoes them when a rule breaks. Propagation removes values that cannot work before the search reaches them. Local search repairs a complete but imperfect assignment. The last concept is about the step that decides how hard all three will be: writing the model.</p>
<p>The algorithms are only half the subject. A correct solver on a bad model returns a wrong answer or no answer. The final concept gives you a way to test the model itself, separately from the solver.</p>`,
  concepts: {
    'csp': {
      teach: `<p>A constraint satisfaction problem has three parts: a set of <strong>variables</strong>, a <strong>domain</strong> of values for each, and <strong>constraints</strong> that rule out combinations. A solution assigns one value to every variable without violating any constraint.</p>
<p>A unary constraint restricts one variable, such as a room that seats at most forty people. A binary constraint relates two variables, such as two exams that cannot share a room. A global constraint covers many variables, such as all digits in a Sudoku row being different. The model can mix all three.</p>
<h4>The constraint graph</h4>
<p>Draw a node for each variable and an edge for each binary constraint. The graph shows which decisions interact. A variable with many edges is involved in many rules; a disconnected component can be solved independently. The graph also suggest where propagation will be effective: dense regions constrain each other strongly, while sparse regions leave more freedom.</p>
<h4>Solving is search plus inference</h4>
<p>A solver combines two activities. Search assigns values to variables. Inference removes values that cannot appear in any solution. Backtracking is the basic search. Propagation is the basic inference. Modern solvers interleave them: propagate after every assignment, and backtrack when a domain becomes empty.</p>
<p>General constraint satisfaction is NP-hard, so every exact algorithm has bad cases. That does not make the methods useless. Many practical instances have structure that propagation exploits, and a good model can turn a hard instance into an easy one.</p>
<div class="callout"><b>Solution, not path</b><p>The order in which values are assigned is not part of the answer. Two different search orders that produce the same table have found the same solution.</p></div>`,
      work: `<ol class="steps"><li>Variables: three sessions A, B and C.</li><li>Domains: each can use room R1 or R2.</li><li>Constraints: A and B cannot share a room; A and C cannot share a room.</li><li>Try A = R1. Then B and C must both be R2. They do not conflict with each other.</li><li>The assignment is a solution. Try A = R1, B = R1 and the first constraint fails, so that branch is rejected.</li></ol>`,
      practice: {
        q: 'A map has four regions in a line: A next to B, B next to C, C next to D. Three colours are available. Write the variables, domains and constraints, and give one solution.',
        hint: 'Write one constraint for each adjacent pair. A and C do not touch, so their colours need not differ.',
        answer: `<p>Variables A, B, C and D. Domains {red, green, blue}. Constraints: A ≠ B, B ≠ C, C ≠ D. One solution is A = red, B = green, C = red, D = green. A and C are not adjacent, so they may share a colour.</p>`
      },
      bridge: 'The model is written. Backtracking is the simplest complete way to search it.'
    },
    'backtracking': {
      teach: `<p>Backtracking assigns variables one at a time. After each assignment it checks the constraints. If a constraint is violated, it undoes the assignment and tries another value. If no value works, it returns to the previous variable. The algorithm is complete: if a solution exists, it finds one.</p>
<p>The search is a depth-first traversal of the assignment tree. Each level is one variable, and each branch is one value. A partial assignment that already violates a constraint is abandoned, along with every completion below it. Checking constraints as early as possible prunes large subtrees.</p>
<h4>Choosing the next variable</h4>
<p>The order matters. The <strong>minimum remaining values</strong> heuristic picks the variable with the fewest legal values left. It fails fast when a variable is tightly constrained. The <strong>degree</strong> heuristic breaks ties by choosing the variable involved in the most constraints on the remaining variables. The <strong>least constraining value</strong> heuristic orders values by how much freedom they leave for neighbours, which is useful once a variable is chosen.</p>
<h4>Forward checking</h4>
<p>After assigning a value, forward checking removes incompatible values from the domains of unassigned neighbours. If a domain becomes empty, the branch is dead immediately, without waiting for the search to reach that variable. This is a simple form of propagation, and it often cuts the tree dramatically.</p>
<div class="callout"><b>Completeness has a cost</b><p>Backtracking can visit an exponential number of nodes. The heuristics change the constant and sometimes the exponent in practice, but they do not remove the worst case.</p></div>
<p>Plain backtracking can also thrash: it rediscovers the same conflict many times because it does not remember why a branch failed. Conflict-directed backjumping and clause learning address that, but they are beyond this unit. The basic algorithm plus forward checking is enough to solve many puzzles.</p>`,
      work: `<ol class="steps"><li>A row needs digits 1 to 4 and already has 1 and 3. The empty cells can take 2 or 4.</li><li>Assign 2 to the first empty cell.</li><li>Forward checking removes 2 from the second cell, so it must be 4.</li><li>If a later constraint rejects the first 2, undo it and try 4. That forces 2 in the second cell.</li><li>The search returns to the last choice with an alternative. It does not restart from the beginning.</li></ol>`,
      practice: {
        q: 'Why does minimum remaining values usually reduce the search, even though it does not change the set of solutions?',
        hint: 'A variable with one legal value is forced.',
        answer: `<p>It chooses the most constrained variable first, so a failure appears near the top of the tree instead of after many irrelevant assignments. A variable with one legal value is forced, and a variable with zero values proves the branch dead immediately. Catching failure early prunes more of the tree.</p>`
      },
      bridge: 'Forward checking removes values after an assignment. Propagation turns that idea into a fixed-point process that runs before and during search.'
    },
    'propagation': {
      teach: `<p>Constraint propagation removes values that cannot appear in any solution. For a binary constraint, if one variable takes a value, every incompatible value disappears from its neighbour's domain. If a domain drops to one value, that value is assigned and the process repeats.</p>
<p><strong>Arc consistency</strong> is the standard local rule. For every pair of variables connected by a constraint, every remaining value in one domain must have at least one compatible value in the other. If a value has no partner, remove it. Removing a value can break the consistency of another arc, so the process repeats until nothing changes.</p>
<h4>AC-3</h4>
<p>AC-3 maintains a queue of arcs to check. When a value is removed from a domain, the arcs pointing to that domain are queued again. Each arc is checked until the queue is empty. The algorithm reaches a fixed point: no more values can be removed by this local rule. The cost is polynomial in the size of the constraint graph for binary constraints, which is a bargain compared with search.</p>
<h4>What propagation cannot do</h4>
<p>Arc consistency does not detect all inconsistencies. A network can be arc consistent and still have no solution. Stronger consistency, such as path consistency, catches more but costs more per step. Propagation is therefore a partner for search, not a replacement. On easy puzzles it may solve the problem outright; on hard ones it reduces the branching factor.</p>
<div class="callout"><b>Propagation is not guessing</b><p>It only removes values that have no compatible partner. If it leaves several candidates, the solver must search. The lack of a forced value is not evidence that no solution exists.</p></div>`,
      work: `<ol class="steps"><li>Region A takes red. Its neighbours B and C cannot take red.</li><li>B and C domains shrink from {red, green, blue} to {green, blue}.</li><li>B takes green. C loses green and becomes {blue}.</li><li>C is forced to blue without any search.</li><li>If a domain becomes empty, the current branch is inconsistent and the solver backtracks.</li></ol>`,
      practice: {
        q: 'A network is arc consistent. Does that prove it has a solution? Explain.',
        hint: 'Arc consistency checks pairs, not the whole network at once.',
        answer: `<p>No. Arc consistency means every remaining value has a compatible partner on each adjacent constraint, but a global combination of values may still violate a cycle of constraints. A network can be arc consistent and have no solution. Search is still needed to find an assignment or prove that none exists.</p>`
      },
      bridge: 'Backtracking and propagation build a solution from partial assignments. Local search starts with a complete assignment and repairs it.'
    },
    'local-search': {
      teach: `<p>Local search starts with a complete but imperfect assignment. It repeatedly changes one variable to reduce the number of violated constraints. The assignment stays complete at every step, so the method always has a candidate answer, even when it has not solved the problem.</p>
<p><strong>Min-conflicts</strong> picks a variable that is currently in conflict and assigns the value that minimises the number of conflicts after the change. Ties are broken at random. On many scheduling and n-queens problems, this simple rule is remarkably effective. It can solve million-queens instances that no systematic search could touch.</p>
<h4>Why it scales</h4>
<p>The method does not enumerate partial assignments. It evaluates a small number of candidate changes around the current assignment, which is cheap per step. It also does not need to prove optimality. That makes it a good fit for large problems where a good schedule matters more than a proof that no better one exists.</p>
<h4>Why it can fail</h4>
<p>Local search gives no completeness guarantee. It can stall in a local minimum where every single change makes things worse. It can cycle between assignments. Random restarts and sideways moves escape some traps, at the cost of time. It cannot prove that no solution exists, because failure to find one is not a proof.</p>
<div class="callout"><b>Choose the guarantee you need</b><p>If the problem must be solved or proved impossible, use a systematic method. If a good assignment is enough and the instance is huge, local search is often the practical choice.</p></div>`,
      work: `<ol class="steps"><li>Place eight queens, one per column, with rows chosen at random.</li><li>Count the attacking pairs. Suppose there are 12.</li><li>Pick a queen involved in an attack. Try each row in its column and count the conflicts after the move.</li><li>Move it to the row with the fewest conflicts. The total might fall from 12 to 10.</li><li>Repeat until zero attacks, or restart if the count stops improving.</li></ol>`,
      practice: {
        q: 'Why can local search not prove that a constraint problem has no solution?',
        hint: 'It only explores complete assignments reachable by single changes.',
        answer: `<p>It searches a sequence of complete assignments and stops when it finds one with zero violations. If it never finds one, it has shown only that this trajectory and these restarts failed, not that every assignment fails. A proof of impossibility requires a systematic exploration or a logical argument.</p>`
      },
      bridge: 'All three solvers depend on the model. The last concept is about getting the model right before tuning the solver.'
    },
    'csp-modelling': {
      teach: `<p>Most failures in applied constraint work are modelling failures. The solver returns no schedule, and the problem is that the model required every session to be in a different room, including sessions that never overlap. The solver was correct; the model was wrong.</p>
<p>Variables may be at the wrong level. Assigning each session a room is not enough if time is also a decision. Domains may be too wide, which makes search slow, or too narrow, which removes the real solution. Constraints may be missing, which admits invalid plans, or redundant, which slows the solver without adding information.</p>
<h4>Redundant constraints</h4>
<p>Adding a constraint that is implied by the others can make propagation stronger, because the solver sees the consequence directly. It can also add overhead. The trade needs testing. Symmetry breaking is a common example: if two rooms are identical, many assignments are equivalent, and a constraint that orders them removes duplicates without removing solutions.</p>
<h4>Validate the model</h4>
<p>Test the model on a known valid solution and a known impossible case. If it rejects the valid solution, a domain or constraint is too tight. If it accepts the impossible case, a constraint is missing. Do this before tuning the solver. A fast solver on a wrong model is worse than a slow solver on a right one.</p>
<div class="callout"><b>Model first, solve second</b><p>Write down what a solution means in the world, then check that the variables and constraints express exactly that. The algorithm cannot recover information the model omitted.</p></div>`,
      work: `<ol class="steps"><li>A timetable has sessions and rooms but no time variable.</li><li>The model accepts two sessions in the same room, because it never represents time.</li><li>Add a time variable for each session and a constraint that two sessions in the same room cannot share a time.</li><li>Test the revised model on a known valid schedule and on the invalid double-booking.</li><li>The invalid case is now rejected and the valid case is accepted. The model, not the solver, was the problem.</li></ol>`,
      practice: {
        q: 'A model accepts a schedule that double-books a room. Is the solver wrong? What would you check and change?',
        hint: 'The solver only enforces the constraints it was given.',
        answer: `<p>The solver is probably not wrong. The model is missing a constraint that forbids two sessions in the same room at the same time, or it has no time variable at all. Add the missing variable or constraint, then test the model on a known invalid schedule to confirm that it is rejected and on a known valid schedule to confirm that it is still accepted.</p>`
      },
      bridge: 'Unit 8 adds uncertainty. Instead of hard constraints, it reasons about probabilities and evidence.'
    }
  },
  closing: {
    teach: `<p>A constraint problem is variables, domains and constraints. Backtracking searches for a complete assignment and undoes failures. Propagation removes values that cannot work. Local search repairs a complete assignment without a completeness guarantee. The model decides how hard the problem is, so validate it on known cases before tuning the solver.</p>
<p>The next unit changes the nature of the knowledge. Instead of rules that are definitely true, it has probabilities that summarize uncertainty. The same graph idea returns: variables connected by influences, with tables instead of hard constraints.</p>`,
    problem: {
      q: 'A conference has 12 sessions, 5 rooms and 40 speakers. Some speakers cannot attend on certain days, and some sessions must not run at the same time. Write the variables, domains and the two most important constraints, then say how you would validate the model.',
      hint: 'A session needs a room and a time. Speakers create conflicts.',
      answer: `<p>Variables: one per session, with a domain of (room, time) pairs. Constraints: no two sessions share the same room and time; no speaker has two sessions at the same time. If a speaker is unavailable on a day, remove those times from that session's domain. Validate by taking a known feasible schedule and checking that the model accepts it, then take a schedule with a deliberate double booking or speaker clash and check that the model rejects it.</p>`
    }
  }
});
