using System;
using System.Linq;

Learner[] learners = { new("Ada", 90), new("Grace", 55), new("Linus", 75) };
var passing = learners
    .Where(learner => learner.Score >= 0)
    .OrderBy(learner => learner.Score)
    .Select(learner => learner.Name);

Console.WriteLine($"Passing: {string.Join(", ", passing)}");
