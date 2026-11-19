AIM.registerTeach({
  n: 3,
  opening: `<p>Unit 3 builds the first model in full. A straight line is simple enough to derive on paper and rich enough to show every part of fitting: the model, the loss, the exact solution and the iterative solution. The two solutions minimise the same objective, and the difference between them is the reason gradient descent runs the rest of the course.</p>
<p>The unit moves in a deliberate order. First the model and what its parameters mean. Then the squared-error loss and the normal equation that minimises it in one step. Then gradient descent, which trades an exact answer for scale. The last two concepts explain why the step size and the scale of the features decide whether descent works at all.</p>
<p>Keep one question in mind throughout: what does the fitted line claim, and what would make that claim false? A line is a model, not a law. The data chooses its parameters, and the assumptions decide where those parameters mean anything.</p>`,
  concepts: {
    'linear-model': {
      teach: `<p>A linear model predicts a label as a weighted sum of features plus an offset. With one feature, <code>ŷ = wx + b</code>. The weight <code>w</code> is the change in the prediction for a one-unit change in <code>x</code>. The offset <code>b</code> is the prediction when <code>x</code> is zero.</p>
<p>With several features, <code>ŷ = w₁x₁ + w₂x₂ + ... + wₚxₚ + b</code>. In vector form, <code>ŷ = w · x + b</code>. The vector <code>w</code> holds one weight per feature, and <code>b</code> is a scalar. The model is still a reflex model: one input vector, one output, no memory and no search.</p>
<h4>What linear means</h4>
<p>Linearity is a statement about the parameters, not about the features. You can add <code>x²</code> or <code>log x</code> as a feature and the prediction is still a weighted sum of features, so it is still linear in the weights. That is why a linear model can fit a curve while remaining easy to optimise. The feature transformation is fixed before fitting; only the weights are learned.</p>
<p>An interaction term, such as <code>x₁x₂</code>, is another feature. It lets the effect of one input depend on another. A model with interactions is still linear in its parameters, even though the relationship between the inputs and the output is not a straight line in the original space.</p>
<h4>What the parameters claim</h4>
<p>The weight is a marginal association: holding the other features fixed, a one-unit change in <code>x</code> is associated with a change of <code>w</code> in the prediction. That is not the same as a causal effect. If the features are correlated, the weights can be unstable and their signs can surprise you. A strong correlation between <code>x</code> and <code>y</code> does not prove that changing <code>x</code> changes <code>y</code>.</p>
<div class="callout"><b>The model is a shape</b><p>The shape is chosen before fitting. The data chooses the weights. If the shape cannot represent the pattern, no amount of fitting will fix it.</p></div>
<p>A line cannot represent a threshold, a curve or an interaction unless you add the corresponding feature. It also treats every feature as additive, so a feature that matters only in combination with another needs an interaction term. Unit 2's bias-variance lens explains the trade: a line has high bias if the truth is curved, and adding features lowers bias while raising variance.</p>`,
      work: `<ol class="steps"><li>Fix the shape: <code>ŷ = wx + b</code>.</li><li>Interpret <code>w</code> as the predicted change in income per extra hour. Interpret <code>b</code> as the predicted income at zero hours.</li><li>Suppose fitting gives <code>w = 100</code> and <code>b = 200</code>.</li><li>For 6 hours: <code>100 × 6 + 200 = 800</code>. For 3.5 hours: <code>100 × 3.5 + 200 = 550</code>.</li><li>Check the units. The slope is income per hour, and the intercept is income, so the equation is dimensionally consistent.</li></ol>`,
      practice: {
        q: 'A model predicts house price from size and number of bedrooms. The weight on bedrooms is negative. Does that mean an extra bedroom lowers the price?',
        hint: 'The weight holds the other feature fixed.',
        answer: `<p>Not necessarily. The weight is the association with bedrooms while holding size fixed. Two houses of the same size, one with more bedrooms, may have smaller rooms or a less practical layout, so the model can learn a negative association. The coefficient describes the fitted surface, not a causal effect. If size and bedrooms are correlated, the weights can also be unstable.</p>`
      },
      bridge: 'The shape is chosen. Now choose the weights. Least squares gives a closed-form answer when the model is linear.'
    },
    'least-squares': {
      teach: `<p>For each case, the residual is the gap between the observed label and the prediction: <code>eᵢ = yᵢ - ŷᵢ</code>. Least squares chooses the parameters that minimise the sum of squared residuals: <code>J(θ) = Σ (yᵢ - ŷᵢ)²</code>. Squaring makes positive and negative gaps count the same, and it punishes large gaps more.</p>
<p>For a line, write <code>J(w, b) = Σ (yᵢ - w xᵢ - b)²</code>. The function is a bowl in the two parameters. At the bottom, the partial derivatives are zero. Setting them to zero gives two equations:</p>
<div class="derive"><p><code>∂J/∂w = -2 Σ xᵢ(yᵢ - w xᵢ - b) = 0</code></p><p><code>∂J/∂b = -2 Σ (yᵢ - w xᵢ - b) = 0</code></p></div>
<p>Solving them gives the one-feature formulas <code>w = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²</code> and <code>b = ȳ - w x̄</code>. The line passes through the point of means, which is a useful check.</p>
<h4>The matrix form</h4>
<p>Stack the feature rows into a matrix <code>X</code> and add a column of ones for the offset. Stack the labels into a vector <code>y</code>. Then <code>J(θ) = ||y - Xθ||²</code>. Setting the gradient to zero gives <code>XᵀXθ = Xᵀy</code>, so <code>θ* = (XᵀX)⁻¹Xᵀy</code>. This is the <strong>normal equation</strong>. It returns the exact least-squares parameters in one calculation.</p>
<h4>The cost</h4>
<p>Forming <code>XᵀX</code> costs on the order of <code>n p²</code> operations for <code>n</code> cases and <code>p</code> features, and inverting it costs on the order of <code>p³</code>. That is fine for tens or hundreds of features and impractical for millions. The inverse also becomes unstable when features are collinear, because <code>XᵀX</code> is nearly singular. A pseudoinverse or a ridge penalty can stabilise it, at the cost of a small bias.</p>
<div class="callout"><b>Exact does not mean always best</b><p>The normal equation is exact for squared error. If the loss is absolute error or a classification loss, the closed form no longer applies.</p></div>`,
      work: `<ol class="steps"><li>Use two cases: hours 1 and 6, income 300 and 800.</li><li>The mean hours are <code>3.5</code> and the mean income is <code>550</code>.</li><li>The numerator is <code>(1 - 3.5)(300 - 550) + (6 - 3.5)(800 - 550) = 625 + 625 = 1250</code>.</li><li>The denominator is <code>(1 - 3.5)² + (6 - 3.5)² = 6.25 + 6.25 = 12.5</code>.</li><li><code>w = 1250 / 12.5 = 100</code>, and <code>b = 550 - 100 × 3.5 = 200</code>.</li></ol>`,
      practice: {
        q: 'Three points lie exactly on a line. What is the least-squares residual sum, and what happens to the normal equation if two features are exact copies of each other?',
        hint: 'A perfect line has zero residuals. Duplicated features make the matrix singular.',
        answer: `<p>The residual sum is zero, because the line passes through every point. If two features are exact copies, the columns of <code>X</code> are linearly dependent, so <code>XᵀX</code> is singular and the inverse does not exist. There are infinitely many weight pairs that produce the same predictions. Drop one copy or add a ridge penalty to choose a stable solution.</p>`
      },
      bridge: 'The normal equation needs an inverse. When there are millions of weights, replace it with a step that uses only the gradient.'
    },
    'gradient-descent': {
      teach: `<p>The gradient of a function points in the direction of steepest increase. To reduce the loss, move in the opposite direction. Gradient descent repeats that move: <code>θ ← θ - η ∇L(θ)</code>. The learning rate <code>η</code> sets the step length, and <code>∇L</code> is the vector of partial derivatives, one per parameter.</p>
<p>Each step needs one pass over the data to compute the gradient. It does not need a matrix inverse, so it works with millions of parameters. It also works when no closed form exists, which covers most modern models. The cost per step is linear in the number of parameters and cases.</p>
<h4>Why it finds a minimum</h4>
<p>At a minimum, the gradient is zero, so the update stops. For a convex loss such as linear regression with squared error, every local minimum is global, so descent converges to the optimum from any starting point if the step is small enough. For a non-convex loss, such as a neural network, there can be many local minima and flat regions. Descent finds a stationary point, not necessarily the best one.</p>
<h4>Batch and stochastic</h4>
<p>Batch gradient descent computes the gradient over the whole training set before each step. It is stable and expensive. Stochastic gradient descent uses one case at a time. It is noisy and cheap, and the noise can help escape shallow traps. Minibatch descent uses a small batch, which is the usual compromise. The noise also means the loss trace jumps; that is expected, not a bug.</p>
<div class="callout"><b>Direction, not distance</b><p>The gradient gives the direction of steepest increase. The learning rate decides how far to move. A correct direction with too large a step still diverges.</p></div>
<p>For linear regression, gradient descent and the normal equation minimise the same objective. The normal equation is exact and cubic in the feature count; descent is approximate and linear per step. The next concept explains when the approximate route is the only practical one.</p>`,
      work: `<ol class="steps"><li>Minimise <code>L(w) = (w - 3)²</code>. The gradient is <code>2(w - 3)</code>.</li><li>Start at <code>w = 0</code> and set <code>η = 0.1</code>.</li><li>First step: <code>w = 0 - 0.1 × 2(0 - 3) = 0.6</code>.</li><li>Second: <code>w = 0.6 - 0.1 × 2(0.6 - 3) = 1.08</code>. Third: <code>1.464</code>.</li><li>The sequence approaches 3. It never jumps past it with this step size, because the curvature is 2 and the stability limit is <code>2 / 2 = 1</code>.</li></ol>`,
      practice: {
        q: 'Why does gradient descent still work when the normal equation is impossible, and what does it give up?',
        hint: 'Think about the cost per step and the guarantee.',
        answer: `<p>It needs only the gradient, which costs one pass over the data, so it avoids forming and inverting a large matrix. It gives up the exact one-step solution and the global guarantee on non-convex losses. It also introduces a learning rate and a stopping rule, so the result depends on those choices.</p>`
      },
      bridge: 'The step size is not a detail. It decides whether descent converges, oscillates or crawls.'
    },
    'learning-rate': {
      teach: `<p>The learning rate <code>η</code> is the most consequential setting in gradient descent. Too large and the parameters jump across the valley, sometimes with growing amplitude. Too small and the loss falls so slowly that the budget runs out. The safe range depends on the curvature of the loss.</p>
<p>For a quadratic <code>L(w) = (a/2) w²</code>, the gradient is <code>a w</code>, and the update is <code>w ← w(1 - η a)</code>. The error shrinks only when <code>|1 - η a| &lt; 1</code>, which gives <code>0 &lt; η &lt; 2/a</code>. The number <code>a</code> is the curvature. A sharp valley has a large <code>a</code>, so it forces a small step. A flat valley allows a larger one.</p>
<h4>One rate for many directions</h4>
<p>With several parameters, the curvature differs by direction. A single rate must be small enough for the sharpest direction. In the flat direction, that same rate is tiny, so progress crawls. This is why features on different scales cause trouble: scaling changes the curvature without changing the best answer. The next concept fixes it.</p>
<h4>Schedules and adaptivity</h4>
<p>Practitioners usually schedule the rate rather than fix it. Start larger for speed, then decay for precision. A common pattern is a step decay or a cosine schedule. Momentum accumulates past gradients to push through flat regions. Adaptive methods such as Adam scale the step per parameter, which helps when gradients have very different magnitudes. Each addition brings its own settings, and adaptive methods can generalise differently from plain descent.</p>
<div class="callout"><b>Diagnose the rate from the loss curve</b><p>A loss that falls then rises or oscillates points to a rate that is too high. A loss that falls almost imperceptibly points to one that is too low.</p></div>
<p>The stability limit is a local statement. In a non-convex loss the curvature changes as the parameters move, so a rate that is safe at the start can become unstable later. Schedules and gradient clipping reduce that risk.</p>`,
      work: `<ol class="steps"><li>Take <code>L(w) = 5w²</code>. The gradient is <code>10w</code>, so the curvature is 10.</li><li>The stability limit is <code>2 / 10 = 0.2</code>.</li><li>At <code>η = 0.1</code>, the update is <code>w ← w(1 - 1) = 0</code>, which reaches the minimum in one step from any start.</li><li>At <code>η = 0.15</code>, the factor is <code>1 - 1.5 = -0.5</code>, so the sign alternates and the magnitude halves each step. It converges, with oscillation.</li><li>At <code>η = 0.3</code>, the factor is <code>-2</code>, so the magnitude doubles each step and the loss diverges.</li></ol>`,
      practice: {
        q: 'A loss curve falls quickly, then jumps up and down around a value. What is the first change you would try, and why?',
        hint: 'The pattern is oscillation, not slow progress.',
        answer: `<p>Reduce the learning rate. The oscillation suggests the step is overshooting the valley and bouncing across it. A smaller step should settle into the minimum. If the rate is already small, check for a bug in the gradient or for features on very different scales, because either can create sharp curvature.</p>`
      },
      bridge: 'A single rate struggles when features have different scales. Standardising them makes the loss rounder and the step easier to choose.'
    },
    'feature-scaling': {
      teach: `<p>A model predicts rent from floor area in square metres and distance to the station in kilometres. Area ranges from 20 to 200; distance ranges from 0.1 to 4. The gradient with respect to area is much larger than the gradient with respect to distance, so descent moves quickly in one direction and slowly in the other. The loss contours are long and thin, and one learning rate cannot suit both axes.</p>
<p><strong>Standardisation</strong> subtracts the mean and divides by the standard deviation: <code>x_scaled = (x - μ) / σ</code>. <strong>Min-max scaling</strong> maps each feature to a fixed interval, usually 0 to 1: <code>(x - min) / (max - min)</code>. Both change the geometry of the loss without changing the best answer, because a linear model can absorb the rescaling into its weights.</p>
<h4>Why it works</h4>
<p>Scaling makes the contours rounder. A round bowl has similar curvature in every direction, so one learning rate works for all parameters. Descent takes a direct path instead of zigzagging along a narrow valley. The effect can be dramatic: the same model that needed thousands of steps can converge in hundreds.</p>
<p>Distance-based methods also need scaling. K-nearest neighbours compares distances, and a feature with a large range dominates. Regularised models penalise the size of the weights, so an unscaled feature can be penalised more or less depending on its units. Trees do not need scaling, because they split on order rather than distance.</p>
<h4>Fit on training data only</h4>
<p>Compute <code>μ</code> and <code>σ</code> from the training set, then apply the same values to validation, test and deployment. Fitting the scaler on all rows leaks information and inflates the score. Store the scaler with the model; a prediction in the original units needs the inverse transform.</p>
<div class="callout"><b>Scaling is not outlier removal</b><p>Standardisation hides an extreme value inside the mean and standard deviation. If an outlier is a data error, fix it; scaling alone will not.</p></div>`,
      work: `<ol class="steps"><li>Area has mean 80 and standard deviation 40.</li><li>A flat of 120 square metres becomes <code>(120 - 80) / 40 = 1</code>.</li><li>Distance has mean 1.2 and standard deviation 0.8.</li><li>A flat 2 kilometres away becomes <code>(2 - 1.2) / 0.8 = 1</code>.</li><li>Both features now sit on the same scale. A change of one standard deviation is one unit in each, so one learning rate applies to both.</li></ol>`,
      practice: {
        q: 'A team standardises all features using the full dataset, then splits into training and test. Why is that a leak, and how should it be done?',
        hint: 'The scaler uses the test values to compute the mean and spread.',
        answer: `<p>The mean and standard deviation of the full dataset contain information from the test cases, so the training features depend on the test set. Split first, compute the scaler on the training rows only, and apply those stored values to the validation and test rows. The scaler is part of the fitted model, not a preprocessing step that can see the future.</p>`
      },
      bridge: 'Unit 3 fits a number. Unit 4 fits a probability, which needs a different output function and a different loss.'
    }
  },
  closing: {
    teach: `<p>The straight line contains the whole pattern of fitting. The model fixes a shape. The loss defines what a good fit means. The normal equation solves the loss exactly when the model is linear and the data is small enough. Gradient descent solves the same problem iteratively when the parameters are too many for an inverse. The learning rate and feature scaling decide whether that iteration converges quickly or not at all.</p>
<p>The next unit changes the output from a number to a probability. The linear score stays, but a sigmoid turns it into a chance, and log loss replaces squared error. The same questions return: what does the model claim, what loss matches the output, and how do you choose the threshold that turns a probability into a decision?</p>`,
    problem: {
      q: 'A model has two features. Feature A ranges from 0 to 1; feature B ranges from 0 to 10,000. Gradient descent converges slowly and the loss contour is a long thin ellipse. Explain why, and describe two changes that would speed it up without changing the fitted optimum.',
      hint: 'Think about curvature and the geometry of the loss.',
      answer: `<p>The features have very different scales, so the loss has much larger curvature in the B direction than in the A direction. A single learning rate must be small enough for the sharp B direction, which makes progress in A tiny. Standardise both features, or min-max scale them, so the contours become rounder and one rate works in both directions. The fitted optimum in the original units is unchanged because the linear model absorbs the rescaling into its weights.</p>`
    }
  }
});
