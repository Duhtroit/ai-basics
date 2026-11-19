AIM.registerUnit({
  n: 9, hue: 285, short: 'State spaces',
  title: 'Turning a problem into a graph',
  weeks: 'Week 9',
  promise: 'Choose what belongs in a state, then describe the graph of every situation the agent could face.',
  minutes: 36,
  lectures: ['9.1 State space model', '9.2 The implicit state-space graph', '9.3 State space problem modelling', '9.4 The generic search algorithm'],
  concepts: [
    {
      id: 'state',
      title: 'What belongs in a state',
      prereqs: ['state-models'],
      usecase: 'A delivery robot must collect four parcels, manage a battery and avoid locked doors. Its camera sees the corridor. The camera frame is not enough to decide the next move, because the decision also depends on the parcels already collected and the charge left.',
      metaphor: {
        name: 'The snapshot',
        claim: 'A photograph of the room tells you where everything is, but not what you are carrying or how much battery remains. A useful snapshot includes those too.',
        mapping: [
          ['position in the photo', 'location', 'set coordinates'],
          ['parcels in hand', 'collected flags', 'toggle a parcel'],
          ['battery gauge', 'fuel level', 'set the charge'],
          ['locked doors', 'environment state', 'mark a door']
        ],
        widget: 'state-builder',
        lab: {
          title: 'Choose the fields',
          tryText: 'Tick the information a robot needs to finish the delivery. See which choices hide a needed fact.',
          notice: 'A missing field produces plans that look valid and fail on the next step.'
        }
      },
      idea: `<p>A <strong>state</strong> is the set of facts needed to decide what to do next. It must be sufficient: two situations with the same state must offer the same choices and lead to the same future. It should also be minimal, because every extra field multiplies the state space.</p>
<p>For the parcel robot, the state needs position, remaining charge and a flag for each parcel. It does not need the full path taken, the time of day, or the colour of the walls. Those facts do not change the available actions or the goal test.</p>
<p>Choosing a state is a modelling decision, and the right choice depends on the question. A state for navigation needs position. A state for delivery needs position plus what has been delivered. The next concepts turn these choices into a graph.</p>`,
      lecture: {
        ref: '9.1',
        source: 'Transcript, State space model',
        text: 'The lecturer defines a state as a snapshot. "If the state is well chosen, we do not need to remember the full history. The current state is enough."'
      },
      mechanics: {
        formula: 's = (x, y, fuel, c1, c2, c3, c4)',
        symbols: [
          ['s', 'the complete state tuple'],
          ['x, y', 'the robot position on the grid'],
          ['fuel', 'remaining charge'],
          ['c1 ... c4', 'whether each parcel has been collected']
        ],
        worked: 'A robot at (5, 8) with fuel 3, holding parcel 1 only, has state (5, 8, 3, true, false, false, false). Moving left changes x to 4 and fuel to 2. The parcel flags stay the same until the robot reaches a parcel.'
      },
      mechanism: {
        widget: 'state-builder',
        lab: {
          title: 'Build a state for the fuel grid',
          tryText: 'Add and remove fields, then try to finish the task. Watch which field the agent needs at the last step.',
          notice: 'The goal test only reads some fields. The transition function reads the rest.'
        }
      },
      breaks: 'A state that is too small loses information and produces invalid plans. A state that is too large explodes the search. Continuous state, such as exact position, needs discretisation or a different method. Partial observability needs a belief state, not a single state.',
      check: [
        {
          q: 'What must a state include?',
          options: ['Every event since the start', 'Everything needed for the next decision', 'Only the current position', 'The full map'],
          answer: 1,
          explain: 'Sufficiency for future decisions defines the state. History that does not affect the future is left out.'
        },
        {
          q: 'Why is an oversized state a problem?',
          options: ['It is harder to print', 'It multiplies the number of states the search must consider', 'It breaks the goal test', 'It removes actions'],
          answer: 1,
          explain: 'Every extra field multiplies the state count, which increases search cost.'
        }
      ],
      connection: {
        prompt: 'The state and the goal test are related. Which fields does the goal test read?',
        a: 'State fields', b: 'Goal test',
        options: [
          { label: 'Only the fields the goal depends on', ok: true },
          { label: 'Every field', ok: false },
          { label: 'No fields', ok: false },
          { label: 'The full history', ok: false }
        ],
        explain: 'The goal test ignores position and fuel in the parcel task. Only the collected flags matter.'
      },
      recap: [
        'A state is the information needed for the next decision.',
        'It should be sufficient and no larger than necessary.',
        'Missing fields hide facts and oversized fields explode the search.'
      ],
      now: 'You can now design a state for a task and justify each field.'
    },
    {
      id: 'state-space',
      title: 'The state space',
      prereqs: ['state'],
      usecase: 'A robot in a building can be in thousands of positions. A planner needs to reason about all of them at once, including which moves connect which positions and where the goal lies.',
      metaphor: {
        name: 'The map of all places',
        claim: 'Every place you could stand becomes a dot. Every road between two places becomes a line. Finding a route is finding a path on that map.',
        mapping: [
          ['a place', 'state', 'inspect a node'],
          ['a road', 'transition', 'follow an edge'],
          ['the destination', 'goal state', 'mark the goal']
        ],
        widget: 'graph-explore',
        lab: {
          title: 'Grow the graph from the grid',
          tryText: 'Start at the entrance and expand reachable cells. Watch the grid become a graph.',
          notice: 'The graph is not stored anywhere. It is generated from the grid as you go.'
        }
      },
      idea: `<p>The <strong>state space</strong> is the set of all states reachable from the start. A <strong>transition</strong> connects one state to another through an action. The result is a directed graph, often with costs on the edges.</p>
<p>The state space is usually too large to write down. A grid of 100 by 100 cells with a fuel level and four parcels already has millions of states. The search generates only the part it visits, which is why the graph is described as implicit.</p>
<p>A path is a sequence of states connected by transitions. A solution is a path from the start to a goal. The cost of a path is the sum of its edge costs, and the shortest path is the one with the lowest cost.</p>`,
      lecture: {
        ref: '9.2',
        source: 'Transcript, The implicit state-space graph',
        text: 'The lecturer draws states as nodes and actions as edges. "The whole problem becomes a graph. We start at the initial state and search for a path to a goal state."'
      },
      mechanics: {
        formula: 'G = (S, A, T, cost), with start s0 and goal set G*',
        symbols: [
          ['G', 'the graph of states and transitions'],
          ['G*', 'the goal set'],
          ['S', 'the set of states'],
          ['A', 'the set of actions'],
          ['T', 'the transition function from state and action to state'],
          ['cost', 'the cost of each transition'],
          ['s0', 'the start state']
        ],
        worked: 'A 3 by 3 grid with moves up, down, left and right has 9 states and 12 undirected edges. Adding a fuel level from 0 to 3 multiplies the state count by 4. Adding four collected flags multiplies it by 16. The graph is now 576 states, generated only when needed.'
      },
      mechanism: {
        widget: 'graph-explore',
        lab: {
          title: 'Add a dimension',
          tryText: 'Turn on fuel and parcels, then expand from the start. Compare the number of reachable states.',
          notice: 'Each new field multiplies the graph. Search cost follows the graph.'
        }
      },
      breaks: 'The state space can be infinite when a state variable is unbounded, such as time. Cycles create infinitely many paths to the same state unless the search tracks visited states. Continuous actions require discretisation or sampling.',
      check: [
        {
          q: 'What is an edge in the state space?',
          options: ['A goal test', 'A transition produced by an action', 'A cost function', 'A heuristic'],
          answer: 1,
          explain: 'Edges connect states that an action can move between.'
        },
        {
          q: 'Why is the state-space graph called implicit?',
          options: ['It is hidden from the user', 'It is generated as needed rather than stored in full', 'It has no edges', 'It changes every run'],
          answer: 1,
          explain: 'The graph is defined by a transition function. Only visited states are materialised.'
        }
      ],
      connection: {
        prompt: 'The state space turns which earlier idea into a graph?',
        a: 'State model', b: 'Graph',
        options: [
          { label: 'States become nodes, actions become edges', ok: true },
          { label: 'Actions become nodes', ok: false },
          { label: 'Goals become edges', ok: false },
          { label: 'Costs become nodes', ok: false }
        ],
        explain: 'The graph is the state model written out: nodes for states, edges for transitions.'
      },
      recap: [
        'The state space is the graph of reachable states and transitions.',
        'It is generated on demand, not stored in full.',
        'A solution is a path, and its cost is the sum of edge costs.'
      ],
      now: 'You can now describe a problem as a state graph and estimate its size.'
    },
    {
      id: 'modelling-grid',
      title: 'Modelling the fuel and parcel grid',
      prereqs: ['state-space'],
      usecase: 'The lecture example has a grid, walls, four parcels, a fuel station and a limited tank. The agent must collect all parcels without running out of fuel. The model must encode every rule the agent can break.',
      metaphor: {
        name: 'Packing for a trip with a fuel gauge',
        claim: 'You can drive only as far as the tank allows. Picking up a parcel changes what you carry, and the station refills the tank.',
        mapping: [
          ['the tank', 'fuel variable', 'spend one unit per move'],
          ['a parcel', 'collected flag', 'set it when reached'],
          ['the station', 'refuel action', 'refill to maximum'],
          ['the wall', 'blocked transition', 'remove the move']
        ],
        widget: 'state-builder',
        lab: {
          title: 'Model the grid rules',
          tryText: 'Turn walls, fuel and parcels on one at a time. Try to reach the goal after each change.',
          notice: 'Each rule changes the legal transitions, and the search answers a different question.'
        }
      },
      idea: `<p>Modelling starts with the decisions the agent makes: move one cell, or refuel. Then come the state variables those decisions affect. Position changes with every move, fuel decreases, and a parcel flag flips when the robot enters its cell.</p>
<p>The goal test reads only the parcel flags. The path cost counts steps, or fuel spent. The transition function rejects moves into walls, moves that would take fuel below zero, and refuelling anywhere except the station.</p>
<p>A good model makes invalid actions impossible rather than merely expensive. If a move into a wall is legal but costly, the search may still choose it. If it is absent from the action set, the search cannot.</p>`,
      lecture: {
        ref: '9.3',
        source: 'Transcript, State space problem modelling',
        text: 'The lecturer works through the grid and asks what a state must contain. "We need the position, the fuel, and for each coin whether we have collected it. Then the goal is when all four are true."'
      },
      mechanics: {
        formula: 'moves(s) = neighbours not blocked, if fuel > 0',
        symbols: [
          ['s', 'the current state'],
          ['neighbours', 'the four adjacent cells'],
          ['blocked', 'a wall or a locked door'],
          ['fuel', 'the remaining charge']
        ],
        worked: 'At (5, 8) with fuel 3, the legal moves are the open neighbours. Moving to (5, 7) produces (5, 7, 2, flags). Moving into a wall produces nothing. At the station, the refuel action produces the same position with fuel 20. The goal is reached when all four flags are true, wherever the robot stands.'
      },
      mechanism: {
        widget: 'state-builder',
        lab: {
          title: 'Break the model',
          tryText: 'Allow moves with zero fuel and see what the planner does. Then restore the rule.',
          notice: 'A missing precondition produces a plan the real robot cannot execute.'
        }
      },
      breaks: 'The model can be wrong in either direction: missing preconditions allow impossible plans, and extra ones remove valid plans. Fuel as a discrete count is an approximation. A continuous battery would need a different state representation.',
      check: [
        {
          q: 'Which fact belongs in the state for this grid?',
          options: ['The colour of the walls', 'The fuel remaining', 'The time of day', 'The number of steps taken'],
          answer: 1,
          explain: 'Fuel changes which moves are legal, so it affects future decisions. The step count does not.'
        },
        {
          q: 'Why make an invalid move impossible instead of expensive?',
          options: ['It is faster to type', 'The search may still choose an expensive illegal move', 'It changes the goal', 'It removes the need for a heuristic'],
          answer: 1,
          explain: 'Cost only ranks options. Removing the action from the legal set prevents it entirely.'
        }
      ],
      connection: {
        prompt: 'The goal test and the state design must agree. What happens if the goal reads a field that is not in the state?',
        a: 'Goal test', b: 'State fields',
        options: [
          { label: 'The goal cannot be evaluated correctly', ok: true },
          { label: 'The search becomes faster', ok: false },
          { label: 'The state space shrinks', ok: false },
          { label: 'Nothing changes', ok: false }
        ],
        explain: 'A goal test can only read what the state records. A missing field makes the goal undecidable.'
      },
      recap: [
        'Model the actions, then the state variables they change.',
        'Goal tests read a subset of the state.',
        'Illegal moves should be absent, not merely costly.'
      ],
      now: 'You can now write the transition rules for a grid problem and check them against the goal.'
    },
    {
      id: 'implicit-graph',
      title: 'The implicit graph',
      prereqs: ['modelling-grid'],
      usecase: 'A chess engine cannot store every position. There are more positions than atoms in the observable universe. It generates the legal moves from the current position and explores only what it needs.',
      metaphor: {
        name: 'The recipe, not the meals',
        claim: 'A cookbook does not contain every possible dinner. It contains rules that generate a dinner from ingredients. The graph is the cookbook, not the meals.',
        mapping: [
          ['the recipe', 'transition function', 'apply an action'],
          ['a dinner', 'state', 'generate a child'],
          ['the pantry', 'current state', 'read the fields']
        ],
        widget: 'graph-explore',
        lab: {
          title: 'Generate instead of store',
          tryText: 'Expand nodes one at a time. The counter shows how many states exist versus how many you have visited.',
          notice: 'The visited set is small. The reachable set is enormous.'
        }
      },
      idea: `<p>An <strong>implicit graph</strong> is defined by a start state and a function that returns the successors of any state. Nothing else is stored. The search calls the function when it needs the neighbours of a node.</p>
<p>This is the only practical representation for large problems. A grid with 10,000 cells and a fuel variable has millions of states, but the search may visit a few thousand. Generating on demand keeps memory proportional to the visited set.</p>
<p>The trade is that the search cannot see the whole graph in advance. It cannot compute a perfect heuristic from the full structure, and it may revisit a state unless it tracks what it has seen.</p>`,
      lecture: {
        ref: '9.2',
        source: 'Transcript, The implicit state-space graph',
        text: 'The lecturer explains that the graph is defined by the rules, not drawn in advance. "We do not store all the states. We generate the successors when we need them."'
      },
      mechanics: {
        formula: 'successors(s) = { T(s, a) for a in actions(s) }',
        symbols: [
          ['s', 'the current state'],
          ['actions(s)', 'the legal actions in s'],
          ['T', 'the transition function'],
          ['successors', 'the set of next states']
        ],
        worked: 'A grid state has at most four successors. The function checks each neighbour, rejects walls, and subtracts fuel. Calling it on the start state produces the first layer of the search tree without enumerating the other million states.'
      },
      mechanism: {
        widget: 'graph-explore',
        lab: {
          title: 'Watch the visited set grow',
          tryText: 'Expand breadth first and compare visited states with reachable states.',
          notice: 'The visited set grows with the search, not with the problem size.'
        }
      },
      breaks: 'An implicit graph makes it easy to revisit states, so a visited set is essential for graph search. It also hides global structure that a distance estimate could use. And if the successor function is expensive, the search pays that cost at every expansion.',
      check: [
        {
          q: 'What defines an implicit graph?',
          options: ['A stored adjacency list', 'A start state and a successor function', 'A distance matrix', 'A list of all goals'],
          answer: 1,
          explain: 'The graph is generated from the rules, so the start state and the successor function are enough.'
        },
        {
          q: 'Why is a visited set needed in graph search?',
          options: ['To store the graph', 'To avoid expanding the same state twice', 'To compute the heuristic', 'To sort the goals'],
          answer: 1,
          explain: 'Implicit graphs contain cycles and multiple paths to the same state. Tracking visited states prevents repeated work.'
        }
      ],
      connection: {
        prompt: 'The implicit graph saves memory. What does it cost?',
        a: 'Implicit graph', b: 'Trade',
        options: [
          { label: 'Global structure is unavailable without expanding', ok: true },
          { label: 'It cannot represent grids', ok: false },
          { label: 'It needs more memory than a full graph', ok: false },
          { label: 'It removes cycles', ok: false }
        ],
        explain: 'You only see the part you generate, so heuristics cannot use the whole graph unless you compute them separately.'
      },
      recap: [
        'An implicit graph is a start state plus a successor function.',
        'Memory scales with the visited set, not the whole problem.',
        'Graph search needs a visited set to handle cycles.'
      ],
      now: 'You can now explain why large problems are searched without storing the graph.'
    },
    {
      id: 'framework',
      title: 'The generic search framework',
      prereqs: ['implicit-graph'],
      usecase: 'The searches in this unit share almost all their code. They differ only in which node they pick from the queue. A framework captures the shared part once.',
      metaphor: {
        name: 'The ticket desk',
        claim: 'A clerk serves the next person from a queue. Which person is next depends on the policy: first come, shortest job, or highest priority.',
        mapping: [
          ['the queue', 'frontier', 'add and remove nodes'],
          ['a person', 'partial path', 'expand a node'],
          ['the policy', 'queue order', 'choose the next node'],
          ['served', 'visited set', 'mark as done']
        ],
        widget: 'framework-step',
        lab: {
          title: 'Swap the queue policy',
          tryText: 'Run the same graph with a stack, a FIFO queue and a priority queue. Compare the expansion order.',
          notice: 'The skeleton is identical. The data structure decides the algorithm.'
        }
      },
      idea: `<p>Every systematic search keeps a <strong>frontier</strong> of partial paths. It repeatedly removes one node, checks whether it is a goal, and adds its successors. A visited set prevents re-expansion.</p>
<p>The choice of which node to remove defines the strategy. A stack gives depth-first search. A first-in first-out queue gives breadth-first search. A priority queue ordered by path cost gives uniform cost search, and adding a heuristic gives A star.</p>
<p>The framework makes the differences visible. It also shows the shared requirements: a successor function, a goal test, a cost model and a way to avoid cycles. The next unit fills in the policies.</p>`,
      lecture: {
        ref: '9.4',
        source: 'Transcript, The generic search algorithm',
        text: 'The lecturer writes one loop and changes only the queue. "The algorithms you will see are the same algorithm with a different data structure for the frontier."'
      },
      mechanics: {
        formula: 'loop: pop node, goal test, expand, push successors',
        symbols: [
          ['pop', 'remove the next node from the frontier'],
          ['goal test', 'check whether the node ends a solution'],
          ['expand', 'generate the successors'],
          ['push', 'add successors to the frontier']
        ],
        worked: 'Start with the start node in the frontier. Pop it, find it is not the goal, and push its three neighbours. With a stack, the last neighbour is popped next. With a queue, the first neighbour is popped next. Same nodes, different order.'
      },
      mechanism: {
        widget: 'framework-step',
        lab: {
          title: 'Instrument the loop',
          tryText: 'Step one iteration at a time. Watch the frontier, the visited set and the expansion order.',
          notice: 'The frontier contents are the whole difference between the algorithms.'
        }
      },
      sandbox: {
        widget: 'framework-step',
        lab: {
          title: 'Write a policy',
          tryText: 'Choose an ordering rule and run it. See whether it is complete and whether it finds the cheapest path.',
          notice: 'Any ordering rule is a search algorithm. Only some of them have guarantees.'
        }
      },
      breaks: 'The framework assumes the successors are finite and the graph is searchable. It says nothing about optimality, which depends on the policy and the costs. It also ignores memory: a priority queue can grow very large before the goal appears.',
      check: [
        {
          q: 'What does the frontier hold?',
          options: ['All visited states', 'Partial paths waiting to be expanded', 'The goal states', 'The costs'],
          answer: 1,
          explain: 'The frontier is the set of nodes generated but not yet expanded.'
        },
        {
          q: 'Which part changes between BFS and UCS?',
          options: ['The successor function', 'The goal test', 'The order nodes leave the frontier', 'The state definition'],
          answer: 2,
          explain: 'Both use the same loop. BFS uses a FIFO queue, UCS uses a priority queue by cost.'
        }
      ],
      connection: {
        prompt: 'The framework needs a way to avoid revisiting states. Which earlier concept explains why?',
        a: 'Visited set', b: 'Reason',
        options: [
          { label: 'Implicit graphs contain cycles and repeated states', ok: true },
          { label: 'The frontier is too small', ok: false },
          { label: 'Costs are negative', ok: false },
          { label: 'Goals are unknown', ok: false }
        ],
        explain: 'Without a visited set, a cycle can cause infinite expansion.'
      },
      recap: [
        'Search is one loop with a frontier, a goal test and a visited set.',
        'The frontier policy defines the algorithm.',
        'Completeness and optimality depend on that policy, not the loop.'
      ],
      now: 'You can now read any search algorithm as a queue policy on one shared loop.'
    }
  ],
  test: [
    {
      q: 'What makes a state well chosen?',
      options: ['It records all history', 'It contains exactly what future decisions need', 'It has many fields', 'It includes the goal'],
      answer: 1,
      explain: 'Sufficiency and minimality are the two criteria.'
    },
    {
      q: 'What is a transition?',
      options: ['A goal test', 'A move from one state to another through an action', 'A cost', 'A heuristic'],
      answer: 1,
      explain: 'The transition function maps a state and action to the next state.'
    },
    {
      q: 'Why is the state-space graph implicit?',
      options: ['It is generated on demand', 'It is invisible', 'It has no costs', 'It is a tree'],
      answer: 0,
      explain: 'Only visited states are materialised in memory.'
    },
    {
      q: 'Which fact belongs in the parcel robot state?',
      options: ['Wall colour', 'Which parcels are collected', 'Time of day', 'Number of steps'],
      answer: 1,
      explain: 'Collected parcels affect the goal and the remaining plan.'
    },
    {
      q: 'Why should an illegal move be absent from the action set?',
      options: ['To make the code shorter', 'Cost alone may still let the search choose it', 'To reduce the state count', 'To remove the goal test'],
      answer: 1,
      explain: 'Illegal actions must be impossible, not merely expensive.'
    },
    {
      q: 'What does a visited set prevent?',
      options: ['Re-expanding the same state', 'Computing costs', 'Defining goals', 'Generating successors'],
      answer: 0,
      explain: 'Cycles and multiple paths can revisit states, so the set avoids duplicate work.'
    },
    {
      q: 'In the generic framework, BFS uses which frontier?',
      options: ['A stack', 'A FIFO queue', 'A priority queue by cost', 'A random list'],
      answer: 1,
      explain: 'First in, first out gives level-by-level expansion.'
    },
    {
      q: 'What does the framework not guarantee on its own?',
      options: ['That a loop terminates', 'Optimality of the solution', 'That successors exist', 'That the goal test runs'],
      answer: 1,
      explain: 'Optimality depends on the frontier policy and the costs.'
    }
,
    {
      type: 'numeric',
      q: 'A robot moves on a 10 by 10 grid. Ignoring obstacles, how many distinct cell states are there?',
      answer: 100,
      tolerance: 0.001,
      explain: 'Ten rows times ten columns gives 100 cells. Each cell is one state when position is the whole state.'
    },
    {
      type: 'ordering',
      q: 'Order the steps of the generic search framework.',
      items: [
        'Put the start state in the frontier',
        'Pop a state from the frontier',
        'Test whether it is a goal',
        'Expand it and add the successors to the frontier',
        'Repeat until the frontier is empty or a goal is found'
      ],
      explain: 'The frontier policy is the only part that changes between BFS, UCS and A star.'
    },
    {
      type: 'error',
      q: 'A parcel robot must deliver parcels and track which ones it has collected. One step in the model is wrong. Which one?',
      steps: [
        'The robot must deliver parcels and track which ones it has collected.',
        'State: the robot position only.',
        'Actions: move to an adjacent cell.',
        'Goal: every parcel delivered.'
      ],
      answer: 1,
      explain: 'Position alone cannot tell which parcels are aboard. The collected set belongs in the state, or the search repeats deliveries and loses track.'
    },
    {
      type: 'short',
      q: 'Why should an illegal move be left out of the action set rather than given a high cost?',
      rubric: [
        'Notes that a cost still leaves the move available',
        'Mentions that search may take it when alternatives look worse',
        'Connects the action set to correctness, not only to speed'
      ],
      model: 'A cost is a preference, not a ban. A search that minimises cost can still choose an illegal move when every legal option is expensive. Removing the move from the action set makes the illegal state unreachable and keeps the solution correct.',
      explain: 'Constraints belong in the model. Cost is for trade-offs among allowed actions.'
    }
  ],
  connections: [
    {
      prompt: 'Link the search component to its job.',
      a: 'Component', b: 'Job',
      options: [
        { label: 'Frontier: holds partial paths', ok: true },
        { label: 'Visited set: holds goals', ok: false },
        { label: 'Successor function: stores the graph', ok: false },
        { label: 'Goal test: orders the frontier', ok: false }
      ],
      explain: 'The frontier holds candidates, the visited set prevents repeats, the successor function generates, and the goal test decides.'
    }
  ],
  pairs: [
    {
      a: 'A state', b: 'An action',
      claim: 'Both are nodes in the state-space graph.',
      same: false,
      explain: 'States are nodes. Actions label the edges between them.'
    },
    {
      a: 'BFS', b: 'UCS',
      claim: 'Both expand the frontier in order of path cost.',
      same: false,
      explain: 'BFS uses a FIFO queue and expands by depth. UCS orders by path cost.'
    },
    {
      a: 'An implicit graph', b: 'An explicit graph',
      claim: 'Both can be searched with the same framework.',
      same: true,
      explain: 'The framework only needs a way to list successors. Whether the graph is stored or generated changes nothing else.'
    }
  ],
  map: {
    nodes: [
      { id: 'state', label: 'State', x: 12, y: 24 },
      { id: 'space', label: 'State space', x: 34, y: 16 },
      { id: 'model', label: 'Model', x: 32, y: 62 },
      { id: 'implicit', label: 'Implicit graph', x: 58, y: 26 },
      { id: 'frame', label: 'Framework', x: 80, y: 18 },
      { id: 'frontier', label: 'Frontier', x: 70, y: 62 }
    ],
    edges: [
      ['state', 'space', 'nodes of'],
      ['model', 'space', 'defines transitions'],
      ['space', 'implicit', 'generated on demand'],
      ['implicit', 'frame', 'searched by'],
      ['frame', 'frontier', 'policy lives here']
    ]
  }
});
