AIM.registerTeach({
  n: 9,
  opening: `<p>Unit 9 turns a problem into a graph. The nodes are states, the edges are actions, and a solution is a path from the start to a goal. The graph is usually too large to write down, so the search generates only the part it visits.</p>
<p>The unit starts with the hardest question: what belongs in a state? A state that omits something important produces plans that fail. A state that includes everything explodes the search. The answer is the smallest set of facts that determines the next decision. The rest of the unit builds the state space, models a concrete grid, represents the graph implicitly, and states the shared search loop.</p>
<p>This is the foundation for Unit 10. If the state is wrong, no search algorithm will save the plan. Read the modelling concepts with a pencil and write the tuples down.</p>`,
  concepts: {
    'state': {
      teach: `<p>A state is the set of facts needed to decide what to do next. It must be <strong>sufficient</strong>: two situations with the same state must offer the same choices and lead to the same future. It should also be <strong>minimal</strong>: every extra field multiplies the number of states, so a field that does not change any decision is a cost without a benefit.</p>
<p>For a delivery robot, position, remaining charge and a flag for each parcel are enough. The full path travelled, the time of day and the colour of the walls are not. The path does not change the available moves; the time of day might, but only if the problem includes opening hours; the wall colour never does.</p>
<h4>State is a modelling choice</h4>
<p>The same world can be modelled with different states for different questions. A navigation task needs position. A delivery task needs position plus what has been delivered. A task that cares about the route taken needs the path itself, or enough information to reconstruct it. There is no single correct state independent of the question.</p>
<p>A state can be a tuple, a record, a set of facts or a compact encoding. The representation matters for memory and speed, but the modelling question comes first: which facts change the future? If two histories lead to the same future, they can share a state.</p>
<h4>Partial observability</h4>
<p>If the agent cannot see the full state, a single state is not enough. It needs a <strong>belief state</strong>, a distribution or set of possible states consistent with what it has observed. That is a different problem, and this course does not develop it beyond the definition. The grid examples assume full observability.</p>
<div class="callout"><b>Test sufficiency</b><p>Take two situations with the same proposed state. If they offer different actions, a different goal test or a different cost, the state is missing something.</p></div>`,
      work: `<ol class="steps"><li>A robot is at (5, 8), has fuel 3 and carries parcel 1 only.</li><li>The state tuple is <code>(5, 8, 3, true, false, false, false)</code>.</li><li>Moving left changes the position to (4, 8) and the fuel to 2. The parcel flags stay the same.</li><li>Entering parcel 2's cell flips its flag to true.</li><li>Two histories that reach the same tuple have the same available moves, so the state is sufficient for the delivery question.</li></ol>`,
      practice: {
        q: 'A chess engine needs to know whether a position can be claimed as a draw by threefold repetition. Does the board alone suffice as the state? What must be added?',
        hint: 'The same board can be reached with different histories.',
        answer: `<p>The board alone does not suffice, because the draw rule depends on how many times the same position has occurred. The state needs the board, the side to move, castling and en passant rights, and a count of previous occurrences of the position. The full move history is one way to represent that, but a compact repetition count is enough for the decision.</p>`
      },
      bridge: 'A state is one node. The state space is all states reachable from the start, connected by actions.'
    },
    'state-space': {
      teach: `<p>The state space is the set of all states reachable from the start. A transition connects one state to another through an action. The result is a directed graph, often with costs on the edges. A path is a sequence of states connected by transitions, and a solution is a path from the start to a goal.</p>
<p>The graph is usually too large to write down. A 100 by 100 grid already has 10,000 positions. Add a fuel level from 0 to 20 and four parcel flags and the count reaches millions. The search generates only the part it visits, which is why the graph is described as implicit.</p>
<h4>Costs</h4>
<p>Each edge can carry a cost. The cost of a path is the sum of its edge costs. The shortest path is the one with the lowest cost, not necessarily the fewest edges. Unit 10 distinguishes breadth-first search, which counts edges, from uniform cost search, which minimises cost.</p>
<h4>Cycles and reachability</h4>
<p>A graph can contain cycles. Without a visited set, a search can loop forever, generating the same state again and again. The visited set records states that have been expanded, so the search does not repeat them. Reachability is the question of whether a path exists at all; a search answers it by exploring until it finds the goal or exhausts the reachable states.</p>
<div class="callout"><b>The graph is generated</b><p>Do not confuse the state space with a data structure in memory. The search builds a small part of it as it goes. The full graph may be astronomically large.</p></div>`,
      work: `<ol class="steps"><li>A 3 by 3 grid has 9 positions and 12 undirected edges between adjacent cells.</li><li>Add a fuel level from 0 to 3. The state count becomes <code>9 × 4 = 36</code>.</li><li>Add four parcel flags. The count becomes <code>36 × 16 = 576</code>.</li><li>The graph is not stored in full. The search generates the neighbours of the states it visits.</li><li>A path is a sequence such as start, move right, move up, collect parcel. Its cost is the sum of the move costs.</li></ol>`,
      practice: {
        q: 'A grid has 50 by 50 cells and a fuel level from 0 to 10. How many states are there before parcel flags, and why does the search not store them all?',
        hint: 'Multiply the cells by the fuel values.',
        answer: `<p>There are <code>2,500 × 11 = 27,500</code> states. The search stores only the states it expands and the frontier, not the whole graph. Generating a state's neighbours on demand keeps memory proportional to the visited set rather than to the full state space.</p>`
      },
      bridge: 'The abstract graph is clear. The next concept writes down a concrete model with walls, fuel, parcels and a goal test.'
    },
    'modelling-grid': {
      teach: `<p>The lecture example has a grid, walls, four parcels, a fuel station and a limited tank. The agent must collect all parcels without running out of fuel. The model has to encode every rule the agent can break.</p>
<p>Start with the decisions: move one cell in a direction, or refuel at the station. Then list the state variables those decisions affect. Position changes with every move. Fuel decreases with every move. A parcel flag flips when the robot enters its cell. The goal test reads only the parcel flags.</p>
<h4>Preconditions</h4>
<p>A move into a wall is illegal. A move that would take fuel below zero is illegal. Refuelling is legal only at the station. A good model makes illegal actions impossible rather than merely expensive. If a move into a wall is legal but costs a lot, the search may still choose it. If it is absent from the action set, the search cannot.</p>
<p>The transition function updates the state. After a move, the position changes, the fuel decreases and any parcel on the new cell is collected. Refuelling sets the fuel to the tank capacity and leaves the position unchanged. The cost of a move can be one step, or the fuel spent, depending on what the question asks.</p>
<div class="callout"><b>Goal test, not goal path</b><p>The goal is a condition on the state, such as all four parcel flags true. It does not name a particular cell. The robot can finish anywhere once the parcels are collected.</p></div>`,
      work: `<ol class="steps"><li>State: <code>(x, y, fuel, c1, c2, c3, c4)</code>.</li><li>At (5, 8) with fuel 3 and no parcels, the legal moves are the open neighbours.</li><li>Moving to (5, 7) produces <code>(5, 7, 2, flags)</code>.</li><li>Moving into a wall produces no successor. Refuelling at the station produces the same position with fuel 20.</li><li>The goal is reached when all four flags are true, wherever the robot stands.</li></ol>`,
      practice: {
        q: 'Why is it better to remove an illegal move from the action set than to give it a large cost?',
        hint: 'A large cost can still be the cheapest option in some state.',
        answer: `<p>A large cost still leaves the move available, so the search may choose it if every alternative is worse, and the resulting plan is invalid. Removing the move makes the model correct by construction. The search then explores only plans that satisfy the preconditions.</p>`
      },
      bridge: 'The model defines successors. The search does not store the whole graph; it calls the successor function when it needs neighbours.'
    },
    'implicit-graph': {
      teach: `<p>An implicit graph is defined by a start state and a function that returns the successors of any state. Nothing else is stored. The search calls the function when it needs the neighbours of a node. This is the only practical representation for large problems.</p>
<p>A chess engine cannot store every position. It generates the legal moves from the current position and explores only what it needs. A grid with a fuel variable has millions of states, but the search may visit a few thousand. Generating on demand keeps memory proportional to the visited set.</p>
<h4>The trade</h4>
<p>The search cannot see the whole graph in advance. It cannot compute a perfect heuristic from the full structure, and it may revisit a state unless it tracks what it has seen. The successor function must be correct: if it misses a legal action, the search may fail to find a solution; if it invents an illegal one, the plan may be invalid.</p>
<p>An implicit graph also makes the cost of the successor function part of the search cost. If generating neighbours is expensive, the search pays that cost at every expansion. A good representation makes the function cheap.</p>
<div class="callout"><b>Visited set is essential</b><p>With cycles, a graph search without a visited set can loop forever. The visited set records expanded states and prevents re-expansion.</p></div>`,
      work: `<ol class="steps"><li>The start state is the robot's initial tuple.</li><li>Call <code>successors(start)</code>. It checks the four neighbours, rejects walls, subtracts fuel and returns the legal next states.</li><li>Do not enumerate the other million states. Generate only the neighbours of the nodes the search expands.</li><li>Add each generated state to the frontier and, when expanded, to the visited set.</li><li>If a state is generated again by a different path, the visited set prevents a second expansion.</li></ol>`,
      practice: {
        q: 'What goes wrong if a search on an implicit graph has no visited set, and what is the minimal fix?',
        hint: 'Grid moves can return to the previous cell.',
        answer: `<p>The search can revisit the same state through a cycle, expanding it again and again, which may never terminate. The minimal fix is a visited set of expanded states. When a successor is already in the set, skip it. For weighted graphs, a better-path check may also be needed.</p>`
      },
      bridge: 'The graph is implicit. The framework is one loop that works for every search strategy; only the frontier policy changes.'
    },
    'framework': {
      teach: `<p>Every systematic search keeps a <strong>frontier</strong> of partial paths. It repeatedly removes one node, checks whether it is a goal, and adds its successors. A visited set prevents re-expansion. The choice of which node to remove defines the strategy.</p>
<p>A stack gives depth-first search. A first-in first-out queue gives breadth-first search. A priority queue ordered by path cost gives uniform cost search. Adding a heuristic gives A star. The loop is the same; only the policy changes. That is why Unit 10 can present several algorithms as variations on one framework.</p>
<h4>What the framework needs</h4>
<p>A successor function, a goal test, a cost model and a way to avoid cycles. The successor function defines the graph. The goal test recognises a solution. The cost model ranks paths. The visited set keeps the search finite on graphs with cycles.</p>
<p>The framework does not guarantee completeness or optimality. Those properties depend on the policy and the costs. Breadth-first search is complete on finite graphs and optimal for equal costs; uniform cost search is optimal for non-negative costs; A star is optimal with an admissible heuristic. The loop itself guarantees none of that.</p>
<div class="callout"><b>Tree search versus graph search</b><p>Tree search does not track visited states and can revisit them. Graph search adds the visited set. Most practical searches are graph searches.</p></div>`,
      work: `<ol class="steps"><li>Put the start node in the frontier.</li><li>Pop a node according to the policy.</li><li>If it is a goal, return the path.</li><li>Otherwise expand it: generate its successors, skip visited states, and push the rest.</li><li>Repeat until the frontier is empty. With a stack the last successor is popped next; with a queue the first is popped next.</li></ol>`,
      practice: {
        q: 'Two searches use the same loop and the same graph. One uses a stack, the other a queue. Which properties can differ, and which are shared?',
        hint: 'The data structure changes the order, not the graph.',
        answer: `<p>The order of expansion differs, so completeness, optimality and memory can differ. Depth-first search can go down an infinite branch and is not optimal; breadth-first search is complete on finite graphs and optimal for equal costs but uses more memory. The successor function, goal test and graph are shared. The policy is the source of the difference.</p>`
      },
      bridge: 'Unit 10 fills in the policies: breadth-first, uniform cost and A star.'
    }
  },
  closing: {
    teach: `<p>A search problem is a state definition, a start, a goal test, a successor function and a cost. The state must be sufficient and minimal. The state space is the graph of reachable states, generated on demand rather than stored in full. The search framework is one loop over a frontier, with a visited set to handle cycles. The frontier policy is the algorithm.</p>
<p>The modelling decisions come first. If the state omits the battery, the plan fails. If the goal test reads the wrong field, the search finds the wrong thing. Unit 10 assumes the model is right and compares strategies for exploring it.</p>`,
    problem: {
      q: 'A robot on a 20 by 20 grid has a battery from 0 to 10 and must collect three parcels. Write the state tuple, the goal test and one precondition that must be part of the successor function.',
      hint: 'Position, fuel and three flags; the goal reads the flags.',
      answer: `<p>State: <code>(x, y, fuel, c1, c2, c3)</code>, with <code>x</code> and <code>y</code> from 1 to 20, fuel from 0 to 10, and each flag true or false. Goal: <code>c1 and c2 and c3</code>. A precondition: a move is legal only if the destination is not a wall and the fuel after the move is at least zero. Refuelling is legal only at the station.</p>`
    }
  }
});
