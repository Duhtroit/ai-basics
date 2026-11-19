AIM.registerUnit({
  n: 3, hue: 90, short: 'Regression',
  title: 'Lines, least squares and going downhill',
  weeks: 'Week 3',
  promise: 'Fit a straight line exactly, then fit it iteratively, and understand why the second method scales.',
  minutes: 40,
  lectures: ['3.1 Linear regression models', '3.2 The normal equation', '3.3 Gradient descent', 'Optimisation theory slides'],
  concepts: [
    {
      id: 'linear-model',
      title: 'The linear model',
      prereqs: ['three-perspectives'],
      usecase: 'A payroll analyst has working hours and income for twenty staff. She needs a rule that predicts income for a new hire from contracted hours. The scatter plot looks like a straight line with noise.',
      metaphor: {
        name: 'A ruler through a cloud',
        claim: 'Lay a ruler over a cloud of dots. You can tilt it and slide it. The best position is the one that sits closest to all the dots at once.',
        mapping: [
          ['the tilt', 'weight w', 'drag the slope'],
          ['the height', 'offset b', 'drag the line up or down'],
          ['distance to a dot', 'residual', 'read the gap']
        ],
        widget: 'fit-line',
        lab: {
          title: 'Fit the line by eye',
          tryText: 'Drag the slope and the offset until the line looks right. Then reveal the least-squares answer.',
          notice: 'Your eye balances the gaps. Least squares balances their squares, which is not the same line.'
        }
      },
      idea: `<p><strong>Linear regression</strong> models the label as a weighted sum of features plus an offset: y = w x + b for one feature. The weight w is the change in the prediction per unit of x. The offset b is the prediction when x is zero.</p>
<p>With several features the model becomes y = w₁x₁ + w₂x₂ + ... + b. Written with vectors, y = w·x + b. The model is still a reflex model: one input, one output, no memory.</p>
<p>Linearity is a statement about the parameters, not about the features. You can fit a curve by adding x² as a feature. The model stays linear in w, which keeps the fitting problem tractable.</p>`,
      lecture: {
        ref: '3.1',
        source: 'Transcript, Linear regression models',
        text: 'The lecturer writes the model on the board. "We have the shape of the solution, but we do not know the exact value for the weights and the bias. The data will choose them."'
      },
      mechanics: {
        formula: 'ŷ = w x + b',
        symbols: [
          ['ŷ', 'the predicted income'],
          ['x', 'hours worked'],
          ['w', 'income change per hour'],
          ['b', 'the prediction at zero hours']
        ],
        worked: 'With w = 100 and b = 200, a person working 6 hours is predicted to earn 800. A person working 3.5 hours is predicted to earn 550. The parameters came from data, not from the analyst\'s intuition.'
      },
      mechanism: {
        widget: 'fit-line',
        lab: {
          title: 'Drag the two parameters',
          tryText: 'Change w and b separately. Watch which parameter tilts the line and which moves it.',
          notice: 'Two numbers control the whole line. Fitting is the search for those two numbers.'
        }
      },
      breaks: 'A straight line cannot represent a curve, a threshold or an interaction between features. Outliers pull the fit because their residuals are squared. And a strong correlation does not imply that changing x changes y.',
      check: [
        {
          q: 'What does the weight w represent?',
          options: ['The prediction when x is zero', 'The change in prediction per unit of x', 'The total error', 'The number of features'],
          answer: 1,
          explain: 'The slope is the marginal effect of one feature on the prediction, holding the others fixed.'
        },
        {
          q: 'Adding x² as a feature keeps the model linear in what sense?',
          options: ['Linear in x', 'Linear in the parameters', 'Linear in the label', 'Linear in time'],
          answer: 1,
          explain: 'The prediction is a weighted sum of features. The feature can be curved; the parameters still enter linearly.'
        }
      ],
      connection: {
        prompt: 'Which family does a linear regression belong to?',
        a: 'Linear regression', b: 'Family',
        options: [
          { label: 'Reflex, because it maps input to output', ok: true },
          { label: 'State, because it plans', ok: false },
          { label: 'Variable, because it assigns', ok: false },
          { label: 'Logic, because it proves', ok: false }
        ],
        explain: 'It is a fixed computation with fitted parameters, which is a reflex model with a numeric output.'
      },
      recap: [
        'A linear model is a weighted sum plus an offset.',
        'The weight is the slope, the offset is the intercept.',
        'Linearity refers to the parameters, not the features.'
      ],
      now: 'You can now read a linear model and say what each parameter does.'
    },
    {
      id: 'least-squares',
      title: 'Least squares and the normal equation',
      prereqs: ['linear-model'],
      usecase: 'You have 200 rows and three features. You want the exact best-fit line, not an approximation that depends on where you started. For this size, linear algebra gives it in one step.',
      metaphor: {
        name: 'The balance scale',
        claim: 'A balance settles where the total pull on both sides is equal. Least squares settles where the total pull of the data on the line is zero in every direction.',
        mapping: [
          ['a weight on the pan', 'one residual', 'measure the gap'],
          ['the balance point', 'optimal parameters', 'solve'],
          ['the beam', 'normal equation', 'set the slope to zero']
        ],
        widget: 'normal-eq',
        lab: {
          title: 'Balance two residuals',
          tryText: 'Move the line. The two moment bars show the pull from each side. Find the point where they cancel.',
          notice: 'The optimum is where the pushes balance, not where the line touches the most points.'
        }
      },
      idea: `<p>Least squares chooses parameters that minimise the sum of squared <strong>residuals</strong>. A residual is the gap between an observed label and the prediction. Squaring makes positive and negative gaps count the same and punishes large gaps more.</p>
<p>For linear regression the minimum has a closed form. Setting the derivative to zero gives the <strong>normal equation</strong>, (XᵀX)⁻¹Xᵀy. X is the matrix of features with a column of ones for the offset. The equation returns the exact optimal weights in one calculation.</p>
<p>The cost is cubic in the number of features, because of the matrix inverse. That is fine for tens or hundreds of features and hopeless for millions. The next concept replaces the inverse with an iteration.</p>`,
      lecture: {
        ref: '3.2',
        source: 'Transcript, The normal equation',
        text: 'The lecturer derives the solution by setting the slope of the squared error to zero. "We can solve it directly. We do not need to search. But the matrix inversion becomes expensive when the number of features is large."'
      },
      mechanics: {
        formula: 'θ* = (XᵀX)⁻¹ Xᵀ y',
        symbols: [
          ['θ*', 'the optimal parameter vector'],
          ['X', 'the feature matrix, one row per case'],
          ['Xᵀ', 'the transpose of X'],
          ['y', 'the vector of observed labels'],
          ['⁻¹', 'the matrix inverse']
        ],
        worked: 'For one feature with mean x̄ and mean ȳ, the solution reduces to w = Σ(x - x̄)(y - ȳ) / Σ(x - x̄)² and b = ȳ - w x̄. With hours 1 and 6 and incomes 300 and 800, w = 100 and b = 200, which matches the earlier guess.'
      },
      mechanism: {
        widget: 'normal-eq',
        lab: {
          title: 'Solve a two-point system',
          tryText: 'Move the points and watch the exact solution update. Then add a third point that disagrees.',
          notice: 'With more points than parameters, no line passes through all of them. The equation finds the best compromise.'
        }
      },
      breaks: 'XᵀX can be singular or nearly singular when features are collinear, which makes the inverse unstable. The cubic cost rules out large feature counts. And the solution is only optimal for squared error, not for absolute error or a classification loss.',
      check: [
        {
          q: 'What does the normal equation minimise?',
          options: ['The sum of absolute residuals', 'The sum of squared residuals', 'The number of errors', 'The model variance'],
          answer: 1,
          explain: 'The closed form is the solution to least squares, which is the sum of squared residuals.'
        },
        {
          q: 'Why does the normal equation struggle with a million features?',
          options: ['It needs a test set', 'The matrix inverse costs too much', 'It cannot handle an offset', 'It requires a learning rate'],
          answer: 1,
          explain: 'Inverting a million by million matrix is impractical. Iterative methods avoid the inverse.'
        }
      ],
      connection: {
        prompt: 'The normal equation and the iterative method solve the same problem. What differs?',
        a: 'Normal equation', b: 'Gradient descent',
        options: [
          { label: 'One exact step versus many approximate steps', ok: true },
          { label: 'Different loss functions', ok: false },
          { label: 'Different labels', ok: false },
          { label: 'One uses features, the other does not', ok: false }
        ],
        explain: 'Both minimise squared error. The normal equation solves directly; the iterative method approaches the answer step by step.'
      },
      recap: [
        'Least squares minimises the sum of squared residuals.',
        'The normal equation gives the exact optimum in one step.',
        'Its cubic cost limits it to modest feature counts.'
      ],
      now: 'You can now derive the least-squares fit for one feature and say when the closed form is a bad idea.'
    },
    {
      id: 'gradient-descent',
      title: 'Gradient descent: walk downhill in fog',
      prereqs: ['least-squares'],
      usecase: 'A model has two million weights. The normal equation would need an impossible matrix inverse. You can still fit it by taking small steps that reduce the loss, repeated until the loss stops falling.',
      metaphor: {
        name: 'Walking downhill in fog',
        claim: 'You stand on a hillside in fog and want the valley. You cannot see the bottom, but you can feel the slope under your feet. Take a step downhill, feel again, repeat.',
        mapping: [
          ['your position', 'current parameter values', 'read w and b'],
          ['slope underfoot', 'gradient', 'compute the derivative'],
          ['length of step', 'learning rate', 'set the step size']
        ],
        widget: 'descent-hill',
        lab: {
          title: 'Take three steps by feel',
          tryText: 'Press step. The walker feels the slope and moves downhill. Try a long stride and a short one.',
          notice: 'You never see the valley. You only need the slope where you stand.'
        }
      },
      idea: `<p>The <strong>gradient</strong> of a function points in the direction of steepest increase. To reduce the loss, move in the opposite direction. <strong>Gradient descent</strong> repeats that move: θ ← θ - η ∇L(θ). The symbol ∇L is the vector of partial derivatives, one per parameter.</p>
<p>Each step is cheap: one pass over the data computes the gradient. The method needs no matrix inverse, so it works with millions of parameters. It also works when no closed form exists, which covers most modern models.</p>
<p>The catch is that it only finds a local minimum. For a convex loss such as linear regression with squared error, the local minimum is global. For a neural network it is not, which is why initialisation and momentum matter later.</p>`,
      lecture: {
        ref: '3.3',
        source: 'Transcript, Gradient descent',
        text: 'The lecturer describes the update as a repeated correction. "We compute the gradient, then we move the parameters a small step in the opposite direction. We repeat until the loss stops decreasing."'
      },
      mechanics: {
        formula: 'θ ← θ - η ∇L(θ)',
        symbols: [
          ['θ', 'the current parameter vector'],
          ['η', 'the learning rate, or step size'],
          ['∇L', 'the gradient of the loss'],
          ['←', 'assign the new value']
        ],
        worked: 'For L(w) = (w - 3)², the gradient is 2(w - 3). Start at w = 0 with η = 0.1. The first step gives w = 0 - 0.1(-6) = 0.6. The next gives 1.56, then 2.14, then 2.45. The sequence approaches 3 from below.'
      },
      mechanism: {
        widget: 'descent-contour',
        lab: {
          title: 'Descend a contour map',
          tryText: 'Press play and watch the path. Then set the learning rate very high and run again.',
          notice: 'The path follows the steepest direction at each point. It is not a straight line to the bottom.'
        }
      },
      sandbox: {
        widget: 'descent-contour',
        lab: {
          title: 'Fit a dataset with only step size and steps',
          tryText: 'Adjust the step size and the number of steps to reach the target loss. No closed form is available.',
          notice: 'The same loop fits a model with any number of parameters. Only the gradient computation grows.'
        }
      },
      breaks: 'A learning rate that is too large overshoots and diverges. Too small and training takes forever. Features on different scales produce elongated contours, which slow the walk. Non-convex losses have local minima and plateaus where the gradient is near zero.',
      check: [
        {
          q: 'In which direction does gradient descent move?',
          options: ['Along the gradient', 'Opposite the gradient', 'Perpendicular to the gradient', 'Randomly'],
          answer: 1,
          explain: 'The gradient points uphill. Moving opposite to it reduces the loss.'
        },
        {
          q: 'Why does gradient descent scale better than the normal equation?',
          options: ['It uses less data', 'It avoids the matrix inverse', 'It always finds the global minimum', 'It needs no features'],
          answer: 1,
          explain: 'Each step costs a gradient evaluation. There is no cubic matrix inversion.'
        }
      ],
      connection: {
        prompt: 'What does the loss function supply to the descent?',
        a: 'Loss', b: 'Gradient',
        options: [
          { label: 'The slope that the step follows', ok: true },
          { label: 'The test score', ok: false },
          { label: 'The learning rate', ok: false },
          { label: 'The number of steps', ok: false }
        ],
        explain: 'The derivative of the loss gives the direction and steepness. The learning rate scales the step.'
      },
      recap: [
        'The gradient points uphill, so descent steps the other way.',
        'It needs no matrix inverse and scales to large models.',
        'It finds a local minimum, which is global only for convex losses.'
      ],
      now: 'You can now write the update rule and explain why it replaces the normal equation at scale.'
    },
    {
      id: 'learning-rate',
      title: 'The learning rate decides everything',
      prereqs: ['gradient-descent'],
      usecase: 'Two teams train the same model. One converges in 200 steps, the other oscillates and never settles. The only difference is the step size.',
      metaphor: {
        name: 'Stride length on a hill',
        claim: 'A giant stride can carry you past the valley and up the far slope. A tiny shuffle takes all day. The right stride depends on the terrain.',
        mapping: [
          ['stride length', 'learning rate', 'set η'],
          ['terrain steepness', 'curvature of the loss', 'change the data scale'],
          ['arriving at the valley', 'convergence', 'watch the loss']
        ],
        widget: 'descent-contour',
        lab: {
          title: 'Find the edge of stability',
          tryText: 'Increase the stride until the path overshoots. Then halve it.',
          notice: 'There is a threshold. Below it the loss falls; above it the loss grows.'
        }
      },
      idea: `<p>The <strong>learning rate</strong> η sets how far each step moves. It is the most consequential setting in gradient descent. Too large and the parameters jump across the valley, sometimes with growing amplitude. Too small and the loss falls so slowly that the budget runs out.</p>
<p>The safe upper bound depends on the curvature of the loss. A sharp valley forces a small step. That is why rescaling the inputs matters: it changes the curvature without changing the problem.</p>
<p>Practitioners schedule η rather than fix it. Start larger for speed, decay for precision, or adapt per parameter. The next units use fixed rates for clarity, and the neural network unit introduces schedules.</p>`,
      lecture: {
        ref: '3.3',
        source: 'Transcript, Gradient descent',
        text: 'The lecturer varies the step size on the board. "If the learning rate is too large, we may never converge. If it is too small, it will take a very long time. We need to choose it carefully."'
      },
      mechanics: {
        formula: 'η < 2 / L, where L bounds the curvature',
        symbols: [
          ['η', 'the learning rate'],
          ['L', 'the largest curvature of the loss'],
          ['2', 'the stability limit for a quadratic']
        ],
        worked: 'For L(w) = 5w², the curvature is 10. The stability limit is 2/10 = 0.2. At η = 0.1 the loss halves each step. At η = 0.3 each step overshoots and the loss grows. The boundary is sharp.'
      },
      mechanism: {
        widget: 'descent-contour',
        lab: {
          title: 'Three regimes on one loss',
          tryText: 'Set the rate to 0.02, 0.2 and 0.9. Compare the paths and the loss trace.',
          notice: 'Small is slow, near the limit is fast, past the limit diverges. The loss trace makes the regime visible.'
        }
      },
      breaks: 'A single global rate is wrong when parameters need different scales. Sparse features receive few updates and need larger rates. Adaptive methods help, but they add their own settings and can generalise differently.',
      check: [
        {
          q: 'What happens when the learning rate exceeds the stability limit?',
          options: ['The loss falls faster', 'The loss oscillates or grows', 'The gradient becomes zero', 'The model underfits'],
          answer: 1,
          explain: 'Each step overshoots the minimum, so the parameters move further away instead of settling.'
        },
        {
          q: 'Why does feature scaling allow a larger learning rate?',
          options: ['It reduces the number of features', 'It makes the loss contours rounder', 'It changes the labels', 'It removes noise'],
          answer: 1,
          explain: 'Rescaling features makes curvature similar in every direction, so one step size suits all parameters.'
        }
      ],
      connection: {
        prompt: 'The learning rate and the loss curvature interact. Which earlier concept explains why?',
        a: 'Step size', b: 'Loss shape',
        options: [
          { label: 'The gradient magnitude depends on curvature', ok: true },
          { label: 'The loss is always convex', ok: false },
          { label: 'The step size sets the labels', ok: false },
          { label: 'Curvature sets the number of features', ok: false }
        ],
        explain: 'Steep curvature produces large gradients, so the same step size overshoots. The stability limit scales with curvature.'
      },
      recap: [
        'The learning rate trades speed against stability.',
        'The stable range depends on the curvature of the loss.',
        'Scaling features makes one rate work for all parameters.'
      ],
      now: 'You can now diagnose divergence and slowness from the loss trace and adjust the step size.'
    },
    {
      id: 'feature-scaling',
      title: 'Feature scaling and conditioning',
      prereqs: ['learning-rate'],
      usecase: 'A model predicts rent from floor area in square metres and distance to the station in kilometres. Area ranges from 20 to 200. Distance ranges from 0.1 to 4. The gradient is dominated by area, and the fit crawls along the distance direction.',
      metaphor: {
        name: 'Two knobs of different sensitivity',
        claim: 'One knob changes the temperature by a degree per turn; the other changes it by a hundred. You cannot tune both with the same hand movement.',
        mapping: [
          ['knob sensitivity', 'feature scale', 'rescale the column'],
          ['hand movement', 'learning rate', 'one rate for all'],
          ['smooth tuning', 'well-conditioned loss', 'fast convergence']
        ],
        widget: 'normal-eq',
        lab: {
          title: 'Stretch one axis',
          tryText: 'Scale the horizontal feature by ten and watch the loss contours stretch. Then standardise it.',
          notice: 'The minimum is in the same place. The path to it becomes long and narrow.'
        }
      },
      idea: `<p><strong>Feature scaling</strong> puts features on comparable ranges. Standardisation subtracts the mean and divides by the standard deviation. Min-max scaling maps each feature to a fixed interval. Both change the geometry of the loss without changing the best answer.</p>
<p>Scaled features give rounder contours. Gradient descent can then take a larger step in every direction, which shortens training. Distance-based methods such as k-nearest neighbours and regularised models also need scaling, because otherwise a large-range feature dominates the distance or the penalty.</p>
<p>Fit the scaler on training data only, then apply the same numbers to validation and test. Fitting on all rows leaks information and inflates the score.</p>`,
      lecture: {
        ref: '3.3',
        source: 'Transcript, Gradient descent',
        text: 'The lecturer notes that features with very different ranges make the optimisation slow, and that normalising them makes the same learning rate work across parameters.'
      },
      mechanics: {
        formula: 'x_scaled = (x - μ) / σ',
        symbols: [
          ['x', 'the raw feature value'],
          ['μ', 'the training mean'],
          ['σ', 'the training standard deviation'],
          ['x_scaled', 'the rescaled value']
        ],
        worked: 'Area has mean 80 and standard deviation 40. A flat of 120 square metres becomes (120 - 80) / 40 = 1. Distance has mean 1.2 and standard deviation 0.8. A flat 2 kilometres away becomes (2 - 1.2) / 0.8 = 1. Both features now sit on the same scale, and one learning rate suits both.'
      },
      mechanism: {
        widget: 'normal-eq',
        lab: {
          title: 'Condition the problem',
          tryText: 'Turn scaling on and off, then run descent. Compare the number of steps to reach the same loss.',
          notice: 'Scaling does not change the answer. It changes how quickly the iteration finds it.'
        }
      },
      breaks: 'Scaling hides outliers rather than removing them. A single extreme value can dominate the mean and standard deviation. Trees do not need scaling, because they split on order rather than distance. And scaling must be undone when a prediction needs to be reported in original units.',
      check: [
        {
          q: 'What does standardisation do to a feature?',
          options: ['Removes its outliers', 'Centres it at zero with unit standard deviation', 'Makes it linear', 'Removes it from the model'],
          answer: 1,
          explain: 'Subtract the mean and divide by the standard deviation. The shape of the distribution is unchanged.'
        },
        {
          q: 'Why is fitting the scaler on all rows before splitting a leak?',
          options: ['It is slower', 'Test statistics enter the training pipeline', 'It changes the labels', 'It adds features'],
          answer: 1,
          explain: 'The mean and deviation carry information from the test rows. Fit them on training data only.'
        }
      ],
      connection: {
        prompt: 'Scaling changes the loss geometry. Which earlier idea does that affect?',
        a: 'Feature scale', b: 'Descent behaviour',
        options: [
          { label: 'The stable learning rate', ok: true },
          { label: 'The label distribution', ok: false },
          { label: 'The loss function', ok: false },
          { label: 'The test set size', ok: false }
        ],
        explain: 'Curvature sets the stability limit. Scaling makes curvature similar across directions, so a larger rate is safe.'
      },
      recap: [
        'Features on different ranges produce stretched loss contours.',
        'Standardisation or min-max scaling makes one learning rate work.',
        'Fit the scaler on training data only.'
      ],
      now: 'You can now explain slow convergence from feature ranges and fix it without leaking test data.'
    }
  ],
  test: [
    {
      q: 'In y = wx + b, what does b change?',
      options: ['The slope', 'The height of the line', 'The residuals', 'The learning rate'],
      answer: 1,
      explain: 'The offset moves the line up or down without changing its tilt.'
    },
    {
      q: 'What does the normal equation return?',
      options: ['A local minimum found by iteration', 'The exact least-squares parameters', 'A probability', 'A decision boundary'],
      answer: 1,
      explain: 'It solves the squared-error minimisation in closed form.'
    },
    {
      q: 'Why is the normal equation expensive for many features?',
      options: ['It needs a large test set', 'The matrix inverse grows cubically', 'It uses too much disk', 'It requires labels'],
      answer: 1,
      explain: 'Inverting XᵀX costs roughly the cube of the feature count.'
    },
    {
      q: 'Which update is gradient descent?',
      options: ['θ ← θ + η∇L', 'θ ← θ - η∇L', 'θ ← ∇L / η', 'θ ← η / ∇L'],
      answer: 1,
      explain: 'Move opposite the gradient, scaled by the learning rate.'
    },
    {
      q: 'A loss oscillates with growing amplitude. What is the likely cause?',
      options: ['The learning rate is too large', 'The learning rate is too small', 'The data is scaled', 'The loss is convex'],
      answer: 0,
      explain: 'Overshooting is the signature of a step size beyond the stability limit.'
    },
    {
      q: 'What does standardisation change?',
      options: ['The optimal parameters in original units', 'The geometry of the loss', 'The labels', 'The model family'],
      answer: 1,
      explain: 'The optimum maps back to the same model. The path to it becomes better conditioned.'
    },
    {
      q: 'When should the scaler be fitted?',
      options: ['On all data', 'On the test set', 'On the training set only', 'On the validation set only'],
      answer: 2,
      explain: 'Test statistics must not enter training. Fit on training rows and reuse the numbers.'
    },
    {
      q: 'Which method needs feature scaling least?',
      options: ['Gradient descent on a linear model', 'k-nearest neighbours', 'A decision tree', 'Ridge regression'],
      answer: 2,
      explain: 'Trees split on order, so monotone rescaling does not change their splits.'
    }
,
    {
      type: 'numeric',
      q: 'For L(w) = (w - 4)^2 the gradient is 2(w - 4). Start at w = 0 with a learning rate of 0.1. What is w after one step?',
      answer: 0.8,
      tolerance: 0.001,
      explain: 'The gradient at w = 0 is -8. Subtract 0.1 times -8: 0 - (-0.8) = 0.8.'
    },
    {
      type: 'ordering',
      q: 'Order the steps of one gradient descent iteration.',
      items: [
        'Compute the gradient at the current parameters',
        'Multiply the gradient by the learning rate',
        'Subtract that step from the parameters',
        'Repeat until the loss stops falling'
      ],
      explain: 'Each iteration reads the slope where it stands, scales it, and moves the other way.'
    },
    {
      type: 'error',
      q: 'A team solves least squares with the normal equation. One step is wrong. Which one?',
      steps: [
        'Add a column of ones to X for the offset.',
        'Compute X transpose X and X transpose y.',
        'Invert X and multiply it by y.',
        'Solve the resulting system for the parameters.'
      ],
      answer: 2,
      explain: 'The normal equation inverts X transpose X, not X. X is rectangular whenever there are more cases than features.'
    },
    {
      type: 'short',
      q: 'Why can gradient descent fit a model that the normal equation cannot?',
      rubric: [
        'Mentions avoiding the matrix inverse',
        'Mentions the cubic cost in the number of features',
        'Explains that a gradient step works without a closed form'
      ],
      model: 'The normal equation inverts a matrix whose size grows with the number of features, so its cost grows cubically. Gradient descent only needs one gradient per step, which scales to millions of parameters and works when no closed form exists.',
      explain: 'The difference is cost and generality, not the loss. Both can minimise squared error.'
    }
  ],
  connections: [
    {
      prompt: 'Link the solver to its cost.',
      a: 'Method', b: 'Cost',
      options: [
        { label: 'Normal equation: cubic in features', ok: true },
        { label: 'Gradient descent: cubic in features', ok: false },
        { label: 'Normal equation: linear in cases only', ok: false },
        { label: 'Gradient descent: no cost per step', ok: false }
      ],
      explain: 'The inverse dominates the closed form. Descent costs one gradient per step and scales with parameters and cases.'
    },
    {
      prompt: 'Scaling and the learning rate solve the same symptom. Which statement is right?',
      a: 'Change', b: 'Reason',
      options: [
        { label: 'Scaling rounder contours, so a larger rate is stable', ok: true },
        { label: 'Scaling lowers the loss minimum', ok: false },
        { label: 'A larger rate removes the need for scaling', ok: false },
        { label: 'Scaling changes the labels', ok: false }
      ],
      explain: 'The minimum is unchanged. The conditioning improves, which is why the iteration speeds up.'
    }
  ],
  pairs: [
    {
      a: 'The normal equation', b: 'Gradient descent',
      claim: 'Both minimise the sum of squared residuals for a linear model.',
      same: true,
      explain: 'They solve the same least-squares problem. One is exact and direct, the other iterative.'
    },
    {
      a: 'The learning rate', b: 'Feature scaling',
      claim: 'Both change the minimum of the loss.',
      same: false,
      explain: 'Neither moves the optimum. The rate changes the path, and scaling changes the shape of the path.'
    },
    {
      a: 'The gradient', b: 'A residual',
      claim: 'Both are vectors with one entry per training case.',
      same: false,
      explain: 'A residual is per case. The gradient has one entry per parameter.'
    }
  ],
  map: {
    nodes: [
      { id: 'line', label: 'Line', x: 14, y: 26 },
      { id: 'ls', label: 'Least squares', x: 40, y: 18 },
      { id: 'normal', label: 'Normal equation', x: 68, y: 24 },
      { id: 'gd', label: 'Gradient descent', x: 62, y: 64 },
      { id: 'lr', label: 'Learning rate', x: 86, y: 52 }
    ],
    edges: [
      ['line', 'ls', 'defines residuals'],
      ['ls', 'normal', 'solved exactly'],
      ['ls', 'gd', 'solved iteratively'],
      ['gd', 'lr', 'step size'],
      ['normal', 'gd', 'fails at scale']
    ]
  }
});
