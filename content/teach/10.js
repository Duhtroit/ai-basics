AIM.registerTeach({
  n: 10,
  opening: `<p>Unit 9 built the graph. Unit 10 chooses how to explore it. The three searches in this unit share the same loop: pop a node from the frontier, test for the goal, expand the successors. They differ in which node they pop.</p>
<p>Breadth-first search pops the oldest node and counts steps. Uniform cost search pops the cheapest partial path and minimises total cost. A star adds a heuristic estimate of the remaining cost and focuses the search toward the goal. Each has a different guarantee and a different memory profile.</p>
<p>The comparison is not a ranking. A bad heuristic can make A star slower than uniform cost search. Equal costs can make breadth-first search the simplest correct choice. The right algorithm depends on the graph, the cost model and the memory budget.</p>`,
  concepts: {
    'bfs': {
      teach: `<p>Breadth-first search expands the frontier in first-in first-out order. It visits all states at depth one, then depth two, and so on. The frontier is a queue, and the visited set prevents a state from being expanded twice.</p>
<p>BFS is complete on finite graphs and optimal when every step costs the same. The first goal it reaches has the fewest steps, because shallower states are always expanded before deeper ones. If a goal is at depth <code>d</code>, BFS expands every state at depth less than <code>d</code> before it.</p>
<h4>The cost is memory</h4>
<p>The frontier holds every node at the current depth. On a graph with branching factor <code>b</code>, that can be on the order of <code>b^d</code> nodes. A grid with four moves and depth 15 can have millions of frontier nodes. Time is also exponential, but memory is usually the binding constraint.</p>
<p>BFS ignores edge costs. If a cheap route has more steps than an expensive one, BFS returns the route with fewer steps, not the cheaper one. That is why uniform cost search exists.</p>
<div class="callout"><b>Use BFS when steps are the cost</b><p>If every action costs one unit and the graph is finite, BFS is simple, complete and optimal. Do not add a priority queue you do not need.</p></div>`,
      work: `<ol class="steps"><li>Put the start node in the queue.</li><li>Pop the start, test it, and push its two children.</li><li>Pop the first child and push its children behind the second child.</li><li>The second child is expanded before any grandchild, so the search proceeds level by level.</li><li>If the goal is a grandchild, every child at the previous depth has already been expanded. The found path has the fewest edges.</li></ol>`,
      practice: {
        q: 'A graph has a goal at depth 3 and a branching factor of 10. Roughly how many nodes can the frontier hold at the deepest level, and why does that matter?',
        hint: 'The frontier can hold the whole level.',
        answer: `<p>At depth 3 the frontier can hold on the order of <code>10³ = 1,000</code> nodes. The exact number depends on the graph, but the growth is exponential. Memory, not time, is often what makes BFS impractical on large graphs.</p>`
      },
      bridge: 'BFS counts steps. When edges have different costs, the cheapest path can have more steps.'
    },
    'ucs': {
      teach: `<p>Uniform cost search expands the frontier node with the lowest path cost <code>g</code>. The frontier is a priority queue keyed by <code>g</code>. It is Dijkstra's algorithm in the language of search. The guarantee is optimality for non-negative edge costs.</p>
<p>When a goal is popped from the queue, no cheaper path to it can exist, because every unfinished path already costs at least as much. That is the proof of optimality. If a cheaper path existed, its frontier node would have a lower <code>g</code> and would have been popped first.</p>
<h4>The cost</h4>
<p>UCS explores in every direction, including away from the goal, because it has no estimate of where the goal is. On a large map it can expand a circle around the start. It also stores every generated path, so memory grows with the number of visited states. A better-path check is needed when the same state is reached by different routes: keep the cheaper one.</p>
<p>Negative edge costs break the guarantee, because a later path can undercut a path already settled. The algorithm assumes costs are non-negative. If a graph has negative edges, a different method such as Bellman-Ford is required.</p>
<div class="callout"><b>Do not stop at generation</b><p>UCS is optimal when a goal is popped, not when it is first generated. A cheaper path to the same goal may still be in the frontier.</p></div>`,
      work: `<ol class="steps"><li>Start S. Edges: S to A costs 1, S to B costs 4.</li><li>Pop S, push A at 1 and B at 4.</li><li>Pop A, push the goal at 6. The frontier holds B at 4 and the goal at 6.</li><li>Pop B, push the goal at 5. The frontier holds the goal at 5 and the goal at 6.</li><li>Pop the goal at 5. The route through B is cheaper than the direct route through A.</li></ol>`,
      practice: {
        q: 'Why must UCS wait until a goal is popped rather than returning as soon as it generates a goal?',
        hint: 'The frontier may still contain a cheaper route to a state you have already reached.',
        answer: `<p>Generating a goal only shows that some path reaches it. A cheaper path may still be in the frontier with a lower <code>g</code>, so returning early can miss the optimum. Popping the goal proves that no cheaper unfinished path exists, because the queue is ordered by cost.</p>`
      },
      bridge: 'UCS explores in all directions because it knows the cost so far but not the cost to come. A heuristic supplies that estimate.'
    },
    'astar': {
      teach: `<p>A star orders the frontier by <code>f(n) = g(n) + h(n)</code>. The cost so far <code>g</code> keeps the search honest. The heuristic <code>h</code> estimates the remaining cost and pulls the search toward the goal. When <code>h</code> is zero, A star becomes uniform cost search. When <code>h</code> is exact, A star walks straight to the goal without expanding anything else.</p>
<p>Real heuristics sit between those extremes. A weak heuristic explores almost as much as UCS. A strong one cuts the search area to a narrow band. The efficiency gain depends on the heuristic, not on the algorithm alone.</p>
<h4>Optimality</h4>
<p>A star is optimal when the heuristic is <strong>admissible</strong>: it never overestimates the true remaining cost. The proof is by contradiction. If the search returned a path dearer than the optimum, the cheaper path would still have a frontier node with <code>f</code> no greater than the optimum cost. That node would have been expanded before the returned goal, so the cheaper path would have been found first.</p>
<p>A <strong>consistent</strong> heuristic is stronger: <code>h(n) ≤ cost(n, n') + h(n')</code> for every edge. Consistency implies admissibility and allows the search to skip re-expansion when a state is reached again. Most practical heuristics are designed to be consistent.</p>
<div class="callout"><b>A star is not always faster</b><p>If the heuristic is expensive to compute or very weak, A star can be slower than UCS. The heuristic has to save more work than it costs.</p></div>`,
      work: `<ol class="steps"><li>Node A has cost so far 4 and heuristic 7, so <code>f = 11</code>.</li><li>Node B has cost so far 6 and heuristic 3, so <code>f = 9</code>.</li><li>A star expands B first, even though it is dearer so far, because its estimated total is lower.</li><li>If B leads to the goal with one more cost-1 edge, the total is 7.</li><li>If the heuristic were 20 instead of 3, B would have <code>f = 26</code> and A would be expanded first, which could delay the cheaper route.</li></ol>`,
      practice: {
        q: 'A heuristic estimates the remaining cost as twice the true distance. Is A star still optimal? What might it do well?',
        hint: 'Compare the estimate with the true remaining cost. Overestimating can make a dearer route look cheaper.',
        answer: `<p>It is not guaranteed optimal, because the heuristic can make a dearer path look cheaper and cause the search to settle on it before the optimum is found. A weighted heuristic like this can be faster, because it focuses the search more aggressively, but it trades optimality for speed.</p>`
      },
      bridge: 'A star depends on the heuristic. The next concept explains which heuristics preserve optimality and how to design one.'
    },
    'heuristics': {
      teach: `<p>A heuristic is admissible when it never overestimates the true cost to the goal. Straight-line distance is admissible for road travel, because no road is shorter than the straight line. The number of misplaced tiles is admissible for the sliding puzzle, because each move fixes at most one tile.</p>
<p>Admissibility is a guarantee about the true cost, which is often unknown. In practice heuristics are designed from <strong>relaxed problems</strong>: remove a constraint, solve the easier problem exactly, and use its cost as the estimate. For the sliding puzzle, allowing tiles to move through each other gives the Manhattan distance. For route planning, ignoring roads gives straight-line distance. A relaxed problem's cost can never exceed the original cost, so the heuristic is admissible.</p>
<h4>Consistency</h4>
<p>A heuristic is consistent when <code>h(n) ≤ cost(n, n') + h(n')</code> for every edge. Consistency implies admissibility and means the <code>f</code> value never decreases along a path. That lets the search skip re-expansion of closed states. Manhattan distance is consistent; a heuristic that ignores the edge costs may not be.</p>
<p>A stronger heuristic that still admissible dominates a weaker one: it expands no more nodes. Designing a better heuristic is often more valuable than tuning the search code.</p>
<div class="callout"><b>Admissible is not the same as accurate</b><p>A heuristic can be admissible and useless, such as zero everywhere. It can also be admissible and expensive to compute. The benefit is the reduction in expansions, not the elegance of the bound.</p></div>`,
      work: `<ol class="steps"><li>A node is 5 steps from the goal by the true route.</li><li>A heuristic of 4 is admissible. A heuristic of 6 is not.</li><li>With the 6, the search may expand another node first and settle on a dearer path before the cheaper one is discovered.</li><li>For a grid with four-way moves, Manhattan distance is admissible and consistent.</li><li>For a grid with diagonal moves, straight-line distance is the better relaxation.</li></ol>`,
      practice: {
        q: 'Why is the number of misplaced tiles admissible for the sliding puzzle, and why is Manhattan distance usually a stronger heuristic?',
        hint: 'Each move can fix at most one tile; Manhattan counts the distance each tile must travel.',
        answer: `<p>Each move can put at most one tile into its correct position, so at least one move is needed per misplaced tile. That makes the count a lower bound. Manhattan distance sums the horizontal and vertical distances each tile must travel, and each move reduces that sum by at most one, so it is also a lower bound. It is usually larger and therefore stronger, which means A star expands fewer nodes.</p>`
      },
      bridge: 'The algorithms and the heuristic are separate choices. The last concept compares their work on the same problem.'
    },
    'race': {
      teach: `<p>The three searches differ in what they guarantee and what they cost. BFS is complete and optimal only for equal costs, with memory exponential in depth. UCS is optimal for non-negative costs and explores in every direction. A star is optimal with an admissible heuristic and focuses the search toward the goal.</p>
<p>Expansions are the practical measure of work. On a uniform grid, UCS expands a circle around the start. A star with a good heuristic expands an ellipse that stretches toward the goal. The difference grows with the size of the map. On a 20 by 20 grid, BFS might expand about 400 nodes, UCS more if costs vary, and A star about 120 with a straight-line heuristic.</p>
<h4>No algorithm wins everywhere</h4>
<p>A bad heuristic makes A star slower than UCS because of the extra computation. A graph with equal costs makes BFS the simplest correct choice. A graph with large memory constraints may rule out all three, and a bidirectional or hierarchical method may be needed. The choice depends on the guarantee, the heuristic and the budget.</p>
<div class="callout"><b>Measure expansions, not wall time alone</b><p>Wall time depends on the implementation, the hardware and the cost of the heuristic. Expansions isolate the algorithmic work.</p></div>
<p>The comparison also assumes the heuristic costs nothing to compute. An expensive heuristic can erase the gain. Memory is often the binding constraint, and none of these methods is designed for huge graphs.</p>`,
      work: `<ol class="steps"><li>BFS on a 20 by 20 grid expands about 400 nodes, because it visits every cell at each depth.</li><li>UCS with varied costs expands more, because it follows cheap detours before expensive direct routes.</li><li>A star with a straight-line heuristic expands about 120 nodes, focusing on the goal.</li><li>All three reach the goal, but only UCS and A star return the cheapest path when costs vary.</li><li>If the heuristic is expensive or weak, the expansion count may not translate into a wall-time win.</li></ol>`,
      practice: {
        q: 'A team has a graph with equal edge costs and a strict memory budget. Which search would you start with, and why?',
        hint: 'Equal costs remove the main advantage of UCS.',
        answer: `<p>Breadth-first search, because it is complete and optimal when all steps cost the same and it needs no heuristic or priority queue. If memory is still too high, the next step is a memory-bounded variant or a different formulation, not a more complex heuristic.</p>`
      },
      bridge: 'Unit 11 leaves search and returns to logic: how to represent facts, what follows from them, and how to derive a proof.'
    }
  },
  closing: {
    teach: `<p>Breadth-first search counts steps with a queue. Uniform cost search minimises total cost with a priority queue. A star adds an admissible heuristic to focus the search. The algorithms share the framework from Unit 9; the differences are the frontier policy and the guarantee.</p>
<p>Choose by the question. If every action costs the same, BFS is enough. If costs vary and there is no useful estimate, UCS is the safe choice. If a good admissible heuristic exists and memory allows, A star usually expands far fewer nodes. In every case, the state model from Unit 9 has to be right before the comparison means anything.</p>`,
    problem: {
      q: 'A graph has start S, goal G, and edges S to A cost 1, S to B cost 4, A to G cost 6, B to G cost 1. Trace UCS and say which goal path is returned. Then give an admissible heuristic for the nodes and compute f for A and B.',
      hint: 'UCS pops the lowest g. A heuristic must not exceed the true remaining cost.',
      answer: `<p>UCS pops S, pushes A at 1 and B at 4. It pops A, pushes G at 7. It pops B at 4, pushes G at 5. It pops G at 5, so the route through B is returned. A possible admissible heuristic is the true remaining cost: <code>h(A) = 6</code>, <code>h(B) = 1</code>, <code>h(G) = 0</code>. Then <code>f(A) = 1 + 6 = 7</code> and <code>f(B) = 4 + 1 = 5</code>, so A star expands B first and finds the cheaper route immediately.</p>`
    }
  }
});
